// import jwt from 'jsonwebtoken';

// export const adminAuth = (req, res, next) => {
//     const cookie = req.cookies.adminAuth;
//     if(!cookie) return res.status(401).send('Access denied');

//     try {
//         const adminVeriefied = jwt.verify(cookie, process.env.SECRET);
//         if(adminVeriefied.role === 'user'){
//             return res.status(403).send('You are not allowed');
//         };
//         next();
//     } catch (error) {
//         res.status(500).json({ message: 'Internal server error' });
//         console.error(error);
//     }
// }