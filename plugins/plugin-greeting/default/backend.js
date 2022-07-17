const getGreeting = () => {
  const now = new Date().getHours();
  if (now > 18) return 'Good evening';
  if (now > 12) return 'Good afternoon';
  if (now > 6) return 'Good morning';
  return 'Good night';
};

const options = [ 'doing', 'going', 'hanging', 'today' ];

/** @type {import('../types').BackendFunctions} */
module.exports = {
  update() {
    return {
      greeting: getGreeting(),
      question: `How are you ${options[Math.floor(Math.random() * options.length)]}?`,
    };
  },
};