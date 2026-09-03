const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'frontend/lifelink-app/public');
const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    let content = fs.readFileSync(path.join(publicDir, file), 'utf-8');
    let original = content;

    // Pattern for "Live Requests" link (e.g., in sidebars)
    // We can just regex replace href="..." if the text inside the tag is "Live Requests"
    // Since HTML parsing with regex is brittle, let's just do a specific replace based on what we see.

    // 1. replace href="#" or href="/match-results" or href="donor_match_results.html"
    // where the anchor tag contains "Live Requests"
    
    content = content.replace(/<a([^>]+href="[^"]*")[^>]*>(\s*<[^>]+>\s*)?Live Requests\s*<\/a>/gi, function(match, p1) {
        // Replace the href in p1
        let newP1 = p1.replace(/href="[^"]*"/, 'href="/emergency_response.html"');
        return match.replace(p1, newP1);
    });

    // Also handle cases with newlines
    content = content.replace(/<a([^>]+href="[^"]*")[^>]*>([\s\S]*?)Live Requests\s*<\/a>/gi, function(match, p1, p2) {
        let newP1 = p1.replace(/href="[^"]*"/, 'href="/emergency_response.html"');
        return match.replace(p1, newP1);
    });

    if (content !== original) {
        fs.writeFileSync(path.join(publicDir, file), content);
        console.log('Patched Live Requests link in:', file);
    }
});
