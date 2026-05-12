import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import stripe from "../config/stripe.js";
import { 
    findUserByEmail, 
    verifyUserExistsByEmail, 
    createUser, 
    updateUserSubscription, 
    findUserBySub, 
    verifyUserExistsBySub, 
    createUserWithOauth,
    changeUserStatusActive,
    findUserById,
} from "../repositories/userRepository.js";
import CryptoJS from "crypto-js";
import { OAuth2Client } from 'google-auth-library'
import { logger } from '../config/logger.js';
import { transporter } from '../config/nodemailer.js';
import { incrementLoginAttempts, resetLoginAttempts, isLockedOut } from "../utils/redisLoginAttempts.js";

export const getUrlForOauthSignUp = async () => {
    const state =  CryptoJS.SHA256('testGoogle').toString(CryptoJS.enc.Hex);

    logger.info('getUrlForOauthSignUp called');

    const client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URL_SIGNUP,
    );

    const authorizationUrl = client.generateAuthUrl({
        access_type: 'offline',
        state,
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ],
        include_granted_scopes: true
    });

    return authorizationUrl
}

export const getUrlForOauthSignIn = async () => {
    const state =  CryptoJS.SHA256('testGoogle').toString(CryptoJS.enc.Hex);

    logger.info('getUrlForOauthSignIn called');

    const client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URL_SIGNIN
    );

    const authorizationUrl = client.generateAuthUrl({
        access_type: 'offline',
        state,
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
        ],
        include_granted_scopes: true
    });

    return authorizationUrl
}

export const registerUser = async (name, email, password) => {
    logger.info('registerUser called', { name, email });
    const existingUser = await verifyUserExistsByEmail(email);
    if (existingUser) {
        logger.warn('registerUser - email already exists', { email });
        throw new Error('User already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await createUser(name, email, passwordHash);
    logger.info('registerUser - success', { id: newUser?.id, email: newUser?.email });

    const token = jwt.sign({ id: newUser.id, email: email }, process.env.EMAIL_VERIFICATION_SECRET, { expiresIn: 1000 * 60 * 10 });
    const verificationLink = `http://localhost:5000/verify-email?token=${token}`;
    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Verificação de Email',
        html: `<p>Olá ${name},</p>
               <p>Obrigado por se registrar. Por favor, clique no link abaixo para verificar seu email:</p>
               <a href="${verificationLink}">Verificar Email</a>
               <p>Este link expira em 10 minutos.</p>`
    })

    logger.info('Email de verificação enviado com sucesso', { email, usuarioId: newUser.id });

    return newUser;
}

export const verifyEmail = async (token) => {
    logger.debug('Iniciando processo de verificação de email', {
        usuarioId: 'Desconecido',
    });

    if(!token){
        logger.warn('Tentativa de verificação de email sem token', {
            usuarioId: 'Desconecido',
        });
        throw new Error('Token ausente');
    }

    const decoded = jwt.verify(token, process.env.EMAIL_VERIFICATION_SECRET);
    if (!decoded) {
        logger.warn('Token de verificação de email inválido', {
            usuarioId: 'Desconecido',
        });
        throw new Error('Token inválido');
    }

    const user = await findUserById(decoded.id);
    if (!user) {
        logger.warn('Usuário não encontrado para token de verificação de email', {
            usuarioId: 'Desconecido',
        });
        throw new Error('Usuário não encontrado');
    };

    if(user.email !== decoded.email) {
        logger.warn('Token de verificação de email não corresponde ao usuário', {
            usuarioId: user.id,
        });
        throw new Error('Token inválido');
    }

    if (user.isEmailVerified) {
        logger.info('Email já verificado', {
            usuarioId: user.id,
        });
        throw new Error('Email já verificado');
    }

    await changeUserStatusActive(user.id);
    logger.info('Email do usuário verificado com sucesso', {
        usuarioId: user.id,
    });

    return user;
}

export const registerUserByOauth = async (code) => {
    const client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URL_SIGNUP,
    );
    
    const { tokens } = await client.getToken(code)

    const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID
    });

    const { email, name, sub } = ticket.payload
    logger.info('registerUserByOauth called', { sub, email });

    const verifyIfUserExists = await verifyUserExistsBySub(sub);
    if(verifyIfUserExists) {
        logger.warn('registerUserByOauth - user already exists', { sub });
        throw new Error('User already exists');
    }

    const newUser = await createUserWithOauth(name, email, sub);
    logger.info('registerUserByOauth - success', { id: newUser?.id, sub, email });
    return newUser;
}

