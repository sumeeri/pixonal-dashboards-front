import merge from 'lodash/merge';
import { action, makeObservable } from 'mobx';
import { DataType } from 'shared/constants/mapDataParams.ts';

import { Slide } from '../../../../entities/dashboard/types.ts';
import { TripDirection } from './FetchParams.ts';
import { ICaching3DStore } from './ICaching3DStore.ts';

export class CurrentFetchCancelException extends Error {
  constructor(msg: string) {
    super(msg);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, CurrentFetchCancelException.prototype);
  }
}

export type PropsGetCurrentFetchArgs = {
  timeSliceIndex?: number;
  overrideTripDirection?: TripDirection;
  overrideSlide?: Slide;
};

export default abstract class Caching3DStore<
  /** Key to be used in map of parameters for fast search */
  TKey,
  /** Actual parameter datatype to be used for visualization */
  TParam,
  /** Args to be used in GET request */
  TFetchArgs,
  /** Optional: datatype returned from backend that will become a parameter datatype */
  TLoad = TParam,
> implements ICaching3DStore
{
  // TODO: this cache only adds up, consider removing some values to free up memory
  // still not sure about the rules of which values can be freed
  private cache: Map<string, Map<TKey, TParam>> = new Map();

  public slide?: Slide;
  public dataType?: DataType;

  private promiseFun?: () => Promise<void>;

  constructor() {
    makeObservable(this, {
      startPreloadData: action,
      stopPreloadData: action,
      resetCachedIndixes: action,
    });
  }

  public setSlide(slide: Slide): void {
    this.slide = slide;
  }

  public setDataType(dataType: DataType) {
    this.dataType = dataType;
  }

  protected abstract loadParams(params: TFetchArgs, timeSliceIndex: number): Promise<TLoad[]>;
  protected abstract makeMap(params: TLoad[]): Promise<Map<TKey, TParam>>;
  protected abstract getCurrentFetchArgs(props?: PropsGetCurrentFetchArgs): Promise<TFetchArgs>;

  protected async loadParamsCached(fetchArgs: TFetchArgs, timeSliceIndex: number): Promise<Map<TKey, TParam>> {
    // A unique fetch args fingerprint to be used as a key in cache
    const key = JSON.stringify(merge(fetchArgs, { slide: this.slide, _timeSliceIndex: timeSliceIndex }));
    const cached = this.cache.get(key);
    if (cached) {
      return cached;
    } else {
      const fresh = await this.makeMap(await this.loadParams(fetchArgs, timeSliceIndex));
      this.cache.set(key, fresh);
      return fresh;
    }
  }

  public startPreloadData(startIndex: number, length: number) {
    const promiseFun = action(async () => {
      let i = startIndex;
      for (i; i <= length - 1; i++) {
        if (this.promiseFun != promiseFun) {
          return;
        }
        try {
          await this.loadParamsCached(await this.getCurrentFetchArgs({ timeSliceIndex: i }), i);
        } catch (error) {
          if (error instanceof CurrentFetchCancelException) {
            // eslint-disable-next-line no-console
            console.log('Cancel loading params:', error);
          } else {
            console.error('Error loading params:', error);
          }
          return;
        }
      }
    });
    this.promiseFun = promiseFun;
    promiseFun();
  }

  public stopPreloadData() {
    this.promiseFun = undefined;
  }

  public resetCachedIndixes() {
    this.cache.clear();
  }
}
