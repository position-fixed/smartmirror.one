const { default: caxa } = require('caxa');
const { join } = require('path');
const { platform, stdout } = require('process');

(async () => {
  const ext = platform === 'win32' ? '.exe' : '';
  const version = process.env.PACKAGE_VERSION || Date.now();
  const output = `smartmirror1-${platform}-${version}${ext}`;
  stdout.write(`Generating ${output}\n`);

  await caxa({
    command: [
      '{{caxa}}/node_modules/.bin/node',
      '{{caxa}}/dist/index.js',
    ],
    exclude: '{src,packages}',
    input: join(__dirname, '..'),
    output: join(__dirname, `../_bins/${output}`),
  });
})();