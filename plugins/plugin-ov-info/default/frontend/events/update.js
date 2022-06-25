/* global context:readonly */
/** @type {import('../../../types').FrontendContext} */
const { elements, data } = context;

elements['transportContainer'].innerHTML = data.transportHTML;
elements['transportContainer'].querySelectorAll('.transport__item').forEach(item => {
  window.setInterval(() => {
    item.classList.remove('animated');
    item.scrollBy(); // Triggers a DOM reflow for the item
    item.classList.add('animated');
  }, 60000);
});