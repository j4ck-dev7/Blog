import jwt from 'jsonwebtoken'
import { loginUser, loginUserByOauth, registerUser, registerUserByOauth, getUrlForOauthSignIn, getUrlForOauthSignUp } from '../services/userService.js';
import { logger } from '../config/logger.js';
import { getRequestMeta } from '../config/requestMeta.js';

export const getSignInGoogleUrl = async (req, res) => {
    try {
        const url = await getUrlForOauthSignIn();
        res.status(200).json({ url });
        logger.info('URL de login Google obtida', getRequestMeta(req));
    } catch (error) {
        logger.error('Erro ao obter URL de login do Google', { ...getRequestMeta(req), error: error.message, stack: error.stack });
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const getSignUpGoogleUrl = async (req, res) => {
    try {
        const url = await getUrlForOauthSignUp();
        res.status(200).json({ url });
        logger.info('URL de registro Google obtida', getRequestMeta(req));
    } catch (error) {
        logger.error('Erro ao obter URL de registro do Google', { ...getRequestMeta(req), error: error.message, stack: error.stack });
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await loginUser(email, password);

        const token = jwt.sign(
            {
                name: user.name,
                _id: user.id,
                subscriptionExpire: user.subscriptionExpiresAt,
                subscriptionPlan: user.subscriptionPlan,
                email: user.email
            },
            process.env.SECRET
        );
        
        res.cookie('userAuth', token, { secure: true, httpOnly: true, expires: new Date(Date.now() + 2 * 3600000) });
        res.status(200).json({ message: "User logged in successfully" });
        logger.info('Usuário logado com sucesso', getRequestMeta(req, { userId: user.id }));
    } catch (error) {
        if (error.message === 'Incorrect email or password') {
            logger.warn('Falha no login', { ...getRequestMeta(req), error: error.message });
            return res.status(401).json({ message: "Incorrect email or password" });
        }

        logger.error('Erro ao tentar logar usuário', { ...getRequestMeta(req), error: error.message, stack: error.stack });
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const signInWithOauth = async (req, res) => {
    try {
        const { code } = req.query;
        const user = await loginUserByOauth(code);

        const token = jwt.sign(
            {
                name: user.name,
                _id: user.id,
                subscriptionExpire: user.subscriptionExpiresAt,
                subscriptionPlan: user.subscriptionPlan,
                email: user.email
            },
            process.env.SECRET
        );
        
        res.cookie('userAuth', token, { secure: true, httpOnly: true, expires: new Date(Date.now() + 2 * 3600000) });
        res.status(200).json({ message: "User logged in successfully" });
        logger.info('Usuário logado com sucesso via OAuth', getRequestMeta(req, { userId: user.id }));
    } catch (error) {
        if (error.message === 'Conta não encontrada') {
            logger.warn('Falha no login via OAuth', { ...getRequestMeta(req), error: error.message });
            return res.status(401).json({ message: "Conta não encontrada" });
        }

        logger.error('Erro ao tentar logar usuário via OAuth', { ...getRequestMeta(req), error: error.message, stack: error.stack });
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const signUp = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await registerUser(name, email, password);

        const token = jwt.sign(
            {
                name: user.name,
                _id: user.id,
                subscriptionExpire: user.subscriptionExpiresAt,
                subscriptionPlan: user.subscriptionPlan,
                email: user.email
            },
            process.env.SECRET
        );
        
        res.cookie('userAuth', token, { secure: true, httpOnly: true, expires: new Date(Date.now() + 2 * 3600000) });
        res.status(201).json({ message: 'User registered successfully' });  
        logger.info('Usuário registrado com sucesso', getRequestMeta(req, { userId: user.id }));
    } catch (error) {
        if (error.message === 'User already exists') {
            logger.warn('Tentativa de registro com email existente', { ...getRequestMeta(req), error: error.message });
            return  res.status(401).json({ message: 'User already exists' });
        }
        
        logger.error('Erro ao tentar registrar usuário', { ...getRequestMeta(req), error: error.message, stack: error.stack });
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const signUpWithOauth = async (req, res) => {
    try {
        const { code } = req.query;
        const user = await registerUserByOauth(code);

        const token = jwt.sign(
            {
                name: user.name,
                _id: user.id,
                subscriptionExpire: user.subscriptionExpiresAt,
                subscriptionPlan: user.subscriptionPlan,
                email: user.email
            },
            process.env.SECRET
        );
        
        res.cookie('userAuth', token, { secure: true, httpOnly: true, expires: new Date(Date.now() + 2 * 3600000) });
        res.status(201).json({ message: 'User registered successfully' });  
        logger.info('Usuário registrado com sucesso via OAuth', getRequestMeta(req, { userId: user.id }));
    } catch (error) {
        if (error.message === 'User already exists') {
            logger.warn('Tentativa de registro via OAuth com conta existente', { ...getRequestMeta(req), error: error.message });
            return  res.status(401).json({ message: 'User already exists' });
        }
        
        logger.error('Erro ao tentar registrar usuário via OAuth', { ...getRequestMeta(req), error: error.message, stack: error.stack });
        res.status(500).json({ message: 'Internal server error' });
    }
}