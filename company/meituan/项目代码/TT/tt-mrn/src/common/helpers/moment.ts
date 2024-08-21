import moment from 'moment-timezone';
import store from '../../pages/tt/redux/store';

const defaultTimeZoneList = new Map([
    ['GMT+08:00', 'Asia/Shanghai'],
    ['GMT+03:00', 'Asia/Riyadh'],
]);

const momentWithTimeZone = (...args) => {
    const { timeZone } = store.getState();
    const { timeZone: selectedTimeZone, timeZoneList } = timeZone || {};

    const options = timeZoneList || defaultTimeZoneList;
    const currentTimeZone = options.get(selectedTimeZone) || 'Asia/Shanghai';

    return moment.tz(...args, currentTimeZone);
};

export default momentWithTimeZone;
