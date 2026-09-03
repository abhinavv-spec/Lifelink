const fs = require('fs');
const path = require('path');

const inputHtml = fs.readFileSync(path.join(__dirname, 'ui:ux/lifelink-app/public/index.html'), 'utf-8');

// Extract everything between tailwind.config = { ... }
const match = inputHtml.match(/tailwind\.config\s*=\s*(\{[\s\S]*?\})\s*<\/script>/);

if (match && match[1]) {
  const configContent = match[1];
  
  const newTailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  ...${configContent}
}
`;

  fs.writeFileSync(path.join(__dirname, 'frontend/tailwind.config.js'), newTailwindConfig);
  console.log('Successfully updated tailwind.config.js');
} else {
  console.log('Could not find tailwind config');
}
