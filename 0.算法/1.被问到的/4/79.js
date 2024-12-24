// 瑞联招聘

/**
 * 格式化 Unix 时间戳为 yyyy-mm-dd hh:MM:ss 格式 (GMT+0 时区)
 * @param {number} ts Unix 时间戳
 * @return {string} 格式化后的时间字符串
 */
const formatUnixTimestamp = (ts) => {
    // 定义每月的天数 (平年)
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // 辅助函数：判断是否是闰年
    const isLeapYear = (year) => {
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    };

    // 一天的秒数
    const SECONDS_IN_DAY = 86400;
    // 一小时的秒数
    const SECONDS_IN_HOUR = 3600;
    // 一分钟的秒数
    const SECONDS_IN_MINUTE = 60;

    // 从1970年开始计算年份
    let year = 1970;
    let remainingSeconds = ts;

    // 计算年份
    while (true) {
        const secondsInYear = isLeapYear(year) ? 366 * SECONDS_IN_DAY : 365 * SECONDS_IN_DAY;
        if (remainingSeconds >= secondsInYear) {
            remainingSeconds -= secondsInYear;
            year++;
        } else {
            break;
        }
    }

    // 计算月份
    let month = 0;
    while (month < 12) {
        const days = daysInMonth[month] + (month === 1 && isLeapYear(year) ? 1 : 0); // 考虑闰年
        const secondsInMonth = days * SECONDS_IN_DAY;
        if (remainingSeconds >= secondsInMonth) {
            remainingSeconds -= secondsInMonth;
            month++;
        } else {
            break;
        }
    }
    month += 1; // 将月份从索引变为正常值

    // 计算日期
    const day = Math.floor(remainingSeconds / SECONDS_IN_DAY) + 1;
    remainingSeconds %= SECONDS_IN_DAY;

    // 计算小时
    const hour = Math.floor(remainingSeconds / SECONDS_IN_HOUR);
    remainingSeconds %= SECONDS_IN_HOUR;

    // 计算分钟
    const minute = Math.floor(remainingSeconds / SECONDS_IN_MINUTE);

    // 计算秒
    const second = remainingSeconds % SECONDS_IN_MINUTE;

    // 辅助函数：将数值格式化为两位字符串
    const pad = (num) => (num < 10 ? '0' + num : num.toString());

    // 返回格式化字符串
    return `${year}-${pad(month)}-${pad(day)} ${pad(hour)}:${pad(minute)}:${pad(second)}`;
};

// 用例
console.log(formatUnixTimestamp(0)); // 1970-01-01 00:00:00
console.log(formatUnixTimestamp(86400)); // 1970-01-02 00:00:00
console.log(formatUnixTimestamp(946684800)); // 2000-01-01 00:00:00
console.log(formatUnixTimestamp(1609459200)); // 2021-01-01 00:00:00