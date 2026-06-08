import { makeObservable, observable, runInAction } from 'mobx';

import { fetchLandUsePlots } from '../../../../entities/dashboard/services';
import { LandUsePlotData, LandUsePlotId } from '../landUse/LandUseDataTypes';
import Caching3DStore from './Caching3DStore';
import { getCurrentBasicFetchArgs, LocationAndDateFetchArgs } from './FetchParams';
import { I3DStore } from './I3DStore';

export class Fusion3DStore
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

  public async fetchParams(_currentId: number, _targetId: number): Promise<void> {
    runInAction(() => {
      this.current = new Map([]);
    });
  }

  public updateAnimation(_k: number): void {
    // Empty
  }

  protected loadParams = fetchLandUsePlots;

  protected getCurrentFetchArgs = getCurrentBasicFetchArgs;

  protected async makeMap(_params: LandUsePlotData[]): Promise<Map<number, LandUsePlotData>> {
    const map = new Map<LandUsePlotId, LandUsePlotData>();

    return map;
  }
}

const fusion3DStoreInstance: Fusion3DStore = new Fusion3DStore();
export default fusion3DStoreInstance;
