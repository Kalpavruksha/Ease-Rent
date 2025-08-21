import { sendSMS } from './smsService';
import { supabase } from '../supabase';

export type NotificationType = 'RENT_DUE' | 'PAYMENT_RECEIVED' | 'LEASE_EXPIRING';

const templates = {
  RENT_DUE: {
    sms: (name: string, amount: number) => 
      `Hi ${name}, your rent payment of ₹${amount} is due soon. Please ensure timely payment.`
  },
  PAYMENT_RECEIVED: {
    sms: (name: string, amount: number) => 
      `Hi ${name}, we've received your rent payment of ₹${amount}. Thank you!`
  },
  LEASE_EXPIRING: {
    sms: (name: string, date: string) => 
      `Hi ${name}, your lease is expiring on ${date}. Please contact us to discuss renewal options.`
  }
};

export const sendNotification = async (
  tenantId: string,
  type: NotificationType,
  data: { name: string; amount?: number; date?: string }
) => {
  try {
    const { data: tenant, error } = await supabase
      .from('tenants')
      .select('phone, first_name')
      .eq('id', tenantId)
      .single();

    if (error || !tenant) {
      throw new Error('Tenant not found');
    }

    const template = templates[type];
    const { first_name, phone } = tenant;

    if (phone) {
      const smsMessage = template.sms(
        first_name,
        data.amount || 0
      );
      await sendSMS(phone, smsMessage);
    }

    await supabase.from('notifications').insert({
      tenant_id: tenantId,
      type,
      message: smsMessage,
      status: 'sent'
    });

    return { success: true };
  } catch (error) {
    console.error('Notification sending failed:', error);
    return { success: false, error };
  }
};