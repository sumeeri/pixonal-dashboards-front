import { DataForTimeInterval } from '../../entities/dashboard/types.ts';

export const normalizeData = (data: DataForTimeInterval): DataForTimeInterval => {
  const max: number[] = [];

  data.values?.forEach((items) => {
    for (let j = 0; j < items.length; j++) {
      max[j] = Math.max(max[j] ?? 0, items[j]);
    }
  });

  const values = data.values?.map((items) => {
    return items.map((item, index) => {
      return max[index] !== 0 ? item / max[index] : 0;
    });
  });

  return { ...data, values: values };
};
