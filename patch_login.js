const fs = require('fs');
const path = require('path');

const loginPath = path.join(__dirname, 'frontend/lifelink-app/public/hospital_login.html');
let html = fs.readFileSync(loginPath, 'utf-8');

// Give the form an ID
html = html.replace('<form class="space-y-stack-md bg-surface-container-lowest', '<form id="register-form" class="space-y-stack-md bg-surface-container-lowest');

// Add the auth script before </body>
const authScript = `
<script>
    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const orgName = document.getElementById('orgName').value;
        const regId = document.getElementById('regId').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const submitBtn = e.target.querySelector('button[type="submit"]');
        
        const originalText = submitBtn.innerText;
        submitBtn.innerText = 'Registering...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: orgName + ' Admin',
                    email: email,
                    password: password,
                    role: 'HOSPITAL',
                    hospitalOrBankDetails: {
                        name: orgName,
                        district: 'Central',
                        address: '123 Medical Way',
                        phone: '555-0000'
                    }
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Store the JWT token
                localStorage.setItem('token', data.data.token);
                localStorage.setItem('user', JSON.stringify(data.data.user));
                
                // Redirect to the dashboard
                window.location.href = '/dashboard';
            } else {
                alert('Registration failed: ' + (data.error || 'Unknown error'));
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
            }
        } catch (error) {
            console.error('Auth error:', error);
            alert('Could not connect to the server.');
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
        }
    });
</script>
`;

html = html.replace('</body>', authScript + '\n</body>');

fs.writeFileSync(loginPath, html);
console.log('Successfully patched hospital_login.html');
