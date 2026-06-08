export enum LocationType {
  ALL_LOCATIONS = 'all locations',
  EMIRATE = 'emirate',
  REGION = 'region',
  DISTRICT = 'district',
  ZONE = 'zone',
  CORRIDOR = 'corridor',
  SPECIAL_DISTRICT = 'special_district',
}

export interface ILocation {
  location: string; // name
  boundingBox: [number, number, number, number]; // bbox
  center: [number, number]; // center point
  locationType: LocationType;
  area: number; // area
  parentLocation?: string;
}

export type LocationAndLocationType = { location: string; locationType: string };

export type LocationWithGeometry = ILocation & {
  geometry: MultiPolygonGeometry; // geometry
};

export type Zones = { locationType: LocationType; zones: LocationWithGeometry[] };

export type MultiPolygonGeometry = PolygonWithHoles[];

export type PolygonWithHoles = {
  shape: number[]; // shape
  holes: number[][]; // holes
};
