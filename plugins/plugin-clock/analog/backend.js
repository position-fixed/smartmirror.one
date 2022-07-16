const getAnalogTimeVars = () => {
  const date = new Date();
  return {
    '--hour': `${30 * ((date.getHours() % 12) + (date.getMinutes() / 60)) }`,
    '--minute': `${6 * date.getMinutes()}`,
    '--second': `${6 * date.getSeconds()}`,
  };
};

/** @type {import('../types').BackendFunctions} */
module.exports = {
  update() {
    return { styles: getAnalogTimeVars() };
  },
};