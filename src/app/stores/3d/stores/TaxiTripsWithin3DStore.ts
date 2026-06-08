import { action, makeObservable, observable, runInAction } from 'mobx';
import { Vector3 } from 'three';

import { fetchTaxiTripsWithinParams, fetchTimelineWithDateAndLocation } from '../../../../entities/dashboard/services';
import { TimelineData } from '../../../../entities/dashboard/types';
import locationPanelStoreInstance from '../../locationPanelStore';
import mapDataValuesStore from '../../mapDataValuesStore';
import timeIntervalsStoreInstance from '../../timeIntervalsStore';
import { TaxiWithinTripsParamsData, TaxiWithinTripsZone } from '../busAndTaxi/BusAndTaxiDataTypes';
import IArcInfoPopupState from '../population/IArcInfoPopupState';
import Caching3DStore, { PropsGetCurrentFetchArgs } from './Caching3DStore';
import { AviationTransferFetchArgs, LocationAndDateRangeFetchArgs, TripDirection } from './FetchParams';
import { I3DStore } from './I3DStore';
import zones3DStoreInstance from './Zones3DStore';

export class TaxiTripsWithin3DStore
  extends Caching3DStore<string, TaxiWithinTripsZone, LocationAndDateRangeFetchArgs, TaxiWithinTripsParamsData>
  implements I3DStore
{
  public currentTarget = {
    target: new Map<string, TaxiWithinTripsZone>(),
    current: new Map<string, TaxiWithinTripsZone>(),
  };

  public k: number = 0;

  public arcPopupState: IArcInfoPopupState = {
    isSelected: false,
    x: 0,
    y: 0,
    worldPosition: new Vector3(),
    msg: 'msg',
  };

  private rawTimelineData?: TimelineData;
  public timelineData?: TimelineData;

  constructor() {
    super();

    makeObservable(this, {
      currentTarget: observable.shallow,
      arcPopupState: observable,
      timelineData: observable,
      k: observable,
      updateAnimation: action,
    });
  }

  public async fetchTimeline(): Promise<void> {
    runInAction(() => {
      this.timelineData = undefined;
    });

    runInAction(() => {
      this.timelineData = undefined;
    });

    const { from, to } = mapDataValuesStore.getLastFinishedQuarter();

    const timelineData = await fetchTimelineWithDateAndLocation({
      startDate: from,
      endDate: to,
      location: locationPanelStoreInstance.currentLocation,
      tripDirection: 'within',
      slide: busAndTaxiTripsWithin3DStoreInstance.slide,
    });

    runInAction(() => {
      this.timelineData = timelineData;
    });
  }

  public async fetchParams(currentId: number, targetId: number): Promise<void> {
    // The second argument here is ignored, as we query startDate and endDate to get the data
    const current = await this.loadParamsCached(
      await this.getCurrentFetchArgs({ timeSliceIndex: currentId }),
      currentId
    );
    // Same
    const target = await this.loadParamsCached(await this.getCurrentFetchArgs({ timeSliceIndex: targetId }), targetId);

    runInAction(() => {
      this.currentTarget = {
        current,
        target,
      };

      this.k = 0;
    });
  }

  protected getCurrentFetchArgs = async (props?: PropsGetCurrentFetchArgs): Promise<AviationTransferFetchArgs> => {
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
      dataType: mapDataValuesStore.dataType!,
      typicalday: timeIntervalsStoreInstance.typeOfRange,
    };
  };

  public updateAnimation(k: number): void {
    this.k = k;
  }

  protected loadParams = fetchTaxiTripsWithinParams;

  protected async makeMap(params: TaxiWithinTripsParamsData[]): Promise<Map<string, TaxiWithinTripsZone>> {
    const map = new Map<string, TaxiWithinTripsZone>();
    for (const param of params) {
      const zone: TaxiWithinTripsZone = {
        peopleCountParamsData: param,
        location: (await zones3DStoreInstance.getLocationWithGeometryByName(param.locationType, param.location))!,
      };
      map.set(`${param.locationType}-${param.location}`, zone);
    }
    return map;
  }
}

const busAndTaxiTripsWithin3DStoreInstance: TaxiTripsWithin3DStore = new TaxiTripsWithin3DStore();
export default busAndTaxiTripsWithin3DStoreInstance;
