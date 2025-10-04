// Validates request bodies, params, and queries using a schema validator like Zod or Joi.
import { z } from 'zod';


export const Schemas = {
    auth: {
        register: z.object({
            email: z.string().email({ message: "A valid email is required" }),
            password: z.string().min(8, { message: "Password must be at least 8 characters" }),
        }),
        login: z.object({
            email: z.string().email(),
            password: z.string(),
        }),
        refresh: z.object({
            refreshToken: z.string().min(1),
        }),
    },
};

export const validateRequest = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    } catch (error) {
        const formattedErrors = error.flatten().fieldErrors;
        return res.status(400).json({ errors: formattedErrors });
    }
};
