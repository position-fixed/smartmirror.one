const dateFns = require('date-fns');
const { google } = require('googleapis');

class gCalendarConnector {
  clientId;
  clientSecret;
  returnUrl;

  constructor({ clientId, clientSecret, returnUrl }) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.returnUrl = returnUrl;
  }

  sortByDate(itemA, itemB) {
    const dateA = new Date(itemA.start);
    const dateB = new Date(itemB.start);
    if (dateA.valueOf() > dateB.valueOf()) return 1;
    if (dateA.valueOf() < dateB.valueOf()) return -1;
    return 0;
  }

  getOAuth2Client() {
    const oAuth2Client = new google.auth.OAuth2(
      this.clientId,
      this.clientSecret,
      this.returnUrl,
    );
    return oAuth2Client;
  }

  generateAuthUrl() {
    const oAuth2Client = this.getOAuth2Client();
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [ 'https://www.googleapis.com/auth/calendar.readonly' ],
    });

    return authUrl;
  }

  getTokenFromAuthCode(code) {
    return new Promise((res, rej) => {
      const oAuth2Client = this.getOAuth2Client();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) rej(err);
        res(Buffer.from(JSON.stringify(token)).toString('base64'));
      });
    });
  }

  getItemsForCalendar({ token, maxResults, calendarId }) {
    return new Promise((resolve, reject) => {
      const handleCalendarResponse = (error, response) => {
        if (error) reject(error);
        const events = response.data.items || [];
        const mappedEvents = events.map(event => ({
          calendar: event.organizer.displayName || '',
          end: event.end.dateTime || event.end.date,
          fullDay: !event.start.dateTime,
          start: event.start.dateTime || event.start.date,
          summary: event.summary,
        }));
        resolve(mappedEvents);
      };

      const oAuth2Client = this.getOAuth2Client();
      const stringToken = Buffer.from(token, 'base64').toString('utf-8');
      oAuth2Client.setCredentials(JSON.parse(stringToken));
      const calendar = google.calendar({
        version: 'v3',
        auth: oAuth2Client,
      });

      const now = new Date();
      const tomorrow = dateFns.addDays(now, 1);

      calendar.events.list({
        calendarId,
        maxResults,
        orderBy: 'startTime',
        singleEvents: true,
        timeMax: dateFns.formatISO(tomorrow),
        timeMin: dateFns.formatISO(now),
      }, handleCalendarResponse);
    });
  }

  async getCalendarItems({ token, maxResults, calendarIds }) {
    const calendarPromises = calendarIds.map(calendarId => {
      return this.getItemsForCalendar({ calendarId, maxResults, token });
    });
    const calendarResults = await Promise.all(calendarPromises);
    return calendarResults.flat(1).sort(this.sortByDate);
  }
}

module.exports = gCalendarConnector;
