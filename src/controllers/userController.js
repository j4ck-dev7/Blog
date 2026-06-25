import jwt from "jsonwebtoken";
import {
  loginUser,
  loginUserByOauth,
  registerUser,
  registerUserByOauth,
  getUrlForOauthSignIn,
  getUrlForOauthSignUp,
  verifyEmail,
} from "../services/userService.js";
import { logger } from "../config/logger.js";
import { getRequestMeta } from "../config/requestMeta.js";

export const getSignInGoogleUrl = async (req, res) => {
  try {
    const url = await getUrlForOauthSignIn();
    res.status(200).json({ url });
    logger.info("URL de login Google obtida", getRequestMeta(req));
  } catch (error) {
    logger.error("Erro ao obter URL de login do Google", {
      ...getRequestMeta(req),
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getSignUpGoogleUrl = async (req, res) => {
  try {
    const url = await getUrlForOauthSignUp();
    res.status(200).json({ url });
    logger.info("URL de registro Google obtida", getRequestMeta(req));
  } catch (error) {
    logger.error("Erro ao obter URL de registro do Google", {
      ...getRequestMeta(req),
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: "Internal server error" });
  }
};

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await loginUser(email, password);

    // [SECURITY FIX - V2] JWT com expiração de 2 horas
    const token = jwt.sign(
      {
        _id: user.id,
        email: user.email,
      },
      process.env.SECRET,
      { expiresIn: "2h" }
    );

    // [SECURITY FIX - V1/V14] Cookie com sameSite strict e maxAge
    res.cookie("userAuth", token, {
      secure: true,
      httpOnly: true,
      sameSite: "strict",
      maxAge: 2 * 60 * 60 * 1000,
    });
    res.status(200).json({ message: "User logged in successfully" });
    logger.info(
      "Usuário logado com sucesso",
      getRequestMeta(req, { userId: user.id }),
    );
  } catch (error) {
    if (error.message === "Incorrect email or password") {
      logger.warn("Falha no login", {
        ...getRequestMeta(req),
        error: error.message,
      });
      return res.status(401).json({
        error: error.message,
        attemptsRemaining: error.remainingAttempts,
      });
    }

    if (error.message === "Email não verificado") {
      logger.warn("Tentativa de login com email não verificado", {
        ...getRequestMeta(req),
        error: error.message,
      });
      return res.status(401).json({ message: error.message });
    }

    if (error.message === "Usuário bloqueado por muitas tentativas") {
      logger.warn(
        "Tentativa de login para usuário bloqueado por muitas tentativas",
        { ...getRequestMeta(req), error: error.message },
      );
      return res.status(401).json({ message: error.message });
    }

    logger.error("Erro ao tentar logar usuário", {
      ...getRequestMeta(req),
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: "Internal server error" });
  }
};

export const signInWithOauth = async (req, res) => {
  try {
    const { code } = req.query;
    const user = await loginUserByOauth(code);

    // [SECURITY FIX - V2] JWT com expiração de 2 horas
    const token = jwt.sign(
      {
        name: user.name,
        _id: user.id,
        subscriptionExpire: user.subscriptionExpiresAt,
        subscriptionPlan: user.subscriptionPlan,
        email: user.email,
      },
      process.env.SECRET,
      { expiresIn: "2h" }
    );

    // [SECURITY FIX - V1/V14] Cookie com sameSite strict e maxAge
    res.cookie("userAuth", token, {
      secure: true,
      httpOnly: true,
      sameSite: "strict",
      maxAge: 2 * 60 * 60 * 1000,
    });
    res.status(200).json({ message: "User logged in successfully" });
    logger.info(
      "Usuário logado com sucesso via OAuth",
      getRequestMeta(req, { userId: user.id }),
    );
  } catch (error) {
    if (error.message === "Conta não encontrada") {
      logger.warn("Falha no login via OAuth", {
        ...getRequestMeta(req),
        error: error.message,
      });
      return res.status(401).json({ message: "Conta não encontrada" });
    }

    logger.error("Erro ao tentar logar usuário via OAuth", {
      ...getRequestMeta(req),
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: "Internal server error" });
  }
};

export const signUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await registerUser(name, email, password);

    logger.info(
      "Usuário registrado com sucesso",
      getRequestMeta(req, { userId: user.id }),
    );

    res.status(201).json({
      message: "User registered successfully, please verify your email",
    });
  } catch (error) {
    // [SECURITY FIX - V11] Mensagem genérica para evitar user enumeration
    if (error.message === "User already exists") {
      logger.warn("Tentativa de registro com email existente", {
        ...getRequestMeta(req),
      });
      return res.status(201).json({ message: "If this email is not registered, a verification link has been sent" });
    }

    logger.error("Erro ao tentar registrar usuário", {
      ...getRequestMeta(req),
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyUser = async (req, res) => {
  const { token } = req.query;
  let service;

  try {
    service = await verifyEmail(token);

    logger.info(
      "Usuário registrado com sucesso",
      getRequestMeta(req, { userId: service.id }),
    );
    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    if (
      error.message === "Token ausente" ||
      error.message === "Token inválido" ||
      error.message === "Usuário não encontrado" ||
      error.message === "Email já verificado"
    ) {
      return res.status(401).json({ error: error.message });
    }

    logger.error("Erro ao verificar email", {
      ...getRequestMeta(req, { usuarioId: service?._id || "Desconecido" }),
      error: error.message,
      stack: error.stack,
    });

    res.status(500).json({ error: "Erro ao verificar email" });
  }
};

export const signUpWithOauth = async (req, res) => {
  try {
    const { code } = req.query;
    const user = await registerUserByOauth(code);

    // [SECURITY FIX - V2] JWT com expiração de 2 horas
    const token = jwt.sign(
      {
        _id: user.id,
        email: user.email,
      },
      process.env.SECRET,
      { expiresIn: "2h" }
    );

    // [SECURITY FIX - V1/V14] Cookie com sameSite strict e maxAge
    res.cookie("userAuth", token, {
      secure: true,
      httpOnly: true,
      sameSite: "strict",
      maxAge: 2 * 60 * 60 * 1000,
    });
    res.status(201).json({ message: "User registered successfully" });
    logger.info(
      "Usuário registrado com sucesso via OAuth",
      getRequestMeta(req, { userId: user.id }),
    );
  } catch (error) {
    if (error.message === "User already exists") {
      logger.warn("Tentativa de registro via OAuth com conta existente", {
        ...getRequestMeta(req),
        error: error.message,
      });
      return res.status(401).json({ message: "User already exists" });
    }

    logger.error("Erro ao tentar registrar usuário via OAuth", {
      ...getRequestMeta(req),
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: "Internal server error" });
  }
};

// [SECURITY FIX - V8] Render pages não devem depender de req.user._id
export const renderLoginPage = async (req, res) => {
  const user = req.user?._id !== "freeAccess" ? req.user : null;
  try {
    res.render("login", { user: user, error: null, success: null });
    logger.info("Página de login renderizada", getRequestMeta(req));
  } catch (error) {
    logger.error("Erro ao renderizar página de login", {
      ...getRequestMeta(req),
      error: error.message,
      stack: error.stack,
    });
    res.status(500).render("login", {
      user: null,
      error: "Erro interno do servidor",
      success: null,
    });
  }
};

// [SECURITY FIX - V8] Render pages não devem depender de req.user._id
export const renderRegisterPage = async (req, res) => {
  const user = req.user?._id !== "freeAccess" ? req.user : null;
  try {
    res.render("register", { user: user, error: null, success: null });
    logger.info("Página de registro renderizada", getRequestMeta(req));
  } catch (error) {
    logger.error("Erro ao renderizar página de registro", {
      ...getRequestMeta(req),
      error: error.message,
      stack: error.stack,
    });
    res.status(500).render("register", {
      user: null,
      error: "Erro interno do servidor",
      success: null,
    });
  }
};
