console.log('Plugin Start');
const { elements, inputs, data } = context;
elements['text'].innerText = `${data.greeting} ${inputs.displayName}.`;