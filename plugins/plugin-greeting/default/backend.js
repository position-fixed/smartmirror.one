const getGreeting = () => {
  const now = new Date().getHours();
  if (now > 18) return 'Good evening';
  if (now > 12) return 'Good afternoon';
  if (now > 6) return 'Good morning';
  return 'Good night';
};

/** @type {import('../types').BackendFunctions} */
module.exports = {
  update() {
    return { greeting: getGreeting() };
  },
};