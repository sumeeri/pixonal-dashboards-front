import { action, makeObservable, observable, runInAction } from 'mobx';

import {
  fetchAviationConnectivityParams,
  fetchConnectivityAviationTimeline,
  fetchCountriesGeometry,
} from '../../../../entities/dashboard/services';
import { TimelineData } from '../../../../entities/dashboard/types';
import { LocationWithGeometry } from '../../../../entities/locationPanel/types';
import mapDataValuesStore from '../../mapDataValuesStore';
import { AviationConnectivityDataType, AviationConnectivityParamsData } from '../aviation/AviationDataTypes';
import { ZoneHierarchyId } from '../population/PopulationDataTypes';
import Caching3DStore from './Caching3DStore';
import { getCurrentStartEndDateFetchArgs, LocationAndDateRangeFetchArgs } from './FetchParams';
import { I3DStore } from './I3DStore';

export class AviationConnectivity3DStore
  extends Caching3DStore<
    ZoneHierarchyId,
    AviationConnectivityDataType,
    LocationAndDateRangeFetchArgs,
    AviationConnectivityParamsData
  >
  implements I3DStore
{
  public locationsMap = new Map<string, LocationWithGeometry>();

  public currentTarget = {
    current: new Map<string, AviationConnectivityDataType>(),
    target: new Map<string, AviationConnectivityDataType>(),
  };

  public k: number = 0;

  public timelineData?: TimelineData;

  public get currentLocation(): ZoneHierarchyId {
    return 'United Arab Emirates';
  }

  constructor() {
    super();

    makeObservable(this, {
      locationsMap: observable.shallow,
      currentTarget: observable.shallow,
      k: observable,
      timelineData: observable,
      updateAnimation: action,
    });
  }

  async fetchStaticGeometry(): Promise<void> {
    const locations = await fetchCountriesGeometry();
    if (locations) {
      const locationsMap = new Map<string, LocationWithGeometry>();
      for (const location of locations) {
        locationsMap.set(location.location, location);
      }
      this.locationsMap = locationsMap;
    }
  }

  async fetchParams(currentId: number, targetId: number): Promise<void> {
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

  public async fetchTimeline(): Promise<void> {
    runInAction(() => {
      this.timelineData = undefined;
    });

    const { from, to } = mapDataValuesStore.getLastFinishedQuarter();

    const timelineData = await fetchConnectivityAviationTimeline(from, to);

    runInAction(() => {
      this.timelineData = timelineData;
    });
  }

  updateAnimation(k: number): void {
    this.k = k;
  }

  protected loadParams = fetchAviationConnectivityParams;

  protected async makeMap(
    params: AviationConnectivityParamsData[]
  ): Promise<Map<string, AviationConnectivityDataType>> {
    const map = new Map<string, AviationConnectivityDataType>();
    for (const param of params) {
      try {
        const needLocation = this.locationsMap.get(param.country);
        const zonesObj = {
          id: needLocation!.location,
          geometry: needLocation!.geometry,
          center: needLocation!.center,
          area: needLocation!.area,
        };
        const newParam = {
          ...param,
          location: zonesObj,
        };
        map.set(param.country, newParam);
      } catch {
        console.log(`Error fetching locations:`, param.country);
      }
    }

    return map;
  }

  protected getCurrentFetchArgs = getCurrentStartEndDateFetchArgs;
}

const aviationConnectivity3DStoreInstance = new AviationConnectivity3DStore();
export default aviationConnectivity3DStoreInstance;
