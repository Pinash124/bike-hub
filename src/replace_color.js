const fs = require('fs');
const file = 'd:/github/bike-hub/src/pages/seller/ChoosePlanPage.tsx';
const data = fs.readFileSync(file, 'utf8');
const res = data.replace(/indigo/g, 'green');
fs.writeFileSync(file, res);
console.log('Done replacing indigo with green');
