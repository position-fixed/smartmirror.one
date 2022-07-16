const OvInfo = require('./ovInfo');
const { renderTransport } = require('./renderTransport');

async function getOvInfo(inputs) {
  const ovInfo = new OvInfo({
    widgetId: 'ABCD',
    timeZoneOffset: Number(inputs.timeZoneOffset),
  });

  const locations = await ovInfo.getLocationIds({
    latitude: Number(inputs.latitude),
    longitude: Number(inputs.longitude),
    maxDistanceInMeters: Number(inputs.maxDistanceInMeters),
  });

  const stopInfo = await ovInfo.getDeparturesForLocations({
    maxTimeInMinutes: Number(inputs.maxTimeInMinutes),
    locations,
  });

  return stopInfo;
}

/** @type {import('../types').BackendFunctions} */
module.exports = {
  async update({ inputs }) {
    const info = await getOvInfo(inputs);
    return { transportHTML: renderTransport(info) };
  },
};