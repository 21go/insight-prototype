const fs = require('fs');

const raw = fs.readFileSync('./gcp_creds.json', 'utf-8');
const parsed = JSON.stringify(JSON.parse(raw));

console.log(parsed); // Copy this directly into your .env
