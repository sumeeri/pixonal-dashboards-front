import { action, makeObservable, observable, runInAction } from 'mobx';
import { DataType } from 'shared/constants/mapDataParams.ts';

import {
  fetchBusLocationsParams,
  fetchTaxiTripsParams,
  fetchTimelineWithDateAndLocation,
} from '../../../../entities/dashboard/services';
import { Slide, TimelineData } from '../../../../entities/dashboard/types';
import { LocationType, LocationWithGeometry } from '../../../../entities/locationPanel/types';
import locationPanelStoreInstance from '../../locationPanelStore';
import mapDataValuesStore from '../../mapDataValuesStore';
import timeIntervalsStoreInstance from '../../timeIntervalsStore';
import { BusLocationParamsData } from '../busAndTaxi/BusAndTaxiDataTypes';
import { ZoneHierarchyId } from '../population/PopulationDataTypes';
import Caching3DStore, { PropsGetCurrentFetchArgs } from './Caching3DStore';
import { LocationAndDateFetchArgs, PeopleMovementFetchArgs, TripDirection } from './FetchParams';
import { I3DStore } from './I3DStore';
import zones3DStoreInstance from './Zones3DStore';

export class MapOfBusMoves extends Map<ZoneHierarchyId, Map<ZoneHierarchyId, BusLocationParamsData>> {}

export class BusAndTaxiLocations3DStore
  extends Caching3DStore<
    ZoneHierarchyId,
    Map<ZoneHierarchyId, BusLocationParamsData>,
    LocationAndDateFetchArgs,
    BusLocationParamsData
  >
  implements I3DStore
{
  public locationsMap = new Map<string, LocationWithGeometry>();

  public currentTarget: {
    current: MapOfBusMoves;
    target: MapOfBusMoves;
  } = {
    current: new MapOfBusMoves(),
    target: new MapOfBusMoves(),
  };

  public k: number = 0;
  public timelineData?: TimelineData;

  public currentMoveData?: BusLocationParamsData;

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
      locationsMap: observable.shallow,
      currentTarget: observable.shallow,
      k: observable,
      currentMoveData: observable,
      updateAnimation: action,
      timelineData: observable,
    });
  }

  async fetchStaticGeometry(): Promise<void> {
    const locations = await zones3DStoreInstance.getLocations(locationPanelStoreInstance.currentLocation.locationType);

    if (locations) {
      const locationsMap = new Map<string, LocationWithGeometry>();
      for (const location of locations) {
        locationsMap.set(location.location, location);
      }
      this.locationsMap = locationsMap;
    }
  }

  public async fetchTimeline(): Promise<void> {
    let tripDirection: TripDirection = '';

    switch (this.slide) {
      case Slide.BUS_TRIPS_INBOUND:
      case Slide.TAXI_TRIPS_INBOUND:
        tripDirection = 'inbound';
        break;
      case Slide.BUS_TRIPS_OUTBOUND:
      case Slide.TAXI_TRIPS_OUTBOUND:
        tripDirection = 'outbound';
        break;
      case Slide.TAXI_TRIPS_WITHIN:
        tripDirection = 'within';
        break;
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
      slide: busAndTaxiLocations3DStoreInstance.slide,
    });
    runInAction(() => {
      this.timelineData = timelineData;
    });
  }

  protected loadParams = async (fetchParam: PeopleMovementFetchArgs, timeSliceIndex: number) => {
    return await ([Slide.BUS_TRIPS_INBOUND, Slide.BUS_TRIPS_OUTBOUND, Slide.BUS_TRIPS_WITHIN].includes(this.slide!)
      ? fetchBusLocationsParams(fetchParam, timeSliceIndex)
      : fetchTaxiTripsParams(fetchParam, timeSliceIndex));
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
      typicalday: timeIntervalsStoreInstance.typeOfRange,
    };
  };

  protected async makeMap(params: BusLocationParamsData[]): Promise<MapOfBusMoves> {
    const map = new MapOfBusMoves();
    for (const param of params) {
      const { from, to } = param;

      const item = map.get(from);
      if (item) item.set(to, param);
      else map.set(from, new Map<ZoneHierarchyId, BusLocationParamsData>([[to, param]]));
    }
    return map;
  }

  public async fetchParams(currentId: number, targetId: number): Promise<void> {
    const current = await this.loadParamsCached(await this.getCurrentFetchArgs(), currentId);
    const target = await this.loadParamsCached(await this.getCurrentFetchArgs(), targetId);

    runInAction(() => {
      this.currentTarget = {
        current: new MapOfBusMoves(),
        target: new MapOfBusMoves(),
      };
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
        current: new MapOfBusMoves(),
        target: new MapOfBusMoves(),
      };
    });
    runInAction(() => {
      this.currentTarget = temp;
    });
  }
}

const busAndTaxiLocations3DStoreInstance: BusAndTaxiLocations3DStore = new BusAndTaxiLocations3DStore();
export default busAndTaxiLocations3DStoreInstance;
