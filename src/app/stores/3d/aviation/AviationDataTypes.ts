import { PopulationZoneData } from '../population/PopulationDataTypes';

export type AviationTransferDataType = {
  country: string;
  count: number;
  loadFactor: number;
};

export type AviationConnectivityDataType = AviationConnectivityParamsData & {
  location: PopulationZoneData;
};

export type AviationConnectivityParamsData = {
  country: string;
  count: number;
};
