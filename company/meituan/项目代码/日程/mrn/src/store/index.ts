/* eslint-disable camelcase */
import { action, observable } from 'mobx'
import appConfig from '@src/config'
import { LocalStorageKey } from '@src/common/consts'
import { IMRNAppProps } from '@onejs/mrn'
import { asyncAll } from '@onejs/mrn-utils'
import { SSOInfo, DxUserInfo, DeviceInfo, InstanceInfo } from '@onejs/mrn-stores'
import { IScreenProps } from '@src/common/interfaces'
import { UserInfo } from '@src/utils/userInfo'
import { ApplicationInfos } from '@src/utils/applicationInfos'

const { clientId } = appConfig

export class AppStore {
  @observable
  public isReady = false
  // URL路径参数
  public urlParams: IScreenProps = {}

  // APP 公共信息
  public ssoInfo = new SSOInfo(clientId, LocalStorageKey.SSOInfo)
  public dxUserInfo = new DxUserInfo()
  public deviceInfo = new DeviceInfo()
  public instanceInfo = new InstanceInfo()
  public userInfo = new UserInfo()
  public applicationList = new ApplicationInfos()

  constructor() {
    this.init()
  }

  @action
  private setReady = (isReady = false) => {
    this.isReady = isReady
  }

  public init = async () => {
    await asyncAll([this.dxUserInfo.init(), this.ssoInfo.init(), this.deviceInfo.init()])
    // 切换大象账号更新ssoid
    if (this.dxUserInfo.checkHasChange()) {
      await this.ssoInfo.updateSSOId()
    }
    // 业务数据初始化
    await asyncAll([this.userInfo.init(), this.applicationList.init()])

    this.setReady(true)
  }

  public updateAppProps = (props: IMRNAppProps & IScreenProps) => {
    // 剥离mrnProps
    const {
      hideNavigationBar,
      manualStopLoading,
      mrn_biz,
      mrn_component,
      mrn_entry,
      mrn_env_params,
      mrn_fetch_bridge_type,
      mrn_page_create_time,
      rootTag,
      ...restProps
    } = props

    this.setUrlParams(restProps)
    this.instanceInfo.setAppProps({
      hideNavigationBar,
      manualStopLoading,
      mrn_biz,
      mrn_component,
      mrn_entry,
      mrn_env_params,
      mrn_fetch_bridge_type,
      mrn_page_create_time,
      rootTag
    })
  }

  private setUrlParams = (params: IScreenProps) => {
    this.urlParams = params
  }
}

export const appStore = new AppStore()
export default appStore
