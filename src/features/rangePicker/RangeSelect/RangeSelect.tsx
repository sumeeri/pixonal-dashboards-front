import { observer } from 'mobx-react-lite';
import { useMemo } from 'react';
import { SelectTimeChevronDownIcon } from 'shared/icons';
import { formatDateRange } from 'shared/utils/formatDateRange.ts';

import mapDataValuesStoreInstance from '../../../app/stores/mapDataValuesStore';
import style from './RangeSelect.module.scss';

export const RangeSelect = observer(
  ({ startDate, endDate, onClick }: { startDate: Date; endDate?: Date; onClick: () => void }) => {
    const currentRangeTitle = useMemo(() => {
      return mapDataValuesStoreInstance.time.currentRangeString.length > 0
        ? `Range (${mapDataValuesStoreInstance.time.currentRangeString})`
        : 'Range';
    }, [mapDataValuesStoreInstance.time.currentRangeString]);

    return (
      <button className={style.wrapper} onClick={onClick}>
        <div className={style.content}>
          <div className={style.title}>{currentRangeTitle}</div>
          <div className={style.range}>{formatDateRange(startDate, endDate)}</div>
        </div>
        <SelectTimeChevronDownIcon />
      </button>
    );
  }
);
