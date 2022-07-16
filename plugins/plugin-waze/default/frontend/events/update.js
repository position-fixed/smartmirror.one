/* global context:readonly */
/** @type {import('../../../types').FrontendContext} */
const { elements, data } = context;

elements['distance'].innerText = `${data.routeInfo.distanceInKm}km`;
elements['duration'].innerText = data.routeInfo.durationInMin;