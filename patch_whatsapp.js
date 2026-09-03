const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'backend/src/services/whatsappService.ts');
let code = fs.readFileSync(file, 'utf-8');

// Set the hardcoded Kerala numbers as the default if env is empty
const defaultRecipients = '"+919447011111,+919846022222,+919847033333,+919745044444,+919895055555"';
code = code.replace(
  "return (process.env.TWILIO_WHATSAPP_RECIPIENTS ?? '')",
  "return (process.env.TWILIO_WHATSAPP_RECIPIENTS || " + defaultRecipients + ")"
);

fs.writeFileSync(file, code);
console.log('whatsappService patched');
