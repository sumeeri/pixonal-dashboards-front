import { action, makeObservable, observable, runInAction } from 'mobx';

import {
  fetchMaritimeFacilitiesParams,
  fetchMaritimeFacilitiesTimeline,
  fetchMaritimeLocations,
} from '../../../../entities/dashboard/services';
import { TimelineData } from '../../../../entities/dashboard/types';
import mapDataValuesStore from '../../mapDataValuesStore';
import {
  MaritimeFacilitiesDataType,
  MaritimeFacilitiesDataWithLocation,
  MaritimeGeometryData,
} from '../maritime/MaritimesTypes';
import Caching3DStore from './Caching3DStore';
import { getCurrentStartEndDateFetchArgs, LocationAndDateRangeFetchArgs } from './FetchParams';
import { I3DStore } from './I3DStore';

export class MaritimeFacilities3DStore
  extends Caching3DStore<
    string,
    MaritimeFacilitiesDataWithLocation,
    LocationAndDateRangeFetchArgs,
    MaritimeFacilitiesDataType
  >
  implements I3DStore
{
  public currentTarget = {
    target: new Map<string, MaritimeFacilitiesDataWithLocation>(),
    current: new Map<string, MaritimeFacilitiesDataWithLocation>(),
  };

  public k: number = 0;

  public locationsMap = new Map<string, MaritimeGeometryData>();

  public currentMoveData?: MaritimeFacilitiesDataType;

  public timelineData?: TimelineData;

  constructor() {
    super();

    makeObservable(this, {
      currentTarget: observable.shallow,
      timelineData: observable,
      k: observable,
      updateAnimation: action,
    });
  }

  async fetchStaticGeometry(): Promise<void> {
    const locations = await fetchMaritimeLocations();
    if (locations) {
      const locationsMap = new Map<string, MaritimeGeometryData>();
      for (const location of locations) {
        locationsMap.set(location.harbourName, location);
      }
      this.locationsMap = locationsMap;
    }
  }

  public async fetchTimeline(): Promise<void> {
    runInAction(() => {
      this.timelineData = undefined;
    });

    const { from, to } = mapDataValuesStore.getLastFinishedQuarter();

    const timelineData = await fetchMaritimeFacilitiesTimeline(from, to);

    runInAction(() => {
      this.timelineData = timelineData;
    });
  }

  public async fetchParams(currentId: number, targetId: number): Promise<void> {
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

  protected getCurrentFetchArgs = getCurrentStartEndDateFetchArgs;

  public updateAnimation(k: number): void {
    this.k = k;
  }

  protected loadParams = fetchMaritimeFacilitiesParams;

  protected async makeMap(
    params: MaritimeFacilitiesDataType[]
  ): Promise<Map<string, MaritimeFacilitiesDataWithLocation>> {
    const map = new Map<string, MaritimeFacilitiesDataWithLocation>();

    for (const param of params) {
      const geometry = this.locationsMap.get(param.harbourName)?.geometry;
      const paramsWithLocation = {
        ...param,
        location: geometry!,
      };
      map.set(param.harbourName, paramsWithLocation);
    }

    return map;
  }
}

const maritimeFacilities3DStoreInstance = new MaritimeFacilities3DStore();
export default maritimeFacilities3DStoreInstance;
