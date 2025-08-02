import { env } from './env';

export const emailConfig = {
  host: env.EMAIL_HOST,
  port: Number(env.EMAIL_PORT),
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
  from: {
    name: env.EMAIL_FROM_NAME,
    email: env.EMAIL_FROM_EMAIL,
  },
};