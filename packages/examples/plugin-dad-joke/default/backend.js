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

    req.on('error', (error) => reject());
    req.end();
  });
};

module.exports = {
  async init() {
    console.log('Dad Joke init');
    return { joke: await getJoke() };
  },
  async update() {
    console.log(`The 'update' method has been triggered for the dad-joke plugin.`);
    return { joke: await getJoke() };
  }
}