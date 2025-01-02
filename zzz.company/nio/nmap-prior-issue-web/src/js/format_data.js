//格式化时间字符串
export function dateFormat(timeStr) {
  if (!timeStr) return timeStr;
  let date, formatTime;
  try {
    date = new Date(timeStr.replace('CST', 'GMT+0800'));
  } catch (e) {
    return timeStr;
  }
  formatTime = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}  ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  return formatTime;
}
