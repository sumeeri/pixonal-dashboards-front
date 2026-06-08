import { action, makeObservable, observable, runInAction } from 'mobx';
import { Vector3 } from 'three';

import { fetchPopulationCountParams, fetchTimelineWithDateAndLocation } from '../../../../entities/dashboard/services';
import { TimelineData } from '../../../../entities/dashboard/types';
import { LocationType, LocationWithGeometry } from '../../../../entities/locationPanel/types';
import locationPanelStoreInstance from '../../locationPanelStore';
import mapDataValuesStore from '../../mapDataValuesStore';
import timeIntervalsStoreInstance from '../../timeIntervalsStore';
import IArcInfoPopupState from '../population/IArcInfoPopupState';
import { PopulationZoneId } from '../population/PopulationDataTypes';
import {
  IPeopleCountParamsData,
  IPeopleCountTimelineData,
  PopulationCountZone,
} from '../populationCount/PopulationCountTypes';
import Caching3DStore, { PropsGetCurrentFetchArgs } from './Caching3DStore';
import { LocationAndDateRangeFetchArgs } from './FetchParams';
import { I3DStore } from './I3DStore';
import zones3DStoreInstance from './Zones3DStore';

export class PopulationCount3DStore
  extends Caching3DStore<string, PopulationCountZone, LocationAndDateRangeFetchArgs, IPeopleCountParamsData>
  implements I3DStore
{
  public currentTarget = {
    target: new Map<string, PopulationCountZone>(),
    current: new Map<string, PopulationCountZone>(),
  };

  public movementZonesMap = new Map<PopulationZoneId, LocationWithGeometry>();

  public k: number = 0;

  public arcPopupState: IArcInfoPopupState = {
    isSelected: false,
    x: 0,
    y: 0,
    worldPosition: new Vector3(),
    msg: 'msg',
  };

  // public zones?: PopulationZoneData[];

  private rawTimelineData?: IPeopleCountTimelineData[];
  public timelineData?: TimelineData;

  constructor() {
    super();

    makeObservable(this, {
      currentTarget: observable.shallow,
      arcPopupState: observable,
      // zones: observable.shallow,
      timelineData: observable,
      k: observable,
      updateAnimation: action,
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
      slide: this.slide,
    });

    const densityValues = timelineData.values.map((value) => [
      value[0] / locationPanelStoreInstance.currentLocation.area,
    ]);

    timelineData.values = densityValues;

    runInAction(() => {
      this.timelineData = timelineData;
    });
  }

  getLocationType(currentLocation: LocationType) {
    switch (currentLocation) {
      case LocationType.REGION:
        return LocationType.DISTRICT;

      case LocationType.EMIRATE:
      default:
        return LocationType.REGION;
    }
  }

  async fetchStaticGeometry(): Promise<void> {
    let currentLocationType = locationPanelStoreInstance.currentLocationType;

    const locationTypeWithZone = [LocationType.DISTRICT, LocationType.ZONE, LocationType.SPECIAL_DISTRICT];

    if (locationTypeWithZone.includes(currentLocationType)) {
      currentLocationType = LocationType.ZONE;
    }

    if (currentLocationType === LocationType.REGION) {
      currentLocationType = LocationType.DISTRICT;
    }

    if (currentLocationType === LocationType.EMIRATE) {
      currentLocationType = LocationType.REGION;
    }

    const movementZones = (await zones3DStoreInstance.getLocations(currentLocationType))!;

    this.movementZonesMap = new Map();
    for (const zone of movementZones) {
      this.movementZonesMap.set(zone.location, zone);
    }
  }

  public async fetchParams(currentId: number, targetId: number): Promise<void> {
    // The second argument here is ignored, as we query startDate and endDate to get the data
    const current = await this.loadParamsCached(
      await this.getCurrentFetchArgs({ timeSliceIndex: currentId }),
      currentId
    );
    // Same
    const target = await this.loadParamsCached(await this.getCurrentFetchArgs({ timeSliceIndex: targetId }), targetId);

    runInAction(() => {
      this.currentTarget = {
        current,
        target,
      };

      this.k = 0;
    });
  }

  protected async getCurrentFetchArgs(_props?: PropsGetCurrentFetchArgs) {
    const { from, to } = mapDataValuesStore.getLastFinishedQuarter();

    return {
      startDate: from,
      endDate: to,
      location: locationPanelStoreInstance.currentLocation,
      typicalday: timeIntervalsStoreInstance.typeOfRange,
    };
  }

  public updateAnimation(k: number): void {
    this.k = k;
  }

  protected loadParams = fetchPopulationCountParams;

  protected async makeMap(params: IPeopleCountParamsData[]): Promise<Map<string, PopulationCountZone>> {
    const map = new Map<string, PopulationCountZone>();

    for (const param of params) {
      const zone = this.movementZonesMap.get(param.location)!;

      if (zone) {
        const zonesObj = {
          id: param.location,
          geometry: zone.geometry,
          center: zone.center,
          area: zone.area,
        };
        const populationCountZone: PopulationCountZone = {
          peopleCountParamsData: param,
          location: zonesObj,
        };
        map.set(`${param.locationType}-${param.location}`, populationCountZone);
      }
    }
    return map;
  }
}

const populationCount3DStoreInstance: PopulationCount3DStore = new PopulationCount3DStore();
export default populationCount3DStoreInstance;
