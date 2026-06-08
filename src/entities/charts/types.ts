import { Modify } from 'shared/utils/types.ts';

import { LocationType } from '../locationPanel/types';

export type KeyValue = { type: string; value: number };
export type StringValue = { type: string };
export type NumberValue = { [key: string]: number | string };

export type Charts = { [key: string]: KeyValue[] | StringValue[] | NumberValue };

export type ChartsRequestParams =
  | 'location'
  | 'locationType'
  | 'startDate'
  | 'endDate'
  | 'quarter'
  | 'horizon'
  | 'year'
  | 'rangeOfLastYearBeforeHorizon'
  | 'quartersForCurrentPeriod'
  | 'firstMonthOfCurrentQuarter'
  | 'horizonInPast'
  | 'horizon2025'
  | 'lastMonthOfQuarter'
  | 'allMonthsOfPeriod';

export type ChartsResponse = { [key: string]: Charts };

type ChartBaseOption = {
  url: string | string[];
  id: string;
  params?: ChartsRequestParams[] | ChartsRequestParams[][];
  name?: string;
  mock?: Charts[keyof Charts];
  unavailableLocation?: LocationType[];
};

type PieChartOption = ChartBaseOption & {
  type: 'pie';
};

type RingChartOption = ChartBaseOption & {
  type: 'ring';
};

type PercentChartOptions = ChartBaseOption & {
  type: 'percent';
};

type PerSquareChartOption = ChartBaseOption & {
  type: 'persquare';
  label?: string;
  valuePostfix?: string;
};

export type BarChartOption = ChartBaseOption & {
  type: 'bar';
  maxValue?: number;
  unit?: string;
  columnSize?: number;
  urlLabelsMapping?: string[];
};

type TableChartOption = ChartBaseOption & {
  type: 'table';
  keyLabel: string;
  valueLabel: string;
};

type ValueChartOption = ChartBaseOption & {
  type: 'value';
  label?: string;
  valuePostfix?: string;
  /** Round the displayed number to this many fraction digits (e.g. 0 for whole km). */
  valueDecimals?: number;
};

type ListChartOption = ChartBaseOption & {
  type: 'list';
  keyLabel: string;
};

type ProgressChartOption = ChartBaseOption & {
  type: 'progress';
};

export type ChartOption =
  | PieChartOption
  | PercentChartOptions
  | BarChartOption
  | ProgressChartOption
  | TableChartOption
  | ValueChartOption
  | PerSquareChartOption
  | RingChartOption
  | ListChartOption;

export type ChartEnrichedOptionParams = Record<ChartsRequestParams, string | number>;

export type ChartEnrichedOption = Modify<ChartOption, { params: ChartEnrichedOptionParams[] }>;

export type ChartConfig = ChartOption[];

export type ChartEnrichedConfig = ChartEnrichedOption[];
