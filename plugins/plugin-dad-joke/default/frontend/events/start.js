/* global context:readonly */
/** @type {import('../../../types').FrontendContext} */
const { elements, data } = context;

console.log('Plugin Start');
elements['text'].innerText = data.joke;