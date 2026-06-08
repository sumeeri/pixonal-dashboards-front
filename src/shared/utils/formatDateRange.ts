import { format } from 'date-fns/format';

export const formatDateRange = (startDate?: Date, endDate?: Date) => {
  if (!startDate || !endDate) return;
  return `${format(startDate, 'PP')} - ${format(endDate, 'PP')}`;
};
