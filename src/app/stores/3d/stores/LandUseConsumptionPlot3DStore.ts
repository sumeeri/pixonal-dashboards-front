import { action, makeObservable, observable, runInAction } from 'mobx';
import { DataType } from 'shared/constants/mapDataParams';

import { fetchConsumptionPlotParams } from '../../../../entities/dashboard/services';
import mapDataValuesStoreInstance from '../../mapDataValuesStore';
import { ConsumptionGood, LandUseConsumptionPlotData } from '../landUse/LandUseDataTypes';
import Caching3DStore from './Caching3DStore';
import { getCurrentStartEndDateFetchArgs, LocationAndDateRangeFetchArgs } from './FetchParams';
import { I3DStore } from './I3DStore';

export class LandUseConsumptionPlot3DStore
  extends Caching3DStore<string, LandUseConsumptionPlotData, LocationAndDateRangeFetchArgs>
  implements I3DStore
{
  public k: number = 0;

  public currentTarget = {
    current: new Map<string, LandUseConsumptionPlotData>(),
    target: new Map<string, LandUseConsumptionPlotData>(),
  };

  public consumptionGood: ConsumptionGood = ConsumptionGood.Water;

  constructor() {
    super();

    makeObservable(this, {
      k: observable,
      currentTarget: observable.shallow,
      updateAnimation: action,
      slide: observable,
    });
  }

  protected loadParams = fetchConsumptionPlotParams;

  protected getCurrentFetchArgs = getCurrentStartEndDateFetchArgs;

  protected async makeMap(params: LandUseConsumptionPlotData[]): Promise<Map<string, LandUseConsumptionPlotData>> {
    const map = new Map<string, LandUseConsumptionPlotData>();
    for (const param of params) {
      map.set(param.plotName, param);
    }
    return map;
  }

  public async fetchParams(currentId: number, targetId: number): Promise<void> {
    if (mapDataValuesStoreInstance.dataType !== DataType.UTILIZATION) {
      return;
    }
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
}

const landUseConsumptionPlot3DStoreInstance: LandUseConsumptionPlot3DStore = new LandUseConsumptionPlot3DStore();
export default landUseConsumptionPlot3DStoreInstance;
