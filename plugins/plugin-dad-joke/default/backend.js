const https = require('https');

function getJoke() {
  return new Promise((resolve, reject) => {
    const reqOptions = {
      headers: { 'Accept': 'application/json' },
      hostname: 'icanhazdadjoke.com',
      method: 'GET',
      port: 443,
    };

    const parts = [];

    const req = https.request(reqOptions, (res) => {
      res.on('data', (part) =>  parts.push(part));
      res.on('end', () => {
        const data = JSON.parse(Buffer.concat(parts).toString());
        resolve(data.joke);
      });
    });

    req.on('error', (error) => reject(error));
    req.end();
  });
}

/** @type {import('../types').BackendFunctions} */
module.exports = {
  async update() {
    return { joke: await getJoke() };
  },
};