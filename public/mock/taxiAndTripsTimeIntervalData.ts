import { DataForTimeInterval, TimelineXDataType } from '../../src/entities/dashboard/types';

export const taxiAndTripsTimeIntervalData: DataForTimeInterval = {
  columns: ['No. of Trips', 'AVG Trip Distance', 'AVG Trip Time'],
  types: ['int', 'float', 'float'],
  values: [],
  xData: [],
  xDataType: TimelineXDataType.Time,
};
