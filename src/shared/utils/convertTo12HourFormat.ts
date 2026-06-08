export const convertTo12HourFormat = (timeIn24HoursFormat: string) => {
  const [hours, minutes] = timeIn24HoursFormat.split(':').map(Number);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  const formattedHours = hours12.toString();
  const formattedMinutes = minutes.toString().padStart(2, '0');

  return `${formattedHours}:${formattedMinutes} ${suffix}`;
};
