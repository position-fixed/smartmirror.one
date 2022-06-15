/* global context:readonly */
/**
 * @param {HTMLElement} clock
 */
const updateClockWidth = (clock) => {
  const parent = clock.parentElement;
  if (parent) {
    const size = parent.clientHeight < parent.clientWidth
      ? parent.clientHeight : parent.clientWidth;
    clock.style.minWidth = `${size}px`;
    clock.style.minHeight = `${size}px`;
  }
};

/** @type {import('../../types').FrontendContext} */
const { elements } = context;
updateClockWidth(elements['clock']);