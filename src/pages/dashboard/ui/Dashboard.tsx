import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { Loader } from 'shared/ui/loader/Loader.tsx';

import { useStore } from '../../../app/providers/storeProvider/StoreProvider.tsx';
import { overviewSlides } from '../../../entities/dashboard/config.ts';
import { Slide } from '../../../entities/dashboard/types.ts';
import { BottomPanel } from '../../../widgets/dashboardBottomPannel/BottomPanel.tsx';
import { DashboardMainInfoGroup } from '../../../widgets/dashboardMainInfoGroup/DashboardMainInfoGroup.tsx';
import { DashboardMapControls } from '../../../widgets/dashboardMapControls/DashboardMapControls.tsx';
import { RealWorldEngineButton } from '../../../widgets/dashboardMapControls/realWorldEngineButton/RealWorldEngineButton.tsx';
import { TopPanel } from '../../../widgets/topPanel/TopPanel.tsx';

type DashboardProps = {
  page: Slide;
};

const Dashboard = observer(({ page }: DashboardProps) => {
  const { slidesStore, contentLoadStore, locationPanelStore, mobilityOverviewPanelStore, map3DStore } = useStore();

  // TODO: temporary solution, to keep 3DSlides working properly
  useEffect(() => {
    if (map3DStore.isInitialized) {
      slidesStore.setCurrentSlide(page);
    }

    if (page && !overviewSlides?.includes(page)) {
      mobilityOverviewPanelStore.setIsPanelOpen(false);
    }

    return () => {
      mobilityOverviewPanelStore.setIsPanelOpen(true);
    };
  }, [page, map3DStore.isInitialized]);

  if (!slidesStore.currentSlide) return null;

  const shouldRenderUI = !locationPanelStore.isLocationPanelOpen;
  const isOverview = overviewSlides?.includes(slidesStore.currentSlide as Slide);
  const isTrafficOverview = slidesStore.currentSlide === Slide.TRAFFIC_OVERVIEW;

  return (
    <>
      {contentLoadStore.isContentLoading && <Loader background={false} />}

      {shouldRenderUI && (
        <>
          <TopPanel />
          <DashboardMainInfoGroup />
          {!isOverview && (
            <>
              <DashboardMapControls />
              <BottomPanel />
            </>
          )}
          {isTrafficOverview && (
            <div style={{ position: 'absolute', right: '40px', top: '140px', zIndex: 10 }}>
              <RealWorldEngineButton />
            </div>
          )}
        </>
      )}
    </>
  );
});

export default Dashboard;
