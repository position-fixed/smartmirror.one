/* global context:readonly */
/** @type {import('../../../types').FrontendContext} */
const { elements, inputs, data } = context;
elements['text'].innerText = `${data.greeting} ${inputs.displayName}!`;