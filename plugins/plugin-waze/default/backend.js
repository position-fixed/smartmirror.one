const WazeCalculator = require('waze-route-calculator').default;

const calculateRoute = async (inputs) => {
  const wazeCalculator = new WazeCalculator();
  await wazeCalculator.init({
    startAddress: inputs.origin,
    endAddress: inputs.destination,
  });

  const [ routeTime, routeDistance ] = await wazeCalculator.calcRouteInfo();

  return {
    distanceInKm: routeDistance.toFixed(0),
    durationInMin: routeTime.toFixed(0),
  };
};

/** @type {import('../types').BackendFunctions} */
module.exports = {
  async init({ inputs }) {
    console.log('Init');
    return { routeInfo: await calculateRoute(inputs) };
  },
  async update({ inputs }) {
    console.log('Update');
    return { routeInfo: await calculateRoute(inputs) };
  },
};