
import { ICalendarInfo } from '@/common/interface/IcalendarInfo';
import ajax from './ajax';

const prefix = '/api/v2/xm';

export function getCalendarInfoApi(id: number) {
  return ajax({
    url: `${prefix}/calendars/${id}`,
    method: 'get'
  });
}

export function updateCalendarAdmin(id: number, calendar: ICalendarInfo) {
  return ajax({
    url: `${prefix}/calendars/${id}`,
    method: 'put',
    data: calendar
  });
}

export function updateCalendarReader(id: number, color) {
  return ajax({
    url: `${prefix}/calendars/reader/${id}`,
    method: 'put',
    data: color
  });
}
export function createCalendar(calendar: ICalendarInfo) {
  return ajax({
    url: `${prefix}/calendars/save`,
    method: 'post',
    data: calendar
  });
}

export function searchDepartment(data) {
  return ajax({
    url: `${prefix}/meeting/dataset/search/org`,
    method: 'post',
    data,
  });
}

export function deleteCalendar(id) {
  return ajax({
    url: `${prefix}/calendars/${id}`,
    method: 'delete'
  });
}
