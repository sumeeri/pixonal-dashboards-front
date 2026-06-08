import { Button } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { transformLocationText } from 'shared/utils/transformLocationText.ts';

import { useStore } from '../../../app/providers/storeProvider/StoreProvider.tsx';
import current3DStoreInstance from '../../../app/stores/3d/stores/Current3DStore.ts';
import mapDataValuesStoreInstance from '../../../app/stores/mapDataValuesStore.ts';
import timeIntervalsStoreInstance from '../../../app/stores/timeIntervalsStore.ts';
import { TimelineAggregation } from '../../../entities/dashboard/types.ts';
import { ILocation, LocationType } from '../../../entities/locationPanel/types.ts';
import style from './SelectLocationBottomPanel.module.scss';

export const SelectLocationBottomPanel = observer(() => {
  const { locationPanelStore, map3DStore, timeIntervalsStore } = useStore();
  const { currentLocation, locationInPanel, currentLocationType, locationTypeInPanel } = locationPanelStore;

  const resetLocation = () => {
    locationPanelStore.setLocationTypeInPanel(currentLocationType);
    locationPanelStore.setLocationInPanel(currentLocation);
  };

  const getLocationName = () => {
    const locationName = locationInPanel?.location;
    if (locationName === 'Al Dhafra') {
      return 'Western Region';
    }

    return locationName;
  };

  const getLocationNameForDisplay = (name?: string) => {
    if (name === 'Western Region') {
      return 'Al Dhafra';
    }

    return name;
  };

  // Fix for traffic layer load after stiching location
  const acceptLocation = async () => {
    if (locationTypeInPanel === LocationType.CORRIDOR) {
      locationPanelStore.setBeforeCorridorsLocationAndLocationType();
    }
    locationPanelStore.setCurrentLocationType(locationTypeInPanel);
    locationPanelStore.setCurrentLocation({ ...locationInPanel, location: getLocationName() } as ILocation);

    timeIntervalsStore.setTypeOfRange(TimelineAggregation.ENTIRE);
    locationPanelStore.setIsLocationPanelOpen(false);
    locationPanelStore.setActiveTab(locationInPanel?.locationType || LocationType.DISTRICT);

    // Clear the map and reset stores
    map3DStore.clearMap();

    // Reset cached data and force reload
    current3DStoreInstance.resetCachedIndixes();
    current3DStoreInstance.stopPreloadData();

    // Get current data type and force reload
    const currentDataType = mapDataValuesStoreInstance.dataType;
    if (currentDataType) {
      await current3DStoreInstance.setDataType(currentDataType);
    }

    timeIntervalsStoreInstance.setDefaultState();
    map3DStore.set3DSlideVisible(true);

    if (locationInPanel?.boundingBox) map3DStore.setDefaultCameraPosition();
  };

  return (
    <div className={style.bottomPanel}>
      <div className={style.location}>
        {currentLocation ? (
          <>
            <div className={style.selectedLocationTitle}>Selected location</div>
            <div className={style.selectedLocation}>
              {transformLocationText(getLocationNameForDisplay(locationInPanel?.location) ?? '')} ({locationTypeInPanel}
              )
            </div>
          </>
        ) : (
          <div className={style.selectedLocationTitle}>location not selected</div>
        )}
      </div>
      <div className={style.buttons}>
        <Button size="small" variant="outlined" onClick={resetLocation}>
          Reset
        </Button>
        <Button size="small" color="secondary" variant="contained" onClick={acceptLocation} disabled={!currentLocation}>
          Apply
        </Button>
        {/*   <Button size="small" color="secondary" variant="contained" onClick={acceptLocation} disabled={!currentLocation}>
          Apply to Entire Story
        </Button> */}
      </div>
    </div>
  );
});
