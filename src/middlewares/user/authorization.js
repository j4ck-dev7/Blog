import jwt from 'jsonwebtoken';

export const auth = (req, res, next) => {
    const cookie = req.cookies.userAuth;
    if(!cookie) return res.status(401).send('You need to be logged in');

    try {
        const userVerified = jwt.verify(cookie, process.env.SECRET);
        req.user = userVerified; 
        next()
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
        console.error(error)
    }
}