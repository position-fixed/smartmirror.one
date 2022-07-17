const busSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
  <path d="M224 0C348.8 0 448 35.2 448 80V416C448 433.7 433.7 448 416 448V480C416 497.7 401.7 512 384 512H352C334.3 512 320 497.7 320 480V448H128V480C128 497.7 113.7 512 96 512H64C46.33 512 32 497.7 32 480V448C14.33 448 0 433.7 0 416V80C0 35.2 99.19 0 224 0zM64 256C64 273.7 78.33 288 96 288H352C369.7 288 384 273.7 384 256V128C384 110.3 369.7 96 352 96H96C78.33 96 64 110.3 64 128V256zM80 400C97.67 400 112 385.7 112 368C112 350.3 97.67 336 80 336C62.33 336 48 350.3 48 368C48 385.7 62.33 400 80 400zM368 400C385.7 400 400 385.7 400 368C400 350.3 385.7 336 368 336C350.3 336 336 350.3 336 368C336 385.7 350.3 400 368 400z"/>
</svg>`;

const tramSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
  <path d="M352 0C405 0 448 42.98 448 96V352C448 399.1 412.8 439.7 366.9 446.9L412.9 492.9C419.9 499.9 414.9 512 404.1 512H365.3C356.8 512 348.6 508.6 342.6 502.6L288 448H160L105.4 502.6C99.37 508.6 91.23 512 82.75 512H43.04C33.06 512 28.06 499.9 35.12 492.9L81.14 446.9C35.18 439.7 0 399.1 0 352V96C0 42.98 42.98 0 96 0H352zM64 224C64 241.7 78.33 256 96 256H176C193.7 256 208 241.7 208 224V128C208 110.3 193.7 96 176 96H96C78.33 96 64 110.3 64 128V224zM272 96C254.3 96 240 110.3 240 128V224C240 241.7 254.3 256 272 256H352C369.7 256 384 241.7 384 224V128C384 110.3 369.7 96 352 96H272zM96 320C78.33 320 64 334.3 64 352C64 369.7 78.33 384 96 384C113.7 384 128 369.7 128 352C128 334.3 113.7 320 96 320zM352 384C369.7 384 384 369.7 384 352C384 334.3 369.7 320 352 320C334.3 320 320 334.3 320 352C320 369.7 334.3 384 352 384z"/>
</svg>`;

const getIcon = (lineType) => {
  switch(lineType) {
  case 'BUS':
    return busSVG;
  case 'TRAM':
    return tramSVG;
  default:
    return lineType;
  }
};

const renderTransport = (transportInfo) => {
  const departureMap = departure => {
    const late = departure.late
      ? `<b>${departure.late > 0 ? '+' : ''}${departure.late}</b>`
      : '';
    return `<p>${departure.time}${late}</p>`;
  };

  const lineMap = line => `
  <div class="transport__line">
    ${getIcon(line.type)} <p>${line.number}</p>
    <div class="transport__line__info">
      <p>${line.name}</p>
      ${line.departures.map(departureMap).join('')}
    </div>
  </div>`;

  const transportMap = (location, index, array) => `
  <div class="transport__item animated" style="--index:${index};--total:${array.length}">
    <p class="transport__heading">${location}</p>
    ${transportInfo[location].map(lineMap).join('')}
  </div>`;

  return Object.keys(transportInfo).map(transportMap).join('');
};

module.exports = { renderTransport };