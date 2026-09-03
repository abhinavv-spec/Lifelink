const fs = require('fs');
const path = require('path');

const dashPath = path.join(__dirname, 'frontend/lifelink-app/public/hospital_dashboard.html');
let html = fs.readFileSync(dashPath, 'utf-8');

// Replace the old script
html = html.replace(/<script>\s*document\.addEventListener\('DOMContentLoaded', async \(\) => {[\s\S]*?<\/script>/, '');

const logicScript = `
<script>
    document.addEventListener('DOMContentLoaded', async () => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (!token || !userStr) {
            window.location.href = '/login';
            return;
        }
        
        const user = JSON.parse(userStr);
        
        // --- 1. Update Hospital Name ---
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while (node = walker.nextNode()) {
            if (node.nodeValue.includes('City Central Hospital')) {
                node.nodeValue = node.nodeValue.replace('City Central Hospital', user.name);
            }
        }

        const initialsElement = document.querySelector('.bg-secondary-container.flex.items-center.justify-center.text-on-secondary-container');
        if (initialsElement) {
            const words = user.name.split(' ');
            let initials = 'H';
            if (words.length >= 2) initials = words[0][0] + words[1][0];
            else if (words.length === 1) initials = words[0].substring(0, 2);
            initialsElement.innerText = initials.toUpperCase();
        }

        // --- 2. Load Blood Bank Inventory ---
        // Instead of the static map image, let's load a real table of blood banks
        const mapContainer = document.querySelector('.lg\\\\:col-span-8 .flex-grow.rounded-lg');
        if (mapContainer) {
            mapContainer.innerHTML = '<div class="p-6 text-center text-on-surface-variant">Loading local blood bank inventory...</div>';
            
            try {
                // Fetch blood bank inventory. We need to add this endpoint or simulate it based on DB.
                // For now, let's fetch all users with role BLOOD_BANK. 
                // Since we don't have an open endpoint for this, we'll fetch from a new endpoint we'll create: /api/inventory/all
                const response = await fetch('/api/inventory/all', {
                    headers: { 'Authorization': 'Bearer ' + token }
                });
                
                const data = await response.json();
                
                if (data.success && data.data.length > 0) {
                    let tableHTML = \`<div class="overflow-x-auto w-full h-full bg-surface">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-surface-variant text-on-surface-variant font-label-bold">
                                    <th class="p-3">Blood Bank Name</th>
                                    <th class="p-3">District</th>
                                    <th class="p-3">Phone</th>
                                    <th class="p-3">Inventory Status</th>
                                </tr>
                            </thead>
                            <tbody>\`;
                    
                    data.data.forEach(bank => {
                        // Just aggregate the total units or show types
                        let totalUnits = bank.inventory.reduce((sum, item) => sum + item.units, 0);
                        let statusColor = totalUnits > 20 ? 'bg-green-500' : (totalUnits > 5 ? 'bg-[#D4AF37]' : 'bg-[#C41E3A]');
                        let statusText = totalUnits > 20 ? 'Sufficient' : (totalUnits > 5 ? 'Low' : 'Critical');
                        
                        // Break down by type
                        let typesDisplay = bank.inventory.filter(i => i.units > 0).map(i => \`<span class="mr-2 text-xs bg-surface-container px-2 py-1 rounded">\${i.bloodType.replace('_POS','+').replace('_NEG','-')}: \${i.units}</span>\`).join('');
                        if(!typesDisplay) typesDisplay = '<span class="text-xs text-on-surface-variant">Out of stock</span>';

                        tableHTML += \`
                            <tr class="border-b border-surface-variant hover:bg-surface-container-lowest transition-colors">
                                <td class="p-3 font-bold text-on-surface">\${bank.name}</td>
                                <td class="p-3 text-on-surface-variant">\${bank.district}</td>
                                <td class="p-3 text-on-surface-variant">\${bank.phone}</td>
                                <td class="p-3">
                                    <div class="flex items-center gap-2 mb-1">
                                        <div class="w-3 h-3 rounded-full \${statusColor}"></div>
                                        <span class="font-label-md text-on-surface">\${statusText} (\${totalUnits} total)</span>
                                    </div>
                                    <div class="flex flex-wrap gap-1 mt-1">
                                        \${typesDisplay}
                                    </div>
                                </td>
                            </tr>
                        \`;
                    });
                    
                    tableHTML += \`</tbody></table></div>\`;
                    mapContainer.innerHTML = tableHTML;
                    mapContainer.classList.remove('relative');
                } else {
                    mapContainer.innerHTML = '<div class="p-6 text-center text-on-surface-variant">No registered blood banks found in the network yet.</div>';
                }
            } catch (err) {
                console.error(err);
                mapContainer.innerHTML = '<div class="p-6 text-center text-[#C41E3A]">Failed to load inventory data.</div>';
            }
        }
    });
</script>
`;

html = html.replace('</body>', logicScript + '\n</body>');
fs.writeFileSync(dashPath, html);
console.log('Successfully patched dashboard.html');
