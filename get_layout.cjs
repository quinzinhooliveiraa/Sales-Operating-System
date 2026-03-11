const fs = require('fs');
let layout = fs.readFileSync('client/src/components/layout/Layout.tsx', 'utf8');
const lines = layout.split('\n');
for (let i = 0; i < 30; i++) {
    console.log(`${i+1}: ${lines[i]}`);
}
