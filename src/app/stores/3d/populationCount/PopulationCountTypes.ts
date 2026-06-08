import { LocationType } from '../../../../entities/locationPanel/types';
import { PopulationZoneData } from '../population/PopulationDataTypes';

export interface IPeopleCountTimelineData {
  startDate: string;
  endDate: string;
  peopleCount: number;
}

export interface IPeopleCountParamsData {
  location: string;
  locationType: LocationType;
  peopleCount: number;
  recurrency: number;
  differenceWithTypical: number;
}

export type PopulationCountZone = {
  peopleCountParamsData: IPeopleCountParamsData;
  location: PopulationZoneData;
};
