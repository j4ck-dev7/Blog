// Importação de depêndencias 
import { body, validationResult } from 'express-validator';

export const loginValidate = [ 
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email address'),

    body('password')
        .notEmpty().withMessage('password is required'),

    (req, res, next) => {
        const error = validationResult(req);
        if(!error.isEmpty()) return res.status(400).json({ error: error.array() })

        next()
    },
]