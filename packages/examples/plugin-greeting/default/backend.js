const getGreeting = () => {
  const now = new Date().getHours();
  if (now > 18) return 'Good evening';
  if (now > 12) return 'Good afternoon';
  if (now > 6) return 'Good morning';
  return 'Good night';
};

/** @type {import('./types').BackendFunctions} */
module.exports = {
  init() {
    console.log('Plugin init');
    return { greeting: getGreeting() };
  },
  update() {
    console.log('The \'update\' method has been triggered for the example plugin.');
    return { greeting: getGreeting() };
  },
};