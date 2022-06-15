export * from './waze';

export type BaseReqHeaders = {
  'User-Agent': string;
  referer: string;
};

export enum Regions {
  US = 'US',
  EU = 'EU',
  IL = 'IL',
  AU = 'AU',
}

export type Bounds = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type Coords = {
  lat: number;
  lon: number;
  bounds?: Bounds | {};
};

export type RegionizedString = {
  [key in Regions]: string;
}

export type RegionizedCoords = {
  [key in Regions]: Coords;
}

export interface WazeRouteCalcProps {
  startAddress: string;
  endAddress: string;
  region?: Regions;
  vehicleType?: string;
  avoidTollRoads?: boolean;
  avoidSubscriptionRoads?: boolean;
  avoidFerries?: boolean;
}
