import { observer } from 'mobx-react-lite';
import React from 'react';
import { ChevronDownIcon, LocationIcon } from 'shared/icons';
import { transformLocationText } from 'shared/utils/transformLocationText.ts';

import { useStore } from '../../app/providers/storeProvider/StoreProvider.tsx';
import authStoreInstance from '../../app/stores/authStore.ts';
import { getLocationTypeDisplayName } from '../../app/stores/locationPanelStore.ts';
import slidesStoreInstance from '../../app/stores/slidesStore.ts';
import { Slide } from '../../entities/dashboard/types.ts';
import style from './LocationSelector.module.scss';

// TODO: refactor
const LocationSelector = observer(() => {
  const { map3DStore, locationPanelStore } = useStore();
  const { currentLocation } = locationPanelStore;

  const openLocationPanel = () => {
    map3DStore.set3DSlideVisible(false);
    // todo: add function for set markers data
    locationPanelStore.setIsLocationPanelOpen(true);
  };

  const getIsButtonDisabled = () => {
    if (slidesStoreInstance.currentSlide) {
      const inaccessibleSlidesForAll = [
        Slide.AVIATION_CONNECTIVITY,
        Slide.AVIATION_OUTBOUND,
        Slide.AVIATION_INBOUND,
        Slide.MARITIME_FACILITIES,
        Slide.MARITIME_TRIPS,
      ];
      return inaccessibleSlidesForAll.includes(slidesStoreInstance.currentSlide);
    }

    return authStoreInstance.checkUserPermissionForGeometrySlides();
  };

  const getLocationName = () => {
    let locationName = currentLocation.location;
    if (locationName === 'Western Region') {
      locationName = 'Al Dhafra';
    }

    return locationName;
  };

  return (
    <div className={style.wrapper}>
      <button type="button" onClick={openLocationPanel} className={style.select} disabled={getIsButtonDisabled()}>
        <LocationIcon />
        <span className={style.location + ' ' + style.locationDelimiter}>Location</span>
        <span className={style.locationText + ' ' + style.locationDelimiter}>
          {transformLocationText(getLocationName())}
        </span>
        <span className={style.locationText}>{getLocationTypeDisplayName(currentLocation)}</span>
        <ChevronDownIcon />
      </button>
    </div>
  );
});

export default React.memo(LocationSelector);
