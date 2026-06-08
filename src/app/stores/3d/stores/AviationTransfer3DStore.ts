import { action, autorun, makeObservable, observable, runInAction } from 'mobx';

import {
  fetchAviationInboundOutboundParams,
  fetchCountriesGeometry,
  fetchInboundAviationTimeline,
  fetchOutboundAviationTimeline,
} from '../../../../entities/dashboard/services';
import { Slide, TimelineData } from '../../../../entities/dashboard/types';
import { LocationWithGeometry } from '../../../../entities/locationPanel/types';
import locationPanelStoreInstance from '../../locationPanelStore';
import mapDataValuesStore from '../../mapDataValuesStore';
import { AviationTransferDataType } from '../aviation/AviationDataTypes';
import { ZoneHierarchyId } from '../population/PopulationDataTypes';
import Caching3DStore from './Caching3DStore';
import { AviationTransferFetchArgs, LocationAndDateFetchArgs } from './FetchParams';
import { I3DStore } from './I3DStore';

export class MapOfAviationMoves extends Map<ZoneHierarchyId, Map<ZoneHierarchyId, AviationTransferDataType>> {}

export class AviationTransfer3DStore
  extends Caching3DStore<
    ZoneHierarchyId,
    Map<ZoneHierarchyId, AviationTransferDataType>,
    LocationAndDateFetchArgs,
    AviationTransferDataType
  >
  implements I3DStore
{
  public locationsMap = new Map<string, LocationWithGeometry>();
  public currentTarget: {
    current: MapOfAviationMoves;
    target: MapOfAviationMoves;
  } = {
    current: new MapOfAviationMoves(),
    target: new MapOfAviationMoves(),
  };
  public k: number = 0;

  public currentMoveData?: AviationTransferDataType;

  public timelineData?: TimelineData;

  public get currentLocation(): ZoneHierarchyId {
    return 'United Arab Emirates';
  }

  constructor() {
    super();

    makeObservable(this, {
      // zones: observable.shallow,
      locationsMap: observable.shallow,
      currentTarget: observable.shallow,
      k: observable,
      currentMoveData: observable,
      updateAnimation: action,
      timelineData: observable,
      dataType: observable,
    });

    autorun(() => {
      const value = this.currentMoveData;
      if (value) {
        // eslint-disable-next-line no-console
        console.log(`Current move data = {count = ${value.count}, to = ${value.country}}`);
      } else {
        // eslint-disable-next-line no-console
        console.log(`Current move data = undefined`);
      }
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

  protected loadParams = fetchAviationInboundOutboundParams;

  protected getCurrentFetchArgs = async (): Promise<AviationTransferFetchArgs> => {
    const { from, to } = mapDataValuesStore.getLastFinishedQuarter();

    return {
      startDate: from,
      endDate: to,
      location: locationPanelStoreInstance.currentLocation,
      dataType: this.dataType!,
      tripDirection: this.slide === Slide.AVIATION_INBOUND ? 'inbound' : 'outbound',
    };
  };

  protected async makeMap(params: AviationTransferDataType[]): Promise<MapOfAviationMoves> {
    const map = new MapOfAviationMoves();
    for (const param of params) {
      // const { to: t, from: f } = param;

      const defaultCountry = aviationTransfer3DStoreInstance.currentLocation;
      const item = map.get(defaultCountry);
      if (item) item.set(param.country, param);
      else map.set(defaultCountry, new Map<ZoneHierarchyId, AviationTransferDataType>([[param.country, param]]));
    }
    return map;
  }

  public async fetchParams(currentId: number, targetId: number): Promise<void> {
    const current = await this.loadParamsCached(await this.getCurrentFetchArgs(), currentId);
    const target = await this.loadParamsCached(await this.getCurrentFetchArgs(), targetId);

    runInAction(() => {
      this.currentTarget = {
        current: new MapOfAviationMoves(),
        target: new MapOfAviationMoves(),
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
        current: new MapOfAviationMoves(),
        target: new MapOfAviationMoves(),
      };
    });
    runInAction(() => {
      this.currentTarget = temp;
    });
  }

  public async fetchTimeline(): Promise<void> {
    runInAction(() => {
      this.timelineData = undefined;
    });

    const fetchMethod =
      this.slide === Slide.AVIATION_INBOUND ? fetchInboundAviationTimeline : fetchOutboundAviationTimeline;

    const { from, to } = mapDataValuesStore.getLastFinishedQuarter();

    const timelineData = await fetchMethod(from, to, mapDataValuesStore.dataType!);
    runInAction(() => {
      this.timelineData = timelineData;
    });
  }
}

const aviationTransfer3DStoreInstance: AviationTransfer3DStore = new AviationTransfer3DStore();
export default aviationTransfer3DStoreInstance;
