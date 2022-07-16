const https = require('https');

const iconMap = {
  200: 'wi-storm-showers',
  201: 'wi-thunderstorm',
  202: 'wi-thunderstorm',
  210: 'wi-thunderstorm',
  211: 'wi-thunderstorm',
  212: 'wi-thunderstorm',
  221: 'wi-thunderstorm',
  230: 'wi-storm-showers',
  231: 'wi-storm-showers',
  232: 'wi-storm-showers',
  300: 'wi-rain',
  301: 'wi-raindrops',
  302: 'wi-raindrops',
  310: 'wi-rain-mix',
  311: 'wi-rain-mix',
  312: 'wi-rain-wind',
  313: 'wi-rain-mix',
  314: 'wi-rain-mix',
  321: 'wi-rain-mix',
  500: 'wi-rain',
  501: 'wi-raindrops',
  502: 'wi-raindrops',
  503: 'wi-raindrops',
  504: 'wi-meteor',
  511: 'wi-sleet',
  520: 'wi-raindrops',
  521: 'wi-raindrops',
  522: 'wi-raindrops',
  531: 'wi-raindrops',
  600: 'wi-snow',
  601: 'wi-snow',
  602: 'wi-snowflake-cold',
  611: 'wi-sleet',
  612: 'wi-sleet',
  613: 'wi-sleet',
  615: 'wi-snow',
  616: 'wi-snow',
  620: 'wi-snow',
  621: 'wi-snow',
  622: 'wi-snow',
  701: 'wi-fog',
  711: 'wi-smog',
  721: 'wi-dust',
  731: 'wi-dust',
  741: 'wi-fog',
  751: 'wi-dust',
  761: 'wi-dust',
  762: 'wi-volcano',
  771: 'wi-tornado',
  781: 'wi-tornado',
  800: 'wi-day-sunny',
  801: 'wi-cloudy',
  802: 'wi-cloudy',
  803: 'wi-cloud',
  804: 'wi-cloud',
};

function getWeatherData({ apiKey, cityId }) {
  return new Promise((resolve, reject) => {
    const reqOptions = {
      headers: { 'Accept': 'application/json' },
      hostname: 'api.openweathermap.org',
      method: 'GET',
      path: `/data/2.5/weather?lang=nl&units=metric&appid=${apiKey}&id=${cityId}`,
      port: 443,
    };

    const parts = [];

    const req = https.request(reqOptions, (res) => {
      res.on('data', (part) =>  parts.push(part));
      res.on('end', () => {
        const data = JSON.parse(Buffer.concat(parts).toString());
        resolve(data);
      });
    });

    req.on('error', (error) => reject(error));
    req.end();
  });
}

async function getWeather({ apiKey, cityId }) {
  const data = await getWeatherData({ apiKey, cityId });
  const capitalize = (input) => {
    return `${input.charAt(0).toUpperCase()}${input.slice(1)}`;
  };

  return {
    description: capitalize(data.weather[0].description),
    humidity: data.main.humidity,
    icon: iconMap[data.weather[0].id],
    temperature: data.main.temp,
  };
}

/** @type {import('../types').BackendFunctions} */
module.exports = {
  async update({ inputs }) {
    return { weather: await getWeather({
      apiKey: inputs.apiKey,
      cityId: inputs.cityId,
    }) };
  },
};