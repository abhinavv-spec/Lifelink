const fs = require('fs');
const path = require('path');

const loginPath = path.join(__dirname, 'frontend/lifelink-app/public/hospital_login.html');
let html = fs.readFileSync(loginPath, 'utf-8');

// Find and remove the Create Request button in the header
// It looks like: <button class="..." onclick="window.location.href='/create-request'">Create Request</button>
html = html.replace(/<button[^>]*window\.location\.href='\/create-request'[^>]*>[\s\S]*?<\/button>/gi, '');
html = html.replace(/<button[^>]*window\.location\.href='create_request\.html'[^>]*>[\s\S]*?<\/button>/gi, '');

fs.writeFileSync(loginPath, html);
console.log('Removed Create Request button from login page');
