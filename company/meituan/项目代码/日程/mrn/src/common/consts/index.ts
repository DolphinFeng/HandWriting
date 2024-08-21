export const apiPrefix = '/api/v2/xm'

export * from './storage'
export * from './notice'
export * from './recurrent'
export * from './defaultSetting'
export * from './date'
export * from './errorCode'

// 日程块颜色
export const EVENT_COLORS = {
  blue: {
    backgroundColor: 'rgb(235, 245, 255)', // 背景色
    fontColor: '#02278D', // 字体色
    focusColor: 'rgb(189, 218, 253)' // 选中背景色
  },
  yellow: {
    backgroundColor: 'rgb(255, 251, 233)',
    fontColor: '#A96900',
    focusColor: 'rgb(255, 239, 186)'
  },
  green: {
    backgroundColor: 'rgb(232, 251, 240)',
    fontColor: '#034730',
    focusColor: 'rgb(185, 236, 212)'
  },
  red: {
    backgroundColor: 'rgb(255, 243, 236)',
    fontColor: '#701F13',
    focusColor: 'rgb(255, 213, 193)'
  }
}

export const HOUR_HEIGHT = 48

export const UMEETING_DOWNLOAD_URL = 'https://www.umeet.com.cn/download.html'
