const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

const input = Buffer.from(readFileSync(join(__dirname, './dist/index.html'), 'utf-8'));
const output = `module.exports = "${input.toString('base64')}";`;
writeFileSync(join(__dirname, './dist/index.js'), output, 'utf-8');
