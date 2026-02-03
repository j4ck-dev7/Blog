import jwt from 'jsonwebtoken'
import { loginUser, registerUser } from '../../services/userService.js';

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