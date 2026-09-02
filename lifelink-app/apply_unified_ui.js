const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

// ============================================================
// CANONICAL TOP NAV SHELL GENERATOR
// ============================================================
function generateTopNav(activePage) {
  const links = [
    { text: 'Overview', href: 'hospital_dashboard.html' },
    { text: 'Live Requests', href: 'hospital_requests.html' },
    { text: 'Outreach', href: 'hospital_requests.html' },
    { text: 'Donor Database', href: 'donor_database.html' },
    { text: 'Analytics', href: 'hospital_analytics.html' },
    { text: 'Settings', href: 'hospital_settings.html' },
  ];

  const navLinks = links.map(link => {
    const isActive = link.text === activePage;
    const cls = isActive
      ? 'text-primary font-label-bold text-label-md border-b-2 border-primary py-1 transition-colors'
      : 'text-on-surface-variant font-label-bold text-label-md hover:text-primary py-1 transition-colors';
    return `    <a href="${link.href}" class="${cls}">${link.text}</a>`;
  }).join('\n');

  return `<header class="hidden md:flex items-center justify-between px-container-margin-desktop h-16 bg-surface-container-lowest border-b border-surface-variant sticky top-0 z-50">
  <a href="index.html" class="font-headline-lg text-primary font-bold tracking-tight text-xl">LifeLink</a>
  <nav class="flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
${navLinks}
  </nav>
  <div class="flex items-center gap-6">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold text-sm">CH</div>
      <div class="hidden lg:flex flex-col">
        <span class="font-label-bold text-label-md text-on-surface">City Central Hospital</span>
        <span class="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Verified Medical Center</span>
      </div>
    </div>
    <button class="bg-primary text-on-primary font-label-bold text-label-md px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity shadow-sm" onclick="window.location.href='hospital_requests.html'">Create Request</button>
    <span class="material-symbols-outlined cursor-pointer text-on-surface-variant hover:text-primary transition-colors">notifications</span>
  </div>
</header>`;
}

// ============================================================
// CANONICAL BOTTOM NAV (MOBILE) GENERATOR
// ============================================================
function generateBottomNav(activeIcon) {
  const items = [
    { icon: 'home', label: 'Home', href: 'index.html' },
    { icon: 'add_alert', label: 'Request', href: 'hospital_requests.html' },
    { icon: 'map', label: 'Map', href: '#' },
    { icon: 'person', label: 'Profile', href: 'hospital_login.html' },
  ];

  const navItems = items.map(item => {
    const isActive = item.icon === activeIcon;
    const cls = isActive
      ? 'flex flex-col items-center justify-center bg-secondary-container text-on-secondary-container rounded-xl px-4 py-1 active:scale-90 transition-all duration-200'
      : 'flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-xl px-4 py-1 active:scale-90 transition-all duration-200';
    const iconStyle = isActive ? ' style="font-variation-settings: \'FILL\' 1;"' : '';
    return `<a class="${cls}" href="${item.href}">
<span class="material-symbols-outlined"${iconStyle}>${item.icon}</span>
<span class="font-label-md text-label-md mt-1">${item.label}</span>
</a>`;
  }).join('\n');

  return `<nav class="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 pb-safe bg-surface-container-lowest border-t border-surface-variant shadow-[0px_-4px_20px_rgba(0,0,0,0.04)] rounded-t-xl">
${navItems}
</nav>`;
}

// ============================================================
// HOSPITAL SCREEN CONFIGS
// ============================================================
const hospitalScreens = {
  'hospital_dashboard.html': { activePage: 'Overview', activeIcon: 'home' },
  'hospital_requests.html': { activePage: 'Outreach', activeIcon: 'add_alert' },
  'donor_match_results.html': { activePage: 'Live Requests', activeIcon: 'add_alert' },
  'hospital_analytics.html': { activePage: 'Analytics', activeIcon: null },
  'hospital_settings.html': { activePage: 'Settings', activeIcon: null },
  'donor_database.html': { activePage: 'Donor Database', activeIcon: null },
};

