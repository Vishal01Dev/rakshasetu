import bcrypt from 'bcryptjs';
import prisma from '../../../config/db';
import { AppError } from '../../../utils/AppError';
import { generateUniqueUsername } from '../../../utils/generateUniqueUsername';

import { generateRefreshToken, verifyRefreshToken } from '../../../utils/jwt';
import { sendPasswordResetLinkEmail, sendVerificationEmail } from '../../../utils/sendEmail';
import { generateUID } from '../../../utils/generateUid';

export const register = async (data: {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  password: string;
  type: 'BUYER' | 'SELLER';
  business: string;
}) => {
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email: data.email }, { mobile: data.mobile }],
    },
  });

  if (existing) throw new AppError('Email or mobile already in use', 409);

  const hashedPassword = await bcrypt.hash(data.password, 10);
  const userName = await generateUniqueUsername(data.firstName, data.lastName);
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit

  const userId = await generateUID("usr", "user", "id", 8);

  const user = await prisma.user.create({
    data: {
      id: userId,
      ...data,
      password: hashedPassword,
      userName,
      verificationCode,
      verificationSentAt: new Date(),
    },
  });

  await sendVerificationEmail(user.email, verificationCode);

  return {
    message: 'Registered successfully. Please verify your email.',
  };
};

export const login = async (data: {
  emailOrUsername: string;
  password: string;
}) => {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: data.emailOrUsername }, { userName: data.emailOrUsername }],
    },
  });

  if (!user) throw new AppError('User not found', 404);

  const isValid = await bcrypt.compare(data.password, user.password);
  if (!isValid) throw new AppError('Invalid credentials', 401);

  return {
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      userName: user.userName,
      email: user.email,
      type: user.type,
    },
  };
};


export const handleForgotPassword = async (email: string): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError('User not found', 404);

  const refreshToken = generateRefreshToken({
    id: user.id,
    email: user.email,
  });

  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${refreshToken}`;

  await prisma.user.update({
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

  const user = await prisma.user.findUnique({ where: { id: payload.id } });
  if (!user) throw new AppError('User not found', 404);

  if (
    user.refreshToken !== token ||
    !user.refreshTokenExpires ||
    new Date() > user.refreshTokenExpires
  ) {
    throw new AppError('Invalid or expired token', 401);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      refreshToken: null,
      refreshTokenExpires: null,
    },
  });
};

