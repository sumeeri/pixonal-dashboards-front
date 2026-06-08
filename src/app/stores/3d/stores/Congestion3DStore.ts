import { LngLatBoundsLike } from 'mapbox-gl';
import { action, makeObservable, observable, runInAction } from 'mobx';

import { typesOfMostUsed } from '../../../../entities/dashboard/config.ts';
import {
  fetchCongestionGeometry,
  fetchCongestionMostUsedParams,
  fetchCongestionParams,
  fetchTimelineWithDateAndLocation,
} from '../../../../entities/dashboard/services.ts';
import { TimelineData } from '../../../../entities/dashboard/types.ts';
import { LocationType } from '../../../../entities/locationPanel/types.ts';
import locationPanelStoreInstance from '../../locationPanelStore.ts';
import mapDataValuesStore from '../../mapDataValuesStore.ts';
import timeIntervalsStoreInstance from '../../timeIntervalsStore.ts';
import { CongestionFenceData, CongestionParamsData, FenceId } from '../congestion/data/CongestionDataTypes.ts';
import { IFenceGeometryData } from '../congestion/data/IFenceGeometryData.ts';
import map3d from '../Map3d.ts';
import Caching3DStore from './Caching3DStore.ts';
import { RoadTrafficFetchArgs } from './FetchParams.ts';
import { I3DStore } from './I3DStore.ts';

export const getBoundsForFenceItems = (items: CongestionFenceData[]): LngLatBoundsLike => {
  return items.reduce(
    (res: [number, number, number, number], currentItem) => {
      for (let i = 0; i < currentItem.geometry.length; i += 2) {
        res[0] = res[0] ? Math.min(res[0], res[2], currentItem.geometry[i]) : currentItem.geometry[i];
        res[1] = res[1] ? Math.min(res[1], res[3], currentItem.geometry[i + 1]) : currentItem.geometry[i + 1];
        res[2] = res[2] ? Math.max(res[0], res[2], currentItem.geometry[i]) : currentItem.geometry[i];
        res[3] = res[3] ? Math.max(res[1], res[3], currentItem.geometry[i + 1]) : currentItem.geometry[i + 1];
      }

      return res;
    },
    [0, 0, 0, 0]
  );
};

export class Congestion3DStore
  extends Caching3DStore<FenceId, CongestionParamsData, RoadTrafficFetchArgs>
  implements I3DStore
{
  public fenceData?: IFenceGeometryData;
  public currentTarget = {
    target: new Map<FenceId, CongestionParamsData>(),
    current: new Map<FenceId, CongestionParamsData>(),
  };
  public k: number = 0;

  public timelineData?: TimelineData;

  constructor() {
    super();

    makeObservable(this, {
      fenceData: observable.shallow,
      currentTarget: observable.shallow,
      k: observable,
      timelineData: observable,
      updateAnimation: action,
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

  protected loadParams = async (fetchParam: RoadTrafficFetchArgs, timeSliceIndex: number) => {
    return await (typesOfMostUsed.includes(this.dataType!)
      ? fetchCongestionMostUsedParams(fetchParam)
      : fetchCongestionParams(fetchParam, timeSliceIndex));
  };

  protected getCurrentFetchArgs = async (): Promise<RoadTrafficFetchArgs> => {
    const { from, to } = mapDataValuesStore.getLastFinishedQuarter();

    return {
      startDate: from,
      endDate: to,
      location: locationPanelStoreInstance.currentLocation,
      dataType: this.dataType!,
      typicalday: timeIntervalsStoreInstance.typeOfRange,
    };
  };

  protected async makeMap(params: CongestionParamsData[]): Promise<Map<number, CongestionParamsData>> {
    const map = new Map<FenceId, CongestionParamsData>();
    for (const param of params) {
      map.set(param.sensorId, param);
    }
    return map;
  }

  public async fetchParams(currentId: number, targetId: number): Promise<void> {
    const current = await this.loadParamsCached(await this.getCurrentFetchArgs(), currentId);
    const target = await this.loadParamsCached(await this.getCurrentFetchArgs(), targetId);

    runInAction(() => {
      this.currentTarget = {
        current: current,
        target: target,
      };

      this.k = 0;
    });
  }

  public updateAnimation(k: number): void {
    this.k = k;
  }

  public async fetchTimeline(): Promise<void> {
    runInAction(() => {
      this.timelineData = undefined;
    });

    const { from, to } = mapDataValuesStore.getLastFinishedQuarter();

    const timelineData = await fetchTimelineWithDateAndLocation({
      startDate: from,
      endDate: to,
      location: locationPanelStoreInstance.currentLocation,
      slide: congestion3DStoreInstance.slide,
    });
    runInAction(() => {
      this.timelineData = timelineData;
    });
  }
}

const congestion3DStoreInstance: Congestion3DStore = new Congestion3DStore();
export default congestion3DStoreInstance;
