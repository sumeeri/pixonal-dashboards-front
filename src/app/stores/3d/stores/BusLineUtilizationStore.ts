import { makeObservable, observable, runInAction } from 'mobx';
import { DataType } from 'shared/constants/mapDataParams.ts';

import {
  fetchBusLineUtilizationParams,
  fetchBusUtilizationTimeline,
  fetchCongestionGeometry,
} from '../../../../entities/dashboard/services';
import { TimelineData } from '../../../../entities/dashboard/types';
import { LocationType } from '../../../../entities/locationPanel/types';
import locationPanelStoreInstance from '../../locationPanelStore';
import mapDataValuesStore from '../../mapDataValuesStore';
import timeIntervalsStoreInstance from '../../timeIntervalsStore';
import { BusLineUtilizationParamsData } from '../busAndTaxi/BusAndTaxiDataTypes';
import { IFenceGeometryData } from '../congestion/data/IFenceGeometryData';
import map3d from '../Map3d';
import Caching3DStore from './Caching3DStore';
import { getBoundsForFenceItems } from './Congestion3DStore';
import {
  BusLineUtilizationFetchArgs,
  getCurrentStartEndDateFetchArgs,
  LocationAndDateRangeFetchArgs,
} from './FetchParams';
import { I3DStore } from './I3DStore';

export class BusLineUtilizationStore
  extends Caching3DStore<number, BusLineUtilizationParamsData, LocationAndDateRangeFetchArgs>
  implements I3DStore
{
  public fenceData?: IFenceGeometryData;
  public currentTarget = {
    current: new Map<number, BusLineUtilizationParamsData>(),
    target: new Map<number, BusLineUtilizationParamsData>(),
  };

  public k: number = 0;

  public timelineData?: TimelineData;

  constructor() {
    super();

    makeObservable(this, {
      fenceData: observable.shallow,
      currentTarget: observable.shallow,
      timelineData: observable,
      k: observable,
    });
  }

  public async fetchStaticGeometry(): Promise<void> {
    const sections = await fetchCongestionGeometry({ location: locationPanelStoreInstance.currentLocation });

    if (locationPanelStoreInstance.currentLocation.locationType === LocationType.CORRIDOR) {
      sections.fenceList.length && map3d.fitToBbox(getBoundsForFenceItems(sections.fenceList.slice(0, 10)));
    }

    runInAction(() => {
      this.fenceData = sections;
    });
  }

  public async fetchParams(currentId: number, targetId: number): Promise<void> {
    const current = await this.loadParamsCached(await this.getCurrentFetchArgs(), currentId);

    const target = await this.loadParamsCached(await this.getCurrentFetchArgs(), targetId);

    runInAction(() => {
      this.currentTarget = { current, target };

      this.k = 0;
    });
  }

  public updateAnimation(k: number): void {
    this.k = k;
  }

  protected loadParams = fetchBusLineUtilizationParams;

  public async fetchTimeline(): Promise<void> {
    runInAction(() => {
      this.timelineData = undefined;
    });
    const timelineData = await fetchBusUtilizationTimeline(await getCurrentStartEndDateFetchArgs());

    runInAction(() => {
      this.timelineData = timelineData;
    });
  }

  protected async getCurrentFetchArgs(): Promise<BusLineUtilizationFetchArgs> {
    const { from, to } = mapDataValuesStore.getLastFinishedQuarter();

    return {
      startDate: from,
      endDate: to,
      location: locationPanelStoreInstance.currentLocation,
      typicalday: timeIntervalsStoreInstance.typeOfRange,
      direction: (() => {
        switch (this.dataType) {
          case DataType.TRANSIT_LINES_BOTH_DIRECTIONS:
            return 'both';
          case DataType.TRANSIT_LINES_DIRECTION_1:
            return 'first';
          case DataType.TRANSIT_LINES_DIRECTION_2:
            return 'second';
          default:
            throw new Error(`no match for ${this.dataType}`);
        }
      })(),
    };
  }

  protected async makeMap(params: BusLineUtilizationParamsData[]): Promise<Map<number, BusLineUtilizationParamsData>> {
    const map = new Map<number, BusLineUtilizationParamsData>();
    for (const param of params) {
      const { sectionId } = param;
      map.set(sectionId, param);
    }
    return map;
  }
}

const busLineUtilizationStoreInstance: BusLineUtilizationStore = new BusLineUtilizationStore();
export default busLineUtilizationStoreInstance;
