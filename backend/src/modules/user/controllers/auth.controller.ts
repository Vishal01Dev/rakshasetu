import { z } from 'zod';
import prisma from '../../../config/db';
import { cookieOptions } from '../../../constants';
import { AppError } from '../../../utils/AppError';
import { asyncHandler } from '../../../utils/asyncHandler';
import { generateAccessToken } from '../../../utils/jwt';
import { sendVerificationEmail } from '../../../utils/sendEmail';
import { handleForgotPassword, handleResetPassword, login, register } from '../services/auth.service';
import { loginSchema, registerSchema, resetPasswordSchema, verifyEmailSchema } from '../validators/auth.validator';

export const registerUser = asyncHandler(async (req, res, next) => {
    try {

        const cleanedBody = Object.fromEntries(
            Object.entries(req.body).map(([key, value]) => [key, value?.toString().trim() || undefined])
        );


        const data = registerSchema.parse(cleanedBody);
        const result = await register(data);
        res.status(201).json({ success: true, ...result });


    } catch (err) {
        next(err);
    }
})

export const verifyEmail = asyncHandler(async (req, res, next) => {
    try {
        const { email, code } = verifyEmailSchema.parse(req.body);

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) throw new AppError('User not found', 404);

        if (user.emailVerified) throw new AppError('Email already verified', 400);

        const expiry = new Date(user.verificationSentAt!.getTime() + 10 * 60 * 1000); // 10 minutes
        if (new Date() > expiry) throw new AppError('Verification code expired', 400);

        if (user.verificationCode !== code) throw new AppError('Invalid verification code', 400);

        const updatedUser = await prisma.user.update({
            where: { email },
            data: {
                emailVerified: true,
                emailVerifiedAt: new Date(),
                verificationCode: null,
                verificationSentAt: null,
            },
        });

        // ✅ Generate JWT token
        const accessToken = generateAccessToken({
            id: updatedUser.id,
            userName: updatedUser.userName,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            email: updatedUser.email,
            type: updatedUser.type,
        });

        // ✅ Set token as secure cookie
        res.cookie("accessToken", accessToken, cookieOptions);

        res.status(200).json({
            success: true,
            message: 'Email verified successfully. You are now logged in.',
            user: {
                id: updatedUser.id,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                email: updatedUser.email,
                userName: updatedUser.userName,
                type: updatedUser.type,
                emailVerified: updatedUser.emailVerified,
            },
        });
    } catch (err) {
        next(err);
    }
})

export const resendOtp = asyncHandler(async (req, res, next) => {
    try {
        const { email } = z
            .object({
                email: z.string().email(),
            })
            .parse(req.body);

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) throw new AppError('User not found', 404);

        if (user.emailVerified) throw new AppError('Email already verified', 400);

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        await prisma.user.update({
            where: { email },
            data: {
                verificationCode,
                verificationSentAt: new Date(),
            },
        });

        await sendVerificationEmail(email, verificationCode);

        res.json({ success: true, message: 'OTP resent successfully.' });
    } catch (err) {
        next(err);
    }
})

export const loginUser = asyncHandler(async (req, res, next) => {
    try {
        const data = loginSchema.parse(req.body);
        const { user } = await login(data);

        const accessToken = generateAccessToken({
            id: user.id,
            email: user.email,
            userName: user.userName,
            firstName: user.firstName,
            lastName: user.lastName,
            type: user.type,
        })



        res.cookie("accessToken", accessToken, cookieOptions);

        res.status(200).json({ success: true, user });

    } catch (err) {
        next(err);
    }
})


export const logoutUser = asyncHandler(async (req, res) => {
    res.clearCookie("accessToken", {
        ...cookieOptions,
        maxAge: 0,
    });

    res.status(200).json({ success: true, message: 'Logged out successfully.' });
})

export const forgotPassword = asyncHandler(async (req, res, next) => {
    try {
        const { email } = z.object({ email: z.string().email() }).parse(req.body);
        await handleForgotPassword(email);

        res.status(200).json({ success: true, message: 'Password reset link sent to your email.' });
    } catch (err) {
        next(err);
    }
})

export const resetPassword = asyncHandler(async (req, res, next) => {
    try {
        const { newPassword, conPassword } = resetPasswordSchema.parse(req.body);
        const token = req.params.token as string;

        if (newPassword !== conPassword) {
            throw new AppError('New password and confirmation do not match', 400);
        }

        if (!token) {
            throw new Error('Token not provided in URL');
        }


        await handleResetPassword(token, newPassword);

        res.status(200).json({ success: true, message: 'Password reset successfully.' });
    } catch (err) {
        next(err);
    }
})


