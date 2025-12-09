import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

import User from '../../models/User.js'

export const signIn = async (req, res) => {
    const email = req.body.email;
    const selectedUser = await User.findOne({ email }).lean()
    if(!selectedUser) return res.status(400).send("Incorrect email or password");

    const passwordMatch = await bcrypt.compare(req.body.password, selectedUser.password);
    if (!passwordMatch) return res.status(400).send("Incorrect email or password.");

    try {
        let token = jwt.sign( { _id : selectedUser._id, subscription: selectedUser.subscription, email }, process.env.SECRET )
        res.cookie('userAuth', token, { secure: true, httpOnly: true, expires: new Date(Date.now() + 2 * 3600000) })
        res.status(200).json({ message: "User logged in successfully" })
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
        console.error('User failed to log in', error)
    } 
}