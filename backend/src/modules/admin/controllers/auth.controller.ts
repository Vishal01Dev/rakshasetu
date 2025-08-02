import prisma from "../../../config/db";
import { cookieOptions } from "../../../constants";
import { AppError } from "../../../utils/AppError";
import { asyncHandler } from "../../../utils/asyncHandler";
import { generateAccessToken } from "../../../utils/jwt";
import { sendVerificationEmail } from "../../../utils/sendEmail";
import { resetPasswordSchema, verifyEmailSchema } from "../../user/validators/auth.validator";
import { handleForgotPassword, handleLoginAdmin, handleResetPassword, handlVerifyEmail } from "../services/auth.service";
import { adminLoginSchema } from "../validators/auth.validator";

import z from 'zod'

export const loginAdmin = asyncHandler(async (req, res, next) => {

    try {
        const { emailOrUsername, password } = adminLoginSchema.parse(req.body)

        const { admin, message } = await handleLoginAdmin(emailOrUsername, password);

        if (message) {
            res.status(201).json({ success: true, message });
        }

        let accessToken;

        if (admin) {
            accessToken = generateAccessToken({
                id: admin.id,
                email: admin.email,
                userName: admin.userName,
                firstName: admin.firstName,
                lastName: admin.lastName,
                role: admin.role,
            })
        }

        res.cookie("adminAccessToken", accessToken, cookieOptions);

        res.status(200).json({ success: true, admin });

    } catch (err) {
        next(err)
    }

})

export const logoutAdmin = asyncHandler(async (req, res, next) => {
    res.clearCookie("adminAccessToken", {
        ...cookieOptions,
        maxAge: 0,
    });

    res.status(200).json({ success: true, message: 'Logged out successfully.' });

})


export const verifyEmail = asyncHandler(async (req, res, next) => {
    try {

        const { email, code } = verifyEmailSchema.parse(req.body);

        const { accessToken, updatedAdmin } = await handlVerifyEmail(email, code)

        res.cookie("adminAccessToken", accessToken, cookieOptions);

        res.status(200).json({
            success: true,
            message: 'Email verified successfully. You are now logged in.',
            user: {
                id: updatedAdmin.id,
                firstName: updatedAdmin.firstName,
                lastName: updatedAdmin.lastName,
                email: updatedAdmin.email,
                userName: updatedAdmin.userName,
                role: updatedAdmin.role,
                emailVerified: updatedAdmin.emailVerified,
            },
        });

    } catch (err) {
        next(err)
    }
})

export const resendOtp = asyncHandler(async (req, res, next) => {
    try {
        const { email } = z
            .object({
                email: z.string().email(),
            })
            .parse(req.body);

        const admin = await prisma.admin.findUnique({ where: { email } });
        if (!admin) throw new AppError('Admin not found', 404);

        if (admin.emailVerified) throw new AppError('Email already verified', 400);

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        await prisma.admin.update({
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

