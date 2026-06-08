import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';

import { useStore } from '../../app/providers/storeProvider/StoreProvider.tsx';
import { overviewSlides } from '../../entities/dashboard/config.ts';
import { Slide } from '../../entities/dashboard/types.ts';
import { LocationType } from '../../entities/locationPanel/types.ts';
import { SelectLocationBottomPanel } from '../../features/selectLocationTabs/bottomPanel/SelectLocationBottomPanel.tsx';
import { LocationTab } from '../../features/selectLocationTabs/customTabPanel/locationTab/LocationTab.tsx';
import { SelectLocationPanelHeader } from '../../features/selectLocationTabs/headerPanel/SelectLocationPanelHeader.tsx';
import { SelectLocationTabs } from '../../features/selectLocationTabs/tabs/SelectLocationTabs.tsx';
import style from './SelectLocationPanel.module.scss';

export const SelectLocationPanel = observer(() => {
  const { locationPanelStore, slidesStore, mobilityOverviewPanelStore, zones3DStore } = useStore();
  const { currentLocation } = locationPanelStore;
  const { activeTab } = locationPanelStore;

  const setActiveTab = (tab: LocationType) => {
    locationPanelStore.setActiveTab(tab);
    // Force refresh zones when tab changes to ensure the 3D map updates
    zones3DStore.refreshCurrentZones();
  };

  useEffect(() => {
    locationPanelStore.setLocationInPanel(currentLocation);
    mobilityOverviewPanelStore.setIsPanelOpen(false);

    // Ensure zones are loaded for the current active tab when panel opens
    zones3DStore.refreshCurrentZones();

    return () => {
      const isOverview = overviewSlides?.includes(slidesStore.currentSlide as Slide);

      if (isOverview) {
        mobilityOverviewPanelStore.setIsPanelOpen(true);
      }
    };
  }, []);

  return (
    <div className={style.wrapper}>
      <SelectLocationPanelHeader />
      <SelectLocationTabs setActiveTab={setActiveTab} activeTab={activeTab} />
      <LocationTab activeTab={activeTab} />
      <SelectLocationBottomPanel />
    </div>
  );
});