// ============================================================
// PROCESS EACH HOSPITAL SCREEN
// ============================================================
Object.entries(hospitalScreens).forEach(([filename, config]) => {
  const filePath = path.join(publicDir, filename);
  if (!fs.existsSync(filePath)) {
    console.log(`SKIP: ${filename} not found`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // ----- STEP 1: Replace the desktop top nav -----
  // Remove everything between <body...> and the start of main content.
  // Strategy: Find the <header or <nav that is the top nav and replace it.
  
  // For hospital_dashboard.html: has <!-- TopNavBar (Desktop) --> pattern
  // For hospital_requests.html: has <!-- TopNavBar (Desktop Focus) --> 
  // For donor_match_results.html: has <!-- TopNavBar (Web) -->
  // For hospital_analytics.html: has <!-- Top Navigation Bar -->
  // For hospital_settings.html: has <!-- Top Navigation -->
  // For donor_database.html: has <!-- Top Navigation Bar -->
  
  const topNav = generateTopNav(config.activePage);
  
  // Generic approach: find the top nav block and replace it
  // The top nav is always the first <header or <nav block after <body
  
  // Replace desktop nav - match from opening comment/tag to closing </header> or </nav>
  // Use specific patterns per file
  
  if (filename === 'hospital_dashboard.html') {
    // Replace from <!-- TopNavBar (Desktop) --> to </header>
    content = content.replace(
      /<!-- TopNavBar \(Desktop\) -->[\s\S]*?<\/header>/,
      topNav
    );
    // Fix body class - remove sidebar padding if any
    content = content.replace(
      /class="bg-surface text-on-surface font-body-md min-h-screen"/,
      'class="bg-surface text-on-surface font-body-md min-h-screen"'
    );
  }
  
  if (filename === 'hospital_requests.html') {
    // Replace from <!-- TopNavBar to the end of the nav block
    content = content.replace(
      /<!-- TopNavBar[\s\S]*?<\/nav>\s*\n/,
      topNav + '\n'
    );
    // Ensure body has proper padding
    content = content.replace(
      /class="bg-background text-on-background min-h-screen pb-24 md:pb-0 pt-20 md:pt-24"/,
      'class="bg-surface text-on-surface font-body-md min-h-screen pt-20 md:pt-0"'
    );
  }
  
  if (filename === 'donor_match_results.html') {
    // Replace from <!-- TopNavBar (Web) --> to </header>
    content = content.replace(
      /<!-- TopNavBar \(Web\) -->[\s\S]*?<\/header>/,
      topNav
    );
    content = content.replace(
      /class="bg-background text-on-background font-body-md min-h-screen flex flex-col"/,
      'class="bg-surface text-on-surface font-body-md min-h-screen flex flex-col"'
    );
  }
  
  if (filename === 'hospital_analytics.html') {
    // Replace from <!-- Top Navigation Bar --> to </nav>
    content = content.replace(
      /<!-- Top Navigation Bar -->[\s\S]*?<\/nav>/,
      topNav
    );
    content = content.replace(
      /class="bg-background text-on-background h-full flex flex-col font-body-md"/,
      'class="bg-surface text-on-surface font-body-md min-h-screen flex flex-col"'
    );
    // Fix main content padding
    content = content.replace(
      /class="flex-1 flex flex-col min-h-screen pt-\[96px\] px-container-margin-desktop pb-container-margin-desktop overflow-y-auto bg-surface-bright"/,
      'class="flex-1 flex flex-col pt-24 md:pt-20 px-container-margin-mobile md:px-container-margin-desktop pb-10 overflow-y-auto bg-surface"'
    );
  }
  
  if (filename === 'hospital_settings.html') {
    // Replace from <!-- Top Navigation --> to </header>
    content = content.replace(
      /<!-- Top Navigation -->[\s\S]*?<\/header>/,
      topNav
    );
    content = content.replace(
      /class="bg-surface text-on-surface flex flex-col min-h-screen font-body-md text-body-md"/,
      'class="bg-surface text-on-surface font-body-md min-h-screen flex flex-col"'
    );
    // Fix main padding
    content = content.replace(
      /class="flex-1 p-container-margin-desktop overflow-y-auto w-full bg-surface"/,
      'class="flex-1 pt-24 md:pt-20 px-container-margin-mobile md:px-container-margin-desktop pb-10 overflow-y-auto bg-surface"'
    );
  }
  
  if (filename === 'donor_database.html') {
    // Replace from <!-- Top Navigation Bar --> to </nav>
    content = content.replace(
      /<!-- Top Navigation Bar -->[\s\S]*?<\/nav>/,
      topNav
    );
    content = content.replace(
      /class="bg-background text-on-background font-body-md min-h-screen flex flex-col"/,
      'class="bg-surface text-on-surface font-body-md min-h-screen flex flex-col"'
    );
    // Fix main padding
    content = content.replace(
      /class="flex-1 flex flex-col p-container-desktop bg-surface-bright min-h-screen"/,
      'class="flex-1 flex flex-col pt-24 md:pt-20 px-container-margin-mobile md:px-container-margin-desktop pb-10 bg-surface"'
    );
  }

  // ----- STEP 2: Replace/add bottom mobile nav for screens that have it -----
  if (config.activeIcon) {
    const bottomNav = generateBottomNav(config.activeIcon);
    // Replace existing bottom nav
    content = content.replace(
      /<!-- BottomNavBar[\s\S]*?<\/nav>/,
      bottomNav
    );
    // Also try alternate patterns
    content = content.replace(
      /<!-- Bottom Navigation Bar[\s\S]*?<\/nav>/,
      bottomNav
    );
  }

  // ----- STEP 3: Color token fixes -----
  // Replace hardcoded #1B4D6B with appropriate design tokens
  content = content.replace(/bg-\[#1B4D6B\]/g, 'bg-secondary');
  content = content.replace(/text-\[#1B4D6B\]/g, 'text-secondary');
  content = content.replace(/border-\[#1B4D6B\]/g, 'border-secondary');
  content = content.replace(/hover:bg-\[#1B4D6B\]/g, 'hover:bg-secondary');
  
  // Fix toggle switches that used #1B4D6B
  content = content.replace(/peer-checked:bg-\[#1B4D6B\]/g, 'peer-checked:bg-tertiary');

  // Fix trending indicator colors (tertiary-container → green for positive)
  // This is specific but important
  if (filename === 'hospital_analytics.html') {
    content = content.replace(
      /class="flex items-center gap-1 mt-1 text-tertiary-container">\s*<span class="material-symbols-outlined text-sm">trending_up<\/span>/,
      'class="flex items-center gap-1 mt-1 text-green-700">\n<span class="material-symbols-outlined text-sm">trending_up</span>'
    );
  }

  // ----- STEP 4: Remove any remaining sidebar patterns -----
  content = content.replace(/md:pl-64/g, '');

  // ----- STEP 5: Fix triple onclick -----
  content = content.replace(
    /onclick="window\.location\.href='hospital_requests\.html'" onclick="window\.location\.href='hospital_requests\.html'" onclick="window\.location\.href='hospital_requests\.html'"/g,
    "onclick=\"window.location.href='hospital_requests.html'\""
  );
  content = content.replace(
    /onclick="window\.location\.href='donor_signup\.html'" onclick="window\.location\.href='donor_signup\.html'"/g,
    "onclick=\"window.location.href='donor_signup.html'\""
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ Updated: ${filename} (active: ${config.activePage})`);
});

// ============================================================
// FIX INDEX.HTML (Landing Page)
// ============================================================
const indexPath = path.join(publicDir, 'index.html');
if (fs.existsSync(indexPath)) {
  let content = fs.readFileSync(indexPath, 'utf8');

  // Fix the landing page top nav to match the canonical style more closely
  // The landing page has a different context (public-facing) but should still
  // have consistent styling for the nav links it does show
  
  // Fix duplicate onclick
  content = content.replace(
    /onclick="window\.location\.href='donor_signup\.html'" onclick="window\.location\.href='donor_signup\.html'"/g,
    "onclick=\"window.location.href='donor_signup.html'\""
  );

  // Fix avatar to use secondary-container instead of primary-container
  content = content.replace(
    /class="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold"/,
    'class="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold"'
  );

  // Fix "Request Blood" button to navigate
  content = content.replace(
    /<button class="bg-\[#C41E3A\] text-white font-body-md text-body-md px-8 py-4 rounded-lg shadow-\[0px_4px_20px_rgba\(0,0,0,0\.08\)\] hover:bg-primary transition-colors flex items-center justify-center gap-2">/,
    '<button class="bg-primary text-on-primary font-body-md text-body-md px-8 py-4 rounded-lg shadow-[0px_4px_20px_rgba(0,0,0,0.08)] hover:opacity-90 transition-opacity flex items-center justify-center gap-2" onclick="window.location.href=\'hospital_requests.html\'">'
  );

  // Fix CTA border button color
  content = content.replace(/border-\[#1B4D6B\]/g, 'border-secondary');
  content = content.replace(/text-\[#1B4D6B\]/g, 'text-secondary');

  fs.writeFileSync(indexPath, content, 'utf8');
  console.log('✓ Updated: index.html (landing page fixes)');
}

// ============================================================
// FIX DONOR_DASHBOARD.HTML
// ============================================================
const donorDashPath = path.join(publicDir, 'donor_dashboard.html');
if (fs.existsSync(donorDashPath)) {
  let content = fs.readFileSync(donorDashPath, 'utf8');

  // Fix triple onclick
  content = content.replace(
    /onclick="window\.location\.href='hospital_requests\.html'" onclick="window\.location\.href='hospital_requests\.html'" onclick="window\.location\.href='hospital_requests\.html'"/g,
    "onclick=\"window.location.href='hospital_requests.html'\""
  );

  // Fix avatar: use secondary-container
  content = content.replace(
    /bg-primary-container text-on-primary font-label-bold/,
    'bg-primary text-on-primary font-label-bold'
  );

  fs.writeFileSync(donorDashPath, content, 'utf8');
  console.log('✓ Updated: donor_dashboard.html (fixed onclick, colors)');
}

// ============================================================
// REBUILD DONOR_MATCH_RESULTS.HTML CARD LAYOUT
// ============================================================
const matchPath = path.join(publicDir, 'donor_match_results.html');
if (fs.existsSync(matchPath)) {
  let content = fs.readFileSync(matchPath, 'utf8');

  // Fix main content area - remove bg-pattern, fix padding
  content = content.replace(
    /class="flex-1 w-full px-container-margin-mobile md:px-container-margin-desktop pb-32 bg-pattern min-h-screen pt-stack-lg flex flex-col"/,
    'class="flex-1 w-full max-w-[1440px] mx-auto px-container-margin-mobile md:px-container-margin-desktop pt-24 md:pt-20 pb-10 flex flex-col"'
  );

  // Fix grid - ensure proper responsive grid
  content = content.replace(
    /class="grid grid-cols-1 md:grid-cols-\[repeat\(3,1fr\)\] gap-\[24px\] w-full"/,
    'class="grid grid-cols-1 md:grid-cols-3 gap-gutter w-full"'
  );

  // Fix footer - remove mt-auto and make it flow naturally
  content = content.replace(
    /class="w-full py-stack-lg px-container-margin-desktop flex flex-col md:flex-row justify-between items-center gap-gutter bg-inverse-surface border-none shadow-none mt-auto z-10 relative block"/,
    'class="w-full py-stack-lg px-container-margin-desktop flex flex-col md:flex-row justify-between items-center gap-gutter bg-inverse-surface mt-stack-lg"'
  );

  // Remove the bg-pattern style definition
  content = content.replace(
    /\.bg-pattern \{[\s\S]*?\}/,
    ''
  );

  fs.writeFileSync(matchPath, content, 'utf8');
  console.log('✓ Updated: donor_match_results.html (layout rebuild)');
}

console.log('\n🎉 All screens updated successfully!');
