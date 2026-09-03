const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, 'ui:ux/lifelink-app/public');
const outputDir = path.join(__dirname, 'frontend/src/pages');

// Simple regex based replacements for JSX
function convertToJSX(html) {
  let jsx = html;
  
  // Replace class= with className=
  jsx = jsx.replace(/class=/g, 'className=');
  
  // Replace for= with htmlFor=
  jsx = jsx.replace(/for=/g, 'htmlFor=');
  
  // Close unclosed tags
  jsx = jsx.replace(/<img(.*?)>/g, (match, p1) => {
    if (p1.endsWith('/')) return match;
    return `<img${p1} />`;
  });
  
  jsx = jsx.replace(/<input(.*?)>/g, (match, p1) => {
    if (p1.endsWith('/')) return match;
    return `<input${p1} />`;
  });
  
  jsx = jsx.replace(/<br>/g, '<br />');
  jsx = jsx.replace(/<hr(.*?)>/g, (match, p1) => {
    if (p1.endsWith('/')) return match;
    return `<hr${p1} />`;
  });
  
  // Replace inline styles (very basic) - ideally we should remove them or convert to objects
  // For this script, we'll just remove style="" to prevent React compilation errors, 
  // since Tailwind is used mostly anyway.
  jsx = jsx.replace(/style="[^"]*"/g, '');
  
  // SVG properties
  jsx = jsx.replace(/stroke-width/g, 'strokeWidth');
  jsx = jsx.replace(/stroke-linecap/g, 'strokeLinecap');
  jsx = jsx.replace(/stroke-linejoin/g, 'strokeLinejoin');
  jsx = jsx.replace(/fill-rule/g, 'fillRule');
  jsx = jsx.replace(/clip-rule/g, 'clipRule');
  jsx = jsx.replace(/viewBox/g, 'viewBox'); // already camelCase but standardizing

  // Extract body content (ignore head, html tags)
  const bodyMatch = jsx.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch && bodyMatch[1]) {
    jsx = bodyMatch[1];
  }

  // Remove script tags
  jsx = jsx.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Wrap in a fragment if multiple root elements
  return `<>\n${jsx}\n</>`;
}

const filesToConvert = [
  { file: 'hospital_dashboard.html', component: 'HospitalDashboard' },
  { file: 'hospital_login.html', component: 'Login' },
  { file: 'create_request.html', component: 'BloodRequest' },
  { file: 'donor_dashboard.html', component: 'DonorDashboard' } // We can integrate map here
];

filesToConvert.forEach(({ file, component }) => {
  const filePath = path.join(inputDir, file);
  if (fs.existsSync(filePath)) {
    const html = fs.readFileSync(filePath, 'utf-8');
    const jsxContent = convertToJSX(html);
    
    const componentCode = `import React from 'react';
import { Link } from 'react-router-dom';

export default function ${component}() {
  return (
    ${jsxContent}
  );
}
`;
    
    fs.writeFileSync(path.join(outputDir, `${component}.tsx`), componentCode);
    console.log(`Converted ${file} to ${component}.tsx`);
  }
});
