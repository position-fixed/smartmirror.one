/* global context:readonly */
/** @type {import('../../types').FrontendContext} */

const { elements, data } = context;
elements['clock'].innerText = data.time;