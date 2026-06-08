import { action, makeObservable, observable, runInAction } from 'mobx';

import {
  fetchJunctions,
  fetchJunctionsParams,
  fetchTimelineWithDateAndLocation,
} from '../../../../entities/dashboard/services.ts';
import { TimelineData } from '../../../../entities/dashboard/types.ts';
import locationPanelStoreInstance from '../../locationPanelStore.ts';
import mapDataValuesStore from '../../mapDataValuesStore.ts';
import { JunctionData, JunctionId, JunctionParamsData } from '../failingJunctions/JunctionDataTypes.ts';
import Caching3DStore from './Caching3DStore.ts';
import { getCurrentBasicFetchArgs, LocationAndDateRangeFetchArgs } from './FetchParams.ts';
import { I3DStore } from './I3DStore.ts';

export class Junctions3DStore
  extends Caching3DStore<JunctionId, JunctionParamsData, LocationAndDateRangeFetchArgs>
  implements I3DStore
{
  public junctionsData?: JunctionData[];
  public currentTarget: { current: Map<JunctionId, JunctionParamsData>; target: Map<JunctionId, JunctionParamsData> } =
    { current: new Map<JunctionId, JunctionParamsData>(), target: new Map<JunctionId, JunctionParamsData>() };

  public k: number = 0;
  public timelineData?: TimelineData;

  constructor() {
    super();

    makeObservable(this, {
      junctionsData: observable.shallow,
      currentTarget: observable.shallow,
      timelineData: observable,
      k: observable,
      updateAnimation: action,
    });
  }

  public async fetchStaticGeometry(): Promise<void> {
    const data = await fetchJunctions({ location: locationPanelStoreInstance.currentLocation });

    runInAction(() => {
      this.junctionsData = data;
    });
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
      slide: junctions3DStoreInstance.slide,
    });
    runInAction(() => {
      this.timelineData = timelineData;
    });
  }

  protected loadParams = fetchJunctionsParams;

  protected getCurrentFetchArgs = getCurrentBasicFetchArgs;

  protected async makeMap(params: JunctionParamsData[]): Promise<Map<string, JunctionParamsData>> {
    const map = new Map<JunctionId, JunctionParamsData>();
    for (const param of params) {
      map.set(param.id, param);
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

  public refreshGraphics(): void {
    const temp = this.currentTarget;
    runInAction(() => {
      this.currentTarget = {
        current: new Map<JunctionId, JunctionParamsData>(),
        target: new Map<JunctionId, JunctionParamsData>(),
      };
    });
    runInAction(() => {
      this.currentTarget = temp;
    });
  }
}

const junctions3DStoreInstance: Junctions3DStore = new Junctions3DStore();
export default junctions3DStoreInstance;
