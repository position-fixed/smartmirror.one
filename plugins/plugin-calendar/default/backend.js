const gCalendarConnector = require('google-calendar-connector').default;

async function getCalendarItems(inputs) {
  const connector = new gCalendarConnector({
    clientId: inputs.clientId,
    clientSecret: inputs.clientSecret,
    returnUrl: inputs.returnUrl,
  });

  try {
    const items = await connector.getCalendarItems({
      calendarIds: inputs.calendarIds.split(';'),
      maxResults: 50,
      token: inputs.token,
    });
    return items;
  } catch(e) {
    console.error(e);
    return [];
  }
}

/** @type {import('../types').BackendFunctions} */
module.exports = {
  async update({ inputs }) {
    console.log('Update');
    return { calendarItems: await getCalendarItems(inputs) };
  },
};