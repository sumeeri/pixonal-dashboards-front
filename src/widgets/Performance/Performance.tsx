import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';

import { useStore } from '../../app/providers/storeProvider/StoreProvider';
import chartsStore from '../../app/stores/chartsStore';
import contentLoadStoreInstance from '../../app/stores/contentLoadStore.ts';
import { DASHBOARD_CONFIG } from '../../entities/dashboard/config';
import { Slide } from '../../entities/dashboard/types';
import { isOverviewChart } from '../../entities/kpi/utils.ts';
import { OverviewChartItem } from '../../features/kpi/OverviewChartItem/OverviewChartItem.tsx';
import { OverviewValueItem } from '../../features/kpi/OverviewValueItem/OverviewValueItem.tsx';
import style from './Performance.module.scss';

export const Performance = observer(() => {
  const { slidesStore, kpiStore, locationPanelStore, mapDataValuesStore } = useStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (slidesStore.currentSlide?.includes('overview')) {
        chartsStore.fetchCharts(slidesStore.currentSlide as Slide);
      }

      contentLoadStoreInstance.setIsKpiLoading(true);

      kpiStore.fetchMainKpis(slidesStore.currentSlide as Slide).then(() => {
        contentLoadStoreInstance.setIsKpiLoading(false);
      });
    }, 50);

    return () => clearTimeout(timer);
  }, [
    slidesStore.currentSlide,
    locationPanelStore.currentLocation.location,
    mapDataValuesStore.time.currentRange,
    mapDataValuesStore.dataType,
    mapDataValuesStore.horizon.id,
    mapDataValuesStore.pattern,
  ]);

  const data = DASHBOARD_CONFIG[slidesStore.currentSlide as Slide];
  const kpis = data?.kpis;

  if (!kpis) return null;

  return (
    <div
      className={style.performance}
      style={{
        gridTemplateRows: `repeat(${Math.min(kpis?.length ?? 0, 4)}, max-content)`,
      }}
    >
      {kpis.map((it) => {
        if (isOverviewChart(it)) {
          return (
            <OverviewChartItem key={it.key} chartIds={it.chartIds} title={it.title} column={it.column} row={it.row} />
          );
        }

        return (
          <OverviewValueItem
            key={it.key}
            kpiKey={it.kpiKey}
            title={it.title}
            titleSize={it.titleSize}
            value={it.value}
            valueSize={it.valueSize}
            caption={it.caption}
            compare={it.compare}
            valuePostfix={it.valuePostfix}
            column={it.column}
            row={it.row}
            actions={it.actions}
          />
        );
      })}
    </div>
  );
});
