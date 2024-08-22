import { HOUR_HEIGHT } from '../consts'

const busyStyleConst = {
  oneHourHeight: HOUR_HEIGHT, // 一小时网格的高度
  leftWidth: 57, // 侧边x轴的宽度
  hearderHeight: 81, // 底部Y轴的宽度
  itemMinWidth: 64, // 一列元素的最小宽度
  itemDistanceWidth: 6, // 2列之间的间隙
  topStart: 24, // 上面预留24,
  oneQuotaHeight: Math.floor(HOUR_HEIGHT / 4), // 一刻钟网格的高度
  scrollBeforeHours: 2, // 滚动到当前的2小时
  oneMinuteHeight: HOUR_HEIGHT / 60 // 一分钟网格的高度
}

export default busyStyleConst
