import { action, makeObservable, observable, runInAction } from 'mobx';
import { DataType } from 'shared/constants/mapDataParams.ts';
import { Vector3 } from 'three';

import {
  fetchPopulationMovementParams,
  fetchTimelineWithDateAndLocation,
} from '../../../../entities/dashboard/services';
import { TimelineData } from '../../../../entities/dashboard/types';
import { LocationType, LocationWithGeometry } from '../../../../entities/locationPanel/types';
import locationPanelStoreInstance from '../../locationPanelStore';
import mapDataValuesStoreInstance from '../../mapDataValuesStore';
import timeIntervalsStoreInstance from '../../timeIntervalsStore';
import IArcInfoPopupState from '../population/IArcInfoPopupState';
import { PopulationMoveParamsData, PopulationMoveZone, PopulationZoneId } from '../population/PopulationDataTypes';
import Caching3DStore, { PropsGetCurrentFetchArgs } from './Caching3DStore';
import { LocationAndDateRangeFetchArgs, PeopleMovementFetchArgs, TripDirection } from './FetchParams';
import { I3DStore } from './I3DStore';
import zones3DStoreInstance from './Zones3DStore';

export class PopulationMovementWithin3DStore
  extends Caching3DStore<string, PopulationMoveZone, LocationAndDateRangeFetchArgs, PopulationMoveParamsData>
  implements I3DStore
{
  public currentTarget = {
    target: new Map<string, PopulationMoveZone>(),
    current: new Map<string, PopulationMoveZone>(),
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

  public timelineData?: TimelineData;

  constructor() {
    super();

    makeObservable(this, {
      currentTarget: observable.shallow,
      arcPopupState: observable,
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

    const { from, to } = mapDataValuesStoreInstance.getLastFinishedQuarter();

    const timelineData = await fetchTimelineWithDateAndLocation({
      startDate: from,
      endDate: to,
      location: locationPanelStoreInstance.currentLocation,
      tripDirection: 'within',
      slide: populationMovementWithin3DStoreInstance.slide,
    });

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
        current: current,
        target: target,
      };

      this.k = 0;
    });
  }

  protected getCurrentFetchArgs = async (_props?: PropsGetCurrentFetchArgs): Promise<PeopleMovementFetchArgs> => {
    let tripDirection: TripDirection;
    if (this.slide?.includes('inbound')) {
      tripDirection = 'inbound';
    } else if (this.slide?.includes('outbound')) {
      tripDirection = 'outbound';
    } else {
      tripDirection = 'within';
    }

    const { from, to } = mapDataValuesStoreInstance.getLastFinishedQuarter();

    return {
      location: locationPanelStoreInstance.currentLocation,
      startDate: from,
      endDate: to,
      tripDirection: tripDirection,
      withinType: this.dataType == DataType.ORIGIN ? 'origins' : 'destination',
      typicalday: timeIntervalsStoreInstance.typeOfRange,
    };
  };

  public updateAnimation(k: number): void {
    this.k = k;
  }

  protected loadParams = fetchPopulationMovementParams;

  protected async makeMap(params: PopulationMoveParamsData[]): Promise<Map<string, PopulationMoveZone>> {
    const map = new Map<string, PopulationMoveZone>();

    for (const param of params) {
      const movementZone = this.movementZonesMap.get(param.from);

      if (movementZone) {
        const populationMoveZone: PopulationMoveZone = {
          peopleMoveParamsData: param,
          location: movementZone,
        };
        map.set(`${param.from}`, populationMoveZone);
      }
    }
    return map;
  }
}

const populationMovementWithin3DStoreInstance: PopulationMovementWithin3DStore = new PopulationMovementWithin3DStore();
export default populationMovementWithin3DStoreInstance;
