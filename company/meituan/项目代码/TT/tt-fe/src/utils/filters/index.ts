import dayjs from 'dayjs';
import dayjsWithTimeZone from '../tools/dayjs';

// 格式化时间
export const formatTime = (timestamp: number, format: string = 'YYYY-MM-DD HH:mm:ss') => {
    if (!timestamp) {
        return '-';
    }
    return dayjs(timestamp).format(format);
};

export const formatTimeWithTimeZone = (timestamp: number, format: string = 'YYYY-MM-DD HH:mm:ss') => {
    if (!timestamp) {
        return '-';
    }
    return dayjsWithTimeZone(timestamp).format(format);
};

export const formatTimeToMin = (timestamp: number, format: string = 'YYYY-MM-DD HH:mm') => {
    if (!timestamp) {
        return '-';
    }
    return dayjsWithTimeZone(timestamp).format(format);
};

export const formatTimeToDay = (timestamp: number, format: string = 'YYYY-MM-DD') => {
    if (!timestamp) {
        return '-';
    }
    return dayjs(timestamp).format(format);
};

export const formatTimeWithoutYear = (timestamp: number, format: string = 'MM-DD HH:mm') => {
    if (!timestamp) {
        return '-';
    }
    return dayjsWithTimeZone(timestamp).format(format);
};

export const ticketStateFilter = (value: string): string => {
    if (!value) return '';
    return ['暂停中', '挂起中'].includes(value) ? '暂停中' : value;
};

export const tableSlaFilter = (value: string): string => {
    if (!value) return '';
    return ['S1', 'S2'].includes(value) ? '紧急' : '非紧急';
};

export const bytesFilter = (bytes): string => {
    if (bytes < 1024) return bytes + ' Bytes';
    else if (bytes < 1048576) return(bytes / 1024).toFixed(3) + ' KB';
    else if (bytes < 1073741824) return(bytes / 1048576).toFixed(3) + ' MB';
    else return (bytes / 1073741824).toFixed(3) + ' GB';
};
