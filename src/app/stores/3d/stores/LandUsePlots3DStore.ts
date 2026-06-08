import { makeObservable, observable, runInAction } from 'mobx';
import { DataType } from 'shared/constants/mapDataParams.ts';

import { fetchLandUsePlots } from '../../../../entities/dashboard/services';
import { Slide } from '../../../../entities/dashboard/types';
import locationPanelStoreInstance from '../../locationPanelStore';
import mapDataValuesStore from '../../mapDataValuesStore';
import { LandUsePlotData, LandUsePlotId } from '../landUse/LandUseDataTypes';
import Caching3DStore, { PropsGetCurrentFetchArgs } from './Caching3DStore';
import { LandUseKpiFetchArgs, LocationAndDateFetchArgs } from './FetchParams';
import { I3DStore } from './I3DStore';

export class LandUsePlots3DStore
  extends Caching3DStore<LandUsePlotId, LandUsePlotData, LocationAndDateFetchArgs>
  implements I3DStore
{
  public current = new Map<LandUsePlotId, LandUsePlotData>();

  constructor() {
    super();

    makeObservable(this, {
      current: observable.shallow,
    });
  }

  clearParams(): void {
    this.current = new Map();
  }

  protected loadParams = fetchLandUsePlots;

  protected getCurrentFetchArgs = async (props?: PropsGetCurrentFetchArgs): Promise<LandUseKpiFetchArgs> => {
    const { from, to } = mapDataValuesStore.getLastFinishedQuarter();

    return {
      location: locationPanelStoreInstance.currentLocation,
      slide: this.slide ?? props?.overrideSlide ?? Slide.LAND_USE_RESIDENTIAL,
      startDate: from,
      endDate: to,
    };
  };

  public async fetchParams(currentId: number, _targetId: number): Promise<void> {
    if (
      this.dataType == DataType.LAND_USE_TYPE_PLOT ||
      this.dataType == DataType.UTILIZATION // temporary mock
    ) {
      const current = await this.loadParamsCached(await this.getCurrentFetchArgs(), currentId);

      runInAction(() => {
        this.current = current;
      });
    }
  }

  public updateAnimation(_k: number): void {
    // Empty
  }

  protected async makeMap(params: LandUsePlotData[]): Promise<Map<LandUsePlotId, LandUsePlotData>> {
    const map = new Map<LandUsePlotId, LandUsePlotData>();
    let i = 0;
    for (const param of params) {
      const { sensorId } = param;
      map.set(sensorId ?? i++, param);
    }
    return map;
  }
}

const landUsePlots3DStoreInstance: LandUsePlots3DStore = new LandUsePlots3DStore();
export default landUsePlots3DStoreInstance;
