import { observer } from 'mobx-react-lite';
import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { MainGradient } from 'shared/ui/mainGradient/MainGradient.tsx';

import { overviewSlides } from '../../../../entities/dashboard/config.ts';
import { Slide } from '../../../../entities/dashboard/types.ts';
import { Map3DPanel } from '../../../../widgets/dashboard3DMap/Map3DPanel.tsx';
import { InfoMarker } from '../../../../widgets/InfoMarker/InfoMarker.tsx';
import { InfoPopup } from '../../../../widgets/infoPopup/InfoPopup.tsx';
import { SelectLocationPanel } from '../../../../widgets/selectLocationPanel/SelectLocationPanel.tsx';
import { useStore } from '../../../providers/storeProvider/StoreProvider.tsx';

export const MapLayout = observer(() => {
  const { pathname } = useLocation();

  const { slidesStore, locationPanelStore } = useStore();
  const isOverview = overviewSlides?.includes(slidesStore.currentSlide as Slide);

  useEffect(() => {
    if (pathname !== `/${Slide.ROAD_TRAFFIC}` && locationPanelStore.currentLocationType === 'corridor') {
      locationPanelStore.setDefaultLocation();
    }
  }, [pathname, locationPanelStore.currentLocationType]);

  return (
    <Suspense>
      <Outlet />

      {locationPanelStore.isLocationPanelOpen && <SelectLocationPanel />}

      <InfoPopup />
      <InfoMarker />
      <Map3DPanel />
      <MainGradient hasGradient={isOverview} />
    </Suspense>
  );
});
