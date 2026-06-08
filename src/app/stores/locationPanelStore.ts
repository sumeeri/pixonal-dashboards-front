import { action, makeObservable, observable } from 'mobx';

import { ILocation, LocationType } from '../../entities/locationPanel/types.ts';

const defaultLocation: ILocation = {
  location: 'Abu Dhabi Island',
  boundingBox: [54.30011, 24.54127, 54.48773, 24.39636],
  center: [54.39505, 24.45524],
  locationType: LocationType.SPECIAL_DISTRICT,
  area: 91.3587,
};

export function getLocationTypeDisplayName(location: ILocation) {
  switch (location.locationType) {
    case LocationType.SPECIAL_DISTRICT:
      return 'district';
    default:
      return location.locationType;
  }
}

export class LocationPanelStore {
  isLocationPanelOpen = false;
  currentLocationType = LocationType.SPECIAL_DISTRICT;
  locationTypeInPanel = this.currentLocationType;
  currentLocation: ILocation = defaultLocation;
  locationInPanel: ILocation | undefined = undefined;
  activeTab: LocationType = LocationType.DISTRICT;
  beforeCorridorsLocation: ILocation = defaultLocation;
  beforeCorridorsLocationType: LocationType = this.currentLocationType;

  constructor() {
    makeObservable(this, {
      isLocationPanelOpen: observable,
      currentLocationType: observable,
      currentLocation: observable,
      activeTab: observable,
      locationInPanel: observable,
      locationTypeInPanel: observable,
      setCurrentLocation: action,
      setIsLocationPanelOpen: action,
      setCurrentLocationType: action,
      setLocationInPanel: action,
      setActiveTab: action,
      setLocationTypeInPanel: action,
      setBeforeCorridorsLocationAndLocationType: action,
      setCurrentLocationToBeforeLocation: action,
    });
  }

  setBeforeCorridorsLocationAndLocationType() {
    this.beforeCorridorsLocation = this.currentLocation;
    this.beforeCorridorsLocationType = this.currentLocationType;
  }

  setCurrentLocationToBeforeLocation() {
    this.currentLocationType = this.beforeCorridorsLocationType;
    this.currentLocation = this.beforeCorridorsLocation;
  }

  setIsLocationPanelOpen(value: boolean) {
    this.isLocationPanelOpen = value;
  }

  setCurrentLocationType(value: LocationType) {
    this.currentLocationType = value;
  }

  setCurrentLocation(value: ILocation) {
    this.currentLocation = value;
  }

  setLocationInPanel(value: ILocation) {
    this.locationInPanel = value;
  }

  setActiveTab(value: LocationType) {
    if (value === LocationType.SPECIAL_DISTRICT) {
      value = LocationType.DISTRICT;
    }
    this.activeTab = value;
  }

  setLocationTypeInPanel(value: LocationType) {
    this.locationTypeInPanel = value;
  }

  setDefaultLocation() {
    this.currentLocation = defaultLocation;
  }
}

const locationPanelStoreInstance = new LocationPanelStore();
export default locationPanelStoreInstance;
