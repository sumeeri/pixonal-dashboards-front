import { DataType } from 'shared/constants/mapDataParams.ts';

import { Slide, TimelineAggregation } from '../../../../entities/dashboard/types';
import { ILocation } from '../../../../entities/locationPanel/types';
import locationPanelStoreInstance from '../../locationPanelStore';
import mapDataValuesStore from '../../mapDataValuesStore';
import timeIntervalsStoreInstance from '../../timeIntervalsStore';
import { ConsumptionGood, Consumptor } from '../landUse/LandUseDataTypes';

export type TripDirection = 'inbound' | 'outbound' | 'within' | '';
export type WithinTripType = 'destination' | 'origins';
export type BusStopsType = 'endtoend' | 'boarding' | 'alightings' | 'transfers' | '';
export type BusLineDirection = 'both' | 'first' | 'second';

export type LocationFetchArgs = { location: ILocation };
export type LocationAndDateFetchArgs = LocationFetchArgs & { startDate: Date };
export type LocationAndDateRangeFetchArgs = LocationAndDateFetchArgs & { endDate: Date };
export type LocationAndDateRangeWithRangeTypeFetchArgs = LocationAndDateRangeFetchArgs & {
  typicalday?: TimelineAggregation;
};
export type LocationAndDateRangeWithHorizonFetchArgs = LocationAndDateRangeWithRangeTypeFetchArgs & {
  horizon?: number;
};

export type RoadTrafficFetchArgs = LocationAndDateRangeWithRangeTypeFetchArgs & {
  dataType: DataType;
};
export type AviationTransferFetchArgs = LocationAndDateRangeWithRangeTypeFetchArgs & {
  dataType: DataType;
  tripDirection: TripDirection;
};
export type StudentCountFetchArgs = LocationAndDateRangeWithRangeTypeFetchArgs & {
  dataType: DataType;
  horizon: number;
};
export type PeopleMovementFetchArgs = LocationAndDateRangeWithHorizonFetchArgs & {
  tripDirection?: TripDirection;
  withinType?: WithinTripType;
  slide?: Slide;
};
export type BusLineUtilizationFetchArgs = LocationAndDateRangeWithRangeTypeFetchArgs & { direction?: BusLineDirection };
export type BusStopsFetchArgs = LocationAndDateRangeWithRangeTypeFetchArgs & { type?: BusStopsType; slide?: Slide };
export type ConsumptionFetchArgs = LocationAndDateRangeFetchArgs & {
  consumptionGood: ConsumptionGood;
  consumptor: Consumptor;
};

export function ConsumptorToResedentialOrCommercial(consumptor: Consumptor): Consumptor {
  switch (consumptor) {
    case Consumptor.Residential:
    case Consumptor.Apartment:
    case Consumptor.Villa:
      return Consumptor.Residential;
    case Consumptor.Commercial:
    case Consumptor.Office:
    case Consumptor.Shop:
      return Consumptor.Commercial;
    case Consumptor.Utilization:
      return Consumptor.Utilization;
  }
}

export type LandUseFetchArgs = LocationAndDateFetchArgs & { slide: Slide };
export type LandUseTooltipArgs = LandUseFetchArgs & { id: number };
export type LandUseKpiFetchArgs = LocationAndDateRangeFetchArgs & { slide: Slide; horizon?: number };
export type LandUseFetchArgsWithHorizon = LocationFetchArgs & { slide: Slide; horizon?: number };

export type BusLineUtilizationTooltipArgs = {
  id: number;
  startDate: Date;
  endDate: Date;
};

export type CongestionTooltipArgs = LocationAndDateRangeFetchArgs & { id: number };

export async function getCurrentBasicFetchArgs(): Promise<LocationAndDateRangeWithRangeTypeFetchArgs> {
  const { from, to } = mapDataValuesStore.getLastFinishedQuarter();

  return {
    startDate: from,
    endDate: to,
    location: locationPanelStoreInstance.currentLocation,
    typicalday: timeIntervalsStoreInstance.typeOfRange,
  };
}

export async function getCurrentStartEndDateFetchArgs(): Promise<LocationAndDateRangeFetchArgs> {
  const { from, to } = mapDataValuesStore.getLastFinishedQuarter();

  return {
    startDate: from,
    endDate: to,
    location: locationPanelStoreInstance.currentLocation,
  };
}
