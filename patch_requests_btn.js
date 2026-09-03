const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'frontend/lifelink-app/public/hospital_requests.html');
let html = fs.readFileSync(file, 'utf-8');

const targetFunction = `function broadcastToAllClubsWhatsApp() {`;
const newFunction = `async function broadcastToAllClubsWhatsApp() {
      const btn = document.querySelector('button[onclick="broadcastToAllClubsWhatsApp()"]');
      const originalText = btn.innerHTML;
      btn.innerHTML = '<span class="material-symbols-outlined animate-spin text-[18px]">refresh</span> Broadcasting...';
      btn.disabled = true;

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('You must be logged in as a hospital to use automated broadcast.');
          btn.innerHTML = originalText;
          btn.disabled = false;
          return;
        }

        const res = await fetch('/api/emergency/broadcast', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({
            bloodType: HOSPITAL_DESTINATION.neededBlood,
            unitsNeeded: HOSPITAL_DESTINATION.unitsNeededForPatient
          })
        });

        const data = await res.json();
        if (data.success) {
          alert('✅ Successfully broadcasted automated Twilio alert to ' + data.data.recipients + ' predefined clubs/NGOs!');
          btn.innerHTML = '<span class="material-symbols-outlined text-[18px]">check</span> Automated Sent';
          btn.classList.replace('bg-[#25D366]', 'bg-emerald-700');
        } else {
          alert('Failed to send broadcast: ' + data.error);
          btn.innerHTML = originalText;
          btn.disabled = false;
        }
      } catch (err) {
        console.error(err);
        alert('Network error while triggering automated broadcast.');
        btn.innerHTML = originalText;
        btn.disabled = false;
      }
    }`;

// Replace the old function with the async API call
html = html.replace(/function broadcastToAllClubsWhatsApp\(\) \{[\s\S]*?\}\n/, newFunction + '\n');

fs.writeFileSync(file, html);
console.log('hospital_requests patched');
