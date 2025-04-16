// save as encode-creds.js and run with: node encode-creds.js
const fs = require('fs');

const json = JSON.parse(fs.readFileSync('./gcp_creds.json', 'utf8'));
const jsonEscaped = JSON.stringify(json);
console.log(`GCP_CREDENTIALS_JSON='${jsonEscaped}'`);
