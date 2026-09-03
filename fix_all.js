const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'frontend/lifelink-app/public');
const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    let content = fs.readFileSync(path.join(publicDir, file), 'utf-8');
    
    // Replace href="#" or href="/match-results" for Live Requests sidebar elements
    // This specifically targets the exact structure of the sidebar links
    content = content.replace(
        /<a([^>]+)href="[^"]*"([^>]*)>\s*<span class="material-symbols-outlined">emergency<\/span> Live Requests\s*<\/a>/g,
        '<a$1href="/emergency_response.html"$2>\n<span class="material-symbols-outlined">emergency</span> Live Requests\n</a>'
    );

    // Some might not have the emergency icon, let's catch standard text
    content = content.replace(
        /<a([^>]+)href="[^"]*"([^>]*)>\s*Live Requests\s*<\/a>/gi,
        '<a$1href="/emergency_response.html"$2>Live Requests</a>'
    );

    fs.writeFileSync(path.join(publicDir, file), content);
});
console.log('Fixed all HTML files.');
