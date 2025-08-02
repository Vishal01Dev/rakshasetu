import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  PORT: z.string().default('5000'),
  DATABASE_URL: z.string().url(),
  JWT_ACCESS_TOKEN_SECRET: z.string(),
  JWT_REFRESH_TOKEN_SECRET: z.string(),
  JWT_ACCESS_TOKEN_EXPIRES_IN: z.string().default('2d'),
  JWT_REFRESH_TOKEN_EXPIRES_IN: z.string().default('15d'),
  CLOUDINARY_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  SANDBOX_API_KEY: z.string(),
  SANDBOX_API_SECRET: z.string(),
  EMAIL_HOST: z.string(),
  EMAIL_PORT: z.string(),
  EMAIL_USER: z.string(),
  EMAIL_PASS: z.string(),
  EMAIL_FROM_NAME: z.string(),
  EMAIL_FROM_EMAIL: z.string(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
