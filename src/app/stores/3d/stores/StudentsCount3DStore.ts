import { action, makeObservable, observable, runInAction } from 'mobx';

import {
  fetchStudentCountParams,
  fetchStudentTripsWithinParams,
  fetchTimelineWithDateAndLocation,
} from '../../../../entities/dashboard/services';
import { Slide, TimelineData } from '../../../../entities/dashboard/types';
import locationPanelStoreInstance from '../../locationPanelStore';
import mapDataValuesStore from '../../mapDataValuesStore';
import timeIntervalsStoreInstance from '../../timeIntervalsStore';
import { StudentCountZone, StudentsdataType } from '../students/StudentsDataTypes';
import Caching3DStore from './Caching3DStore';
import { LocationAndDateRangeFetchArgs, StudentCountFetchArgs } from './FetchParams';
import { I3DStore } from './I3DStore';
import zones3DStoreInstance from './Zones3DStore';

export class StudentsCount3DStore
  extends Caching3DStore<string, StudentCountZone, LocationAndDateRangeFetchArgs, StudentsdataType>
  implements I3DStore
{
  public currentTarget = {
    target: new Map<string, StudentCountZone>(),
    current: new Map<string, StudentCountZone>(),
  };

  public k: number = 0;

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

  public async fetchTimeline(): Promise<void> {
    runInAction(() => {
      this.timelineData = undefined;
    });

    runInAction(() => {
      this.timelineData = undefined;
    });

    const { from, to } = mapDataValuesStore.getLastFinishedQuarter();

    const timelineData = await fetchTimelineWithDateAndLocation({
      startDate: from,
      endDate: to,
      location: locationPanelStoreInstance.currentLocation,
      tripDirection: 'within',
      slide: studentsCount3DStoreInstance.slide,
    });

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

  protected getCurrentFetchArgs = async (): Promise<StudentCountFetchArgs> => {
    const { from, to } = mapDataValuesStore.getLastFinishedQuarter();

    return {
      startDate: from,
      endDate: to,
      location: locationPanelStoreInstance.currentLocation,
      dataType: this.dataType!,
      typicalday: timeIntervalsStoreInstance.typeOfRange,
      horizon: mapDataValuesStore.horizon.id,
    };
  };

  public updateAnimation(k: number): void {
    this.k = k;
  }

  protected loadParams = async (fetchParam: StudentCountFetchArgs, timeSliceIndex: number) => {
    return await ([Slide.STUDENTS_COUNT].includes(this.slide!)
      ? fetchStudentCountParams(fetchParam, timeSliceIndex)
      : fetchStudentTripsWithinParams(fetchParam, timeSliceIndex));
  };

  protected async makeMap(params: StudentsdataType[]): Promise<Map<string, StudentCountZone>> {
    const map = new Map<string, StudentCountZone>();
    for (const param of params) {
      const location = (await zones3DStoreInstance.getLocationWithGeometryByName(param.locationType, param.location))!;
      const studentCountZone: StudentCountZone = {
        countParamsData: param,
        location: { ...location, id: location.location },
      };
      map.set(`${param.locationType}-${param.location}`, studentCountZone);
    }
    return map;
  }
}

const studentsCount3DStoreInstance: StudentsCount3DStore = new StudentsCount3DStore();
export default studentsCount3DStoreInstance;
