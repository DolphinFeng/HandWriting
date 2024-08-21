import ajax from './ajax';

const prefix = '/api/v2/xm';
// pike注册用户
export async function registerChannel(params) {
  return ajax.post(`${prefix}/calendarPlugin/registerChannel`, params);
}
export async function offlineChannel(params) {
  return ajax.post(`${prefix}/calendarPlugin/offlineChannel`, params);
}

export async function getCalendarsList(params) {
  return ajax.get(`${prefix}/calendarPlugin/public/calendar`, params);
}
export async function getEvents(params) {
  return ajax.get(`${prefix}/calendarPlugin/event/list`, params);
}

export async function getSchedulesMonthly(calendarSetId, scheduleId) {
  return ajax.get(`${prefix}/calendarPlugin/${calendarSetId}/${scheduleId}`);
}

export async function createLink(calendarIds) {
  return ajax.post(`${prefix}/calendarPlugin/createLink`, { calendarIds });
}
