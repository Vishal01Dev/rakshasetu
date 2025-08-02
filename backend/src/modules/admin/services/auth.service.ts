import prisma from "../../../config/db"
import { AppError } from "../../../utils/AppError";
import bcrypt from 'bcryptjs'
import { sendPasswordResetLinkEmail, sendVerificationEmail } from "../../../utils/sendEmail";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../../utils/jwt";

export const handleLoginAdmin = async (emailOrUsername: string, password: string) => {

    const admin = await prisma.admin.findFirst({
        where: {
            OR: [{ email: emailOrUsername }, { userName: emailOrUsername }],
        },
        include: {
            role: {
                include: {
                    permissions: true
                }
            }
        }
    });


    if (!admin) throw new AppError('Admin not found', 404);

    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) throw new AppError('Invalid credentials', 401);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();



    if (!admin.emailVerified) {
        await sendVerificationEmail(admin.email, verificationCode)

        const adminExists = await prisma.admin.findUnique({ where: { id: admin.id } });

        if (!adminExists) {
            throw new AppError('Admin not found', 404);
        }

        await prisma.admin.update({
            where: {
                id: admin.id
            },
            data: {
                verificationCode,
                verificationSentAt: new Date(),
            }
        })

        return {
            message: 'Please verify your email.',
        }
    }

    return {
        admin: {
            id: admin.id,
            firstName: admin.firstName,
            lastName: admin.lastName,
            userName: admin.userName,
            email: admin.email,
            role: admin.role,
        },
    };
}

export const handlVerifyEmail = async (email: string, code: string) => {

    const admin = await prisma.admin.findUnique({ where: { email } });

    if (!admin) throw new AppError('Admin not found', 404);

    if (admin.emailVerified) throw new AppError('Email already verified', 400);

    const expiry = new Date(admin.verificationSentAt!.getTime() + 10 * 60 * 1000);
    if (new Date() > expiry) throw new AppError('Verification code expired', 400);

    if (admin.verificationCode !== code) throw new AppError('Invalid verification code', 400);

    const updatedAdmin = await prisma.admin.update({
        where: { email },
        data: {
            emailVerified: true,
            emailVerifiedAt: new Date(),
            verificationCode: null,
            verificationSentAt: null,
        },
        include: {
            role: {
                include: {
                    permissions: true
                }
            }
        }
    });

    const accessToken = generateAccessToken({
        id: updatedAdmin.id,
        userName: updatedAdmin.userName,
        firstName: updatedAdmin.firstName,
        lastName: updatedAdmin.lastName,
        email: updatedAdmin.email,
        role: updatedAdmin.role,
    });

    return {
        accessToken, updatedAdmin
    }

}


export const handleForgotPassword = async (email: string): Promise<void> => {
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) throw new AppError('Admin not found', 404);

    const refreshToken = generateRefreshToken({
        id: admin.id,
        email: admin.email,
    });

    const resetLink = `${process.env.FRONTEND_URL}/admin/reset-password/${refreshToken}`;

    await prisma.admin.update({
        where: { email },
        data: {
            refreshToken,
            refreshTokenExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 min
        },
    });

    await sendPasswordResetLinkEmail(email, resetLink);
};

export const handleResetPassword = async (token: string, newPassword: string): Promise<void> => {
    const payload = verifyRefreshToken(token);
    if (!payload || typeof payload !== 'object' || !('id' in payload)) {
        throw new AppError('Invalid or expired token', 401);
    }

    const admin = await prisma.admin.findUnique({ where: { id: payload.id } });
    if (!admin) throw new AppError('Admin not found', 404);

    if (
        admin.refreshToken !== token ||
        !admin.refreshTokenExpires ||
        new Date() > admin.refreshTokenExpires
    ) {
        throw new AppError('Invalid or expired token', 401);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.admin.update({
        where: { id: admin.id },
        data: {
            password: hashedPassword,
            refreshToken: null,
            refreshTokenExpires: null,
        },
    });
};

