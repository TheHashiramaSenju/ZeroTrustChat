import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }

    async sendOTPEmail(email, otp) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'ZeroTrust - Email Verification Code',
            html: `
                <div style="font-family: 'Courier New', monospace; background: #0f172a; color: #e2e8f0; padding: 40px; border: 2px solid #22c55e;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #22c55e; font-size: 28px; letter-spacing: 3px; margin: 0;">ZEROTRUST</h1>
                        <p style="color: #64748b; font-size: 11px; margin: 5px 0; letter-spacing: 2px;">SECURE COMMUNICATIONS</p>
                    </div>
                    
                    <div style="background: #1e293b; border: 1px solid #334155; padding: 40px; margin: 20px 0; text-align: center;">
                        <div style="color: #22c55e; font-size: 11px; margin-bottom: 20px; letter-spacing: 1px;">
                            <span style="display: inline-block; width: 8px; height: 8px; background: #22c55e; border-radius: 50%; margin-right: 8px; animation: pulse 2s infinite;"></span>
                            EMAIL VERIFICATION
                        </div>
                        
                        <p style="font-size: 14px; line-height: 1.8; margin: 25px 0; color: #cbd5e1;">
                            Your verification code is:
                        </p>
                        
                        <div style="background: #0f172a; border: 2px solid #22c55e; padding: 25px; margin: 30px auto; max-width: 300px;">
                            <div style="font-size: 48px; font-weight: bold; letter-spacing: 10px; color: #22c55e; font-family: monospace;">
                                ${otp}
                            </div>
                        </div>
                        
                        <p style="font-size: 12px; color: #64748b; margin: 25px 0;">
                            This code expires in <span style="color: #22c55e; font-weight: bold;">10 minutes</span>
                        </p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px; font-size: 11px; color: #475569; line-height: 1.6;">
                        <p style="margin: 5px 0;">If you did not request this code, please ignore this email.</p>
                        <p style="margin: 15px 0 5px 0; color: #334155; letter-spacing: 1px;">━━━━━━━━━━━━━━━━━━</p>
                        <p style="margin: 5px 0; font-size: 10px;">ZEROTRUST//CHAT | ZERO TRUST ARCHITECTURE</p>
                    </div>
                </div>
            `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            logger.info(`OTP email sent to ${email}`);
            return { success: true };
        } catch (error) {
            logger.error('Failed to send OTP email:', error);
            return { error };
        }
    }
}

export default new EmailService();
