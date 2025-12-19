import jwt from 'jsonwebtoken' 
import bcrypt from 'bcryptjs'

import { prisma } from '../../lib/prisma.js';

export const signIn = async (req, res) => {
    const email = req.body.email;
    const selectedUser = await prisma.user.findUnique({
        where: {
            email
        },
        select: { // Trazer do documento apenas campos necessários 
            name: true,
            email: true,
            password: true,
            id: true,
            subscriptionExpiresAt: true,
            subscriptionPlan: true
        }
    })
    if(!selectedUser) return res.status(400).send("Incorrect email or password");

    const passwordMatch = await bcrypt.compare(req.body.password, selectedUser.password);
    if (!passwordMatch) return res.status(400).send("Incorrect email or password.");

    try {
        let token = jwt.sign( { 
            name: selectedUser.name, 
            _id : selectedUser.id, 
            subscriptionExpire: selectedUser.subscriptionExpiresAt, 
            subscriptionPlan: selectedUser.subscriptionPlan, 
            email 
        }, process.env.SECRET )
        res.cookie('userAuth', token, { secure: true, httpOnly: true, expires: new Date(Date.now() + 2 * 3600000) })
        res.status(200).json({ message: "User logged in successfully" })
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
        console.error('User failed to log in', error)
    } 
}