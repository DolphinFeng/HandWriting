import { service } from '../utils';

// 获取值班信息
export const getOncallTable = (params: {
    rgId: number[];
    timestamp: number;
    timeType: 'WEEK' | 'MONTH';
    needRgDetail: boolean;
    mis?: string;
}) => {
    return service.post('/oncall/1.0/table', params);
};

// 获取节假日信息
export const getOncallCalender = (params: {
    rgId: number[];
    timestamp: number;
    timeType: 'WEEK' | 'MONTH';
    needHolidayInfo: boolean;
}) => {
    return service.post('/oncall/1.0/calendar', params);
};

// 根据mis查询所在rg列表
export const getOncallRgList = (misId: string) => {
    return service.get('/oncall/1.0/rg/list', { params: { misId } });
};
