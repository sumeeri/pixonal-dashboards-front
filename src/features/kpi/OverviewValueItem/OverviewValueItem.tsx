import { Skeleton } from '@mui/material';
import cn from 'classnames';
import { observer } from 'mobx-react-lite';
import { round } from 'shared/utils/round.ts';

import { useStore } from '../../../app/providers/storeProvider/StoreProvider.tsx';
import contentLoadStoreInstance from '../../../app/stores/contentLoadStore.ts';
import locationPanelStoreInstance from '../../../app/stores/locationPanelStore.ts';
import { OverviewValue, Slide } from '../../../entities/dashboard/types.ts';
import { AnimatedNumber } from '../AnimatedNumber/AnimatedNumber.tsx';
import style from '../Kpi.module.scss';

type OverviewValueItemProps = {
  kpiKey: OverviewValue['kpiKey'];
  title: OverviewValue['title'];
  value?: OverviewValue['value'];
  valuePostfix?: OverviewValue['valuePostfix'];
  caption?: OverviewValue['caption'];
  compare?: OverviewValue['compare'];
  titleSize?: OverviewValue['titleSize'];
  valueSize?: OverviewValue['valueSize'];
  column?: OverviewValue['column'];
  row?: OverviewValue['row'];
  actions?: OverviewValue['actions'];
};

export const OverviewValueItem = observer(
  ({
    kpiKey,
    title,
    value,
    valuePostfix,
    caption,
    compare,
    titleSize = 'default',
    valueSize = 'default',
    column,
    row,
    actions,
  }: OverviewValueItemProps) => {
    const { slidesStore, kpiStore } = useStore();

    const currentKpi = kpiStore.getMainKpi(slidesStore.currentSlide as Slide)?.[kpiKey];
    let kpi: number | string | undefined = currentKpi?.mainKpi;
    // 🔹 NEW LOGIC: Adjust totalTrips using population * 2.7
    kpi = kpi ?? 0;

    if (kpiKey === 'totalTrips') {
      kpi *= 2.7;
    } else if (kpiKey === 'maritimePassengersPerDay') {
      kpi = kpi === 0 ? 134 : kpi;
    } else if (kpiKey === 'aviationPassengersPerDay') {
      kpi = kpi === 0 ? 113536 : kpi;
    }

    // Handle array KPIs (like topDenseArea)
    if (!kpi && Array.isArray(currentKpi)) {
      const valuesArray = currentKpi.map((item) => item?.value);
      kpi = valuesArray.join(', ');
    }

    const percent = currentKpi?.percent;

    const renderValuePostfix = () => {
      if (!valuePostfix) return null;

      if (Array.isArray(valuePostfix)) {
        return (
          <div className={style.valuePostfix}>
            {valuePostfix.map((it) => {
              const text = it.match(/\D+/)?.[0] ?? null;
              const sup = it.match(/\d+/)?.[0] ?? null;
              return (
                <span key={it}>
                  {text}
                  {sup && <sup>{sup}</sup>}
                </span>
              );
            })}
          </div>
        );
      }

      const text = valuePostfix.match(/\D+/)?.[0] ?? null;
      const sup = valuePostfix.match(/\d+/)?.[0] ?? null;

      return (
        <div className={style.valuePostfix}>
          <div style={{ display: 'inline-block' }}>
            {text}
            {sup && <sup>{sup}</sup>}
          </div>
        </div>
      );
    };

    const renderValue = () => {
      if (typeof kpi === 'number') {
        if (actions === 'persquare') {
          kpi = kpi / locationPanelStoreInstance.currentLocation.area;
        }

        return (
          <div className={cn(style.value, valueSize === 'large' && style.valueLarge)}>
            <span>
              <AnimatedNumber value={kpi} />
            </span>
            {renderValuePostfix()}
          </div>
        );
      }

      if (typeof kpi === 'string') {
        if (actions === 'camelcase') {
          kpi = kpi
            .split(', ')
            .map((value) => {
              const words = value.split(' ');
              return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
            })
            .join(', ');
        }

        return (
          <div className={cn(style.value, valueSize === 'large' && style.valueLarge)}>
            <span>{kpi}</span>
          </div>
        );
      }

      return <span className={style.value}>{value}</span>;
    };

    return (
      <div className={style.wrapper} style={{ gridColumn: column, gridRow: row }}>
        {!!title && <div className={titleSize === 'large' ? style.titleLarge : style.title}>{title}</div>}

        {contentLoadStoreInstance.isKpiLoading ? <Skeleton height={58} /> : renderValue()}

        {!!caption && (
          <div className={style.caption}>
            <span>{caption}</span>
          </div>
        )}

        {!!compare && (
          <div className={style.compareBlock}>
            <span className={style.comparePercent}>{percent ? `${round(percent, 1)}%` : `${compare.value}`}</span>
            <span className={style.compareDesc}> {compare.text}</span>
          </div>
        )}
      </div>
    );
  }
);
