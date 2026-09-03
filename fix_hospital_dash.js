const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'frontend/lifelink-app/public/hospital_dashboard.html');
let html = fs.readFileSync(file, 'utf-8');

// The exact block is:
// <a class="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-variant rounded-lg transition-colors" href="#">
// <span class="material-symbols-outlined">emergency</span> Live Requests
//             </a>

html = html.replace(
    /<a class="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-variant rounded-lg transition-colors" href="#">\s*<span class="material-symbols-outlined">emergency<\/span> Live Requests\s*<\/a>/,
    '<a class="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-variant rounded-lg transition-colors" href="/emergency_response.html">\n<span class="material-symbols-outlined">emergency</span> Live Requests\n</a>'
);

fs.writeFileSync(file, html);
console.log('Fixed hospital_dashboard.html');
