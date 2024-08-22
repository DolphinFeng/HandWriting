const DEFAULT_PUBLIC_COLOR_STR = '#00B460';
const DEFAULT_PUBLIC_COLOR_NUM = '4278236256';
const regexColorNum = /^\d{10}$/;
const regexColorStr = /^#\w{6}$/;

export function colorNumToStr(color: string) {
  return (regexColorNum.test(color))
    ? `#${Number(color).toString(16).substring(2)}`
    : DEFAULT_PUBLIC_COLOR_STR;
}
export function colorStrToNum(color: string) {
  return (regexColorStr.test(color))
    ? parseInt(color.substring(1).padStart(8, 'F'), 16)
    : DEFAULT_PUBLIC_COLOR_NUM;
}
