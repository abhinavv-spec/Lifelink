const fs = require('fs');
const path = require('path');

const signupPath = path.join(__dirname, 'frontend/lifelink-app/public/donor_signup.html');
let html = fs.readFileSync(signupPath, 'utf-8');

// Replace old inline onsubmit
html = html.replace(/onsubmit="[^"]*"/, 'id="donor-form"');
html = html.replace(/<script>[\s\S]*?showLoadingState[\s\S]*?<\/script>/, '');

const script = `
<script>
    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('donor-form');
        const submitBtn = form.querySelector('button[type="submit"]');
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="material-symbols-outlined animate-spin">refresh</span> Capturing Location...';
            submitBtn.disabled = true;

            // 1. Get Geolocation
            if (!navigator.geolocation) {
                alert("Geolocation is required to be matched with nearby hospitals.");
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                return;
            }

            navigator.geolocation.getCurrentPosition(async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                // We map display names to enum values since the frontend HTML has things like "A Positive"
                const bloodSelect = document.getElementById('bloodGroup');
                let rawBlood = bloodSelect.options[bloodSelect.selectedIndex].text;
                
                // Map common HTML text to our backend enum Format (e.g. A_POS)
                let bloodType = 'O_POS'; // fallback
                if(rawBlood.includes('O+') || rawBlood.includes('O Positive')) bloodType = 'O_POS';
                if(rawBlood.includes('O-') || rawBlood.includes('O Negative')) bloodType = 'O_NEG';
                if(rawBlood.includes('A+') || rawBlood.includes('A Positive')) bloodType = 'A_POS';
                if(rawBlood.includes('A-') || rawBlood.includes('A Negative')) bloodType = 'A_NEG';
                if(rawBlood.includes('B+') || rawBlood.includes('B Positive')) bloodType = 'B_POS';
                if(rawBlood.includes('B-') || rawBlood.includes('B Negative')) bloodType = 'B_NEG';
                if(rawBlood.includes('AB+') || rawBlood.includes('AB Positive')) bloodType = 'AB_POS';
                if(rawBlood.includes('AB-') || rawBlood.includes('AB Negative')) bloodType = 'AB_NEG';

                submitBtn.innerHTML = '<span class="material-symbols-outlined animate-spin">refresh</span> Registering into Database...';

                // 2. Post to API
                try {
                    const response = await fetch('/api/donors/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: document.getElementById('fullName').value,
                            email: document.getElementById('fullName').value.toLowerCase().replace(' ', '') + '@example.com', // UI is missing email input, using fake one
                            phone: document.getElementById('phone').value,
                            bloodType: bloodType,
                            lat: lat,
                            lng: lng
                        })
                    });

                    const data = await response.json();
                    if (data.success) {
                        submitBtn.innerHTML = '<span class="material-symbols-outlined">check_circle</span> Successfully Enrolled!';
                        submitBtn.classList.remove('bg-primary-container', 'text-on-primary-container');
                        submitBtn.classList.add('bg-green-500', 'text-white');
                        setTimeout(() => {
                            window.location.href = '/donor-dashboard';
                        }, 1500);
                    } else {
                        alert("Error: " + data.error);
                        submitBtn.innerHTML = originalText;
                        submitBtn.disabled = false;
                    }
                } catch (err) {
                    console.error(err);
                    alert("Network error.");
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }

            }, (error) => {
                alert("Could not get your location! Error: " + error.message);
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, { enableHighAccuracy: true });
        });
    });
</script>
`;

html = html.replace('</body>', script + '\n</body>');
fs.writeFileSync(signupPath, html);
console.log('Successfully patched donor_signup.html');
