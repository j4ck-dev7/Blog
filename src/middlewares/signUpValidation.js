import { body, validationResult } from 'express-validator';

export const signUpValidator = [ 
    body('name')
        .trim()
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3, max: 50 }).withMessage('Usernames must be between 3 and 20 characters long.')
        .isAlphanumeric().withMessage('Usernames must contain only letters and numbers.'),

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email address')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('password is required')
        .isLength({ min : 8 }).withMessage('The password must contain at least 8 characters.'),

    (req, res, next) => {
        const error = validationResult(req).formatWith(({ msg }) => msg);
        if(!error.isEmpty()) return res.status(400).json({ error: error.array() });

        next();
    }
]