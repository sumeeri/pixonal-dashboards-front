/** Format date as 01_12_2023 */
export const formatDateOld = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  // js counts months from 0, so add 1..
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString();
  return `${day}_${month}_${year}`;
};

/** Format date as 2023-12-01 */
export const formatDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  // js counts months from 0, so add 1..
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString();
  return `${year}-${month}-${day}`;
};

/** Format date as 2023-12-01 20:30:00 */
export const formatDateFull = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  // js counts months from 0, so add 1..
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/** Format date as 2023-12-01T20:30:00 in csharp style */
export const formatDateFullCSharp = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  // js counts months from 0, so add 1..
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

export function adjustToFullQuarters(startDate: Date, endDate: Date) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Adjust to the start of the quarter
  start.setMonth(Math.floor(start.getMonth() / 3) * 3, 1);
  start.setHours(0, 0, 0, 0);

  // Adjust to the end of the quarter
  end.setMonth(Math.floor(end.getMonth() / 3) * 3 + 3, 0);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}
