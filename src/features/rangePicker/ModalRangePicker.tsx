import { Button, IconButton, Modal, Tooltip } from '@mui/material';
import { endOfMonth, getQuarter, isSameDay, startOfMonth } from 'date-fns';
import { lastDayOfMonth } from 'date-fns/lastDayOfMonth';
import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useState } from 'react';
import { DateRange } from 'react-day-picker';
import { AlertIcon } from 'shared/icons';
import { IDateRange } from 'shared/interfaces';
import { DateRangePicker } from 'shared/ui/DateRangePicker/DateRangePicker.tsx';
import { formatDateRange } from 'shared/utils/formatDateRange.ts';

import { useStore } from '../../app/providers/storeProvider/StoreProvider.tsx';
import timeIntervalsStoreInstance from '../../app/stores/timeIntervalsStore.ts';
import { Periods } from '../../entities/dashboard/types.ts';
import style from './ModalRangePicker.module.scss';

interface IRangeItems {
  range: IDateRange;
  name: string;
}

export const ModalRangePicker = observer(
  ({
    open,
    onClose,
    setData,
  }: {
    open: boolean;
    onClose: () => void;
    setData: (data: { value: DateRange }) => void;
  }) => {
    const { mapDataValuesStore, patternStore } = useStore();
    const [range, setRange] = useState<IDateRange>(mapDataValuesStore.calendarPattern);

    const eventRangeItems = useMemo(() => {
      if (mapDataValuesStore.currentPatternType) {
        return patternStore.patternsMap.get(mapDataValuesStore.currentPatternType);
      }
    }, [patternStore.patternsMap]);

    const isMonthlySelect = mapDataValuesStore.time.currentPeriod === Periods.Months;

    const getQuarterDateRange = (year: number, numberOfQuarter: number) => {
      const firstMonthOfQuarter = numberOfQuarter - 1;

      const lastMonthDay = lastDayOfMonth(new Date(year, firstMonthOfQuarter * 3 + 2, 1)).getDate();

      return {
        from: new Date(year, firstMonthOfQuarter * 3, 1),
        to: new Date(year, firstMonthOfQuarter * 3 + 2, lastMonthDay),
      };
    };

    const getDateToCurrentDayRange = () => {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      return { from: new Date(currentYear, 0, 1), to: currentDate };
    };

    const getYearRange = (year: number) => {
      return { from: new Date(year, 0, 1), to: new Date(year, 11, 31) };
    };

    const getRangeItems = () => {
      const quartersRangeItems: IRangeItems[] = [];

      const currentDate = new Date();
      const currentQuarterNumber = getQuarter(currentDate);
      const currentYear = currentDate.getFullYear();

      let previousQuarterNumber = currentQuarterNumber;
      let previousYear = currentYear;

      for (let i = 0; i < 3; i++) {
        previousQuarterNumber = previousQuarterNumber - 1;
        if (previousQuarterNumber < 1) {
          previousQuarterNumber = 4;
          previousYear--;
        }

        quartersRangeItems.push({
          name: `Q${previousQuarterNumber} ${previousYear}`,
          range: getQuarterDateRange(previousYear, previousQuarterNumber),
        });
      }

      return [
        {
          name: `Q${currentQuarterNumber} ${currentYear}`,
          range: getQuarterDateRange(currentYear, currentQuarterNumber),
        },
        ...quartersRangeItems,
        { name: 'Year to Date', range: getDateToCurrentDayRange() },
        { name: `${currentYear - 1}`, range: getYearRange(currentYear - 1) },
      ];
    };

    const currentRangeStart = isMonthlySelect ? startOfMonth(range.from) : range.from;
    const currentRangeEnd = isMonthlySelect ? endOfMonth(range.to) : range.to;

    const currentRange = { from: currentRangeStart, to: currentRangeEnd };

    const isCurrentRangeDifferFromRange =
      !isSameDay(currentRangeStart, range.from) || !isSameDay(currentRangeEnd, range.to);

    const submitHandler = () => {
      mapDataValuesStore.setCalendarPattern(currentRange);
      timeIntervalsStoreInstance.setDefaultState();
      // TODO: add name for calendar pattern to store and add it to data
      setData({ value: currentRange as DateRange });
      onClose();
    };

    const resetHandler = () => {
      mapDataValuesStore.resetCalendarPattern();
      setRange(mapDataValuesStore.calendarPattern);
      onClose();
    };

    const setCurrentRange = () => {
      setRange(currentRange);
    };

    useEffect(() => {
      setRange(mapDataValuesStore.calendarPattern);
    }, [mapDataValuesStore.calendarPattern]);

    return (
      <Modal open={open} onClose={onClose}>
        <div className={style.wrapper}>
          <DateRangePicker
            onRangeChange={setRange}
            range={range}
            rangeItems={getRangeItems()}
            eventRangeItems={eventRangeItems}
          />

          <div className={style.footer}>
            <div>
              <div className={style.selectedRangeHeader}>Selected Range</div>

              <div className={style.selectedRangeWrapper}>
                <div className={style.selectedRange}>{formatDateRange(currentRangeStart, currentRangeEnd)}</div>

                {isCurrentRangeDifferFromRange && (
                  <Tooltip title="The selection is available only by month" placement="top" disableInteractive>
                    <IconButton sx={{ width: 14, height: 14, padding: 0 }} onClick={setCurrentRange}>
                      <AlertIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </div>
            </div>
            <div className={style.buttons}>
              <Button size="small" variant="outlined" onClick={resetHandler}>
                cancel
              </Button>
              <Button size="small" color="secondary" variant="contained" onClick={submitHandler}>
                done
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
);
