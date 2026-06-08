import {
  eachQuarterOfInterval,
  endOfMonth,
  endOfQuarter,
  getYear,
  lastDayOfMonth,
  startOfMonth,
  startOfQuarter,
  subQuarters,
} from 'date-fns';
import { action, makeObservable, observable, runInAction } from 'mobx';
import { DateRange } from 'react-day-picker';
import { DataType, mapDataHorizons, PatternsTypes } from 'shared/constants/mapDataParams.ts';
import { IDateRange } from 'shared/interfaces';

import { HorizonValue, Pattern, Periods, ValuesTypes } from '../../entities/dashboard/types.ts';
import TimeModel from './models/TimeModel.ts';

export class MapDataValuesStore {
  dataType: DataType | undefined = undefined;
  calendarPattern: IDateRange = { from: new Date(2025, 1, 8), to: new Date(2025, 1, 8) };
  currentPatternType: PatternsTypes = PatternsTypes.PEOPLE_DENSITY;

  activeIndex: number = 0;

  time = new TimeModel();

  timeType: ValuesTypes = ValuesTypes.RANGE;
  allowedTimeTypes: ValuesTypes[] = [];
  horizon: HorizonValue =
    mapDataHorizons.find((horizon) => {
      const currentHorizonValue = this.getClosestHorizonInFuture(true);

      return horizon.id === currentHorizonValue;
    }) ?? mapDataHorizons[1];
  pattern: Pattern | undefined = undefined;
  timeName: string | undefined = '';

  isDataTypeActive: boolean = true;
  isBordersVisible: boolean = false;
  isDateRangePanelOpen: boolean = false;

  constructor() {
    makeObservable(this, {
      dataType: observable,
      calendarPattern: observable,
      time: observable,
      horizon: observable,
      pattern: observable,
      timeName: observable,
      timeType: observable,
      isDataTypeActive: observable,
      isBordersVisible: observable,
      currentPatternType: observable,
      isDateRangePanelOpen: observable,
      setDateRangePanelOpen: action,
      setCalendarPattern: action,
      setTime: action,
      setTimeType: action,
      setTimeName: action,
      setHorizon: action,
      setPattern: action,
      setIsDataTypeActive: action,
      setIsBordersVisible: action,
      setCurrentPatternType: action,
    });

    this.time.defaultRange = this.getLastFinishedQuarter();
  }

  setCurrentPatternType(type: PatternsTypes) {
    this.currentPatternType = type;
  }

  setDateRangePanelOpen(value: boolean) {
    this.isDateRangePanelOpen = value;
  }

  public getDefaultTimePeriod() {
    const lastQuarter = subQuarters(new Date(), 1);

    const quarterStart = startOfQuarter(lastQuarter);
    const quarterEnd = endOfQuarter(lastQuarter);

    return { from: quarterStart, to: quarterEnd };
  }

  public getClosestHorizonInFuture(byDefault?: boolean): number {
    const defaultAllowed = byDefault;

    if (this.time.currentPeriod === Periods.Horizons && !defaultAllowed) {
      return this.horizon.id;
    }

    const currentDate = defaultAllowed ? new Date() : this.time.currentRange.to!;
    const currentYear = getYear(currentDate);

    const closestHorizonInFuture = mapDataHorizons.find((dataHorizon) => currentYear <= dataHorizon.id);

    return closestHorizonInFuture?.id ?? this.horizon.id;
  }

  getClosetHorizonInPast() {
    if (this.time.currentPeriod === Periods.Horizons) {
      return this.horizon.id;
    }

    const currentDate = this.time.currentRange.to!;
    const currentYear = getYear(currentDate);

    const closestHorizonInPast = mapDataHorizons.filter((dataHorizon) => currentYear >= dataHorizon.id).pop();

    return closestHorizonInPast?.id ?? this.horizon.id;
  }

  public getLastFinishedYear(byDefault?: boolean): number {
    const defaultAllowed = byDefault;

    if (this.time.currentPeriod === Periods.Horizons && !defaultAllowed) {
      return this.horizon.id - 1;
    }

    const currentDate = defaultAllowed ? new Date() : this.time.currentRange.from!;
    const currentYear = getYear(currentDate);

    return currentYear;
  }

