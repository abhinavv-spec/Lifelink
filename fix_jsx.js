const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, 'frontend/src/pages');
const files = ['HospitalDashboard.tsx', 'Login.tsx', 'BloodRequest.tsx', 'DonorDashboard.tsx'];

files.forEach(file => {
  const filePath = path.join(outputDir, file);
  if (fs.existsSync(filePath)) {
    let jsx = fs.readFileSync(filePath, 'utf-8');
    
    // Remove HTML comments
    jsx = jsx.replace(/<!--[\s\S]*?-->/g, '');
    
    // Escape unescaped curly braces outside of JSX bindings (a bit tricky, let's just assume they don't have JS bindings yet since they were pure HTML)
    // Actually, in pure HTML, { and } are just text, so we need to wrap them in {'{'} and {'}'} or just replace them if they are not part of our wrapper.
    // Easiest is to replace { with {'{'} and } with {'}'} EXCEPT for the component wrapper
    // Since we know the wrapper is at the top/bottom:
    const startTag = `return (\n    <>`;
    const endTag = `</>\n  );\n}`;
    
    const startIndex = jsx.indexOf(startTag) + startTag.length;
    const endIndex = jsx.lastIndexOf(endTag);
    
    if (startIndex > -1 && endIndex > -1) {
      let body = jsx.substring(startIndex, endIndex);
      
      // We don't have active bindings, so safely replace
      // Wait, there might be CSS with inline style={{}}? No, we removed inline styles earlier.
      // So all { and } are literal text.
      // Wait, there might be `<script>` tags? We removed them.
      
      body = body.replace(/\{/g, '{"{"}').replace(/\}/g, '{"}"}');
      
      // Also, SVG xmlns:xlink="http://www.w3.org/1999/xlink" -> xmlnsXlink="http://www.w3.org/1999/xlink"
      body = body.replace(/xmlns:xlink/g, 'xmlnsXlink');
      body = body.replace(/xml:space/g, 'xmlSpace');
      body = body.replace(/xlink:href/g, 'xlinkHref');
      
      jsx = jsx.substring(0, startIndex) + body + jsx.substring(endIndex);
    }
    
    fs.writeFileSync(filePath, jsx);
    console.log(`Fixed ${file}`);
  }
});
