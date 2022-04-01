const { cpSync, rmSync } = require('fs');
const { join } = require('path');
const { stdout } = require('process');

const source = join(__dirname, '../../frontend/dist');
const target = join(__dirname, '../_public');
stdout.write('Removing current Frontend\n');
rmSync(target, { recursive: true, force: true });
cpSync(source, target, { recursive: true });
stdout.write('Frontend Updated\n');