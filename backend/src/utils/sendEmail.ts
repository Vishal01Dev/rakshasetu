import nodemailer from 'nodemailer';
import { emailConfig } from '../config/email';

const transporter = nodemailer.createTransport({
  host: emailConfig.host,
  port: emailConfig.port,
  secure: emailConfig.port === 465,
  auth: {
    user: emailConfig.auth.user,
    pass: emailConfig.auth.pass,
  },
});

export const sendVerificationEmail = async (to: string, code: string) => {
  const info = await transporter.sendMail({
    from: `"${emailConfig.from.name}" <${emailConfig.from.email}>`,
    to,
    subject: 'Email Verification - RakshaSetu',
    html: `
      <div style="font-family: sans-serif; line-height: 1.5">
        <h2>Hello from ${emailConfig.from.name} 👋</h2>
        <p>Your email verification code is:</p>
        <h1 style="color: #003C5C">${code}</h1>
        <p>This code is valid for 10 minutes.</p>
        <p>If you did not request this, you can safely ignore it.</p>
      </div>
    `,
  });

  console.log('✅ Email sent: %s', info.messageId);
};

export const sendPasswordResetLinkEmail = async (to: string, link: string) => {
  const info = await transporter.sendMail({
    from: `"${emailConfig.from.name}" <${emailConfig.from.email}>`,
    to,
    subject: 'Password Reset Request - RakshaSetu',
    html: `
      <div style="font-family: sans-serif; line-height: 1.5">
        <h2>Hello from ${emailConfig.from.name} 👋</h2>
        <p>Your password reset code is:</p>
        <h4 style="color: #003C5C">${link}</h4>
        <p>This link is valid for 10 minutes.</p>
        <p>If you did not request this, you can safely ignore it.</p>
      </div>
    `,
  });

  console.log('✅ Password reset email sent: %s', info.messageId);
};