const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'backend/src/routes/inventory.ts');
let code = fs.readFileSync(file, 'utf-8');

if (!code.includes('triggerLowStockAlert')) {
    code = code.replace("import { Role } from '../types/enums';", "import { Role } from '../types/enums';\nimport { triggerLowStockAlert } from '../services/emergencyService';");
    
    const target = 'res.json({ success: true, data: updated });';
    const replacement = `
    if (updated.units < 10) {
      triggerLowStockAlert(bloodBankId, bloodType, updated.units).catch(err => console.error("Twilio Alert Failed:", err));
    }
    res.json({ success: true, data: updated });
    `;
    code = code.replace(target, replacement);
    
    fs.writeFileSync(file, code);
    console.log('Patched inventory.ts');
}
