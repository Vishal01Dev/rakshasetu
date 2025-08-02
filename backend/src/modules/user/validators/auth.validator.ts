import { z } from 'zod';


export const registerSchema = z.object({
    firstName: z.coerce.string().min(1),
    lastName: z.coerce.string().min(1),
    email: z.coerce.string().email(),
    mobile: z.coerce.string().min(10).max(15),
    password: z.coerce.string().min(6),
    type: z.enum(['BUYER', 'SELLER']),
    business: z.coerce.string(),
});


export const verifyEmailSchema = z.object({
    email: z.string().email(),
    code: z.string().length(6).regex(/^\d+$/, 'Code must be a 6-digit number'),
});

export const loginSchema = z.object({
    emailOrUsername: z.string(),
    password: z.string().min(6),
});


export const resetPasswordSchema = z.object({
    newPassword: z.string().min(6),
    conPassword: z.string().min(6),
})