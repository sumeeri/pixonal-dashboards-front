import { LocationType } from '../../../../entities/locationPanel/types';
import { PopulationZoneData } from '../population/PopulationDataTypes';

export type StudentsdataType = {
  location: string;
  locationType: LocationType;
  count: number;
};

export type StudentCountZone = {
  countParamsData: StudentsdataType;
  location: PopulationZoneData;
};
