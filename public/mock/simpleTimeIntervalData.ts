import { DataForTimeInterval, TimelineXDataType } from '../../src/entities/dashboard/types';

export const simpleTimeIntervalData: DataForTimeInterval = {
  columns: ['Congested KM', 'No. of Accidents', 'No. of Failing Junctions'],
  types: ['float', 'int', 'int'],
  values: [],
  xData: [],
  xDataType: TimelineXDataType.Time,
};
