const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const sourceFile = path.join(publicDir, 'hospital_requests.html');
const targetFile = path.join(publicDir, 'hospital_live_requests.html');

// 1. Copy the file
fs.copyFileSync(sourceFile, targetFile);

// 2. Fix the active state and title in the new file
let liveContent = fs.readFileSync(targetFile, 'utf8');

liveContent = liveContent.replace('<title>LifeLink - Outreach</title>', '<title>LifeLink - Live Requests</title>');
liveContent = liveContent.replace('<h1 class="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-2">Outreach Log</h1>', '<h1 class="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-2">Live Requests</h1>');
liveContent = liveContent.replace('<p class="font-body-md text-body-md text-on-surface-variant">Review the status of outgoing blood requests to nearby hospitals and blood banks.</p>', '<p class="font-body-md text-body-md text-on-surface-variant">Monitor incoming and active blood requests in real-time.</p>');

// Swap active nav highlight
liveContent = liveContent.replace(
    /<a href="hospital_requests\.html" class="text-on-surface-variant font-label-bold text-label-md hover:text-primary py-1 transition-colors">Live Requests<\/a>/g,
    '<a href="hospital_live_requests.html" class="text-primary font-label-bold text-label-md border-b-2 border-primary py-1 transition-colors">Live Requests</a>'
);
liveContent = liveContent.replace(
    /<a href="hospital_requests\.html" class="text-primary font-label-bold text-label-md border-b-2 border-primary py-1 transition-colors">Outreach<\/a>/g,
    '<a href="hospital_requests.html" class="text-on-surface-variant font-label-bold text-label-md hover:text-primary py-1 transition-colors">Outreach</a>'
);

fs.writeFileSync(targetFile, liveContent, 'utf8');

// 3. Update navigation links in all files
const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(publicDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace "Live Requests" href pointing to hospital_requests.html
    // It captures any class attributes
    content = content.replace(
        /<a href="hospital_requests\.html"([^>]*)>Live Requests<\/a>/g,
        '<a href="hospital_live_requests.html"$1>Live Requests</a>'
    );

    fs.writeFileSync(filePath, content, 'utf8');
});

console.log('Fixed Live Requests page and navigation!');
