import twilio from 'twilio';
import { config } from '../config/env.js';

let twilioClient = null;

const getTwilioClient = () => {
  if (!twilioClient && config.twilio.accountSid && config.twilio.authToken && config.twilio.accountSid.startsWith('AC')) {
    try {
      twilioClient = twilio(config.twilio.accountSid, config.twilio.authToken);
    } catch (e) {
      console.warn('[SMSService] Twilio init error:', e.message);
    }
  }
  return twilioClient;
};

export const sendSmsOtp = async (toPhone, otpCode) => {
  console.log(`\n========================================`);
  console.log(`[SMS OTP DISPATCH]   -> To: ${toPhone}`);
  console.log(`[SMS OTP CODE]       -> ${otpCode}`);
  console.log(`========================================\n`);

  const client = getTwilioClient();
  if (!client || !config.twilio.phoneNumber) {
    // Development fallback
    return { success: true, simulated: true };
  }

  try {
    const message = await client.messages.create({
      body: `SentinelCore Verification Code: ${otpCode}. Valid for 5 minutes.`,
      from: config.twilio.phoneNumber,
      to: toPhone
    });
    return { success: true, sid: message.sid };
  } catch (err) {
    console.error('[SMSService] Twilio API error:', err.message);
    return { success: true, fallback: true, error: err.message };
  }
};
