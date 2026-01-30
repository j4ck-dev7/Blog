// import jwt from 'jsonwebtoken';
// import bcryptjs from 'bcryptjs';

// import User from '../../models/User.js';

// export const signIn = async (req, res) => {
//     const email = req.body.email;
//     const selectedUser = await User.findOne({ email }).lean();
//     if(!selectedUser) return res.status(400).send("Incorrect email or password");

//     const passwordMatch = await bcryptjs.compare(req.body.password, selectedUser.password);
//     if(!passwordMatch) return res.status(400).send("Incorrect email or password");

//     if(selectedUser.role === 'user') return res.status(401).send('Access Denied!');

//     try {
//         let token = jwt.sign({ _id: selectedUser._id, role: selectedUser.role }, process.env.SECRET);
//         res.cookie('adminAuth', token, { secure: true, httpOnly: true, expires: new Date(Date.now() + 2 * 3600000) });
//         res.status(200).json({ message: "Admin logged in successfully" });
//     } catch (error) {
//         res.status(500).json({ message: 'Internal server error' });
//         console.error('Admin failed to log in', error);
//     }
// }