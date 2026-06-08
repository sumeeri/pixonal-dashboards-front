import { makeAutoObservable, reaction } from 'mobx';
import { DataType } from 'shared/constants/mapDataParams.ts';
import { until } from 'shared/utils/until.ts';

import { Slide, TimelineData } from '../../../../entities/dashboard/types';
import contentLoadStoreInstance from '../../contentLoadStore';
import mapDataValuesStoreInstance from '../../mapDataValuesStore';
import { I3DStore } from './I3DStore';

export class Current3DStore implements I3DStore {
  private current3DStores: I3DStore[] = [];

  private fetchGeometryResult: (void | undefined)[] | undefined;

  public get timelineData(): TimelineData | undefined {
    return this.current3DStores[0]?.timelineData;
  }

  constructor() {
    makeAutoObservable(this);
    reaction(
      () => mapDataValuesStoreInstance.dataType,
      (dataType) => {
        if (dataType) {
          this.setDataType(dataType);
        }
      }
    );
  }

  setSlide(slide: Slide | undefined): void {
    this.current3DStores.forEach((x) => x.setSlide?.(slide));
  }

  public async setDataType(dataType: DataType) {
    this.current3DStores.forEach((x) => x.setDataType?.(dataType));

    this.fetchGeometryResult = undefined;
    this.fetchGeometryResult = await Promise.all(this.current3DStores.map((x) => x.fetchStaticGeometry?.()));

    const activeIndex = mapDataValuesStoreInstance.activeIndex;
    this.fetchParams(activeIndex, activeIndex + 1);
  }

  public async setCurrentStore(slide: Slide | undefined, stores: I3DStore[]) {
    this.stopPreloadData();

    this.current3DStores = stores;
    this.setSlide(slide);
  }

  public async fetchParams(currentId: number, targetId: number): Promise<void> {
    await until(() => this.fetchGeometryResult != undefined);

    contentLoadStoreInstance.setIsSelectedTimePointLoading(false);
    contentLoadStoreInstance.setIsTimelineDataLoading(true);

    this.current3DStores.forEach(async (x) => x.clearParams?.());
    try {
      await Promise.all([
        ...this.current3DStores.map(async (x) => {
          if (x.fetchTimeline) {
            await x.fetchTimeline();
          }
        }),
        ...this.current3DStores.map(async (x) => await x.fetchParams(currentId, targetId)),
      ]);
    } finally {
      contentLoadStoreInstance.setIsTimelineDataLoading(false);
    }
  }

  public updateAnimation(k: number): void {
    for (const store of this.current3DStores) {
      store.updateAnimation(k);
    }
  }

  public async startPreloadData(startFromIndex: number, length: number): Promise<void> {
    await until(() => this.fetchGeometryResult != undefined);

    for (const store of this.current3DStores) {
      store.startPreloadData(startFromIndex, length);
    }
  }

  public stopPreloadData(): void {
    for (const store of this.current3DStores) {
      store.stopPreloadData();
    }
  }

  public resetCachedIndixes(): void {
    for (const store of this.current3DStores) {
      store.resetCachedIndixes();
    }
  }
}

const current3DStoreInstance: Current3DStore = new Current3DStore();
export default current3DStoreInstance;
