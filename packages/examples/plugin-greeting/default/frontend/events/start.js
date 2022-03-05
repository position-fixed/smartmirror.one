console.log('Plugin Start');
const { elements, inputs } = context;
elements['text'].innerText = `Hello ${inputs.displayName}.`;