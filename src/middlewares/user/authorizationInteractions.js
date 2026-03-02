export const authInteractions = (req, res, next) => {
    try {
        if(!req.user._id){
            return res.status(401).json({ message: 'Unauthorized. Please register or login to perform this action' });
        }

        if(req.user.state === 'freeAccess'){
            return res.status(401).json({ message: 'Unauthorized. Please register or login to perform this action' });
        };

        next();
    } catch (error) {
        console.error('Error during authorization interactions', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}