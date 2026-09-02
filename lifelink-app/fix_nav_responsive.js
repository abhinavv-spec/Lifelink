const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

// Fix the nav bar overlap at medium viewports by hiding the hospital name text on screens < xl
// and reducing nav link gap slightly
const hospitalScreens = [
  'hospital_dashboard.html',
  'hospital_requests.html',
  'donor_match_results.html',
  'hospital_analytics.html',
  'hospital_settings.html',
  'donor_database.html'
];

hospitalScreens.forEach(filename => {
  const filePath = path.join(publicDir, filename);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Change nav gap from gap-8 to gap-6 to reduce collision
  content = content.replace(
    '<nav class="flex items-center gap-8 absolute left-1/2 -translate-x-1/2">',
    '<nav class="hidden lg:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">'
  );
  
  // Already uses hidden lg:flex for the identity text, good
  // But also hide the whole identity section below xl
  content = content.replace(
    '<div class="hidden lg:flex flex-col">',
    '<div class="hidden xl:flex flex-col">'
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ Fixed nav responsiveness: ${filename}`);
});

console.log('\n✅ Nav responsiveness fixed!');
