import sgMail from '@sendgrid/mail';

const apiKey = import.meta.env.VITE_SENDGRID_API_KEY;
sgMail.setApiKey(apiKey);

export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
  try {
    const msg = {
      to,
      from: import.meta.env.VITE_SENDGRID_FROM_EMAIL,
      subject,
      text,
      html: html || text,
    };
    
    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error };
  }
};