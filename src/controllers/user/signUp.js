import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import User from '../../models/User.js';

export const signUp = async (req, res) => {
    const email = req.body.email;
    const selectedUser = await User.findOne({ email }).lean();
    if(selectedUser) return res.status(409).send('Existing email');

    const user = new User({
        name: req.body.name,
        email,
        password: bcrypt.hashSync(req.body.password)
    });

    try {
        const savedUser = await user.save();
        let token = jwt.sign( { _id : savedUser._id, subscription: savedUser.subscription, email }, process.env.SECRET );
        res.cookie('userAuth', token, { secure: true, httpOnly: true, expires: new Date(Date.now() + 2 * 3600000) });
        res.status(201).json({ message: "User successfully registered" });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
        console.error('Error creating a new user', error)
    }
}
