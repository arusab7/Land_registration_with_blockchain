const fs = require('fs');
const path = require('path');

const from = path.join(__dirname, '..', 'build', 'contracts', 'LandRegistry.json');
const toDir = path.join(__dirname, '..', 'client', 'src', 'abi');
const to = path.join(toDir, 'LandRegistry.json');

if (!fs.existsSync(from)) {
  console.error('Artifact not found. Did you run `truffle migrate`?');
  process.exit(1);
}
if (!fs.existsSync(toDir)) fs.mkdirSync(toDir, { recursive: true });
fs.copyFileSync(from, to);
console.log('ABI copied to client/src/abi/LandRegistry.json');
