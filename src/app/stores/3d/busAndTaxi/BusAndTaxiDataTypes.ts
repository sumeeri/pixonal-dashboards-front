import { LocationType, LocationWithGeometry } from '../../../../entities/locationPanel/types';
import { ZoneHierarchyId } from '../population/PopulationDataTypes';

export type BusStopData = {
  id: number; // id
  name: string; // value
  geometry: [number, number]; // lng, lat
};

export type BusStopTooltipData = {
  stopName: string;
  shareOfCongestedTrips: number;
};

export type BusWithinParamsData = {
  count: number;
  recurrency: number;
  differenceWithTypical: number;
  busStop: BusStopData;
};

export type BusLocationParamsData = {
  from: ZoneHierarchyId;
  to: ZoneHierarchyId;
  count: number;
  recurrency: number;
  differenceWithTypical: number;
};

export type BusLineUtilizationParamsData = {
  sectionId: number;
  passengers: number;
  count: number;
  loadFactor: number;
};

export type TaxiWithinTripsParamsData = {
  location: string;
  locationType: LocationType;
  peopleCount: number;
  recurrency: number;
  differenceWithTypical: number;
};

export type TaxiWithinTripsZone = {
  peopleCountParamsData: TaxiWithinTripsParamsData;
  location: LocationWithGeometry;
};
