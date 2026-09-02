const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(publicDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Make all absolute paths relative
    content = content.replace(/href="\/([a-zA-Z0-9_]+\.html)"/g, 'href="$1"');
    content = content.replace(/onclick="window\.location\.href='\/([a-zA-Z0-9_]+\.html)'"/g, 'onclick="window.location.href=\'$1\'"');

    // Fix double onclicks generated accidentally earlier
    content = content.replace(/onclick="window\.location\.href='donor_signup\.html'" onclick="window\.location\.href='donor_signup\.html'"/g, 'onclick="window.location.href=\'donor_signup.html\'"');

    fs.writeFileSync(filePath, content, 'utf8');
});

console.log('Made all links relative!');
