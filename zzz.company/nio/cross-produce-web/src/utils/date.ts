import moment from 'moment';
import dayjs from 'dayjs';
/**
 * 支持时间单位 s,ms,µs,ns
 * ℹ️ {@link formatTime} 支持非数字类型时间字段
 */
export function humanizeTime(time: any, format = 'YYYY-MM-DD HH:mm:ss'): string {
  if (!time) {
    return '-';
  }

  if (typeof time === 'string') {
    const m = moment(time);
    return m.isValid() ? m.format(format) : time;
  } else if (time > Math.pow(10, 18)) {
    // ns
    return moment(time / 1000000).format(format);
  } else if (time > Math.pow(10, 15)) {
    // us
    return moment(time / 1000).format(format);
  } else if (time > Math.pow(10, 12)) {
    // ms
    return moment(time).format(format);
  } else if (time > 0) {
    // s
    return moment(time * 1000).format(format);
  }

  return '-';
}

/**
 * 把 moment tuple 转换成 timestamp tuple
 */
export const convertMomentTupleToTimestampTuple = (tuple?: [moment.Moment?, moment.Moment?]): [number?, number?] => {
  if (tuple && tuple[0] && tuple[1]) {
    return [tuple[0].valueOf(), tuple[1].valueOf()];
  }
  return [];
};

/**
 * 把 timestamp tuple 转换成 moment tuple
 */
export const convertTimestampTupleToMomentTuple = (
  tuple?: [(number | string)?, (number | string)?],
): [moment.Moment?, moment.Moment?] => {
  if (tuple && tuple[0] && tuple[1]) {
    return [moment(Number(tuple[0])), moment(Number(tuple[1]))];
  }

  return [];
};

/**
 * ant design 的 DatePicker.RangePicker 控件使用此函数转换时间，不要使用convertTimestampTupleToMomentTuple，否则转换会有问题
 *
 * @param tuple
 * @returns
 */
export const convertTimestampTupleToDayTuple = (
  tuple?: [(number | string)?, (number | string)?],
): [dayjs.Dayjs?, dayjs.Dayjs?] => {
  if (tuple && tuple[0] && tuple[1]) {
    return [dayjs(Number(tuple[0])), dayjs(Number(tuple[1]))];
  }

  return [];
};
