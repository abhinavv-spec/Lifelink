const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(publicDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // --- Bottom Nav (Mobile) ---
    content = content.replace(/<a([^>]+)href="#"([^>]*)>\s*<span([^>]+)>home<\/span>/g, '<a$1href="/index.html"$2>\n<span$3>home</span>');
    content = content.replace(/<a([^>]+)href="#"([^>]*)>\s*<span([^>]+)>add_alert<\/span>/g, '<a$1href="/hospital_requests.html"$2>\n<span$3>add_alert</span>');
    content = content.replace(/<a([^>]+)href="#"([^>]*)>\s*<span([^>]+)>person<\/span>/g, '<a$1href="/hospital_login.html"$2>\n<span$3>person</span>');

    // --- Side Nav (if any) ---
    content = content.replace(/href="#">\s*<span([^>]+)>dashboard<\/span>\s*Overview/g, 'href="/hospital_dashboard.html">\n<span$1>dashboard</span> Overview');
    content = content.replace(/href="#">\s*<span([^>]+)>emergency<\/span>\s*Live Requests/g, 'href="/hospital_requests.html">\n<span$1>emergency</span> Live Requests');
    content = content.replace(/href="#">\s*<span([^>]+)>groups<\/span>\s*Donor Database/g, 'href="/donor_database.html">\n<span$1>groups</span> Donor Database');
    content = content.replace(/href="#">\s*<span([^>]+)>monitoring<\/span>\s*Analytics/g, 'href="/hospital_analytics.html">\n<span$1>monitoring</span> Analytics');
    content = content.replace(/href="#">\s*<span([^>]+)>settings<\/span>\s*Settings/g, 'href="/hospital_settings.html">\n<span$1>settings</span> Settings');

    // --- Top Nav (New Structure) ---
    content = content.replace(/href="#"([^>]+)>Overview<\/a>/g, 'href="/hospital_dashboard.html"$1>Overview</a>');
    content = content.replace(/href="#"([^>]+)>Live Requests<\/a>/g, 'href="/hospital_requests.html"$1>Live Requests</a>');
    content = content.replace(/href="#"([^>]+)>Outreach<\/a>/g, 'href="/hospital_requests.html"$1>Outreach</a>'); // Linking to requests for now
    content = content.replace(/href="#"([^>]+)>Donor Database<\/a>/g, 'href="/donor_database.html"$1>Donor Database</a>');
    content = content.replace(/href="#"([^>]+)>Analytics<\/a>/g, 'href="/hospital_analytics.html"$1>Analytics</a>');
    content = content.replace(/href="#"([^>]+)>Settings<\/a>/g, 'href="/hospital_settings.html"$1>Settings</a>');
    
    // Also handle cases where class comes before href
    content = content.replace(/<a([^>]+)class="([^"]+)"\s*href="#">Overview<\/a>/g, '<a$1class="$2" href="/hospital_dashboard.html">Overview</a>');
    content = content.replace(/<a([^>]+)class="([^"]+)"\s*href="#">Live Requests<\/a>/g, '<a$1class="$2" href="/hospital_requests.html">Live Requests</a>');
    content = content.replace(/<a([^>]+)class="([^"]+)"\s*href="#">Outreach<\/a>/g, '<a$1class="$2" href="/hospital_requests.html">Outreach</a>');
    content = content.replace(/<a([^>]+)class="([^"]+)"\s*href="#">Donor Database<\/a>/g, '<a$1class="$2" href="/donor_database.html">Donor Database</a>');
    content = content.replace(/<a([^>]+)class="([^"]+)"\s*href="#">Analytics<\/a>/g, '<a$1class="$2" href="/hospital_analytics.html">Analytics</a>');
    content = content.replace(/<a([^>]+)class="([^"]+)"\s*href="#">Settings<\/a>/g, '<a$1class="$2" href="/hospital_settings.html">Settings</a>');

    // --- Auth links ---
    content = content.replace(/Already registered\? <a([^>]+)href="#">Log in here<\/a>/g, 'Already registered? <a$1href="/hospital_login.html">Log in here</a>');
    content = content.replace(/Don't have an account\? <a([^>]+)href="#">Register here<\/a>/g, 'Don\'t have an account? <a$1href="/hospital_login.html">Register here</a>');
    content = content.replace(/href="#">Log in here<\/a>/g, 'href="/hospital_login.html">Log in here</a>'); // Fallback

    // --- Buttons ---
    content = content.replace(/<button([^>]+)>\s*Request Blood\s*<\/button>/g, '<button$1 onclick="window.location.href=\'/hospital_requests.html\'">\nRequest Blood\n</button>');
    content = content.replace(/<button([^>]+)>\s*Register as Donor\s*<\/button>/g, '<button$1 onclick="window.location.href=\'/donor_signup.html\'">\nRegister as Donor\n</button>');
    content = content.replace(/<button([^>]+)>\s*Create Request\s*<\/button>/g, '<button$1 onclick="window.location.href=\'/hospital_requests.html\'">\nCreate Request\n</button>');
    
    // Logo links
    content = content.replace(/<span class="font-display-lg text-headline-md font-bold text-primary dark:text-inverse-primary">LifeLink<\/span>/g, '<a href="/index.html"><span class="font-display-lg text-headline-md font-bold text-primary dark:text-inverse-primary">LifeLink</span></a>');

    fs.writeFileSync(filePath, content, 'utf8');
});

console.log('Links updated successfully for new UI!');
