import { body, validationResult } from 'express-validator';

export const postValidate = [
    body('post')
        .trim()
        .notEmpty().withMessage('The field post is empty, please enter something.'),

    (req, res, next) => {
        const error = validationResult(req).formatWith(({ msg }) => msg);
        if(!error.isEmpty()) return res.status(400).json({ error: error.array() });

        next();
    }
]