const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const dashboardFile = path.join(publicDir, 'hospital_dashboard.html');
const targetFile = path.join(publicDir, 'create_request.html');

// Read dashboard file to extract the head and header
const dashboardContent = fs.readFileSync(dashboardFile, 'utf8');

// Find where <main> starts
const mainStartIndex = dashboardContent.indexOf('<main');
const headerContent = dashboardContent.substring(0, mainStartIndex);

// Update title in header
let newHeaderContent = headerContent.replace('<title>LifeLink Dashboard</title>', '<title>Create Request - LifeLink</title>');

// We don't want 'Overview' to be highlighted in create_request.html
newHeaderContent = newHeaderContent.replace(
    '<a href="hospital_dashboard.html" class="text-primary font-label-bold text-label-md border-b-2 border-primary py-1 transition-colors">Overview</a>',
    '<a href="hospital_dashboard.html" class="text-on-surface-variant font-label-bold text-label-md hover:text-primary py-1 transition-colors">Overview</a>'
);

const newMainContent = `
<main class="pb-24 pt-8 md:pb-8 px-container-margin-mobile md:px-container-margin-desktop flex flex-col gap-stack-lg max-w-[1440px] mx-auto w-full items-center">
    <div class="text-center mb-6 mt-4">
        <h1 class="text-headline-lg-mobile md:text-headline-lg text-on-surface mb-2" style="font-family: 'Montserrat', sans-serif; font-weight: 700;">Create Request</h1>
        <p class="font-body-md text-body-md text-on-surface-variant">Start an emergency blood request and notify nearby donors instantly.</p>
    </div>

    <div class="w-full max-w-2xl bg-surface-container-lowest rounded-xl p-6 md:p-8 border border-surface-variant shadow-[0px_4px_20px_rgba(0,0,0,0.04)] flex flex-col gap-6">
        <div class="flex flex-col gap-3">
            <label class="font-label-md text-label-md text-on-surface-variant font-medium">Blood Group</label>
            <select id="blood-group" class="w-full rounded-lg border-surface-variant bg-surface p-3 focus:ring-2 focus:ring-secondary focus:border-secondary font-body-md text-body-md outline-none">
                <option value="O-">O Negative (O-)</option>
                <option value="O+">O Positive (O+)</option>
                <option value="A-">A Negative (A-)</option>
                <option value="A+">A Positive (A+)</option>
                <option value="B-">B Negative (B-)</option>
                <option value="B+">B Positive (B+)</option>
                <option value="AB-">AB Negative (AB-)</option>
                <option value="AB+">AB Positive (AB+)</option>
            </select>
        </div>
        <div class="flex flex-col gap-3">
            <label class="font-label-md text-label-md text-on-surface-variant font-medium">Units Needed</label>
            <input id="units-needed" class="w-full rounded-lg border-surface-variant bg-surface p-3 focus:ring-2 focus:ring-secondary focus:border-secondary font-body-md text-body-md outline-none" min="1" type="number" value="4">
        </div>
        <div class="flex flex-col gap-3">
            <label class="font-label-md text-label-md text-on-surface-variant font-medium">Urgency Level</label>
            <div class="flex gap-2" id="urgency-buttons">
                <button type="button" data-val="CRITICAL" class="urgency-btn flex-1 bg-[#9e0027] text-white py-3 rounded-lg font-bold text-[12px] uppercase tracking-wide text-center transition-colors">Critical</button>
                <button type="button" data-val="HIGH" class="urgency-btn flex-1 bg-surface-variant text-on-surface-variant py-3 rounded-lg font-bold text-[12px] uppercase tracking-wide text-center hover:bg-surface-container-high transition-colors">High</button>
                <button type="button" data-val="NORMAL" class="urgency-btn flex-1 bg-surface-variant text-on-surface-variant py-3 rounded-lg font-bold text-[12px] uppercase tracking-wide text-center hover:bg-surface-container-high transition-colors">Normal</button>
            </div>
        </div>
        <div class="flex flex-col gap-3">
            <label class="font-label-md text-label-md text-on-surface-variant font-medium">Location (Auto-filled)</label>
            <div class="flex items-center gap-2 bg-surface-container-low p-3 rounded-lg border border-surface-variant text-on-surface-variant font-body-md text-body-md">
                <span class="material-symbols-outlined">location_on</span> City Central Hospital, Trauma Ward A
            </div>
        </div>

        <div class="mt-4 pt-6 border-t border-surface-variant flex flex-col gap-4">
            <p id="summary-text" class="text-center font-body-md text-on-surface-variant text-md">
                You're about to broadcast a <span class="font-bold text-[#9e0027]">CRITICAL</span> request for <span class="font-bold">4</span> units of <span class="font-bold">O-</span> blood.
            </p>
            <button onclick="window.location.href='donor_match_results.html'" class="w-full bg-[#9e0027] text-white py-4 rounded-lg font-bold text-[16px] hover:bg-opacity-90 transition-opacity shadow-[0px_4px_20px_rgba(0,0,0,0.04)]">Broadcast Request</button>
        </div>
    </div>
</main>

<script>
    const bloodGroupSelect = document.getElementById('blood-group');
    const unitsInput = document.getElementById('units-needed');
    const urgencyButtons = document.querySelectorAll('.urgency-btn');
    const summaryText = document.getElementById('summary-text');
    let currentUrgency = 'CRITICAL';

    function updateSummary() {
        const bg = bloodGroupSelect.value;
        const units = unitsInput.value || 0;
        
        let urgencyFormatted = currentUrgency;
        if (currentUrgency === 'CRITICAL') {
            urgencyFormatted = \`<span class="font-bold text-[#9e0027]">CRITICAL</span>\`;
        } else {
            urgencyFormatted = \`<span class="font-bold">\${currentUrgency}</span>\`;
        }
        
        summaryText.innerHTML = \`You're about to broadcast a \${urgencyFormatted} request for <span class="font-bold">\${units}</span> units of <span class="font-bold">\${bg}</span> blood.\`;
    }

    bloodGroupSelect.addEventListener('change', updateSummary);
    unitsInput.addEventListener('input', updateSummary);

    urgencyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Reset all
            urgencyButtons.forEach(b => {
                b.className = "urgency-btn flex-1 bg-surface-variant text-on-surface-variant py-3 rounded-lg font-bold text-[12px] uppercase tracking-wide text-center hover:bg-surface-container-high transition-colors";
            });
            // Set active
            currentUrgency = btn.getAttribute('data-val');
            if (currentUrgency === 'CRITICAL') {
                btn.className = "urgency-btn flex-1 bg-[#9e0027] text-white py-3 rounded-lg font-bold text-[12px] uppercase tracking-wide text-center transition-colors";
            } else {
                btn.className = "urgency-btn flex-1 bg-[#356382] text-white py-3 rounded-lg font-bold text-[12px] uppercase tracking-wide text-center transition-colors";
            }
            updateSummary();
        });
    });
</script>
</body>
</html>
`;

fs.writeFileSync(targetFile, newHeaderContent + newMainContent, 'utf8');

// Now update the navigation in all files to point to create_request.html
const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(publicDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Find the "Create Request" button in the nav and point it to create_request.html
    // The button typically looks like:
    // <button class="..." onclick="window.location.href='hospital_requests.html'">Create Request</button>
    // Or it might already be 'donor_match_results.html' depending on previous scripts
    content = content.replace(
        /<button([^>]*)onclick="window\.location\.href='[^']*'"([^>]*)>Create Request<\/button>/g,
        '<button$1onclick="window.location.href=\\\'create_request.html\\\'"$2>Create Request</button>'
    );
    
    // Also, we can update the dashboard embedded form's button to point to create_request.html or donor_match_results.html.
    // The prompt says "Keep the existing embedded form on the Overview page as-is for now", so we don't need to change it explicitly if we don't want to, but if it has "Broadcast Request", we can make it do nothing or point to create_request.
    
    fs.writeFileSync(filePath, content, 'utf8');
});

console.log('Successfully created create_request.html and updated navigation!');
