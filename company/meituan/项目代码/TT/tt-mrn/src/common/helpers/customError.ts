import KNB from '@mrn/mrn-knb'
import { owl } from '@mrn/mrn-owl'
import { forceGetAppName, forceGetUserMis } from '@src/common/helpers/api'

const ERROR_PRE = 'tt-mrn:'
enum EErrorCategory {
  jsError = 'jsError',
  resourceError = 'resourceError',
  ajaxError = 'ajaxError'
}

enum EErrorLevel {
  warn = 'warn',
  error = 'error',
  info = 'info',
  debug = 'debug'
}

let globalMis: string = ''

class CustomError extends Error {
  public level = EErrorLevel.info
  public category = EErrorCategory.resourceError
  public customData: any = {}
  constructor(message: string, level?: EErrorLevel, category?: EErrorCategory, tags?: any) {
    super(`${ERROR_PRE}${message}`)
    this.level = level || EErrorLevel.info
    this.category = category || EErrorCategory.resourceError

    if (tags) {
      this.customData = tags
    }
  }

  public setMis = async () => {
    if (!globalMis) {
      globalMis = await forceGetUserMis()
    }
    this.customData.userMis = globalMis
  }
}

const sendLog = (message?: string) => {
  KNB.sendLog({
    text: message,
    type: '33'
  })
}

const customInfo = async (message: string, tags?: any) => {
  // eslint-disable-next-line no-console
  console.log(message, tags)
  // 上报owl
  const err = new CustomError(message, EErrorLevel.info, EErrorCategory.resourceError, tags)
  await err.setMis()
  owl.error.pushError(err, 1)
  // 上报日志
  sendLog(message)
}

const customWarn = async (message: string, tags?: any) => {
  // eslint-disable-next-line no-console
  console.log(message, tags)
  // 上报owl
  const err = new CustomError(message, EErrorLevel.warn, EErrorCategory.resourceError, tags)
  await err.setMis()
  owl.error.pushError(err, 1)
  // 上报日志
  sendLog(message)
}

export { customInfo, customWarn, sendLog }
