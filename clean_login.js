const fs = require('fs');
const path = require('path');

const loginPath = path.join(__dirname, 'frontend/lifelink-app/public/hospital_login.html');
let html = fs.readFileSync(loginPath, 'utf-8');

// Remove pt-16 from body
html = html.replace('pt-16 md:flex', 'md:flex');

// Remove everything from <header to </header>
html = html.replace(/<header[\s\S]*?<\/header>/i, '');

// Also, the <main> should probably have a title if we removed the header.
// Let's add a simple logo/title at the top of the form area so they know it's LifeLink.
if (!html.includes('id="login-brand"')) {
    const brandHtml = `
<div id="login-brand" class="flex items-center gap-2 mb-8 justify-center">
    <span class="material-symbols-outlined text-primary text-4xl" style="font-variation-settings: 'FILL' 1;">favorite</span>
    <span class="font-display-lg text-4xl font-bold text-primary">LifeLink</span>
</div>
    `;
    html = html.replace('<form id="register-form"', brandHtml + '\n<form id="register-form"');
}

fs.writeFileSync(loginPath, html);
console.log('Cleaned up login page!');
