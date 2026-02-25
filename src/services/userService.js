import bcrypt from 'bcryptjs';
import { findUserByEmail, verifyUserExistsByEmail, createUser, updateUserSubscription, findUserBySub, verifyUserExistsBySub, createUserWithOauth } from "../repositories/userRepository.js";
import CryptoJS from "crypto-js";
import { OAuth2Client } from 'google-auth-library'

export const getUrlForOauthSignUp = async () => {
    const state =  CryptoJS.SHA256('testGoogle').toString(CryptoJS.enc.Hex);

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
    const existingUser = await verifyUserExistsByEmail(email);
    if (existingUser) {
        throw new Error('Email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await createUser(name, email, passwordHash);
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

    const verifyIfUserExists = await verifyUserExistsBySub(sub);
    if(verifyIfUserExists) {
        throw new Error('User already exists');
    }

    const newUser = await createUserWithOauth(name, email, sub);
    return newUser;
}

export const loginUser = async (email, password) => {
    const userVerify = await verifyUserExistsByEmail(email);
    if (!userVerify) {
        throw new Error('Invalid email or password');
    }

    const user = await findUserByEmail(email);

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        throw new Error('Invalid email or password');
    }

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
    
    const userVerify = await verifyUserExistsBySub(sub);
    if (!userVerify) {
        throw new Error('Conta não encontrada');
    };

    const user = await findUserBySub(sub);

    return user
}

export const subscribeUser = async (userId, plan) => {
    const updatedUser = await updateUserSubscription(userId, plan);

    return updatedUser;
}