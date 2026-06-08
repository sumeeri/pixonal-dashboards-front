import {
  addDays,
  addMonths,
  addQuarters,
  differenceInDays,
  endOfDay,
  endOfMonth,
  endOfQuarter,
  endOfWeek,
  isSameMonth,
  isSameQuarter,
  isSameYear,
  startOfDay,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
} from 'date-fns';
import { MapDataAggregationTimeType, MapDataAggregationType } from 'shared/constants/mapDataParams';
import { IDateRange } from 'shared/interfaces';

import { TimelineAggregation } from '../../entities/dashboard/types';
import timeIntervalsStoreInstance from '../stores/timeIntervalsStore';

export const getDateRangeByCurrentRangeAndIndex = (
  startDate: Date,
  endDate: Date,
  index: number,
  hasDefaultMonthlyType: boolean = false,
  aggregationTimeCoefficient: MapDataAggregationTimeType = MapDataAggregationTimeType.MINUTES
): IDateRange => {
  const currentAggregationType = getCurrentAggregationType(startDate, endDate, hasDefaultMonthlyType);

  const startDateCopy = new Date(startDate);
  const endDateCopy = new Date(endDate);

  switch (currentAggregationType) {
    case MapDataAggregationType.MONTHLY: {
      const currentMonth = addMonths(startDateCopy, index);

      const currentMonthStart = startOfMonth(currentMonth);
      const currentMonthEnd = endOfMonth(currentMonth);

      const isStartedOnFirstMonthOfRange = isSameMonth(currentMonthStart, startDate);

      const currentStartDate = isStartedOnFirstMonthOfRange ? startDate : currentMonthStart;
      const currentEndDate = currentMonthEnd;

      return { from: currentStartDate, to: currentEndDate };
    }

    case MapDataAggregationType.QUARTERLY: {
      const currentQuarter = addQuarters(startDateCopy, index);

      const currentQuarterStart = startOfQuarter(currentQuarter);
      const currentQuarterEnd = endOfQuarter(currentQuarter);

      const isStartedOnFirstQuarterOfRange = isSameQuarter(currentQuarterStart, startDate);
      const isEndedOnLastQuarterOfRange = isSameQuarter(currentQuarterEnd, endDate);

      const currentStartDate = isStartedOnFirstQuarterOfRange ? startDate : currentQuarterStart;
      const currentEndDate = isEndedOnLastQuarterOfRange ? endDate : currentQuarterEnd;

      return { from: currentStartDate, to: currentEndDate };
    }

    case MapDataAggregationType.DAILY: {
      const currentDay = addDays(startDateCopy, index);

      const currentDayStart = startOfDay(currentDay);
      const currentDayEnd = endOfDay(currentDay);

      return { from: currentDayStart, to: currentDayEnd };
    }

    case MapDataAggregationType.TYPICAL_DAY:
    case MapDataAggregationType.AVERAGE_DAY:
    default: {
      if (aggregationTimeCoefficient === MapDataAggregationTimeType.MINUTES) {
        startDateCopy.setMinutes(index * aggregationTimeCoefficient);
        endDateCopy.setMinutes(index * aggregationTimeCoefficient);
      } else {
        startDateCopy.setHours(index * aggregationTimeCoefficient);
        endDateCopy.setHours(index * aggregationTimeCoefficient);
      }

      return { from: startDateCopy, to: endDateCopy };
    }
  }
};

export const getCurrentAggregationType = (
  startDate: Date,
  endDate: Date,
  hasDefaultMonthlyType: boolean = false
): MapDataAggregationType => {
  const difference = Math.abs(differenceInDays(endDate, startDate));

  const isDailyAggregationType = difference >= 1 && isSameMonth(endDate, startDate);
  const isMonthlyAggregationType = !isSameMonth(endDate, startDate) && isSameYear(endDate, startDate);
  const isQuarterlyAggregationType = !isSameYear(endDate, startDate);

  const isTypicalDayAggregationType = timeIntervalsStoreInstance.typeOfRange === TimelineAggregation.TYPICAL;

  if (isTypicalDayAggregationType) {
    return MapDataAggregationType.TYPICAL_DAY;
  }

  if (isDailyAggregationType && !hasDefaultMonthlyType) {
    return MapDataAggregationType.DAILY;
  }

  if (isQuarterlyAggregationType) {
    return MapDataAggregationType.QUARTERLY;
  }

  if (isMonthlyAggregationType || hasDefaultMonthlyType) {
    return MapDataAggregationType.MONTHLY;
  }

  return MapDataAggregationType.AVERAGE_DAY;
};

export const getDateRangeForKpi = (startDate: Date, endDate: Date, isRoadSlide: boolean) => {
  let startDateCopy = new Date(startDate);
  let endDateCopy = new Date(endDate);

  if (isRoadSlide) {
    startDateCopy = startOfWeek(startDateCopy);
    endDateCopy = endOfWeek(endDateCopy);
  } else {
    startDateCopy.setDate(1);

    const lastDayOfMonth = endOfMonth(endDateCopy).getDate();
    endDateCopy.setDate(lastDayOfMonth);
  }

  return { startDate: startDateCopy, endDate: endDateCopy };
};
