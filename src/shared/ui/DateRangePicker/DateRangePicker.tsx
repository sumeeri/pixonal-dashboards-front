import 'react-day-picker/dist/style.css';

import { MenuItem, SelectChangeEvent } from '@mui/material';
import { addMonths, isSameDay, subMonths } from 'date-fns';
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { DateRange, DayPicker, DropdownProps } from 'react-day-picker';
import { ChevronDownIcon, ExpandAccordionIcon } from 'shared/icons';

import { Pattern } from '../../../entities/dashboard/types.ts';
import { IDateRange } from '../../interfaces';
import * as S from './DateRangePicker.styles.ts';

interface IRangeItems {
  range: IDateRange;
  name: string;
}

interface IProps {
  range: IDateRange;
  rangeItems?: IRangeItems[];
  eventRangeItems?: Pattern[];
  monthStart?: Date | null;
  onRangeChange: (range: IDateRange) => void;
}

const START_DATE = new Date(2021, 0);
const END_DATE = new Date(2030, 11, 31);

export const DateRangePicker = (props: IProps) => {
  const { range, rangeItems = [], eventRangeItems = [], monthStart, onRangeChange } = props;

  const [monthRange, setMonthRange] = useState<IDateRange>({
    from: range.from,
    to: addMonths(range.from, 1),
  });

  useEffect(() => {
    if (!monthStart) {
      return;
    }

    handleSetMonth(monthStart, true);
  }, [monthStart]);

  const isCurrentRange = (from: Date, to: Date) => {
    const startDate = range.from;
    const endDate = range.to;

    const isEqualStartDate = isSameDay(from, startDate);
    const isEqualEndDate = isSameDay(to, endDate);

    return isEqualStartDate && isEqualEndDate;
  };

  const dateRangeValue = useMemo(() => {
    return rangeItems.find((item) => {
      return isCurrentRange(item.range.from, item.range.to);
    })?.name;
  }, [range.from, range.to, rangeItems]);

  const eventRangeValue = useMemo(() => {
    return (
      eventRangeItems.find((item) => {
        return isCurrentRange(item.date, item.date);
      })?.name ?? 'Select Custom Event'
    );
  }, [range.from, range.to, rangeItems]);

  const dropdownCallback = useCallback(({ value, onChange, options }: DropdownProps) => {
    const selected = options?.find((option) => option.value === value);

    return (
      <S.DayPickerSelect
        variant="outlined"
        IconComponent={ChevronDownIcon}
        onChange={(event: unknown) => {
          onChange?.(event as ChangeEvent<HTMLSelectElement>);
        }}
        defaultValue={selected?.value}
        value={value}
      >
        {options?.map((option, id: number) => {
          return (
            // eslint-disable-next-line react/no-array-index-key
            <MenuItem key={`${option.value}-${id}`} value={option.value?.toString() ?? ''}>
              {option.label}
            </MenuItem>
          );
        })}
      </S.DayPickerSelect>
    );
  }, []);

  const handleSetRange = (rangeData: IDateRange | undefined) => {
    if (!rangeData) {
      return;
    }

    onRangeChange(rangeData);
  };

  const handleSetMonth = (date: Date, isStartDate: boolean = false) => {
    if (isStartDate) {
      const secondPickerDate = addMonths(date, 1);

      return setMonthRange({ from: date, to: secondPickerDate });
    }

    const firstPickerDate = subMonths(date, 1);

    return setMonthRange({ from: firstPickerDate, to: date });
  };

  const handleSecondCalendarSelect = (range: DateRange | undefined) => {
    if (!range?.from || !range?.to) {
      return;
    }

    handleSetRange(range as IDateRange);
  };

  const handleChangeRangeItem = (value: string) => {
    const currentRangeItem = rangeItems.find((item) => item.name === value);

    if (!currentRangeItem) {
      return;
    }

    setMonthRange({
      from: currentRangeItem.range.from,
      to: addMonths(currentRangeItem.range.from, 1),
    });

    handleSetRange(currentRangeItem.range);
  };

  const handleChangeEventRangeItem = (value: string) => {
    const currentEventRangeItem = eventRangeItems.find((item) => item.name === value);

    if (!currentEventRangeItem) {
      return;
    }

    setMonthRange({
      from: currentEventRangeItem.date,
      to: currentEventRangeItem.date,
    });

    handleSetRange({ from: currentEventRangeItem.date, to: currentEventRangeItem.date });
  };

  return (
    <>
      {eventRangeItems.length !== 0 && (
        <S.EventRangeWrapper>
          <S.EventRangeSelect
            IconComponent={ExpandAccordionIcon}
            defaultValue="Select Custom Event"
            value={eventRangeValue}
            onChange={(e: SelectChangeEvent<unknown>) => handleChangeEventRangeItem(e.target.value as string)}
          >
            <MenuItem disabled value={'Select Custom Event'}>
              Select Custom Event
            </MenuItem>

            {eventRangeItems.map((item) => (
              <MenuItem key={item.name} value={item.name}>
                {item.name}
              </MenuItem>
            ))}
          </S.EventRangeSelect>
        </S.EventRangeWrapper>
      )}

      <S.DateRangePickerWrapper>
        {rangeItems.length > 0 && (
          <>
            <S.TabsBlock>
              <S.RangesButtonsGroup>
                {rangeItems.map((item) => {
                  const isCurrentItem = item.name === dateRangeValue;

                  return (
                    <S.RangeButton
                      key={item.name}
                      active={isCurrentItem}
                      onClick={() => handleChangeRangeItem(item.name)}
                    >
                      {item.name}
                    </S.RangeButton>
                  );
                })}
              </S.RangesButtonsGroup>
            </S.TabsBlock>

            <S.CalendarDivider />
          </>
        )}

        <DayPicker
          id={'datePicker'}
          captionLayout="dropdown"
          mode="range"
          fixedWeeks
          startMonth={START_DATE}
          endMonth={subMonths(END_DATE, 1)}
          selected={range}
          month={monthRange.from}
          onMonthChange={(date) => handleSetMonth(date, true)}
          onSelect={handleSecondCalendarSelect}
          ISOWeek
          components={{
            Dropdown: dropdownCallback,
          }}
        />

        <S.CalendarDivider />

        <DayPicker
          id={'datePicker'}
          captionLayout="dropdown"
          mode="range"
          fixedWeeks
          startMonth={addMonths(START_DATE, 1)}
          endMonth={END_DATE}
          selected={range}
          onSelect={handleSecondCalendarSelect}
          month={monthRange.to}
          onMonthChange={handleSetMonth}
          ISOWeek
          components={{
            Dropdown: dropdownCallback,
          }}
        />
      </S.DateRangePickerWrapper>
    </>
  );
};
