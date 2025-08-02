import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { AppError } from '../utils/AppError';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../types/types';

export const verifyLoggedAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const token =
            req.cookies?.adminAccessToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new AppError("Unauthorized: Token not found", 401);
        }

        const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET!) as JwtPayload & { id: string };

        if (!decoded?.id) {
            throw new AppError("Invalid token payload", 401);
        }

        const admin = await prisma.admin.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                userName: true,
                email: true,
                role: true,
            },
        });

        if (!admin) {
            throw new AppError("User not found", 401);
        }

        req.admin = admin;
        next();
    } catch (error: any) {
        next(new AppError(error?.message || "Authentication failed", 401));
    }
};


export const verifyLoggedUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new AppError("Unauthorized: Token not found", 401);
        }

        const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET!) as JwtPayload & { id: string };

        if (!decoded?.id) {
            throw new AppError("Invalid token payload", 401);
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                userName: true,
                email: true,
                type: true,
            },
        });

        if (!user) {
            throw new AppError("User not found", 401);
        }

        req.user = user;
        next();
    } catch (error: any) {
        next(new AppError(error?.message || "Authentication failed", 401));
    }
};