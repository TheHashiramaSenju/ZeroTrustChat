import { Resend } from 'resend';
import config from '../config/environment.js';
import logger from '../utils/logger.js';

const resend = new Resend(config.RESEND_API_KEY);

class EmailService {
  static async sendOTPEmail(email, otp) {
    try {
      logger.info('Sending OTP email', { email, otp });

      const { data, error } = await resend.emails.send({
        from: 'ZeroTrust <onboarding@resend.dev>',  // ← FIXED: DEFAULT RESEND DOMAIN
        to: email,
        subject: 'Your ZeroTrust Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0f172a; color: #e2e8f0;">
            <h1 style="color: #22c55e; text-align: center;">🔐 ZeroTrust</h1>
            <div style="background: #1e293b; padding: 30px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #e2e8f0;">Your Verification Code</h2>
              <div style="background: #0f172a; padding: 20px; text-align: center; margin: 20px 0;">
                <span style="font-size: 36px; font-weight: bold; color: #22c55e; letter-spacing: 10px;">${otp}</span>
              </div>
              <p style="color: #94a3b8;">This code expires in 10 minutes.</p>
            </div>
          </div>
        `
      });

      if (error) {
        logger.error('Email error:', error);
        throw new Error(error.message);
      }

      logger.info('✅ Email sent successfully', { messageId: data?.id });
      return { success: true, messageId: data?.id };
    } catch (err) {
      logger.error('❌ Email failed:', err);
      throw err;
    }
  }

  static async sendPasswordResetEmail(email, token) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'ZeroTrust <onboarding@resend.dev>',
        to: email,
        subject: 'Password Reset - ZeroTrust',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0f172a; color: #e2e8f0;">
            <h1 style="color: #22c55e;">Password Reset</h1>
            <div style="background: #1e293b; padding: 30px;">
              <div style="background: #0f172a; padding: 20px; text-align: center;">
                <span style="font-size: 36px; font-weight: bold; color: #22c55e;">${token}</span>
              </div>
              <p style="color: #94a3b8;">Expires in 15 minutes.</p>
            </div>
          </div>
        `
      });

      if (error) throw new Error(error.message);
      return { success: true };
    } catch (err) {
      logger.error('Password reset email failed:', err);
      throw err;
    }
  }
}

export default EmailService;