export const loginUser = async (email, password) => {
    logger.info('loginUser attempt', { email });
    const locked = await isLockedOut(email);
    if (locked) {
        logger.warn('Tentativa de login para usuário bloqueado por muitas tentativas', {
            usuarioId: 'Desconecido',
            email
        });

        throw new Error('Usuário bloqueado por muitas tentativas');
    }

    const user = await findUserByEmail(email);
    const passwordHash = user?.password || '$2b$10$invalidpasswordhash00000000000000000000000000000000000000';
    const isValidPassword = await bcrypt.compare(passwordHash, user.password);

    if (!user || !isValidPassword) {
        const loginAttemps = await incrementLoginAttempts(email);
        
        logger.warn('Tentativa de login com credenciais incorretas', {
            usuarioId: 'Desconecido',
            email,
            tentativas: loginAttemps.attempts
        });

        const error = new Error('Email ou senha incorretos');
        error.attempts = loginAttemps.attempts;
        error.remainingAttempts = 5 - loginAttemps.attempts;
        throw error;
    }

    if(!user.isEmailVerified){
        logger.warn('Tentativa de login com email não verificado', {
            usuarioId: user.id,
        });

        throw new Error('Email não verificado');
    }

    await resetLoginAttempts(email);

    logger.info('loginUser success', { id: user.id, email: user.email });
    return user;
}

export const loginUserByOauth = async (code) => {
    const client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URL_SIGNIN,
    );
    
    const { tokens } = await client.getToken(code)

    const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID
    });

    const { sub } = ticket.payload
    logger.info('loginUserByOauth called', { sub });

    const userVerify = await verifyUserExistsBySub(sub);
    if (!userVerify) {
        logger.warn('loginUserByOauth - account not found', { sub });
        throw new Error('Conta não encontrada');
    };

    const user = await findUserBySub(sub);
    logger.info('loginUserByOauth success', { id: user?.id, sub });
    return user
}

export const generateUrlForSubscription = async (userId, plan) => {
    if(!userId || userId === 'freeAccess'){
        logger.warn('generateUrlForSubscription - user not authenticated', { userId });
        throw new Error('User not authenticated, please login or register');
    }

    let amount;
    switch(plan) {
        case 'basic': amount = 500; break;
        case 'intermediate': amount = 700; break;
        case 'premium': amount = 1000; break;
        default: throw new Error('Invalid plan');
    };

    if(!isValidCuid(userId)){
        logger.warn('changeUserSubscription - invalid userId format', { userId });
        throw new Error('Invalid userId format');
    }
        
    const session = await stripe.checkout.sessions.create({ // Cria a sessão de checkout na stripe com os dados necessários para o pagamento
        mode: 'subscription',
        payment_method_types: ['card'],
        customer_email: req.user.email,
        line_items: [{
            price_data: {
                currency: 'brl',
                product_data: { name: `Plano ${plan}` },
                unit_amount: amount,
                recurring: { interval: "month" }
            },
            quantity: 1
        }],
        success_url: `http://localhost:5000/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `http://localhost:5000/cancel?plan=${plan}&user=${userId}`,
        metadata: { userId, plan } // Define o metatdata para identificar o usuário e o plano na hora do webhook para efetuar a assinatura (Modificar o usuário no banco de dados)
    })

    return session.url;
}

export const changeUserSubscription = async (sig, body) => {
    try {
        let update, plan, userId;

        logger.info('changeUserSubscription called (webhook)')
        let event = stripe.webhooks.constructEvent(
            body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
        
        if(event.type === 'checkout.session.completed'){ // Verifica se o evento é de checkout completo para 
            const session = event.data.object; // O session tem os dados da compra
            userId = session.metadata.userId; // O metadata foi definido na criação da sessão de checkout
            plan = session.metadata.plan;

            logger.info('changeUserSubscription called', { userId, plan });

            if(!isValidCuid(userId)){
                logger.warn('changeUserSubscription - invalid userId format', { userId });
                throw new Error('Invalid userId format');
            }

            switch(plan) { 
                case 'basic':; break;
                case 'intermediate':; break;
                case 'premium':; break;
                default: throw new Error('Invalid plan');
            };

            update = await updateUserSubscription(userId, plan);
            logger.info('changeUserSubscription success', { id: update.id, plan: plan });
        }

        return update;
    } catch (error) {
        logger.error('changeUserSubscription failed', { userId, plan, error });
        throw error;
    }
}