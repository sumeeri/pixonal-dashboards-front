import { makeObservable, observable, reaction, runInAction } from 'mobx';

import { populationMovementSlides } from '../../../../entities/dashboard/config';
import { fetchAllLocationsByType } from '../../../../entities/dashboard/services';
import { Slide } from '../../../../entities/dashboard/types';
import { LocationType, LocationWithGeometry, Zones } from '../../../../entities/locationPanel/types';
import locationPanelStoreInstance from '../../locationPanelStore';

const UNNECESSARY_LOCATION_TYPES = [LocationType.ALL_LOCATIONS, LocationType.SPECIAL_DISTRICT];

export class Zones3DStore {
  public zones?: Zones;
  public slide?: Slide;

  private cache = new Map<string, LocationWithGeometry[]>();

  private locationType: LocationType = LocationType.SPECIAL_DISTRICT;

  constructor() {
    makeObservable(this, {
      zones: observable,
    });

    reaction(
      () => locationPanelStoreInstance.activeTab,
      () => {
        this.locationType = locationPanelStoreInstance.activeTab;
        this.fetchZones(this.locationType).finally();
      },
      {
        fireImmediately: false,
      }
    );
  }

  getKey(locationType: LocationType) {
    if (locationType === LocationType.SPECIAL_DISTRICT) {
      return LocationType.DISTRICT;
    }

    const isZoneLocationType = locationType === LocationType.ZONE;

    const keyWordForPMovement =
      isZoneLocationType && this.slide && populationMovementSlides.includes(this.slide) ? 'movement' : '';

    return locationType + keyWordForPMovement;
  }

  setSlide(slide: Slide) {
    this.slide = slide;
  }

  public async fetchZones(locationType: LocationType): Promise<void> {
    let zones: LocationWithGeometry[];
    const key = this.getKey(locationType);
    const locations = this.cache.get(key);

    if (locations) {
      zones = locations;
    } else {
      try {
        zones = await fetchAllLocationsByType(locationType, this.slide);
      } catch (error) {
        throw new Error(`Can't fetch "${locationType}" location type`);
      }

      this.cache.set(key, zones);
    }
    runInAction(() => {
      this.zones = { locationType: locationType, zones: zones };
    });
  }

  public async getLocationWithGeometryByName(
    locationType: LocationType,
    locationName: string
  ): Promise<LocationWithGeometry | undefined> {
    // Convert display name back to actual data name for lookup
    const actualLocationName = locationName === 'Al Dhafra' ? 'Western Region' : locationName;

    const locationsPromise =
      locationType == LocationType.ALL_LOCATIONS ? await this.getAllLocations() : await this.getLocations(locationType);

    return locationsPromise?.find((x) => x.location == actualLocationName);
  }

  public async getLocations(locationType: LocationType): Promise<LocationWithGeometry[] | undefined> {
    const key = this.getKey(locationType);

    const locations = this.cache.get(key);

    if (!locations) {
      await this.fetchZones(locationType);
    }

    return structuredClone(this.cache.get(key));
  }

  public async refreshCurrentZones(): Promise<void> {
    // Manually trigger zone fetch for the current active tab
    await this.fetchZones(locationPanelStoreInstance.activeTab);
  }

  public async getAllLocations(listOfLocation?: LocationType[]): Promise<LocationWithGeometry[] | undefined> {
    const list: LocationWithGeometry[] = [];

    const needLocationTypes = listOfLocation ? listOfLocation : Object.values(LocationType);

    for (const locationType of needLocationTypes) {
      if (!UNNECESSARY_LOCATION_TYPES.includes(locationType)) {
        list.push(...((await this.getLocations(locationType)) ?? []));
      }
    }

    return list;
  }
}

const zones3DStoreInstance: Zones3DStore = new Zones3DStore();
export default zones3DStoreInstance;
