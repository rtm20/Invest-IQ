// Script to format Google Cloud credentials for Vercel
const fs = require('fs');
const path = require('path');

// Read the service account key
const keyPath = path.join(__dirname, '..', 'google-cloud-key.json');
const serviceAccount = require(keyPath);

// Convert to base64 to preserve newlines and special characters
const base64Credentials = Buffer.from(JSON.stringify(serviceAccount)).toString('base64');

console.log('\nRun this command to add the credentials to Vercel:\n');
console.log('vercel env add GOOGLE_CREDENTIALS_JSON production');
console.log('> Enter this value (it\'s base64 encoded for safety):');
console.log(base64Credentials);
console.log('\nIMPORTANT:');
console.log('1. Make sure to mark GOOGLE_CREDENTIALS_JSON as "Sensitive"');
console.log('2. After adding the variable, deploy your project with: vercel deploy --prod');