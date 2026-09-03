const fs = require('fs');
const path = require('path');

const loginPath = path.join(__dirname, 'frontend/lifelink-app/public/hospital_login.html');
let html = fs.readFileSync(loginPath, 'utf-8');

// Remove the <aside> block which contains the image
html = html.replace(/<aside[\s\S]*?<\/aside>/i, '');

// Update the <body> class to perfectly center everything
html = html.replace(/<body class="[^"]*"/, '<body class="h-screen w-full flex flex-col items-center justify-center antialiased text-on-background bg-surface"');

// Update the <main> class to remove the 1/2 width limitation
html = html.replace(/<main class="[^"]*"/, '<main class="w-full max-w-md px-6 flex flex-col justify-center"');

fs.writeFileSync(loginPath, html);
console.log('Centered login form and removed images');
