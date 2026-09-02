const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(publicDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix the broken onclick handlers generated previously with escaped quotes
    // Replace: onclick="window.location.href=\'create_request.html\'"
    // With:    onclick="window.location.href='create_request.html'"
    content = content.replace(/onclick="window\.location\.href=\\'create_request\.html\\'"/g, 'onclick="window.location.href=\'create_request.html\'"');
    
    // Also, if any of them are still pointing to hospital_requests.html for the "Create Request" text button:
    // (There is one in index.html which might not have been caught)
    // Actually in index.html line 201 is:
    // <button class="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-bold text-label-bold uppercase tracking-wider hover:bg-primary transition-colors shadow-md" onclick="window.location.href='hospital_requests.html'">
    // Create Request
    // </button>
    // Note it spans across lines. Let's fix that.
    content = content.replace(/onclick="window\.location\.href='hospital_requests\.html'"([^>]*>\s*Create Request\s*<\/button>)/g, 'onclick="window.location.href=\'create_request.html\'"$1');

    fs.writeFileSync(filePath, content, 'utf8');
});

console.log('Fixed Create Request links!');
