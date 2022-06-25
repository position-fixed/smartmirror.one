/* global context:readonly */
/** @type {import('../../../types').FrontendContext} */
const { elements, data } = context;

console.log('Plugin Update');
elements['text'].innerText = data.joke;