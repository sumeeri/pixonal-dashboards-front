import { observer } from 'mobx-react-lite';

import { useStore } from '../../../app/providers/storeProvider/StoreProvider.tsx';
import { CHARTS_CONFIG } from '../../../entities/charts/config.ts';
import { OverviewChart, Slide } from '../../../entities/dashboard/types.ts';
import { ExploreDataChart } from '../../../widgets/exploreDataChart/ExploreDataChart.tsx';
import style from '../Kpi.module.scss';

type OverviewChartItemProps = {
  chartIds: OverviewChart['chartIds'];
  title?: OverviewChart['title'];
  column?: OverviewChart['column'];
  row?: OverviewChart['row'];
};

export const OverviewChartItem = observer(({ chartIds, title, column, row }: OverviewChartItemProps) => {
  const { slidesStore } = useStore();

  const config = CHARTS_CONFIG[slidesStore.currentSlide as Slide]?.filter((it) => chartIds.includes(it.id));

  const charts = config?.map((props) => (
    <ExploreDataChart key={props.id} slide={slidesStore.currentSlide as Slide} {...props} isOverview />
  ));

  return (
    <div className={style.wrapper} style={{ gridColumn: column, gridRow: row }}>
      {title ? <div className={style.titleLarge}>{title}</div> : null}

      <div className={style.exploreChart}>{charts}</div>
    </div>
  );
});
