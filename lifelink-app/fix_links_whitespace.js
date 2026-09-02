const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(publicDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace <a class="..." href="#">\n   Overview\n</a>
    // We use [\s\S]*? to match the class or other attributes, and \s* to match spaces/newlines around the text.
    
    const replacements = {
        'Overview': 'hospital_dashboard.html',
        'Live Requests': 'hospital_requests.html',
        'Outreach': 'hospital_requests.html',
        'Donor Database': 'donor_database.html',
        'Analytics': 'hospital_analytics.html',
        'Settings': 'hospital_settings.html',
        'Dashboard': 'hospital_dashboard.html',
        'Requests': 'hospital_requests.html',
        'Donors': 'donor_database.html'
    };

    for (const [text, link] of Object.entries(replacements)) {
        // Matches href="#" followed by anything inside the tag, then spaces, then text, then spaces, then </a>
        const regex1 = new RegExp(`href="#"([^>]*)>\\s*${text}\\s*<\\/a>`, 'g');
        content = content.replace(regex1, `href="${link}"$1>${text}</a>`);

        // Matches anything inside the tag, then href="#", then anything, then spaces, then text, then spaces, then </a>
        const regex2 = new RegExp(`<a([^>]+)href="#"([^>]*)>\\s*${text}\\s*<\\/a>`, 'g');
        content = content.replace(regex2, `<a$1href="${link}"$2>${text}</a>`);
    }

    // Auth links
    content = content.replace(/href="#"([^>]*)>\s*Log in here\s*<\/a>/g, 'href="hospital_login.html"$1>Log in here</a>');
    content = content.replace(/href="#"([^>]*)>\s*Register here\s*<\/a>/g, 'href="hospital_login.html"$1>Register here</a>');

    fs.writeFileSync(filePath, content, 'utf8');
});

console.log('Robustly updated links with newlines!');
