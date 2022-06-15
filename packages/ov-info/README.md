# Smartmirror.one - OV-info

## What is it?
This package helps to expose Dutch public transport information through a JS API.

## How does it do that?
It uses the excellent API over at [ovapi.nl](https://ovapi.nl). You can read the docs [here](https://github.com/skywave/KV78Turbo-OVAPI/wiki).

### API

You should instantiate a new ov-info class.
```js
import OvInfo from 'ov-info';

const ovInfo = new OvInfo();
```

You then have the following methods available:
```js
const locations = await ovInfo.getLocationIds({
  maxDistance: 0.5, // distance in km
  latitude: 52.090522, // as a float
  longitude:  5.342797, // as a float
});
// Locations will be an array of ids bus-stops, tramstops, etc.

const stopInfo = await ovInfo.getDeparturesForLocations({
  maxTime: 15000, // maximum time in the future, in ms
  locations: [...], // a list like the output of getLocationIds()
});
```

The output of `getDeparturesForLocations()` will have this format:
```json
{
  "RandomBusStopName": [ // Every busstop is a key, the passing lines will be in the array
    {
      "number": "21", // line number, a string because it might be 700e etc.
      "name": "Vrederust", // destination
      "type": "BUS", // can also be "TRAM", etc.
      "departures": [
        {
          "time": "23:02", // time it should leave according to plan
          "late": 0 // number of minutes that it is late
        },
        {
          "time": "23:22", // departures are sorted on timestamp
          "late": 0
        }
      ]
    },
    {
      "number": "21", // can be a duplicate number, most services run both ways
      "name": "Stad - Noord", // different destination than above
      "type": "BUS",
      "departures": [
        {
          "time": "23:12",
          "late": 0
        }
      ]
    }
  ]
}
```
Double entries are removed, and empty items are filtered out.

## Etiquette

Take the [etiquette](https://github.com/skywave/KV78Turbo-OVAPI/wiki#etiquette) described by the data provider seriously please.