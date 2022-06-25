/* global context:readonly */
/** @type {import('../../../types').FrontendContext} */
const { elements, data } = context;

elements.icon.innerHTML = `
<svg viewBox="0 0 100 100" class="wi ${data.weather.icon}">
  <use xlink:href="#${data.weather.icon}"></use>
</svg>
`;
elements.description.innerHTML = data.weather.description;

const [ full, rest ] = data.weather.temperature.toFixed(1).split('.');
elements.fullDegrees.innerText = full;
elements.restDegrees.innerHTML = `.${rest}&deg;`;
elements.humidity.innerText = `${data.weather.humidity}%`;

elements['weather'].innerText = data.weather;