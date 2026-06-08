import { action, makeObservable, observable, runInAction } from 'mobx';
import { DataType } from 'shared/constants/mapDataParams.ts';

import {
  fetchConsumptionPillarParams,
  fetchElectricityConsumptionTimeline,
  fetchWaterConsumptionTimeline,
  fetchWaterConsumptionUtilizationTimeline,
} from '../../../../entities/dashboard/services';
import { Slide, TimelineData } from '../../../../entities/dashboard/types';
import locationPanelStoreInstance from '../../locationPanelStore';
import mapDataValuesStore from '../../mapDataValuesStore';
import { ConsumptionGood, Consumptor, LandUseConsumptionPillarData } from '../landUse/LandUseDataTypes';
import Caching3DStore from './Caching3DStore';
import { ConsumptionFetchArgs } from './FetchParams';
import { I3DStore } from './I3DStore';

export class LandUseConsumptionPillar3DStore
  extends Caching3DStore<number, LandUseConsumptionPillarData, ConsumptionFetchArgs>
  implements I3DStore
{
  public k: number = 0;

  public currentTarget = {
    current: new Map<number, LandUseConsumptionPillarData>(),
    target: new Map<number, LandUseConsumptionPillarData>(),
  };

  public timelineData?: TimelineData;

  public consumptionGood: ConsumptionGood = ConsumptionGood.Water;
  public consumptor: Consumptor = Consumptor.Residential;

  constructor() {
    super();

    makeObservable(this, {
      consumptor: observable,
      timelineData: observable,

      k: observable,
      currentTarget: observable.shallow,
      updateAnimation: action,
    });
  }

  public setDataType(dataType: DataType | undefined) {
    if (dataType) {
      super.setDataType(dataType);
    }

    switch (mapDataValuesStore.dataType) {
      case DataType.RESIDENTIAL:
        this.consumptor = Consumptor.Residential;
        break;
      case DataType.COMMERCIAL:
        this.consumptor = Consumptor.Commercial;
        break;
      case DataType.UTILIZATION:
        this.consumptor = Consumptor.Utilization;
        break;
    }
  }

  public async fetchTimeline(): Promise<void> {
    let fetchMethod = null;

    runInAction(() => {
      this.timelineData = undefined;
    });

    const isUtilizationDataType = mapDataValuesStore.dataType === DataType.UTILIZATION;

    if (isUtilizationDataType) {
      this.fetchTimelineOfUtilization();
      return;
    }

    switch (this.slide) {
      case Slide.LAND_USE_WATER_CONSUMPTION:
        fetchMethod = fetchWaterConsumptionTimeline;
        break;
      case Slide.LAND_USE_ELECTRICITY_CONSUMPTION:
        fetchMethod = fetchElectricityConsumptionTimeline;
        break;

      default:
        break;
    }

    if (!fetchMethod) {
      return;
    }

    const { from, to } = mapDataValuesStore.getLastFinishedQuarter();

    const timelineData = await fetchMethod(from, to, this.consumptor, {
      startDate: from,
      location: locationPanelStoreInstance.currentLocation,
    });
    runInAction(() => {
      this.timelineData = timelineData;
    });
  }

  public async fetchTimelineOfUtilization(): Promise<void> {
    const { from, to } = mapDataValuesStore.getLastFinishedQuarter();

    const timelineData = await fetchWaterConsumptionUtilizationTimeline({
      startDate: from,
      endDate: to,
      location: locationPanelStoreInstance.currentLocation,
    });

    runInAction(() => {
      this.timelineData = timelineData;
    });
  }

  protected loadParams = fetchConsumptionPillarParams;

  protected async getCurrentFetchArgs(): Promise<ConsumptionFetchArgs> {
    const { from, to } = mapDataValuesStore.getLastFinishedQuarter();

    return {
      startDate: from,
      endDate: to,
      location: locationPanelStoreInstance.currentLocation,
      consumptionGood: this.consumptionGood,
      consumptor: this.consumptor,
    };
  }

  protected async makeMap(params: LandUseConsumptionPillarData[]): Promise<Map<number, LandUseConsumptionPillarData>> {
    const map = new Map<number, LandUseConsumptionPillarData>();

    for (const param of params) {
      map.set(param.i, param);
    }
    return map;
  }

  public async fetchParams(currentId: number, _targetId: number): Promise<void> {
    if (mapDataValuesStore.dataType === DataType.UTILIZATION) {
      return;
    }

    const current = await this.loadParamsCached(await this.getCurrentFetchArgs(), currentId);

    runInAction(() => {
      this.currentTarget = {
        current: current,
        target: current,
      };

      this.k = 0;
    });
  }

  public updateAnimation(k: number): void {
    this.k = k;
  }
}

const landUseConsumptionPillar3DStoreInstance: LandUseConsumptionPillar3DStore = new LandUseConsumptionPillar3DStore();
export default landUseConsumptionPillar3DStoreInstance;
