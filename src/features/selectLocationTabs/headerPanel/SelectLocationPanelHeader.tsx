import { BigArrowIcon } from 'shared/icons';
import { DownloadProgress } from 'shared/ui/DownloadProgress.tsx';

import { useStore } from '../../../app/providers/storeProvider/StoreProvider.tsx';
import style from './SelectLocationPanelHeader.module.scss';

export const SelectLocationPanelHeader = () => {
  const { locationPanelStore, map3DStore, current3DStore, timeIntervalsStore } = useStore();

  const closeLocationPanel = () => {
    map3DStore.fitToBbox(locationPanelStore.currentLocation.boundingBox);
    locationPanelStore.setIsLocationPanelOpen(false);
    locationPanelStore.setActiveTab(locationPanelStore.currentLocation.locationType);

    map3DStore.set3DSlideVisible(true);
    current3DStore.fetchParams(timeIntervalsStore.activeIndex, timeIntervalsStore.activeIndex);
  };

  return (
    <div className={style.header}>
      <div className={style.backButton} onClick={closeLocationPanel}>
        <BigArrowIcon />
        <div className={style.backButtonText}>Select location</div>
        <DownloadProgress />
      </div>
    </div>
  );
};
