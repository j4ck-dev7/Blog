import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
  findUserByEmail,
  verifyUserExistsByEmail,
  createUser,
  findUserBySub,
  verifyUserExistsBySub,
  createUserWithOauth,
  changeUserStatusActive,
  findUserById,
} from "../repositories/userRepository.js";
import { OAuth2Client } from "google-auth-library";
import { logger } from "../config/logger.js";
import { transporter } from "../config/nodemailer.js";
import {
  incrementLoginAttempts,
  resetLoginAttempts,
  isLockedOut,
} from "../utils/redisLoginAttempts.js";

// [SECURITY FIX - V9] OAuth state deve ser aleatório por sessão (removido CryptoJS hardcoded)
export const getUrlForOauthSignUp = async () => {
  const state = crypto.randomBytes(32).toString("hex");

  logger.info("getUrlForOauthSignUp called");

  const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL_SIGNUP,
  );

  const authorizationUrl = client.generateAuthUrl({
    access_type: "offline",
    state,
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
    include_granted_scopes: true,
  });

  return authorizationUrl;
};

// [SECURITY FIX - V9] OAuth state deve ser aleatório por sessão
export const getUrlForOauthSignIn = async () => {
  const state = crypto.randomBytes(32).toString("hex");

  logger.info("getUrlForOauthSignIn called");

  const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL_SIGNIN,
  );

  const authorizationUrl = client.generateAuthUrl({
    access_type: "offline",
    state,
    scope: ["https://www.googleapis.com/auth/userinfo.profile"],
    include_granted_scopes: true,
  });

  return authorizationUrl;
};

export const registerUser = async (name, email, password) => {
  logger.info("registerUser called", { name, email });
  const existingUserResult = await verifyUserExistsByEmail(email);
  if (existingUserResult?.data?.user) {
    logger.warn("registerUser - email already exists", { email });
    throw new Error("User already exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUserResult = await createUser(name, email, passwordHash);
  const newUser = newUserResult?.data?.user;
  logger.info("registerUser - success", {
    id: newUser?.id,
    email: newUser?.email,
  });

  const token = jwt.sign(
    { id: newUser.id, email: email },
    process.env.EMAIL_VERIFICATION_SECRET,
    { expiresIn: 1000 * 60 * 10 },
  );
  // [SECURITY FIX - V5] URL de verificação deve usar variável de ambiente
  const baseUrl = process.env.BASE_URL || "http://localhost:5000";
  const verificationLink = `${baseUrl}/verify-email?token=${token}`;
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: "Verificação de Email",
    html: `<p>Olá ${name},</p>
               <p>Obrigado por se registrar. Por favor, clique no link abaixo para verificar seu email:</p>
               <a href="${verificationLink}">Verificar Email</a>
               <p>Este link expira em 10 minutos.</p>`,
  });

  logger.info("Email de verificação enviado com sucesso", {
    email,
    usuarioId: newUser.id,
  });

  return newUser;
};

export const verifyEmail = async (token) => {
  logger.debug("Iniciando processo de verificação de email", {
    usuarioId: "Desconecido",
  });

  if (!token) {
    logger.warn("Tentativa de verificação de email sem token", {
      usuarioId: "Desconecido",
    });
    throw new Error("Token ausente");
  }

  const decoded = jwt.verify(token, process.env.EMAIL_VERIFICATION_SECRET);
  if (!decoded) {
    logger.warn("Token de verificação de email inválido", {
      usuarioId: "Desconecido",
    });
    throw new Error("Token inválido");
  }

  const userResult = await findUserById(decoded.id);
  const user = userResult?.data?.user;
  if (!user) {
    logger.warn("Usuário não encontrado para token de verificação de email", {
      usuarioId: "Desconecido",
    });
    throw new Error("Usuário não encontrado");
  }

  if (user.email !== decoded.email) {
    logger.warn("Token de verificação de email não corresponde ao usuário", {
      usuarioId: user.id,
    });
    throw new Error("Token inválido");
  }

  if (user.isEmailVerified) {
    logger.info("Email já verificado", {
      usuarioId: user.id,
    });
    throw new Error("Email já verificado");
  }

  await changeUserStatusActive(user.id);
  logger.info("Email do usuário verificado com sucesso", {
    usuarioId: user.id,
  });

  return user;
};

export const registerUserByOauth = async (code) => {
  const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL_SIGNUP,
  );

  const { tokens } = await client.getToken(code);

  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const { email, name, sub } = ticket.payload;
  logger.info("registerUserByOauth called", { sub, email });

  const verifyIfUserExists = await verifyUserExistsBySub(sub);
  if (verifyIfUserExists?.data?.user) {
    logger.warn("registerUserByOauth - user already exists", { sub });
    throw new Error("User already exists");
  }

  const newUserResult = await createUserWithOauth(name, email, sub);
  const newUser = newUserResult?.data?.user;
  logger.info("registerUserByOauth - success", { id: newUser?.id, sub, email });
  return newUser;
};

export const loginUser = async (email, password) => {
  logger.info("loginUser attempt", { email });
  const locked = await isLockedOut(email);
  if (locked) {
    logger.warn(
      "Tentativa de login para usuário bloqueado por muitas tentativas",
      {
        usuarioId: "Desconecido",
        email,
      },
    );

    throw new Error("Usuário bloqueado por muitas tentativas");
  }

  const userResult = await findUserByEmail(email);
  const user = userResult?.data?.user;

  // [SECURITY FIX - V4] Não executar bcrypt.compare se usuário não existe (evita timing attack e waste CPU)
  if (!user) {
    const loginAttemps = await incrementLoginAttempts(email);

    logger.warn("Tentativa de login com credenciais incorretas", {
      usuarioId: "Desconecido",
      email,
      tentativas: loginAttemps.attempts,
    });

    const error = new Error("Email ou senha incorretos");
    error.attempts = loginAttemps.attempts;
    error.remainingAttempts = 5 - loginAttemps.attempts;
    throw error;
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    const loginAttemps = await incrementLoginAttempts(email);

    logger.warn("Tentativa de login com credenciais incorretas", {
      usuarioId: "Desconecido",
      email,
      tentativas: loginAttemps.attempts,
    });

    const error = new Error("Email ou senha incorretos");
    error.attempts = loginAttemps.attempts;
    error.remainingAttempts = 5 - loginAttemps.attempts;
    throw error;
  }

  if (!user.isEmailVerified) {
    logger.warn("Tentativa de login com email não verificado", {
      usuarioId: user.id,
    });

    throw new Error("Email não verificado");
  }

  await resetLoginAttempts(email);

  logger.info("loginUser success", { id: user.id, email: user.email });
  return user;
};

export const loginUserByOauth = async (code) => {
  const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL_SIGNIN,
  );

  const { tokens } = await client.getToken(code);

  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const { sub } = ticket.payload;
  logger.info("loginUserByOauth called", { sub });

  const userVerify = await verifyUserExistsBySub(sub);
  if (!userVerify?.data?.user) {
    logger.warn("loginUserByOauth - account not found", { sub });
    throw new Error("Conta não encontrada");
  }

  const userResult = await findUserBySub(sub);
  const user = userResult?.data?.user;
  logger.info("loginUserByOauth success", { id: user?.id, sub });
  return user;
};
