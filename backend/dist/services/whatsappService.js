"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfiguredWhatsAppContacts = getConfiguredWhatsAppContacts;
exports.sendWhatsAppAlert = sendWhatsAppAlert;
const twilio_1 = __importDefault(require("twilio"));
function getConfiguredWhatsAppContacts() {
    return (process.env.TWILIO_WHATSAPP_RECIPIENTS ?? '')
        .split(',')
        .map((phone) => phone.trim())
        .filter(Boolean)
        .map((phone, index) => ({
        name: `Configured recipient ${index + 1}`,
        phone,
    }));
}
const isPlaceholder = (value) => !value || value.startsWith('PLACEHOLDER') || value.startsWith('your-');
async function sendWhatsAppAlert(contacts, message) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_WHATSAPP_FROM;
    if (isPlaceholder(accountSid) || isPlaceholder(authToken) || isPlaceholder(from)) {
        console.log('\n📱 [WhatsApp Fallback Mode] Message would be sent to:');
        contacts.forEach((c) => console.log(`  → ${c.name} (${c.phone})`));
        console.log('Message:\n', message);
        return;
    }
    const client = (0, twilio_1.default)(accountSid, authToken);
    const sendPromises = contacts.map(async (contact) => {
        try {
            const to = `whatsapp:+${contact.phone.replace(/^\+/, '')}`;
            await client.messages.create({
                from: from,
                to,
                body: message,
            });
            console.log(`✅ WhatsApp alert sent to ${contact.name} (${contact.phone})`);
        }
        catch (error) {
            console.error(`❌ Failed to send WhatsApp to ${contact.name} (${contact.phone}):`, error);
        }
    });
    await Promise.allSettled(sendPromises);
}
