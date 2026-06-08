import { TimelineAggregation } from '../../../../entities/dashboard/types';

export const TIMEPOINTS_AGGREGATIONS = [
  { value: 'Entire', label: 'Entire Range' },
  { value: 'Typical', label: 'Typical Day' },
];

export const TIMEPOINTS_AGGREGATIONS_VALUES = {
  [TimelineAggregation.ENTIRE]: 'Entire',
  [TimelineAggregation.TYPICAL]: 'Typical',
};
