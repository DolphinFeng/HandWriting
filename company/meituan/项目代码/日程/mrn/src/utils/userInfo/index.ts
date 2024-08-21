import { CommonApi } from '@src/apis'
import { IAttendee } from '@src/common/interfaces'
import { warn, info } from '@onejs/mrn-utils'

export class UserInfo {
  public user = {} as IAttendee
  public isFetching: boolean

  constructor() {
    info('use userInfo')
  }

  public init = async () => {
    const user = await this.getInfo()
    this.setInfo(user)
  }

  public getInfo = async (): Promise<IAttendee> => {
    let user: IAttendee = null
    try {
      this.setFetching(true)
      user = await CommonApi.getUserInfo()
      info('user', user)
    } catch (err) {
      warn('get userInfo fail', err)
    } finally {
      this.setFetching(false)
    }
    return user
  }

  private setInfo = (userInfo = {} as IAttendee) => {
    this.user = userInfo
    info('userInfo setInfo', userInfo)
  }

  private setFetching = (fetching: boolean) => {
    this.isFetching = fetching
  }
}
