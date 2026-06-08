import { makeObservable, observable, runInAction } from 'mobx';
import { DataType } from 'shared/constants/mapDataParams.ts';

import { fetchLandUseZones } from '../../../../entities/dashboard/services';
import { Slide } from '../../../../entities/dashboard/types';
import { LocationType, LocationWithGeometry } from '../../../../entities/locationPanel/types';
import locationPanelStoreInstance from '../../locationPanelStore';
import mapDataValuesStore from '../../mapDataValuesStore';
import { LandUseZoneData, LandUseZoneId } from '../landUse/LandUseDataTypes';
import Caching3DStore from './Caching3DStore';
import { LandUseFetchArgsWithHorizon, LandUseKpiFetchArgs } from './FetchParams';
import { I3DStore } from './I3DStore';
import zones3DStoreInstance from './Zones3DStore';

export class LandUseZones3DStore
  extends Caching3DStore<LandUseZoneId, LandUseZoneData, LandUseFetchArgsWithHorizon>
  implements I3DStore
{
  public current = new Map<LandUseZoneId, LandUseZoneData>();

  private locationsMap = new Map<string, LocationWithGeometry>();

  constructor() {
    super();

    makeObservable(this, {
      current: observable.shallow,
    });
  }

  clearParams(): void {
    this.current = new Map();
  }

  async fetchStaticGeometry(): Promise<void> {
    const locations = await zones3DStoreInstance.getLocations(LocationType.ZONE);
    if (locations) {
      const locationsMap = new Map<string, LocationWithGeometry>();
      for (const location of locations) {
        locationsMap.set(location.location, location);
      }
      this.locationsMap = locationsMap;
    }
  }

  protected loadParams = fetchLandUseZones;

  protected getCurrentFetchArgs = async (): Promise<LandUseKpiFetchArgs> => {
    const { from, to } = mapDataValuesStore.getLastFinishedQuarter();

    return {
      location: locationPanelStoreInstance.currentLocation,
      slide: this.slide ?? Slide.LAND_USE_RESIDENTIAL,
      startDate: from,
      endDate: to,
      horizon: mapDataValuesStore.horizon.id,
    };
  };

  public async fetchParams(currentId: number, _targetId: number): Promise<void> {
    if (this.dataType == DataType.LAND_USE_TYPE_ZONE) {
      const current = await this.loadParamsCached(await this.getCurrentFetchArgs(), currentId);
      runInAction(() => {
        this.current = current;
      });
    }
  }

  public updateAnimation(_k: number): void {
    // Empty
  }

  protected async makeMap(params: LandUseZoneData[]): Promise<Map<LandUseZoneId, LandUseZoneData>> {
    const map = new Map<LandUseZoneId, LandUseZoneData>();
    for (const param of params) {
      if (!param.geometry) {
        const location = this.locationsMap.get(param.zone)!;
        param.geometry = location?.geometry;
      }
      const { zone } = param;

      map.set(zone, param);
    }
    return map;
  }
}

const landUseZones3DStoreInstance: LandUseZones3DStore = new LandUseZones3DStore();
export default landUseZones3DStoreInstance;
