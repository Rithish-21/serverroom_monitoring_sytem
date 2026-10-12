import nodemailer from 'nodemailer';
import { config } from '../config/env.js';

let transporter = null;

const getTransporter = () => {
  if (!transporter && config.email.user && config.email.pass) {
    transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.user,
        pass: config.email.pass
      }
    });
  }
  return transporter;
};

export const sendEmailOtp = async (toEmail, otpCode) => {
  console.log(`\n========================================`);
  console.log(`[EMAIL OTP DISPATCH] -> To: ${toEmail}`);
  console.log(`[EMAIL OTP CODE]     -> ${otpCode}`);
  console.log(`========================================\n`);

  const mailer = getTransporter();
  if (!mailer) {
    // Development fallback: simulated delivery
    return { success: true, simulated: true };
  }

  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #0b0f19; color: #f3f4f6; padding: 30px; border-radius: 8px;">
      <h2 style="color: #38bdf8; margin-bottom: 8px;">SentinelCore Datacenter Security</h2>
      <p style="font-size: 14px; color: #9ca3af;">Environmental Monitoring Verification Code</p>
      <div style="margin: 24px 0; padding: 20px; background-color: #1e293b; border: 1px solid #334155; border-radius: 6px; text-align: center;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #38bdf8;">${otpCode}</span>
      </div>
      <p style="font-size: 13px; color: #9ca3af;">This code is valid for 5 minutes. If you did not request this verification, please contact your datacenter administrator immediately.</p>
    </div>
  `;

  try {
    const info = await mailer.sendMail({
      from: config.email.from,
      to: toEmail,
      subject: `Your SentinelCore Verification Code: ${otpCode}`,
      html
    });
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('[EmailService] SMTP error:', err.message);
    // Keep server resilient even if remote SMTP credentials fail
    return { success: true, fallback: true, error: err.message };
  }
};
