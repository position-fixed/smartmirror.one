console.log('Plugin Update');
const { elements, inputs, update } = context;
elements['text'].innerText = `${update} ${inputs.displayName}.`;