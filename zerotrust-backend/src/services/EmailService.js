import { Resend } from 'resend';
import config from '../config/environment.js';
import logger from '../utils/logger.js';

const resend = new Resend(config.RESEND_API_KEY);

class EmailService {
  static async sendOTPEmail(email, otp) {
    try {
      logger.info('Sending OTP email', { email, otp });

      const { data, error } = await resend.emails.send({
        from: 'ZeroTrust Security <noreply@send.zerotrustchatapp.xyz>',  // ← YOUR VERIFIED DOMAIN
        to: email,
        subject: 'Your ZeroTrust Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0f172a; color: #e2e8f0;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #22c55e; margin: 0;">🔐 ZeroTrust</h1>
              <p style="color: #94a3b8; margin: 10px 0;">Secure Authentication</p>
            </div>
            
            <div style="background: #1e293b; padding: 30px; border-radius: 8px; border: 1px solid #334155;">
              <h2 style="color: #e2e8f0; margin-top: 0;">Your Verification Code</h2>
              <p style="color: #cbd5e1;">Use this code to verify your email address:</p>
              
              <div style="background: #0f172a; padding: 20px; border-radius: 4px; text-align: center; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; color: #22c55e; letter-spacing: 8px; font-family: monospace;">${otp}</span>
              </div>
              
              <p style="color: #94a3b8; font-size: 14px; margin-bottom: 0;">
                This code will expire in <strong>10 minutes</strong>.
              </p>
              <p style="color: #94a3b8; font-size: 14px;">
                If you didn't request this code, please ignore this email.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; color: #64748b; font-size: 12px;">
              <p>ZeroTrust - Secure by Design</p>
              <p>© 2025 ZeroTrust. All rights reserved.</p>
            </div>
          </div>
        `
      });

      if (error) {
        logger.error('Resend API error:', error);
        throw new Error(error.message);
      }

      logger.info('Email sent successfully', { messageId: data?.id, to: email });
      return { success: true, messageId: data?.id };
    } catch (err) {
      logger.error('Email sending failed:', err);
      throw err;
    }
  }

  static async sendPasswordResetEmail(email, token) {
    try {
      logger.info('Sending password reset email', { email });

      const { data, error } = await resend.emails.send({
        from: 'ZeroTrust Security <noreply@send.zerotrustchatapp.xyz>',  // ← YOUR VERIFIED DOMAIN
        to: email,
        subject: 'Password Reset Request - ZeroTrust',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0f172a; color: #e2e8f0;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #22c55e; margin: 0;">🔐 ZeroTrust</h1>
              <p style="color: #94a3b8; margin: 10px 0;">Password Reset</p>
            </div>
            
            <div style="background: #1e293b; padding: 30px; border-radius: 8px; border: 1px solid #334155;">
              <h2 style="color: #e2e8f0; margin-top: 0;">Password Reset Code</h2>
              <p style="color: #cbd5e1;">You requested a password reset. Use this code:</p>
              
              <div style="background: #0f172a; padding: 20px; border-radius: 4px; text-align: center; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; color: #22c55e; letter-spacing: 8px; font-family: monospace;">${token}</span>
              </div>
              
              <p style="color: #94a3b8; font-size: 14px; margin-bottom: 0;">
                This code will expire in <strong>15 minutes</strong>.
              </p>
              <p style="color: #94a3b8; font-size: 14px;">
                If you didn't request this reset, please ignore this email and your password will remain unchanged.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; color: #64748b; font-size: 12px;">
              <p>ZeroTrust - Secure by Design</p>
              <p>© 2025 ZeroTrust. All rights reserved.</p>
            </div>
          </div>
        `
      });

      if (error) {
        logger.error('Password reset email error:', error);
        throw new Error(error.message);
      }

      logger.info('Password reset email sent', { messageId: data?.id, to: email });
      return { success: true, messageId: data?.id };
    } catch (err) {
      logger.error('Password reset email failed:', err);
      throw err;
    }
  }
}

export default EmailService;