  public getLastFinishedQuarter(byDefault?: boolean, id?: string): IDateRange {
    let quarterStart: Date;
    let quarterEnd: Date;

    switch (id) {
      case 'maritimeTrips':
      case 'airPassengers':
        quarterStart = new Date(2024, 3, 1);
        quarterEnd = new Date(2024, 5, 30);
        break;

      default:
        const defaultAllowed = byDefault;

        if (!defaultAllowed) {
          return this.time.currentRange as IDateRange;
        }

        let currentDate = defaultAllowed ? new Date() : this.time.currentRange.from!;

        if (this.time.currentPeriod === Periods.Horizons) {
          currentDate = new Date(this.horizon.id, 0, 1);
        }

        const lastQuarter = subQuarters(currentDate, 1);

        quarterStart = startOfQuarter(lastQuarter);
        quarterEnd = endOfQuarter(lastQuarter);
        break;
    }

    return { from: quarterStart, to: quarterEnd };
  }

  public getLastFinishedYearBeforeSelectedHorizon() {
    const currentYear = new Date().getFullYear();

    const horizon = Number(this.horizon.name);

    let finishedYear: number = horizon;

    if (currentYear <= horizon) {
      finishedYear = currentYear - 1;
    }

    return { from: new Date(finishedYear, 0, 1), to: new Date(finishedYear, 11, 31) };
  }

  public getQuartersForCurrentPeriod() {
    const currentPeriod = this.time.currentRange;

    const quarters = eachQuarterOfInterval({ start: currentPeriod.from!, end: currentPeriod.to! });

    return { from: startOfQuarter(quarters[0]), to: endOfQuarter(quarters[quarters.length - 1]) };
  }

  public getFirstMonthOfCurrentQuarter() {
    const currentPeriod = this.time.currentRange;

    const quarters = eachQuarterOfInterval({ start: currentPeriod.from!, end: currentPeriod.to! });

    const firstDay = startOfQuarter(quarters[0]);

    const firstMonthOfLastQuarter = startOfQuarter(quarters[quarters.length - 1]);

    const lastDay = lastDayOfMonth(firstMonthOfLastQuarter);

    return { from: firstDay, to: lastDay };
  }

  public getLastMonthOfCurrentQuarter() {
    const to = this.time.currentRange.to ?? new Date();

    const quarterEnd = endOfQuarter(to);
    return {
      from: startOfMonth(quarterEnd),
      to: quarterEnd,
    };
  }

  public getAllMonthsOfCurrentPeriod() {
    const from = this.time.currentRange.from ?? new Date();
    const to = this.time.currentRange.to ?? new Date();

    return {
      from: startOfMonth(from),
      to: endOfMonth(to),
    };
  }

  setHorizon(horizon: HorizonValue) {
    this.horizon = horizon;
    this.time.changedTimeTypes.horizon = true;
  }

  setPattern(pattern?: Pattern) {
    this.pattern = pattern;
  }

  setDataType(type: DataType | undefined) {
    runInAction(() => {
      this.dataType = undefined;
    });
    runInAction(() => {
      this.dataType = type;
      this.isDataTypeActive = true;
    });
  }

  setCalendarPattern(date: IDateRange) {
    this.calendarPattern = date;
  }

  resetCalendarPattern() {
    this.setCalendarPattern({ from: this.time.currentRange.from!, to: this.time.currentRange.to! });
  }

  setTime(date: DateRange) {
    this.time.setTime(date);

    this.resetCalendarPattern();
  }

  setDefaultTime(date: DateRange) {
    this.time.setDefaultTime(date);

    this.resetCalendarPattern();
  }

  setPeriod(period: Periods) {
    this.time.setPeriod(period);
  }

  setTimeType(type: ValuesTypes) {
    this.timeType = type;
  }

  setAllowedTimeTypes(types: ValuesTypes[]) {
    this.allowedTimeTypes = types;

    const sortedTypes = [...types].sort(
      (a, b) => Object.values(ValuesTypes).indexOf(a) - Object.values(ValuesTypes).indexOf(b)
    );

    const minimalTypeElement = sortedTypes[0];

    this.setTimeType(minimalTypeElement);
  }

  setTimeName(name: string | undefined) {
    this.timeName = name;
  }

  setIsDataTypeActive(value: boolean) {
    this.isDataTypeActive = value;
  }

  setIsBordersVisible(value: boolean) {
    this.isBordersVisible = value;
  }

  setActiveIndex(index: number) {
    this.activeIndex = index;
  }
}

const mapDataValuesStoreInstance = new MapDataValuesStore();
export default mapDataValuesStoreInstance;
