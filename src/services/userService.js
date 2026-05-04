import bcrypt from 'bcryptjs';
import { findUserByEmail, verifyUserExistsByEmail, createUser, updateUserSubscription, findUserBySub, verifyUserExistsBySub, createUserWithOauth } from "../repositories/userRepository.js";
import CryptoJS from "crypto-js";
import { OAuth2Client } from 'google-auth-library'
import { logger } from '../config/logger.js';

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
        throw new Error('Email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await createUser(name, email, passwordHash);
    logger.info('registerUser - success', { id: newUser?.id, email: newUser?.email });
    return newUser;
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
    const userVerify = await verifyUserExistsByEmail(email);
    if (!userVerify) {
        logger.warn('loginUser failed - email not found', { email });
        throw new Error('Invalid email or password');
    }

    const user = await findUserByEmail(email);

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        logger.warn('loginUser failed - invalid password', { email });
        throw new Error('Invalid email or password');
    }

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

export const subscribeUser = async (userId, plan) => {
    logger.info('subscribeUser called', { userId, plan });
    const updatedUser = await updateUserSubscription(userId, plan);
    logger.info('subscribeUser success', { id: updatedUser?.id, plan: updatedUser?.subscriptionPlan });
    return updatedUser;
}