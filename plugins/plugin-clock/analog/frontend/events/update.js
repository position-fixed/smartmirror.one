/* global context:readonly */

/** @type {import('../../types').FrontendContext} */
const { elements, data } = context;
Object.entries(data.styles).forEach(([ key, val ]) => {
  elements['clock'].style.setProperty(key, val);
});
