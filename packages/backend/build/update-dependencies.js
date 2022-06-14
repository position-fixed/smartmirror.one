const { cpSync, rmSync } = require('fs');
const { join, basename } = require('path');
const { stdout } = require('process');

const dependencies = [{
  src: join(__dirname, '../../frontend/dist'),
  target: join(__dirname, '../_public'),
}, {
  src: join(__dirname, '../../examples/plugin-greeting'),
  target: join(__dirname, '../_example/plugin-greeting'),
}];

dependencies.forEach(({ src, target }) => {
  const dir = basename(target);
  stdout.write(`Removing current ${dir}\n`);
  rmSync(target, { recursive: true, force: true });
  cpSync(src, target, { recursive: true });
  stdout.write(`${dir} Updated\n`);
});
