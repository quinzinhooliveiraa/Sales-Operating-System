const fs = require('fs');
let crm = fs.readFileSync('client/src/pages/CRMView.tsx', 'utf8');
const lines = crm.split('\n');
for (let i = 0; i < 30; i++) {
    console.log(`${i+1}: ${lines[i]}`);
}
