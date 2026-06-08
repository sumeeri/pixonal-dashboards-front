import { Tab, Tabs } from '@mui/material';
import { observer } from 'mobx-react-lite';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DownloadProgress } from 'shared/ui/DownloadProgress.tsx';

import { useStore } from '../../app/providers/storeProvider/StoreProvider.tsx';
import mapDataValuesStoreInstance from '../../app/stores/mapDataValuesStore.ts';
import { Slide } from '../../entities/dashboard/types.ts';
import { NAVIGATION_CONFIG } from '../../entities/navigation/config.ts';
import { NavigationGroup } from '../../entities/navigation/types.ts';
import { getFirstSlideById, getSlidePath } from '../../entities/navigation/utils.ts';
import { TimeSelect } from '../../features/dashboard/timeSelect/TimeSelect.tsx';
import { SelectTimeModal } from '../../features/selectTimeModal/SelectTimeModal.tsx';
import { ExploreDataCharts } from '../exploreDataCharts/ExploreDataCharts.tsx';
import { ExportDialogue } from '../ExportDialogue/ExportDialogue.tsx';
import { Performance } from '../Performance/Performance.tsx';
import style from './DashboardMainInfoGroup.module.scss';

export const DashboardMainInfoGroup = observer(() => {
  const navigate = useNavigate();

  const { slidesStore, exportMediaStore } = useStore();

  const exploreDataChartsRef = useRef<HTMLDivElement | null>(null);
  const [exploreDataChartsOffset, setExploreDataChartsOffset] = useState<number | null>(null);

  useEffect(() => {
    if (exploreDataChartsRef.current) {
      setExploreDataChartsOffset(exploreDataChartsRef.current.getBoundingClientRect().top + 32);
    }
  }, [exploreDataChartsRef.current, slidesStore.currentSlide]);

  const handleSlideChange = useCallback(
    (_: React.SyntheticEvent, groupOrSlideId: Slide | NavigationGroup) => {
      const targetSlide = getFirstSlideById(groupOrSlideId);
      if (targetSlide) {
        navigate(`/${targetSlide}`);
      }
    },
    [navigate]
  );

  const path = getSlidePath(slidesStore.currentSlide as Slide);
  const [currentChapterId, currentGroupId, currentSlideId] = path;

  const currentChapter = NAVIGATION_CONFIG.find((it) => it.id === currentChapterId);
  const currentGroup = currentChapter?.children.find((it) => it.id === currentGroupId);
  const tabs = currentGroup?.children;

  return (
    <>
      <div className={style.wrapper}>
        <div>
          <span className={style.name}>{currentChapter?.label}</span>

          <div className={style.section}>
            <h2 className={style.description}>{currentGroup?.label}</h2>
            {tabs && tabs.length > 0 && (
              <>
                <div className={style.delimiter} />
                <Tabs
                  sx={{
                    '.MuiTabs-flexContainer': { gap: '12px' },
                    '.MuiTabs-indicator': { display: 'none' },
                    '.Mui-selected': {
                      background: '#4D5EFF',
                    },
                  }}
                  className={style.tabs}
                  indicatorColor="secondary"
                  value={currentSlideId}
                  onChange={handleSlideChange}
                  aria-label="Slide Navigation"
                >
                  {tabs.map((it) => {
                    return <Tab key={it.id} value={it.id} className={style.tab} label={it.label} />;
                  })}
                </Tabs>
              </>
            )}
          </div>
        </div>

        <TimeSelect />

        <div className={style.statisticsWrapper}>
          <Performance />
        </div>

        <div ref={exploreDataChartsRef} style={{ width: 'max-content' }}>
          <ExploreDataCharts offset={exploreDataChartsOffset} />
        </div>

        <DownloadProgress />
      </div>

      <SelectTimeModal
        isOpenModal={mapDataValuesStoreInstance.isDateRangePanelOpen}
        onClose={() => mapDataValuesStoreInstance.setDateRangePanelOpen(false)}
      />

      <ExportDialogue
        isOpenModal={exportMediaStore.isModalOpen}
        onClose={() => exportMediaStore.setIsModalOpen(false)}
      />
    </>
  );
});
