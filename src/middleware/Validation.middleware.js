import {body,validationResult} from 'express-validator';


function validate(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}




export const registerValidationRules = [

    body('username')
        .isString().withMessage('Username must be a string')
        .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters long'),
    body('email')
        .isEmail().withMessage('Please provide a valid email address'),
   body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')

    , validate
]
