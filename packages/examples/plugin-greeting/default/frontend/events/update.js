console.log('Plugin Update');
const { elements, inputs, data } = context;
elements['text'].innerText = `${data.greeting} ${inputs.displayName}!`;