import { observer } from 'mobx-react-lite';
import { useMemo } from 'react';
import { CalendarIcon, ChevronDownIcon } from 'shared/icons';
import { formatDateRange } from 'shared/utils/formatDateRange.ts';

import { useStore } from '../../../app/providers/storeProvider/StoreProvider.tsx';
import { ValuesTypes } from '../../../entities/dashboard/types.ts';
import style from './TimeSelect.module.scss';

export const TimeSelect = observer(() => {
  const { mapDataValuesStore } = useStore();
  const { time, timeType, horizon, pattern } = mapDataValuesStore;

  const currentRange = useMemo(() => {
    return time.currentRangeString.length > 0 ? ` (${time.currentRangeString})` : '';
  }, [time.currentRangeString]);

  let timeNameClassName = style.timeName;

  if (timeType === ValuesTypes.RANGE) {
    timeNameClassName += ' ' + style.timeDelimiter;
  }

  const dateForCurrentType = () => {
    switch (timeType) {
      case ValuesTypes.RANGE:
        return <span className={style.time}>{formatDateRange(time.currentRange.from, time.currentRange.to)}</span>;
      case ValuesTypes.HORIZON:
        return <span className={timeNameClassName}>{horizon.name}</span>;
      case ValuesTypes.PATTERN:
        return <span className={timeNameClassName}>{pattern?.name}</span>;
    }
  };

  return (
    <>
      <button
        className={style.wrapper}
        onClick={() => mapDataValuesStore.setDateRangePanelOpen(true)}
        aria-label={'set time'}
      >
        <CalendarIcon />
        <span className={style.timeType + ' ' + style.timeDelimiter}>{timeType + currentRange}</span>
        {dateForCurrentType()}
        <ChevronDownIcon />
      </button>
    </>
  );
});
