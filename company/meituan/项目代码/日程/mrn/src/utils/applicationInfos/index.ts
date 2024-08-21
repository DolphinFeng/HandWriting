import { CommonApi } from '@src/apis'
import { IApplicationItem } from '@src/common/interfaces'
import { warn, info } from '@onejs/mrn-utils'

export class ApplicationInfos {
  public applicationList = [] as IApplicationItem[]

  constructor() {
    info('use applicationList')
  }

  public init = async () => {
    const applicationList = await this.getApplications()
    this.setApplications(applicationList)
  }

  public getApplications = async (): Promise<IApplicationItem[]> => {
    let applicationList: IApplicationItem[] = []
    try {
      const tempList = await CommonApi.getApplications()
      if (tempList) {
        applicationList = tempList.map(item => {
          const { appKey, appName, id } = item
          return { appKey, appName, id }
        })
      }
      info('applicationList', applicationList)
    } catch (err) {
      warn('get applicationList fail', err)
    }
    return applicationList
  }

  private setApplications = (applicationList = [] as IApplicationItem[]) => {
    this.applicationList = applicationList
    info('applicationList setApplicationList', applicationList)
  }
}
