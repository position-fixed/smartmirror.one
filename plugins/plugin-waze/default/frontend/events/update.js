/* global context:readonly */
/** @type {import('../../../types').FrontendContext} */
const { elements, data } = context;

const duration = [];
const hours = Math.floor(data.routeInfo.durationInMin / 60);
const mins = data.routeInfo.durationInMin - (60 * hours);
if (hours) duration.push(`${hours}h`);
duration.push(`${mins}m`);

elements['distance'].innerText = `${data.routeInfo.distanceInKm}km`;
elements['duration'].innerText = duration.join(' ');