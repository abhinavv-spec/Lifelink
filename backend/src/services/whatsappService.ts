import twilio from 'twilio';

interface Contact {
  name: string;
  phone: string;
}

export function getConfiguredWhatsAppContacts(): Contact[] {
  return (process.env.TWILIO_WHATSAPP_RECIPIENTS || "+919447011111,+919846022222,+919847033333,+919745044444,+919895055555")
    .split(',')
    .map((phone) => phone.trim())
    .filter(Boolean)
    .map((phone, index) => ({
      name: `Configured recipient ${index + 1}`,
      phone,
    }));
}

const isPlaceholder = (value: string | undefined): boolean =>
  !value || value.startsWith('PLACEHOLDER') || value.startsWith('your-');

export async function sendWhatsAppAlert(contacts: Contact[], message: string): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;

  if (isPlaceholder(accountSid) || isPlaceholder(authToken) || isPlaceholder(from)) {
    console.log('\n📱 [WhatsApp Fallback Mode] Message would be sent to:');
    contacts.forEach((c) => console.log(`  → ${c.name} (${c.phone})`));
    console.log('Message:\n', message);
    return;
  }

  const client = twilio(accountSid, authToken);

  const sendPromises = contacts.map(async (contact) => {
    try {
      const to = `whatsapp:+${contact.phone.replace(/^\+/, '')}`;
      await client.messages.create({
        from: from as string,
        to,
        body: message,
      });
      console.log(`✅ WhatsApp alert sent to ${contact.name} (${contact.phone})`);
    } catch (error) {
      console.error(`❌ Failed to send WhatsApp to ${contact.name} (${contact.phone}):`, error);
    }
  });

  await Promise.allSettled(sendPromises);
}
