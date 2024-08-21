import dayjs from 'dayjs';
// 格式化时间
export const formatTime = (timestamp: number, format: string = 'YYYY-MM-DD HH:mm:ss') => {
    if (!timestamp) {
        return '-';
    }
    return dayjs(timestamp).format(format);
};
export const formatTimeWithoutDate = (timestamp: number, format: string = 'HH:mm') => {
    if (!timestamp) {
        return '-';
    }
    return dayjs(timestamp).format(format);
};
// 格式化轮值时间
export const formatOncallTime = (timeString: string) => {
    let oncallTime = '';
    if (timeString) {
        const timeArr = timeString.split(' ');
        const date = timeArr[0];
        const hours = timeArr[1].split('');
        oncallTime = hours[0] === '0' ? `${date} ${hours[1]}点` : `${date} ${timeArr[1]}点`;
    }
    return oncallTime;
};
