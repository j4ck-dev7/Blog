import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { prisma } from '../../lib/prisma.js'; 

export const signUp = async (req, res) => {
    const email = req.body.email;

    try {
        const selectedUser = await prisma.user.findUnique({
            where: {
                email
            }
        })
        if(selectedUser) return res.status(409).send('Existing email');

        const user = await prisma.user.create({
            data: {
                email,
                name: req.body.name,
                password: bcrypt.hashSync(req.body.password)
            } 
        })
        let token = jwt.sign( { 
            _id : user._id, 
            subscriptionExpires: user.subscriptionExpiresAt, 
            subscriptionPlan: user.subscriptionPlan, 
            email 
        }, process.env.SECRET );
        res.cookie('userAuth', token, { secure: true, httpOnly: true, expires: new Date(Date.now() + 2 * 3600000) });
        res.status(201).json({ message: "User successfully registered" });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
        console.error('Error creating a new user', error)
    }
}
