import { Resend } from 'resend';
import config from '../config/environment.js';
import logger from '../utils/logger.js';

const resend = new Resend(config.RESEND_API_KEY);

class EmailService {
  static async sendOTPEmail(email, otp) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'ZeroTrust Chat <onboarding@resend.dev>',
        to: email,
        subject: 'Your ZeroTrust Chat Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">ZeroTrust Chat</h2>
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
        logger.error('Failed to send OTP email:', { error, email });
        throw new Error(error.message || 'Failed to send email');
      }

      logger.info('OTP email sent successfully', { email, messageId: data.id });
      return { success: true, messageId: data.id };
    } catch (error) {
      logger.error('Email service error:', { error: error.message, email });
      throw error;
    }
  }
}

export default EmailService;
