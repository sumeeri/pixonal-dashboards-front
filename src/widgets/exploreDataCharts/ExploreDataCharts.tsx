import { ClickAwayListener } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import { useEffect } from 'react';
import { CloseIcon } from 'shared/icons/CloseIcon.tsx';
import { PlusIcon } from 'shared/icons/PlusIcon.tsx';

import { useStore } from '../../app/providers/storeProvider/StoreProvider.tsx';
import { CHARTS_CONFIG } from '../../entities/charts/config.ts';
import { Slide } from '../../entities/dashboard/types.ts';
import { ExploreDataChart } from '../exploreDataChart/ExploreDataChart.tsx';
import style from './ExploreDataCharts.module.scss';

export const ExploreDataCharts = observer(({ offset }: { offset: number | null }) => {
  const { slidesStore, chartsStore } = useStore();

  const { isExploreDataOpen, currentSlide } = slidesStore;
  const currentOptions = CHARTS_CONFIG[currentSlide as Slide];

  useEffect(() => {
    if (isExploreDataOpen) {
      chartsStore.fetchCharts(currentSlide as Slide);
    }
  }, [isExploreDataOpen]);

  useEffect(() => {
    if (isExploreDataOpen) {
      slidesStore.setIsExploreDataOpen(false);
    }
  }, [slidesStore.currentSlide]);

  if (currentOptions?.length === 0 || currentSlide?.includes('overview')) return null;

  if (!isExploreDataOpen)
    return (
      <button className={style.exploreDataButton} onClick={() => slidesStore.setIsExploreDataOpen(true)}>
        <div className={style.exploreDataIcon}>
          <PlusIcon />
        </div>
        Explore Data
      </button>
    );

  const charts = currentOptions?.map((props) => {
    return <ExploreDataChart key={props.id} slide={slidesStore.currentSlide as Slide} {...props} />;
  });

  return (
    <ClickAwayListener onClickAway={() => slidesStore.setIsExploreDataOpen(false)}>
      <div className={style.wrapper} style={{ maxHeight: `calc(100vh - ${offset}px)` }}>
        <div className={style.mainBlock}>
          <div className={style.header}>
            <span className={style.title}>Explore Data</span>

            <div className={style.headerActions}>
              <div className={style.delimiter} />

              <div className={style.headerButton}>
                <button onClick={() => slidesStore.setIsExploreDataOpen(false)}>
                  <CloseIcon />
                </button>
              </div>
            </div>
          </div>
          <OverlayScrollbarsComponent defer>
            <div className={style.content} style={{ gridTemplateColumns: charts?.length === 1 ? '1fr' : '1fr 1fr' }}>
              {charts}
            </div>
          </OverlayScrollbarsComponent>
        </div>
      </div>
    </ClickAwayListener>
  );
});
