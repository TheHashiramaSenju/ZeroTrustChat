import { Resend } from 'resend';
import logger from '../utils/logger.js';

const resend = new Resend(process.env.RESEND_API_KEY);

class EmailService {
  static async sendOTPEmail(email, otp) {
    try {
      logger.info(`Sending OTP to ${email}: ${otp}`);
      
      const { data, error } = await resend.emails.send({
        from: 'ZeroTrust <no-reply@zerotrustchatapp.xyz>',
        to: [email],
        subject: 'Your ZeroTrust Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #007bff;">🔐 ZeroTrust</h2>
            <p style="font-size: 16px;">Your verification code is:</p>
            <div style="background: #f8f9fa; padding: 30px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 8px;">${otp}</span>
            </div>
            <p>This code expires in 10 minutes.</p>
            <p style="color: #666; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
          </div>
        `
      });

      if (error) {
        logger.error('Resend error:', error);
        throw new Error(error.message);
      }

      logger.info(`OTP sent successfully to ${email}, message ID: ${data.id}`);
      return { success: true, messageId: data.id };
    } catch (error) {
      logger.error('EmailService.sendOTPEmail failed:', error);
      throw error;
    }
  }

  static async sendWelcomeEmail(email, username) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'ZeroTrust <no-reply@zerotrustchatapp.xyz>',
        to: [email],
        subject: `Welcome to ZeroTrust, ${username}!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #007bff;">Welcome ${username}!</h2>
            <p>Thanks for joining ZeroTrust Chat. Your account is now active.</p>
            <p style="text-align: center;">
              <a href="https://www.zerotrustchatapp.xyz" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Start Chatting</a>
            </p>
            <p style="color: #666; font-size: 14px;">&copy; 2025 ZeroTrust. Secure by design.</p>
          </div>
        `
      });

      if (error) throw new Error(error.message);
      return { success: true, messageId: data.id };
    } catch (error) {
      logger.error('Welcome email failed:', error);
      throw error;
    }
  }

  static async sendPasswordResetEmail(email, token) {
    const resetUrl = `https://www.zerotrustchatapp.xyz/reset-password?token=${token}`;
    
    try {
      const { data, error } = await resend.emails.send({
        from: 'ZeroTrust <no-reply@zerotrustchatapp.xyz>',
        to: [email],
        subject: 'Reset Your ZeroTrust Password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #dc3545;">Password Reset Request</h2>
            <p>You recently requested to reset your password.</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" style="background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
            </p>
            <p style="color: #666; font-size: 14px;">This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
          </div>
        `
      });

      if (error) throw new Error(error.message);
      return { success: true, messageId: data.id };
    } catch (error) {
      logger.error('Password reset email failed:', error);
      throw error;
    }
  }
}

export default EmailService;
