import KNB from '@mrn/mrn-knb'
import { Platform } from '@mrn/react-native'

export enum PlatformType {
  dx = 'dx',
  mws = 'mws'
}

class PlatformHelper {
  private static instance: PlatformHelper

  private currentType: PlatformType = undefined

  private constructor() {}

  public static getInstance(): PlatformHelper {
    if (!PlatformHelper.instance) {
      PlatformHelper.instance = new PlatformHelper()
    }

    return PlatformHelper.instance
  }

  public static resetInstance() {
    PlatformHelper.instance = null
  }

  public async getAppPackageName(): Promise<String> {
    return new Promise<String>((resolve, reject) => {
      KNB.getAppInfo({
        success: function (data) {
          // 包名
          let packname = new String(data.package)
          resolve(packname)
        },
        fail: function (err) {
          console.warn(JSON.stringify(err))
          reject()
        }
      })
    })
  }

  public getPresetPackageName(): string {
    const name = Platform.OS === 'ios' ? 'com.meituan.mmws' : 'com.sankuai.mmws'
    return name
  }

  public async getCurrentPlatform(): Promise<PlatformType> {
    if (this.currentType === undefined) {
      return this.getAppPackageName().then(packname => {
        const presetName = this.getPresetPackageName()
        this.currentType = packname.includes(presetName)
          ? PlatformType.mws
          : PlatformType.dx
        return this.currentType
      })
    } else {
      // return new Promise(resolve => resolve(this.currentType))
      return new Promise<PlatformType>((resolve, reject) => {
        resolve(this.currentType)
      })
    }
  }
  public static isFromIpad(): boolean {
    return Platform.isPad || false
  }
}

export default PlatformHelper
