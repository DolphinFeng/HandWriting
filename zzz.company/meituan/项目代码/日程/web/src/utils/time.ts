import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const dayjsWithTimeZone = (date, tz) => {
  dayjs.tz.setDefault(tz);
  return dayjs.tz(date);
};
