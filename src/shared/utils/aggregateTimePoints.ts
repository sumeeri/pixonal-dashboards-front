import { DataForTimeInterval, ITimePoint, ITimePointsData } from '../../entities/dashboard/types';

export const aggregateTimePoints = (data: DataForTimeInterval): ITimePointsData => {
  const aggregatedPointsValues: ITimePoint[] = [];

  data.columns?.forEach((columnName, index) => {
    const currentValuesArray: number[] = [];

    data.values?.forEach((valuesArray) => {
      currentValuesArray.push(valuesArray?.[index] ?? 0);
    });

    const timePointData: ITimePoint = {
      axisName: columnName,
      values: currentValuesArray,
    };

    aggregatedPointsValues.push(timePointData);
  });

  return {
    timestamps: data.xData,
    xDataType: data.xDataType,
    pointValues: aggregatedPointsValues,
  };
};
