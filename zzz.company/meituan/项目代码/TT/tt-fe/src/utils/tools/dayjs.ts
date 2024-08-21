import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import store from '../../store';

dayjs.extend(utc);
dayjs.extend(timezone);

// 默认
const timeZone = new Map([
    ['GMT+08:00', 'Asia/shanghai'],
    ['GMT+03:00', 'Asia/Riyadh']
]);

type tzFunctionParams = [date?: dayjs.ConfigType, forma?: string, timezone?: string];

const dayjsWithTimeZone = (...args: tzFunctionParams) => {
    const options = store.getters.timeZoneList || timeZone;
    console.log(options.get(store.getters.timeZone));
    dayjs.tz.setDefault(options.get(store.getters.timeZone));
    return dayjs.tz(...args);
};

export default dayjsWithTimeZone;
