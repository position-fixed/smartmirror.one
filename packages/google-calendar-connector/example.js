const dotenv = require('dotenv');
const Connector = require('./gcalendar-connector');

dotenv.config();

const connector = new Connector({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  returnUrl: process.env.RETURN_URL,
});

// Step 0: Make sure you know what is in README.md

/**
  // Step 1: Generate a URL to connect a Google User's account to your "app"

  const authUrl = connector.generateAuthUrl();
  console.log(authUrl);

  // When you visit this URL you will be returned to your localhost.
  // Make sure to grab the authCode from the queryparams.
  // It should start with 4/, you might need to use decodeURIcomponent.
*/

/**
  // Step 2: Swap authCode for a reusable token
  (async () => {
    try {
      const token = await connector.getTokenFromAuthCode('4/SuperLongGoogleAuthCodeGoesHere');
      console.log(token);
    } catch (e) {
      console.error(e);
    }
  })()

  // Make sure to store this token somewhere safe, you will need it later.
  // Never check in your tokens!
*/

/**
  // Step 3: Use the token from step 2 to grab your info!
  (async () => {
    try {
      const items = await connector.getCalendarItems({
        calendarIds: [
          'lorem-ipsum-1@group.calendar.google.com', // Grab this from your calendar's "settings" page
          'default', // Or just use default
          'nl.dutch#holiday@group.v.calendar.google.com' // You can also use Google's holiday calendars
        ],
        token,
        maxResults: 50,
      });
      console.log(JSON.stringify(items, null, 2));
    } catch(e) {
      console.error(e);
    }
  })()
// */
