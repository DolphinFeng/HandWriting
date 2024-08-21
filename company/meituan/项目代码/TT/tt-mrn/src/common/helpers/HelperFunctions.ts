import { owl } from '@mrn/mrn-owl'

/** 检查对象是否 null 或者 undefined */
export function checkNull(obj?: any): boolean {
  if (obj != null) {
    return false
  }

  return true
}

/** 检查列表是否包含 空对象 */
export function checkListItemAnyNull(list: Array<any>): boolean {
  for (let item of list) {
    if (checkNull(item)) {
      return true
    }
  }

  return false
}

/** 检查列表是否包含 非空对象 */
export function checkListItemAnyNotNull(list: Array<any>): boolean {
  for (let item of list) {
    if (!checkNull(item)) {
      return true
    }
  }

  return false
}

/** 检查string 非空 */
export function isStringNotEmpty(str: string): boolean {
  return str != null && str.length > 0
}

export function getRandomColor() {
  let bgColor = ['red', 'blue', 'yellow', 'green', 'purple']
  const color = bgColor[Math.floor(Math.random() * bgColor.length)]
  return color
}

export function convertHex(hex: string, opacity: number): string {
  hex = hex.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  const result = 'rgba(' + r + ',' + g + ',' + b + ',' + opacity + ')'
  return result
}

export const reportOwlError = (
  message: string,
  level: 'info' | 'error' | 'warn' | 'error' = 'info',
  reportNow: boolean = true
) => {
  const { owl } = require('@mrn/mrn-owl')

  const e = new Error(message)
  ;(e as any).level = level

  owl.error.pushError(e, reportNow)
}

export function initOwl(bundleName: string) {
  owl.start({
    devMode: process.env.NODE_ENV !== 'production', // true 为开发模式，上报到 Cat 测试环境中， false 上报到线上
    autoCatch: {
      // 自动捕获
      error: false, // 自动捕获 JS 异常并上报，自动捕获之后，Native 侧不会再感知到异常，也不会展示错误页面。 建议不开启
      // image: false // 自动捕获图片加载情况并上报
    },
    onErrorPush: function (error) {
      // 异常上报前的回调，可以做异常的过滤限流等功能。
      // console.log('111222333 onErrorPush')
      return error
    },
    jsError: {
      // 0.0.5+ 版本，支持上报 JS异常时上报自定义字段
      customData: {} // key value 格式
    },
    project: bundleName //  必填，Bundle 名称
  })
}
