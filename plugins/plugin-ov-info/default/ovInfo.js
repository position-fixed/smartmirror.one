const { get } = require('https');

class OvInfo {
  userAgent;
  timeZoneOffset;

  constructor({ widgetId, timeZoneOffset }) {
    this.userAgent = `Smartmirror Widget ${widgetId}`;
    this.timeZoneOffset = timeZoneOffset;
  }

  ovRequest(path) {
    return new Promise((resolve, reject) => {
      const reqOptions = {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': this.userAgent,
        },
        hostname: 'v0.ovapi.nl',
        path,
      };
      get(reqOptions, (response) => {
        const data = [];
        response.on('data', (chunk) => data.push(chunk));
        response.on('close', () => {
          const result = JSON.parse(Buffer.concat(data).toString());
          resolve(result);
        });
      }).on('error', (err) => reject(err));
    });
  }

  calculateDistance({
    originLatitude,
    originLongitude,
    destinationLatitude,
    destinationLongitude,
  }) {
    if (
      originLatitude === destinationLatitude
      && originLongitude === destinationLongitude
    ) {
      return 0;
    }

    // Draw circles around both latitudes
    const lat1Radius = Math.PI * originLatitude / 180;
    const lat2Radius = Math.PI * destinationLatitude / 180;
    // Theta is the difference difference
    const theta = originLongitude - destinationLongitude;
    // The radius of the difference
    const thetaRadius = Math.PI * theta / 180;

    // Calculate distance
    let distance = (Math.sin(lat1Radius)
      * Math.sin(lat2Radius)
      + Math.cos(lat1Radius)
      * Math.cos(lat2Radius)
      * Math.cos(thetaRadius));

    if (distance > 1) distance = 1;
    distance = Math.acos(distance);
    distance = distance * 180 / Math.PI;
    distance = distance * 60 * 1.1515;

    // Convert to KM
    distance = distance * 1.609344;
    return distance;
  }

  async getLocationIds({ maxDistanceInMeters, latitude, longitude }) {
    const stopCodes = await this.ovRequest('/stopareacode');
    const maxDistanceInKm = maxDistanceInMeters / 1000;

    const codes = Object.keys(stopCodes)
      .map(code => {
        const stop = stopCodes[code];
        const dist = this.calculateDistance({
          destinationLatitude: stop.Latitude,
          destinationLongitude: stop.Longitude,
          originLatitude: latitude,
          originLongitude: longitude,
        });

        if (dist < maxDistanceInKm) {
          return stop.StopAreaCode;
        }
      });

    return codes.filter((i) => i);
  }

  async getDeparturesForLocations({ maxTimeInMinutes, locations }) {
    const departuresData = await this.ovRequest(`/stopareacode/${locations.join(',')}/departures`);

    const departuresList = Object.keys(departuresData)
      .flatMap((departureId) => {
        const transitData = departuresData[departureId];
        const transitLines = Object.keys(transitData).map((line) => transitData[line]);
        return transitLines
          .flatMap((line) => this.parseTransitLine({
            line,
            maxTime: maxTimeInMinutes * 60 * 1000,
          }))
          .filter((l) => l);
      });

    const departuresPerLocation = {};
    departuresList.forEach((listItem) => {
      departuresPerLocation[listItem.location] = [
        ...(departuresPerLocation[listItem.location] || []),
        listItem,
      ];
    });

    Object.keys(departuresPerLocation)
      .forEach((code) => {
        departuresPerLocation[code] = this.flattenDepartures(departuresPerLocation[code]);
      });

    return departuresPerLocation;
  }

  flattenDepartures(departureList) {
    const transitLines = [];
    departureList.forEach((listItem) => {
      delete listItem.location;

      const lineIndex = transitLines.findIndex((line) => {
        return (
          line.number === listItem.number
          && line.name === listItem.name
          && line.type === listItem.type
        );
      });

      if (lineIndex !== -1) {
        transitLines[lineIndex].departures.push(...listItem.departures);
        transitLines[lineIndex].departures.sort(this.sortOnTime);
      } else {
        transitLines.push(listItem);
      }
    });
    return transitLines;
  }

  parseTransitLine({ line, maxTime }) {
    if (Object.keys(line.Passes).length > 0) {
      return Object.keys(line.Passes)
        .map((passingTransit) => line.Passes[passingTransit])
        .flatMap((passingTransit) => this.parsePassingTransit({
          location: line.Stop.TimingPointName,
          maxTime,
          passingTransit,
        }))
        .filter((p) => p);
    }
  }

  parsePassingTransit({ location, passingTransit, maxTime }) {
    const expectedDeparture = new Date(passingTransit.ExpectedDepartureTime);
    const targetDeparture = new Date(passingTransit.TargetDepartureTime);
    const late = parseInt(
      Math.abs(targetDeparture.getTime() - expectedDeparture.getTime()) / (1000 * 60) % 60,
    );

    const currentTime = (new Date()).getTime() + (60 * 60 * 1000 * this.timeZoneOffset);
    const distanceInMs = expectedDeparture.getTime() - currentTime;
    const inSelectedTimeSlot = distanceInMs <= maxTime;

    if (passingTransit.TripStopStatus !== 'PASSED' && inSelectedTimeSlot) {
      const thisTransitPass = {
        departures: [{
          time: this.dateToHumanTime(expectedDeparture),
          late,
        }],
        location,
        name: passingTransit.DestinationName50.replace(/\s\s/, ' - '),
        number: passingTransit.LinePublicNumber,
        type: passingTransit.TransportType,
      };

      return thisTransitPass;
    }
  }

  dateToHumanTime(date) {
    const hours = date.getHours();
    const mins = date.getMinutes();
    return `${hours < 10 ? `0${hours}` : hours}:${mins < 10 ? `0${mins}` : mins}`;
  }

  sortOnTime(firstTimeString, secondTimeString) {
    const firstTime = +firstTimeString.time.replace(':', '');
    const secondTime = +secondTimeString.time.replace(':', '');

    if (firstTime > secondTime) return 1;
    if (firstTime < secondTime) return -1;
    return 0;
  }
}

module.exports = OvInfo;
