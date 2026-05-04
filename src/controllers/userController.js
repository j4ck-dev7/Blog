import jwt from 'jsonwebtoken'
import { loginUser, loginUserByOauth, registerUser, registerUserByOauth, getUrlForOauthSignIn, getUrlForOauthSignUp } from '../services/userService.js';

export const getSignInGoogleUrl = async (req, res) => {
    try {
        const url = await getUrlForOauthSignIn();
        res.status(200).json({ url });
    } catch (error) {
        console.error('Error getting Google sign in URL:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const getSignUpGoogleUrl = async (req, res) => {
    try {
        const url = await getUrlForOauthSignUp();
        res.status(200).json({ url });
    } catch (error) {
        console.error('Error getting Google sign up URL:', error);
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
    } catch (error) {
        if (error.message === 'Incorrect email or password') {
            return res.status(401).json({ message: "Incorrect email or password" });
        }

        console.error('User failed to log in', error);
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
    } catch (error) {
        if (error.message === 'Conta não encontrada') {
            return res.status(401).json({ message: "Conta não encontrada" });
        }

        console.error('User failed to log in', error);
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
    } catch (error) {
        if (error.message === 'User already exists') {
            return  res.status(401).json({ message: 'User already exists' });
        }
        
        console.error('User failed to register', error);
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
    } catch (error) {
        if (error.message === 'User already exists') {
            return  res.status(401).json({ message: 'User already exists' });
        }
        
        console.error('User failed to register', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}