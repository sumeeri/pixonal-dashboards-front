import { makeAutoObservable } from 'mobx';
import { DateRange } from 'react-day-picker';
import { ChangedTimeTypes } from 'shared/interfaces';

import { Periods } from '../../../entities/dashboard/types';

class TimeModel {
  defaultRange?: DateRange;
  monthsRange?: DateRange;
  daysRange?: DateRange;
  patternsRange?: DateRange;

  changedTimeTypes: ChangedTimeTypes = { daysRange: false, monthsRange: false, patternsRange: false, horizon: false };

  currentPeriod: Periods = Periods.Days;

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true });
  }

  public get currentRange(): DateRange {
    switch (this.currentPeriod) {
      case Periods.Horizons:
      case Periods.Days: {
        return this.daysRange ?? this.defaultRange ?? { from: new Date(2025, 1, 8), to: new Date(2025, 1, 8) };
      }
      case Periods.Months: {
        return this.monthsRange ?? this.defaultRange ?? { from: new Date(2025, 1, 1), to: new Date(2025, 1, 28) };
      }

      case Periods.Patterns: {
        return this.patternsRange ?? this.defaultRange ?? { from: new Date(2025, 1, 1), to: new Date(2025, 1, 28) };
      }

      default: {
        return { from: new Date(2025, 1, 8), to: new Date(2025, 1, 8) };
      }
    }
  }

  public get wasChanged() {
    switch (this.currentPeriod) {
      case Periods.Days: {
        return this.changedTimeTypes.daysRange;
      }
      case Periods.Months: {
        return this.changedTimeTypes.monthsRange;
      }

      case Periods.Patterns: {
        return this.changedTimeTypes.patternsRange;
      }

      case Periods.Horizons: {
        return this.changedTimeTypes.horizon;
      }

      default: {
        return this.changedTimeTypes.daysRange;
      }
    }
  }

  public get currentRangeString(): string {
    if (this.currentPeriod === Periods.Months) {
      return 'Months';
    }

    return '';
  }

  public setDefaultTime(date: DateRange) {
    if (this.currentPeriod === Periods.Days && !this.daysRange) {
      this.defaultRange = date;
    }

    if (this.currentPeriod === Periods.Months && !this.monthsRange) {
      this.defaultRange = date;
    }

    if (this.currentPeriod === Periods.Patterns && !this.patternsRange) {
      this.defaultRange = date;
    }
  }

  public setTime(date: DateRange) {
    switch (this.currentPeriod) {
      case Periods.Days: {
        this.daysRange = date;
        this.changedTimeTypes.daysRange = true;
        return;
      }
      case Periods.Months: {
        this.monthsRange = date;
        this.changedTimeTypes.monthsRange = true;
        return;
      }

      case Periods.Patterns: {
        this.patternsRange = date;
        this.changedTimeTypes.patternsRange = true;
        return;
      }

      default: {
        return;
      }
    }
  }

  public setPeriod(period: Periods) {
    this.currentPeriod = period;
  }
}

export default TimeModel;
