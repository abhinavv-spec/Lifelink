const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

// 1. Delete hospital_live_requests.html since we don't need it
const targetFile = path.join(publicDir, 'hospital_live_requests.html');
if (fs.existsSync(targetFile)) {
    fs.unlinkSync(targetFile);
}

// 2. Update all html files to point Live Requests to donor_match_results.html
const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(publicDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace "Live Requests" href pointing to hospital_live_requests.html (or hospital_requests.html)
    // with donor_match_results.html
    content = content.replace(
        /<a href="hospital_live_requests\.html"([^>]*)>Live Requests<\/a>/g,
        '<a href="donor_match_results.html"$1>Live Requests</a>'
    );
    
    // Just in case some still point to hospital_requests.html
    content = content.replace(
        /<a href="hospital_requests\.html"([^>]*)>Live Requests<\/a>/g,
        '<a href="donor_match_results.html"$1>Live Requests</a>'
    );

    fs.writeFileSync(filePath, content, 'utf8');
});

console.log('Successfully pointed Live Requests to the correct screen (donor_match_results.html)!');
