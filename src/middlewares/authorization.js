import jwt from 'jsonwebtoken';

export const auth =  (req, res, next) => {
    try {
        const cookie = req.cookies.userAuth;
        if(!cookie){ 
            res.cookie('userAuth', 'freeAccess', { secure: true, httpOnly: true, expires: new Date(Date.now() + 2 * 3600000) });
            req.user = { state: 'freeAccess' }; // Usuário não autenticado, acesso livre. Exeto em rotas protegidas | conteudos premium
            return next();
        };
        
        if(cookie === 'freeAccess'){
            req.user = { state: 'freeAccess' };
            return next();
        }

        const userVerified = jwt.verify(cookie, process.env.SECRET);
        req.user = userVerified;
        next();
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
        console.error(error)
    }
}