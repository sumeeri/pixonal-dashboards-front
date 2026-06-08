import { action, makeObservable, observable, runInAction } from 'mobx';

import { fetchAccidentsParams, fetchTimelineWithDateAndLocation } from '../../../../entities/dashboard/services.ts';
import { TimelineData } from '../../../../entities/dashboard/types.ts';
import locationPanelStoreInstance from '../../locationPanelStore.ts';
import mapDataValuesStore from '../../mapDataValuesStore.ts';
import { AccidentData, AccidentId } from '../accidents/AccidentsDataTypes.ts';
import Caching3DStore from './Caching3DStore.ts';
import { getCurrentStartEndDateFetchArgs, LocationAndDateFetchArgs } from './FetchParams.ts';
import { I3DStore } from './I3DStore.ts';

export class Accidents3DStore
  extends Caching3DStore<AccidentId, AccidentData, LocationAndDateFetchArgs>
  implements I3DStore
{
  public current = new Map<AccidentId, AccidentData>();

  public k: number = 0;
  public timelineData?: TimelineData;

  constructor() {
    super();

    makeObservable(this, {
      current: observable.shallow,
      k: observable,
      timelineData: observable,
      updateAnimation: action,
    });
  }

  protected loadParams = fetchAccidentsParams;

  protected getCurrentFetchArgs = getCurrentStartEndDateFetchArgs;

  protected async makeMap(params: AccidentData[]): Promise<Map<number, AccidentData>> {
    const map = new Map<AccidentId, AccidentData>();
    for (const element of params) {
      // WORKAROUND: AccidentData getters only work if object is created with new keyword
      map.set(
        Math.trunc(Math.random() * Number.MAX_SAFE_INTEGER),
        new AccidentData(
          element.point,
          element.injuries,
          element.injuryLevel,
          element.affectedPeopleCount,
          element.accidentId
        )
      );
    }
    return map;
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
      slide: accidents3DStoreInstance.slide,
    });
    runInAction(() => {
      this.timelineData = timelineData;
    });
  }

  public async fetchParams(currentId: number, _targetId: number): Promise<void> {
    const current = await this.loadParamsCached(await this.getCurrentFetchArgs(), currentId);

    runInAction(() => {
      this.current = current;
      this.k = 0;
    });
  }

  public updateAnimation(k: number): void {
    this.k = k;
  }
}

const accidents3DStoreInstance: Accidents3DStore = new Accidents3DStore();
export default accidents3DStoreInstance;
