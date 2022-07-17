/* global context:readonly */
/** @type {import('../../../types').FrontendContext} */
const { elements, inputs, data } = context;

elements['text'].innerHTML = [
  `${data.greeting}, ${inputs.displayName}!`,
  data.question,
].join('<br />');