const https = require('https');
const fs = require('fs');
const path = require('path');

const screens = [
  {
    title: "Hospital Login/Register",
    url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1YTdjY2UxYzNhYjAwNTAzZDA0ZDQ1MTZmZGQ0EgsSBxDjzeK4jBQYAZIBIwoKcHJvamVjdF9pZBIVQhM2NTc5NTk1MzIzNTI0MDI4NjUz&filename=&opi=89354086",
    filename: "hospital_login.html"
  },
  {
    title: "LifeLink Landing Page",
    url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1YTdjY2U4MjZmNDAwNDMxMTVhMDQ4MWIzZmFlEgsSBxDjzeK4jBQYAZIBIwoKcHJvamVjdF9pZBIVQhM2NTc5NTk1MzIzNTI0MDI4NjUz&filename=&opi=89354086",
    filename: "index.html"
  },
  {
    title: "Donor Sign-Up",
    url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1YTdjY2UzZWQ4NzMwMWE2MDMxNTM0M2NmM2IzEgsSBxDjzeK4jBQYAZIBIwoKcHJvamVjdF9pZBIVQhM2NTc5NTk1MzIzNTI0MDI4NjUz&filename=&opi=89354086",
    filename: "donor_signup.html"
  },
  {
    title: "Hospital Dashboard (Top Nav)",
    url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1YTdjOTZmZmRiZWUwMzgzOTBkOGU5MmE2NWViEgsSBxDjzeK4jBQYAZIBIwoKcHJvamVjdF9pZBIVQhM2NTc5NTk1MzIzNTI0MDI4NjUz&filename=&opi=89354086",
    filename: "hospital_dashboard.html"
  },
  {
    title: "Donor Match Results (Top Nav)",
    url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1YTdjY2RmYWE1OGEwOTI1ZDQ5ZTgwMTFlNDVlEgsSBxDjzeK4jBQYAZIBIwoKcHJvamVjdF9pZBIVQhM2NTc5NTk1MzIzNTI0MDI4NjUz&filename=&opi=89354086",
    filename: "donor_match_results.html"
  },
  {
    title: "Outreach Log (Top Nav)",
    url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1YTdjY2UwODI5MGIwMmE5YWQ1N2FmMGNlZWU4EgsSBxDjzeK4jBQYAZIBIwoKcHJvamVjdF9pZBIVQhM2NTc5NTk1MzIzNTI0MDI4NjUz&filename=&opi=89354086",
    filename: "hospital_requests.html"
  },
  {
    title: "Hospital Analytics (Top Nav)",
    url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1YTdjY2VkZmVmZDQwMmE5YWQ1N2FmMGNlZWU4EgsSBxDjzeK4jBQYAZIBIwoKcHJvamVjdF9pZBIVQhM2NTc5NTk1MzIzNTI0MDI4NjUz&filename=&opi=89354086",
    filename: "hospital_analytics.html"
  },
  {
    title: "Hospital Settings (Top Nav)",
    url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1YTdjY2ViOTFmNWQwOTEwNGY0ZTNlMGI1YWExEgsSBxDjzeK4jBQYAZIBIwoKcHJvamVjdF9pZBIVQhM2NTc5NTk1MzIzNTI0MDI4NjUz&filename=&opi=89354086",
    filename: "hospital_settings.html"
  },
  {
    title: "Donor Database (Top Nav)",
    url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1YTdjY2U1Yzk4MWEwMWI0ZTI3MmY0MGQxNjI5EgsSBxDjzeK4jBQYAZIBIwoKcHJvamVjdF9pZBIVQhM2NTc5NTk1MzIzNTI0MDI4NjUz&filename=&opi=89354086",
    filename: "donor_database.html"
  }
];

const publicDir = path.join(__dirname, 'public');

const downloadFile = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
};

(async () => {
  for (const screen of screens) {
    console.log(`Downloading ${screen.title}...`);
    await downloadFile(screen.url, path.join(publicDir, screen.filename));
    console.log(`Saved as ${screen.filename}`);
  }
  console.log("All files downloaded successfully!");
})();
