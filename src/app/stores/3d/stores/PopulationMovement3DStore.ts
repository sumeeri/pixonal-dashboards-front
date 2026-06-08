import { action, makeObservable, observable, runInAction } from 'mobx';
import { DataType } from 'shared/constants/mapDataParams.ts';

import {
  fetchPopulationMovementParams,
  fetchTimelineWithDateAndLocation,
  fetchTripsParams,
} from '../../../../entities/dashboard/services';
import { Slide, TimelineData } from '../../../../entities/dashboard/types';
import { LocationType, LocationWithGeometry } from '../../../../entities/locationPanel/types';
import locationPanelStoreInstance from '../../locationPanelStore';
import mapDataValuesStore from '../../mapDataValuesStore';
import timeIntervalsStoreInstance from '../../timeIntervalsStore';
import { PopulationMoveParamsData, ZoneHierarchyId } from '../population/PopulationDataTypes';
import Caching3DStore, { PropsGetCurrentFetchArgs } from './Caching3DStore';
import { PeopleMovementFetchArgs, TripDirection } from './FetchParams';
import { I3DStore } from './I3DStore';
import zones3DStoreInstance from './Zones3DStore';

export class MapOfPopulationMoves extends Map<ZoneHierarchyId, Map<ZoneHierarchyId, PopulationMoveParamsData>> {}

export class PopulationMovement3DStore
  extends Caching3DStore<
    ZoneHierarchyId,
    Map<ZoneHierarchyId, PopulationMoveParamsData>,
    PeopleMovementFetchArgs,
    PopulationMoveParamsData
  >
  implements I3DStore
{
  public locationsMap = new Map<string, LocationWithGeometry>();

  public currentTarget: {
    current: MapOfPopulationMoves;
    target: MapOfPopulationMoves;
  } = {
    current: new MapOfPopulationMoves(),
    target: new MapOfPopulationMoves(),
  };

  public k: number = 0;
  public timelineData?: TimelineData;

  public currentMoveData?: PopulationMoveParamsData;

  public get currentLocation(): ZoneHierarchyId | undefined {
    const currentLocation = locationPanelStoreInstance.currentLocation;
    if (
      currentLocation.locationType === LocationType.DISTRICT ||
      currentLocation.locationType === LocationType.SPECIAL_DISTRICT
    ) {
      return currentLocation.location;
    } else {
      return undefined;
    }
  }

  constructor() {
    super();

    makeObservable(this, {
      locationsMap: observable,
      currentTarget: observable.shallow,
      k: observable,
      currentMoveData: observable,
      updateAnimation: action,
      timelineData: observable,
    });
  }

  async fetchStaticGeometry(): Promise<void> {
    const currentLocationType = locationPanelStoreInstance.currentLocationType;

    const movementZones = (await zones3DStoreInstance.getLocations(currentLocationType))!;

    this.locationsMap = new Map();
    for (const zone of movementZones) {
      this.locationsMap.set(zone.location, zone);
    }
  }

  public async fetchTimeline(): Promise<void> {
    let tripDirection: TripDirection = '';

    switch (this.slide) {
      case Slide.POPULATION_MOVEMENT_INBOUND:
      case Slide.STUDENTS_TRIPS_INBOUND:
        tripDirection = 'inbound';
        break;
      case Slide.POPULATION_MOVEMENT_OUTBOUND:
      case Slide.STUDENTS_TRIPS_OUTBOUND:
        tripDirection = 'outbound';
        break;
      case Slide.MOBILITY_TRIPS_INBOUND:
      case Slide.MOBILITY_TRIPS_OUTBOUND:
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
      tripDirection: tripDirection,
      slide: populationMovement3DStoreInstance.slide,
    });
    runInAction(() => {
      this.timelineData = timelineData;
    });
  }

  protected loadParams = async (fetchParam: PeopleMovementFetchArgs, timeSliceIndex: number) => {
    return await ([Slide.MOBILITY_TRIPS_INBOUND, Slide.MOBILITY_TRIPS_OUTBOUND].includes(this.slide!)
      ? fetchTripsParams(fetchParam)
      : fetchPopulationMovementParams(fetchParam, timeSliceIndex));
  };

  protected getCurrentFetchArgs = async (props?: PropsGetCurrentFetchArgs): Promise<PeopleMovementFetchArgs> => {
    let tripDirection: TripDirection;
    if (props?.overrideTripDirection) {
      tripDirection = props.overrideTripDirection;
    } else if (this.slide?.includes('inbound')) {
      tripDirection = 'inbound';
    } else if (this.slide?.includes('outbound')) {
      tripDirection = 'outbound';
    } else {
      tripDirection = 'within';
    }

    const { from, to } = mapDataValuesStore.getLastFinishedQuarter();

    return {
      location: locationPanelStoreInstance.currentLocation,
      startDate: from,
      endDate: to,
      tripDirection: tripDirection,
      withinType: this.dataType == DataType.ORIGIN ? 'origins' : 'destination',
      slide: this.slide as Slide,
      horizon: mapDataValuesStore.horizon.id,
      typicalday: timeIntervalsStoreInstance.typeOfRange,
    };
  };

  protected async makeMap(params: PopulationMoveParamsData[]): Promise<MapOfPopulationMoves> {
    const map = new MapOfPopulationMoves();

    for (const param of params) {
      const { from, to } = param;

      const item = map.get(from);
      if (item) item.set(to, param);
      else map.set(from, new Map<ZoneHierarchyId, PopulationMoveParamsData>([[to, param]]));
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

  public refreshMovesGraphics() {
    const temp = this.currentTarget;
    runInAction(() => {
      this.currentTarget = {
        current: new MapOfPopulationMoves(),
        target: new MapOfPopulationMoves(),
      };
    });
    runInAction(() => {
      this.currentTarget = temp;
    });
  }
}

const populationMovement3DStoreInstance: PopulationMovement3DStore = new PopulationMovement3DStore();
export default populationMovement3DStoreInstance;
