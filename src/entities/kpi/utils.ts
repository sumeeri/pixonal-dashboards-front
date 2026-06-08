import { OverviewChart, OverviewValue } from '../dashboard/types';

export function isOverviewChart(item: OverviewValue | OverviewChart): item is OverviewChart {
  return (item as OverviewChart).chartIds !== undefined;
}
