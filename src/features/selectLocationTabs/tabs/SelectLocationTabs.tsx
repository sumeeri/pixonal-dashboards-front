import { Tab, Tabs } from '@mui/material';
import { SyntheticEvent } from 'react';

import slidesStoreInstance from '../../../app/stores/slidesStore.ts';
import { inaccessibleSlidesForEmirates, inaccessibleSlidesForZones } from '../../../entities/dashboard/config.ts';
import { LocationTabs, Slide } from '../../../entities/dashboard/types.ts';
import { LocationType } from '../../../entities/locationPanel/types.ts';
import style from './SelectLocationTabs.module.scss';

const locationTabsArray = Object.values(LocationTabs);
const locationTypeArray = Object.values(LocationType);

export const SelectLocationTabs = ({
  setActiveTab,
  activeTab,
}: {
  setActiveTab: (value: LocationType) => void;
  activeTab: LocationType;
}) => {
  const changeTab = (_event: SyntheticEvent, value: LocationType) => {
    setActiveTab(value);
  };

  const getIsTabDisabled = (locationTab: LocationTabs) => {
    if (!slidesStoreInstance.currentSlide) {
      return false;
    }
    switch (locationTab) {
      case LocationTabs.EMIRATES:
        return inaccessibleSlidesForEmirates.includes(slidesStoreInstance.currentSlide);

      case LocationTabs.ZONES:
        return inaccessibleSlidesForZones.includes(slidesStoreInstance.currentSlide);

      case LocationTabs.CORRIDORS:
        return slidesStoreInstance.currentSlide !== Slide.ROAD_TRAFFIC;

      case LocationTabs.REGIONS:
      default:
        return false;
    }
  };

  return (
    <div className={style.tabs}>
      <Tabs value={activeTab} onChange={changeTab}>
        {locationTabsArray.map((locationTab, index) => {
          const isTabDisabled = getIsTabDisabled(locationTab);

          return (
            <Tab key={locationTab} label={locationTab} value={locationTypeArray[index]} disabled={isTabDisabled} />
          );
        })}
      </Tabs>
    </div>
  );
};
