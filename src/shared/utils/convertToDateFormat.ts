import { format } from 'date-fns';

export const convertToDateFormat = (date: string) => {
  const dateArray = date.split('-');

  return format(new Date(Number(dateArray[0]), Number(dateArray[1]) - 1, Number(dateArray[2])), 'd MMMM yyyy');
};
