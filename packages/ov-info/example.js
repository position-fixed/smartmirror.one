const dotenv = require('dotenv');

const OvInfo = require('./ov-info');

dotenv.config();

(async () => {
  const ovInfo = new OvInfo();

  const locations = await ovInfo.getLocationIds({
    maxDistance: +process.env.MAX_DISTANCE,
    latitude: +process.env.LATITUDE,
    longitude: +process.env.LONGITUDE,
  });

  const stopInfo = await ovInfo.getDeparturesForLocations({
    maxTime: +process.env.MAX_TIME,
    locations,
  });

  console.log(JSON.stringify(stopInfo, null, 2));

})();