import { Skeleton } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { ReactNode } from 'react';
import { useAnimatedNumber } from 'shared/utils/useAnimatedNumber.ts';

import { useStore } from '../../../app/providers/storeProvider/StoreProvider.tsx';
import { MobilityOverviewCard } from '../../../entities/mobilityOverviewPanel/types.ts';
import style from './InfoCard.module.scss';

type InfoCardData = {
  name: string;
  value?: number;
  valueUnit?: string;
  date?: string;
  isLoading?: boolean;
};

type InfoCardProps = {
  title: string;
  items: MobilityOverviewCard['kpis'];
  icon?: ReactNode;
  disabled?: boolean;
  isLoading?: boolean;
  onClick?: () => void;
};

const InfoCardData = (item: InfoCardData) => {
  // const animatedValue = useAnimatedNumber(item.isLoading ? 0 : item.value || 0);

  // Fix for 2.7 factor on mobilty trips
  let baseValue = item.isLoading ? 0 : item.value || 0;

  // Apply your multiplier logic *before* passing into the animation hook
  if (item.name === 'No of Trips') {
    baseValue = baseValue * 2.7;
  }

  const animatedValue = useAnimatedNumber(baseValue);

  return (
    <div className={style.kpiBlock} key={item.name}>
      <span className={style.kpiName}>{item.name}</span>
      {item.isLoading ? (
        <Skeleton height="28px" sx={{ marginBottom: '8px' }} />
      ) : (
        <span className={style.kpiValue}>
          {item.value !== undefined ? Math.round(animatedValue).toLocaleString('en-US') : 'N/A'}
          {item.valueUnit && <span className={style.kpiValueUnit}>{item.valueUnit}</span>}
        </span>
      )}
      {item.date && <span className={style.kpiDate}>{item.date}</span>}
    </div>
  );
};

export const InfoCard = observer(
  ({ title, icon = null, items, onClick, isLoading = false, disabled }: InfoCardProps) => {
    const { kpiStore } = useStore();

    return (
      <div className={`${style.wrapper} ${disabled ? style.disabled : ''}`} onClick={onClick}>
        <div className={style.title}>
          {icon}
          <span>{title}</span>
        </div>
        {items.map(({ id, name, ...rest }) => {
          return (
            <InfoCardData
              key={id}
              name={name}
              value={kpiStore.getMobilityOverviewKpis(id)}
              isLoading={isLoading}
              {...rest}
            />
          );
        })}
      </div>
    );
  }
);
