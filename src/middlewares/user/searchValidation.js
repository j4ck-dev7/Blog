import { query, validationResult } from "express-validator";

export const searchValidation = [
    query('search')
        .notEmpty()
        .withMessage('Search term is required')
        .isLength({ min: 2 })
        .withMessage('Search term must be at least 2 characters long')
    
    , (req, res, next) => {
        const error = validationResult(req).formatWith(({ msg }) => msg);
        if(!error.isEmpty()) return res.status(400).json({ error: error.array() });

        next();
    }
]