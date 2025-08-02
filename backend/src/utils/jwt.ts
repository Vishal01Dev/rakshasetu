import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';

const JWT_ACCESS_TOKEN_SECRET: Secret = process.env.JWT_ACCESS_TOKEN_SECRET!;
const JWT_ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_ACCESS_TOKEN_EXPIRES_IN as `${number}${'d' | 'h' | 'm' | 's'}` || '2d';

const JWT_REFRESH_TOKEN_SECRET: Secret = process.env.JWT_REFRESH_TOKEN_SECRET!;
const JWT_REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_TOKEN_EXPIRES_IN as `${number}${'d' | 'h' | 'm' | 's'}` || '15d';



export const generateAccessToken = (payload: object) => {
  const options: SignOptions = {
    expiresIn: JWT_ACCESS_TOKEN_EXPIRES_IN,
  };

  return jwt.sign(payload, JWT_ACCESS_TOKEN_SECRET, options);
};

export const generateRefreshToken = (payload: object) => {
  const options: SignOptions = {
    expiresIn: JWT_REFRESH_TOKEN_EXPIRES_IN,
  };

  return jwt.sign(payload, JWT_REFRESH_TOKEN_SECRET, options);
};

export const verifyAccessToken = (token: string): JwtPayload & { id: string } | null => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_TOKEN_SECRET) as JwtPayload & { id: string };
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
};

export const verifyRefreshToken = (token: string): JwtPayload & { id: string } | null => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_TOKEN_SECRET) as JwtPayload & { id: string };
    return decoded;
  } catch (error) {
    return null; // Let caller handle the error
  }
};