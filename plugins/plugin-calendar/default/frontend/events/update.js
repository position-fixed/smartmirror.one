/* global context:readonly */
/** @type {import('../../../types').FrontendContext} */
const { elements, data } = context;

const getTime = (date) => {
  const hours = date.getHours();
  const mins = date.getMinutes();
  return `${hours < 10 ? '0' : ''}${hours}:${mins < 10 ? '0' : ''}${mins}`;
};

const getIcon = (filled) => {
  return filled
    ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
        <path d="M96 32C96 14.33 110.3 0 128 0C145.7 0 160 14.33 160 32V64H288V32C288
        14.33 302.3 0 320 0C337.7 0 352 14.33 352 32V64H400C426.5 64 448 85.49 448 112V160H0V112C0
        85.49 21.49 64 48 64H96V32zM448 464C448 490.5 426.5 512 400 512H48C21.49 512 0 490.5 0 464V192H448V464z"/>
      </svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
        <path d="M152 64H296V24C296 10.75 306.7 0 320 0C333.3 0 344 10.75 344 24V64H384C419.3
          64 448 92.65 448 128V448C448 483.3 419.3 512 384 512H64C28.65 512 0 483.3 0 448V128C0
          92.65 28.65 64 64 64H104V24C104 10.75 114.7 0 128 0C141.3 0 152 10.75 152 24V64zM48 448C48
          456.8 55.16 464 64 464H384C392.8 464 400 456.8 400 448V192H48V448z"/>
      </svg>`;
};

const createElements = ({ container, calendarEvents }) => {
  calendarEvents.forEach(calendarEvent => {
    const startDate = new Date(calendarEvent.start);
    const day = startDate.getDate();
    const startTime = getTime(startDate);
    const endDate = new Date(calendarEvent.end);
    const endTime = getTime(endDate);

    const calendarItem = document.createElement('div');
    calendarItem.classList = [ 'calendar__item' ];

    const calendarIcon = document.createElement('div');
    calendarIcon.classList = [ 'calendar__icon' ];
    if (calendarEvent.fullDay) calendarIcon.classList.add('filled');
    calendarIcon.innerHTML = getIcon(calendarEvent.fullDay);
    calendarIcon.setAttribute('data-date', day.toString());
    calendarItem.appendChild(calendarIcon);

    const calendarName = document.createElement('div');
    calendarName.classList = [ 'calendar__name' ];
    calendarName.innerText = calendarEvent.calendar;
    calendarItem.appendChild(calendarName);

    if (!calendarEvent.fullDay) {
      const eventTime = document.createElement('div');
      eventTime.classList = [ 'calendar__time' ];
      eventTime.innerText = `${startTime} - ${endTime}`;
      calendarItem.appendChild(eventTime);
    }

    const eventSummary = document.createElement('h4');
    eventSummary.classList = [ 'calendar__summary' ];
    eventSummary.innerText = calendarEvent.summary;
    calendarItem.appendChild(eventSummary);

    container.appendChild(calendarItem);
  });
};

createElements({
  container: elements['calendarContainer'],
  calendarEvents: data.calendarItems,
});