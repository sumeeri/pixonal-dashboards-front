import { Modify } from 'shared/utils/types.ts';

import { UserPermissions } from '../admin/users/types.ts';
import { MainKpi } from '../dashboard/types.ts';

export type MainKpiRequestParams =
  | 'location'
  | 'locationType'
  | 'startDate'
  | 'endDate'
  | 'quarter'
  | 'defaultQuarter'
  | 'horizon'
  | 'defaultHorizon'
  | 'year'
  | 'defaultYear'
  | 'consumptor'
  | 'RegionLocationAndLocationType'
  | 'quartersForCurrentPeriod'
  | 'allMonthOfCurrentPeriod';

export type MainKpiResponse = { [key: string]: MainKpi };

export type MainKpiConfig = {
  url: string;
  id: string;
  params?: MainKpiRequestParams[];
  mock?: number;
  permission?: UserPermissions;
};

export type MainKpiEnrichedConfig = Modify<MainKpiConfig, { params: Record<MainKpiRequestParams, string | number> }>;

export type KpiConfig = MainKpiConfig[];

export type KpiEnrichedConfig = MainKpiEnrichedConfig[];
