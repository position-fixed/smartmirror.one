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
  async update({ inputs }) {
    return { routeInfo: await calculateRoute(inputs) };
  },
};