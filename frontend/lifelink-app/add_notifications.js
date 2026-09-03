const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));

const notifHtml = `
<div class="relative inline-block" id="notification-wrapper">
    <button id="notification-btn" class="relative p-2 rounded-full text-on-surface-variant hover:bg-surface-variant/50 transition-colors focus:outline-none flex items-center justify-center">
        <span class="material-symbols-outlined">notifications</span>
        <!-- Unread badge -->
        <span class="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#9e0027] rounded-full border-2 border-surface"></span>
    </button>

    <!-- Dropdown Panel -->
    <div id="notification-panel" class="hidden absolute right-0 mt-2 w-80 sm:w-96 bg-surface-container-lowest border border-surface-variant rounded-xl shadow-lg z-50 overflow-hidden flex flex-col max-h-[480px]">
        <!-- Header -->
        <div class="flex justify-between items-center p-4 border-b border-surface-variant">
            <h3 class="font-headline-md text-headline-md text-on-surface" style="font-family: 'Montserrat', sans-serif; font-weight: 600;">Notifications</h3>
            <a href="#" class="text-[#356382] font-body-sm text-sm hover:underline">Mark all as read</a>
        </div>
        
        <!-- List -->
        <div class="overflow-y-auto flex-1 font-body-md text-body-md" style="font-family: 'Inter', sans-serif;">
            <!-- Item 1 (Unread, Critical) -->
            <div class="p-4 border-b border-surface-variant flex gap-3 bg-surface-container-low hover:bg-surface-variant/50 transition-colors cursor-pointer relative">
                <div class="absolute left-0 top-0 bottom-0 w-1 bg-[#9e0027]"></div>
                <div class="mt-1 flex-shrink-0">
                    <div class="w-3 h-3 rounded-full bg-[#9e0027]"></div>
                </div>
                <div class="flex-1">
                    <div class="flex justify-between items-start">
                        <p class="font-bold text-on-surface text-base">Critical Stock Alert: O-</p>
                        <span class="text-xs text-on-surface-variant shrink-0 ml-2">2m ago</span>
                    </div>
                    <p class="text-sm text-on-surface-variant mt-1">Regional supply dropping below 15%. Broadcast recommended.</p>
                </div>
            </div>

            <!-- Item 2 (Unread, Match) -->
            <div class="p-4 border-b border-surface-variant flex gap-3 bg-surface-container-low hover:bg-surface-variant/50 transition-colors cursor-pointer relative">
                <div class="absolute left-0 top-0 bottom-0 w-1 bg-[#9e0027]"></div>
                <div class="mt-1 flex-shrink-0">
                    <div class="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div class="flex-1">
                    <div class="flex justify-between items-start">
                        <p class="font-bold text-on-surface text-base">Donor Match Found</p>
                        <span class="text-xs text-on-surface-variant shrink-0 ml-2">12m ago</span>
                    </div>
                    <p class="text-sm text-on-surface-variant mt-1">3 donors have accepted your recent request for A+.</p>
                </div>
            </div>

            <!-- Item 3 (Read, Info) -->
            <div class="p-4 border-b border-surface-variant flex gap-3 bg-surface-container-lowest hover:bg-surface-variant/50 transition-colors cursor-pointer">
                <div class="mt-1 flex-shrink-0">
                    <div class="w-3 h-3 rounded-full bg-[#356382]"></div>
                </div>
                <div class="flex-1">
                    <div class="flex justify-between items-start">
                        <p class="font-bold text-on-surface text-base">New Donor Registered</p>
                        <span class="text-xs text-on-surface-variant shrink-0 ml-2">1h ago</span>
                    </div>
                    <p class="text-sm text-on-surface-variant mt-1">A new O- donor joined within 5 miles of your location.</p>
                </div>
            </div>

            <!-- Item 4 (Read, Action) -->
            <div class="p-4 border-b border-surface-variant flex gap-3 bg-surface-container-lowest hover:bg-surface-variant/50 transition-colors cursor-pointer">
                <div class="mt-1 flex-shrink-0">
                    <div class="w-3 h-3 rounded-full bg-[#356382]"></div>
                </div>
                <div class="flex-1">
                    <div class="flex justify-between items-start">
                        <p class="font-bold text-on-surface text-base">Outreach Message Viewed</p>
                        <span class="text-xs text-on-surface-variant shrink-0 ml-2">3h ago</span>
                    </div>
                    <p class="text-sm text-on-surface-variant mt-1">Metro Blood Center viewed your transfer request.</p>
                </div>
            </div>

            <!-- Item 5 (Read, Status) -->
            <div class="p-4 flex gap-3 bg-surface-container-lowest hover:bg-surface-variant/50 transition-colors cursor-pointer">
                <div class="mt-1 flex-shrink-0">
                    <div class="w-3 h-3 rounded-full bg-[#D4AF37]"></div>
                </div>
                <div class="flex-1">
                    <div class="flex justify-between items-start">
                        <p class="font-bold text-on-surface text-base">Donor Eligibility Update</p>
                        <span class="text-xs text-on-surface-variant shrink-0 ml-2">1d ago</span>
                    </div>
                    <p class="text-sm text-on-surface-variant mt-1">12 donors in your network are now eligible to donate again.</p>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="p-3 border-t border-surface-variant bg-surface-container-lowest text-center">
            <a href="hospital_analytics.html" class="text-[#356382] font-bold text-sm hover:underline" style="font-family: 'Inter', sans-serif;">View All Notifications</a>
        </div>
    </div>
</div>
`;

const notifScript = `
<script>
    document.addEventListener('DOMContentLoaded', () => {
        const notifBtn = document.getElementById('notification-btn');
        const notifPanel = document.getElementById('notification-panel');
        if (notifBtn && notifPanel) {
            notifBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                notifPanel.classList.toggle('hidden');
            });
            document.addEventListener('click', (e) => {
                if (!notifPanel.contains(e.target)) {
                    notifPanel.classList.add('hidden');
                }
            });
        }
    });
</script>
</body>
`;

files.forEach(file => {
    // Only modify hospital-facing or core files for this header update
    const hospitalFiles = [
        'create_request.html', 'donor_database.html', 'donor_match_results.html',
        'hospital_analytics.html', 'hospital_dashboard.html', 'hospital_requests.html',
        'hospital_settings.html', 'index.html', 'hospital_login.html'
    ];
    if (!hospitalFiles.includes(file)) return;

    const filePath = path.join(publicDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // We want to replace the first occurrence of the notifications icon in the <header> tag.
    // The safest way is to isolate the <header> tag, do the replace, and put it back.
    const headerStart = content.indexOf('<header');
    if (headerStart !== -1) {
        const headerEnd = content.indexOf('</header>');
        let headerHTML = content.substring(headerStart, headerEnd);
        
        // Match either <span...>notifications</span> or <button...><span...>notifications</span></button>
        // specifically looking for "notifications" (not notifications_active)
        const regex = /(<button[^>]*>\s*)?<span[^>]*>\s*notifications\s*<\/span>(\s*<\/button>)?/;
        
        if (regex.test(headerHTML)) {
            headerHTML = headerHTML.replace(regex, notifHtml);
            content = content.substring(0, headerStart) + headerHTML + content.substring(headerEnd);
        }
    }

    // Add the script before </body> if not already there
    if (!content.includes('notification-btn')) {
        // Just in case it wasn't added in the header logic above
        return;
    }
    
    if (!content.includes('notifPanel.classList.toggle')) {
        content = content.replace('</body>', notifScript);
    }

    fs.writeFileSync(filePath, content, 'utf8');
});

console.log('Added notifications dropdown to all hospital screens!');
