const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/lifelink-app/public/create_request.html');
let html = fs.readFileSync(filePath, 'utf-8');

// Find the Broadcast Request button more generically
html = html.replace(/<button([^>]*)>Broadcast Request<\/button>/i, (match, p1) => {
    // Remove onclick if exists
    let newAttr = p1.replace(/onclick="[^"]*"/, '');
    // Remove href if exists
    newAttr = newAttr.replace(/href="[^"]*"/, '');
    return `<button id="submit-request-btn" ${newAttr}>Broadcast Request</button>`;
});

// Remove existing script if it was added earlier
html = html.replace(/<script>\s*document\.addEventListener\('DOMContentLoaded'[\s\S]*?<\/script>/, '');

const logicScript = `
<script>
    document.addEventListener('DOMContentLoaded', () => {
        let selectedUrgency = 'CRITICAL';
        
        // Handle Urgency Buttons
        const urgencyBtns = document.querySelectorAll('.urgency-btn');
        urgencyBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Reset all to unselected visual state
                urgencyBtns.forEach(b => {
                    b.classList.remove('bg-[#9e0027]', 'text-white');
                    b.classList.add('bg-surface-variant', 'text-on-surface-variant');
                });
                // Highlight selected
                e.target.classList.add('bg-[#9e0027]', 'text-white');
                e.target.classList.remove('bg-surface-variant', 'text-on-surface-variant');
                
                selectedUrgency = e.target.getAttribute('data-val');
                if (selectedUrgency === 'HIGH') selectedUrgency = 'URGENT';
            });
        });

        const submitBtn = document.getElementById('submit-request-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                const token = localStorage.getItem('token');
                if (!token) {
                    alert("You must be logged in as a hospital to create a request!");
                    window.location.href = '/login';
                    return;
                }

                const bloodGroup = document.getElementById('blood-group').value;
                const unitsNeeded = parseInt(document.getElementById('units-needed').value) || 1;

                const ogText = submitBtn.innerText;
                submitBtn.innerText = 'Broadcasting...';
                submitBtn.disabled = true;

                try {
                    const response = await fetch('/api/requests', {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + token
                        },
                        body: JSON.stringify({
                            bloodType: bloodGroup,
                            unitsNeeded: unitsNeeded,
                            urgencyLevel: selectedUrgency
                        })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        alert("Request successfully broadcast to all available blood banks!");
                        window.location.href = '/dashboard';
                    } else {
                        alert('Error: ' + data.error);
                        submitBtn.innerText = ogText;
                        submitBtn.disabled = false;
                    }
                } catch (err) {
                    console.error(err);
                    alert('Network error while creating request.');
                    submitBtn.innerText = ogText;
                    submitBtn.disabled = false;
                }
            });
        }
    });
</script>
`;

html = html.replace('</body>', logicScript + '\n</body>');
fs.writeFileSync(filePath, html);
console.log('Successfully patched create_request.html');
