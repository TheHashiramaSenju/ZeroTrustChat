import { Resend } from 'resend';
import config from '../config/environment.js';
import logger from '../utils/logger.js';

const resend = new Resend(config.RESEND_API_KEY);

class EmailService {
  static async sendOTPEmail(email, otp) {
    try {
      logger.info('Attempting to send OTP email', { email, otp });
      
      if (!config.RESEND_API_KEY) {
        logger.error('RESEND_API_KEY is not configured!');
        throw new Error('Email service not configured');
      }

      const { data, error } = await resend.emails.send({
        from: 'ZeroTrust Chat <noreply@send.zerotrustchatapp.xyz>',
        to: email,
        subject: 'Your ZeroTrust Chat Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">🔐 ZeroTrust Chat</h2>
            <p>Your verification code is:</p>
            <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h1 style="color: #1F2937; margin: 0; font-size: 36px; letter-spacing: 8px;">${otp}</h1>
            </div>
            <p style="color: #6B7280;">This code will expire in 10 minutes.</p>
            <p style="color: #6B7280; font-size: 12px; margin-top: 30px;">
              If you didn't request this code, please ignore this email.
            </p>
          </div>
        `,
      });

      if (error) {
        logger.error('Resend API error:', { error, email });
        throw new Error(error.message || 'Failed to send email');
      }

      logger.info('OTP email sent successfully!', { email, messageId: data?.id });
      return { success: true, messageId: data?.id };
    } catch (error) {
      logger.error('Email service error:', { error: error.message, email });
      throw error;
    }
  }

  static async sendPasswordResetEmail(email, resetToken) {
    try {
      logger.info('Attempting to send password reset email', { email });
      
      if (!config.RESEND_API_KEY) {
        throw new Error('Email service not configured');
      }

      const resetLink = `${config.FRONTEND_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

      const { data, error } = await resend.emails.send({
        from: 'ZeroTrust Chat <noreply@send.zerotrustchatapp.xyz>',
        to: email,
        subject: '🔒 Reset Your Password - ZeroTrust Chat',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">Password Reset Request</h2>
            <p>You requested to reset your password. Click the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background: #4F46E5; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
            </div>
            <p style="color: #6B7280; font-size: 14px;">Or use this code:</p>
            <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h1 style="color: #1F2937; margin: 0; font-size: 36px; letter-spacing: 8px;">${resetToken}</h1>
            </div>
            <p style="color: #6B7280;">This link expires in 15 minutes.</p>
            <p style="color: #EF4444; font-weight: bold;">If you didn't request this, please ignore this email.</p>
          </div>
        `,
      });

      if (error) {
        throw new Error(error.message || 'Failed to send email');
      }

      logger.info('Reset email sent!', { email });
      return { success: true };
    } catch (error) {
      logger.error('Email error:', { error: error.message });
      throw error;
    }
  }
}

export default EmailService;
