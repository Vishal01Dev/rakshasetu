import { date, z } from 'zod';

export const changePasswordSchema = z.object({
    oldPassword: z.string().min(6),
    newPassword: z.string().min(6),
    conPassword: z.string().min(6),
})


export const updateUserSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    userName: z.string().min(3).max(20),
    email: z.string().email(),
    mobile: z.string().min(10).max(15).optional(),
    address: z.object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        pinCode: z.string().optional(),
    }),
    business: z.string()
})

export const kycVerificationSchema = z.object({
    panNumber: z.string().min(10).max(10),
    aadharNumber: z.string().min(12).max(12),
    FullNameAsPerAadhar: z.string().min(3).max(50),
    FullNameAsPerPan: z.string().min(3).max(50),
    dateOfBirth: z.string()
})

export const gstVerificationSchema = z.object({
    gstNumber: z.string().min(15).max(15),
})

export const bankVerificationSchema = z.object({
    accountHolderName: z.string().min(3).max(50),
    accountNumber: z.string().min(10).max(20),
    ifscCode: z.string().min(11).max(11),
})