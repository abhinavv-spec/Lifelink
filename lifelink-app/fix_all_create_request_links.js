const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(publicDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix donor_signup.html (missing onclick on Create Request)
    // <button class="bg-primary text-on-primary font-label-bold text-label-md px-4 py-2 rounded-lg shadow-md hover:opacity-80 transition-colors flex items-center gap-2">
    // <span class="material-symbols-outlined text-sm">add</span>
    // <span class="">Create Request</span>
    // </button>
    if (file === 'donor_signup.html') {
        content = content.replace(
            /<button class="([^"]+)"([^>]*)>\s*<span class="material-symbols-outlined text-sm">add<\/span>\s*<span class="">Create Request<\/span>\s*<\/button>/g,
            '<button class="$1" onclick="window.location.href=\'create_request.html\'"$2>\n        <span class="material-symbols-outlined text-sm">add</span>\n        <span class="">Create Request</span>\n      </button>'
        );
    }
    
    // Fix index.html Request Blood
    // <button class="bg-primary text-on-primary font-body-md text-body-md px-8 py-4 rounded-lg shadow-[0px_4px_20px_rgba(0,0,0,0.08)] hover:opacity-90 transition-opacity flex items-center justify-center gap-2" onclick="window.location.href='hospital_requests.html'">
    if (file === 'index.html') {
        content = content.replace(
            /onclick="window\.location\.href='hospital_requests\.html'"/g,
            'onclick="window.location.href=\'create_request.html\'"'
        );
    }
    
    // Fix donor_dashboard.html Request Blood
    if (file === 'donor_dashboard.html') {
        content = content.replace(
            /onclick="window\.location\.href='hospital_requests\.html'"/g,
            'onclick="window.location.href=\'create_request.html\'"'
        );
    }
    
    // Fix hospital_dashboard.html embedded shortcut button
    // <button class="w-full bg-primary text-on-primary py-3 rounded-lg font-label-bold mt-2 hover:opacity-90 transition-opacity shadow-[0px_4px_20px_rgba(0,0,0,0.04)]">Broadcast Request</button>
    if (file === 'hospital_dashboard.html') {
        content = content.replace(
            /<button class="w-full bg-primary text-on-primary py-3 rounded-lg font-label-bold mt-2 hover:opacity-90 transition-opacity shadow-\[0px_4px_20px_rgba\(0,0,0,0\.04\)\]">Broadcast Request<\/button>/g,
            '<button onclick="window.location.href=\'create_request.html\'" class="w-full bg-primary text-on-primary py-3 rounded-lg font-label-bold mt-2 hover:opacity-90 transition-opacity shadow-[0px_4px_20px_rgba(0,0,0,0.04)]">Broadcast Request</button>'
        );
    }

    fs.writeFileSync(filePath, content, 'utf8');
});

console.log('Fixed edge cases for Create Request routing!');
