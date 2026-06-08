import { makeObservable, observable, runInAction } from 'mobx';
import { DataType } from 'shared/constants/mapDataParams.ts';

import { typesOfBusStops } from '../../../../entities/dashboard/config';
import { fetchTimelineWithDateAndLocation, fetchWithinBusTripsParams } from '../../../../entities/dashboard/services';
import { Slide, TimelineData } from '../../../../entities/dashboard/types';
import locationPanelStoreInstance from '../../locationPanelStore';
import mapDataValuesStore from '../../mapDataValuesStore';
import timeIntervalsStoreInstance from '../../timeIntervalsStore';
import { BusWithinParamsData } from '../busAndTaxi/BusAndTaxiDataTypes';
import Caching3DStore from './Caching3DStore';
import { BusStopsFetchArgs, BusStopsType, LocationAndDateFetchArgs } from './FetchParams';
import { I3DStore } from './I3DStore';

export class BusStops3DStore
  extends Caching3DStore<number, BusWithinParamsData, LocationAndDateFetchArgs>
  implements I3DStore
{
  public currentTarget = {
    target: new Map<number, BusWithinParamsData>(),
    current: new Map<number, BusWithinParamsData>(),
  };

  public timelineData?: TimelineData;

  public k: number = 0;

  constructor() {
    super();

    makeObservable(this, {
      currentTarget: observable.shallow,
      timelineData: observable,
    });
  }

  public async fetchTimeline(): Promise<void> {
    if (this.slide !== Slide.BUS_TRIPS_WITHIN) {
      return;
    }

    runInAction(() => {
      this.timelineData = undefined;
    });

    const { from, to } = mapDataValuesStore.getLastFinishedQuarter();

    const timelineData = await fetchTimelineWithDateAndLocation({
      startDate: from,
      endDate: to,
      location: locationPanelStoreInstance.currentLocation,
      tripDirection: 'within',
      slide: this.slide,
    });

    runInAction(() => {
      this.timelineData = timelineData;
    });
  }

  public async fetchParams(currentId: number, targetId: number): Promise<void> {
    if (typesOfBusStops.includes(mapDataValuesStore.dataType!)) {
      const current = await this.loadParamsCached(await this.getCurrentFetchArgs(), currentId);

      const target = await this.loadParamsCached(await this.getCurrentFetchArgs(), targetId);

      runInAction(() => {
        this.currentTarget = {
          current,
          target,
        };

        this.k = 0;
      });
    }
  }

  public updateAnimation(k: number): void {
    this.k = k;
  }

  public startPreloadData(startIndex: number, length: number) {
    // Only preload data if the current dataType is one of the bus stops types
    if (typesOfBusStops.includes(mapDataValuesStore.dataType!)) {
      super.startPreloadData(startIndex, length);
    }
  }

  protected loadParams = fetchWithinBusTripsParams;

  protected async getCurrentFetchArgs(): Promise<BusStopsFetchArgs> {
    let type: BusStopsType;
    switch (this.dataType) {
      case DataType.BOARDING_BUS_STOPS:
        type = 'boarding';
        break;
      case DataType.ALIGHTINGS_BUS_STOPS:
        type = 'alightings';
        break;
      case DataType.TRANSFERS_BUS_STOPS:
        type = 'transfers';
        break;
      case DataType.END_TO_END_TRIPS_BUS_STOPS:
        type = 'endtoend';
        break;
      case DataType.BUS_STOPS:
        type = '';
        break;
      default:
        throw new Error('unknown dataType ' + this.dataType);
    }

    const { from, to } = mapDataValuesStore.getLastFinishedQuarter();

    return {
      startDate: from,
      endDate: to,
      location: locationPanelStoreInstance.currentLocation,
      type,
      slide: this.slide,
      typicalday: timeIntervalsStoreInstance.typeOfRange,
    };
  }

  protected async makeMap(params: BusWithinParamsData[]): Promise<Map<number, BusWithinParamsData>> {
    const map = new Map<number, BusWithinParamsData>();
    for (const param of params) {
      const { busStop } = param;
      map.set(busStop.id, param);
    }
    return map;
  }
}

const busStops3DStoreInstance: BusStops3DStore = new BusStops3DStore();
export default busStops3DStoreInstance;
