import twilio from 'twilio';

const accountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
const authToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
const fromNumber = import.meta.env.VITE_TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

export const sendSMS = async (to: string, message: string) => {
  try {
    if (!accountSid || !authToken || !fromNumber) {
      throw new Error('Missing Twilio configuration');
    }

    // Ensure phone number is in E.164 format
    const formattedNumber = formatPhoneNumber(to);
    
    const response = await client.messages.create({
      body: message,
      from: fromNumber,
      to: formattedNumber,
    });
    
    return { 
      success: true, 
      messageId: response.sid 
    };
  } catch (error) {
    console.error('SMS sending failed:', error);
    return { 
      success: false, 
      error 
    };
  }
};

// Utility function to format phone numbers to E.164 format
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // If it's an Indian number without country code, add +91
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  
  // If it already has a country code (starts with +), just remove spaces
  if (phone.startsWith('+')) {
    return phone.replace(/\s/g, '');
  }
  
  return phone;
};