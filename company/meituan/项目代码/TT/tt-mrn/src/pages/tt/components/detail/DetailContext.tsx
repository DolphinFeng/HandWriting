import React, { createContext } from 'react'
import {
  ScoreModal,
  SLATime,
  TicketDetail,
  RgArchiveInfo,
  RgPermission,
  TicketOperate
} from './../../constants/TTServiceModule'
import { INIT_TICKET_INFO } from '../../constants/ConfigMap'
// Context主要管理：满意度评分、抄送人、SLA等，避免组件间层层callback.
// 遵循react 单数据流原则

export interface RefreshCallback {
  (): void
}

export interface DetailModal {
  showSatisfy: boolean
  handleShowSatisfy: (value: boolean) => void
  score: ScoreModal
  handleScore: (value: ScoreModal) => void
  userInfo: Record<
    string,
    { displayName: string; avatar: string; username: string; i18nDisplayName: string }
  > // 范围扩大， 不仅是抄送人信息，详情页其他地方(四个Tab)的用户也存在这里，全局用户信息
  handleUserInfo: (value) => void
  slaTime: SLATime
  handleSLATime: (value) => void
  ticketDetail: TicketDetail
  handleTicketDetail: (value) => void
  currentUser: string // mis
  handleCurrentUser: (value) => void
  rgArchiveInfo?: RgArchiveInfo
  handleRgArchiveInfo: (value) => void
  rgPermission?: RgPermission
  handleRgPermission: (value: RgPermission) => void
  addRefreshCallback: (callback: RefreshCallback) => void
  removeRefreshCallback: (callback: RefreshCallback) => void
  emitOnRefresh: () => void
  ticketOperate: TicketOperate
  handleTicketOperate: (value: TicketOperate) => void
}

const noop = () => {}

// 1. 使用 createContext 创建上下文
export const TTDetailContext = createContext<DetailModal>({
  score: null,
  handleScore: noop,
  showSatisfy: false,
  handleShowSatisfy: noop,
  userInfo: {},
  handleUserInfo: noop,
  slaTime: null,
  handleSLATime: noop,
  ticketDetail: null,
  handleTicketDetail: noop,
  currentUser: '',
  handleCurrentUser: noop,
  handleRgArchiveInfo: noop,
  handleRgPermission: noop,
  addRefreshCallback: noop,
  removeRefreshCallback: noop,
  emitOnRefresh: noop,
  ticketOperate: null,
  handleTicketOperate: noop
})

// 2. 创建 Provider
export class TTDetailProvider extends React.Component {
  // 注意书写顺序；handleScore 作为箭头函数不能 bind 因此需要写在上面；如果不喜欢这样的顺序则可以书写普通函数放在下面但记得 bind
  handleScore = value => {
    this.setState({ score: value })
  }
  handleShowSatisfy = value => {
    this.setState({ showSatisfy: value })
  }
  handleUserInfo = value => {
    this.setState({ userInfo: value })
  }
  handleSLATime = value => {
    this.setState({ slaTime: value })
  }
  handleTicketDetail = value => {
    this.setState({ ticketDetail: value })
  }
  handleCurrentUser = value => {
    this.setState({ currentUser: value })
  }
  handleRgArchiveInfo = value => this.setState({ rgArchiveInfo: value })
  handleRgPermission = value => this.setState({ rgPermission: value })

  private refreshCallbacks = new Set<RefreshCallback>()
  registerRefreshCallback = (callback: RefreshCallback) =>
    this.refreshCallbacks.add(callback)
  unregisterRefreshCallback = (callbck: RefreshCallback) =>
    this.refreshCallbacks.delete(callbck)
  emitOnRefresh = () => this.refreshCallbacks.forEach(fn => fn())

  handleTicketOperate = value => {
    this.setState({ ticketOperate: value })
  }

  // 2-1. 重写 state
  state = {
    score: null,
    showSatisfy: false,
    userInfo: {},
    slaTime: null,
    ticketDetail: INIT_TICKET_INFO,
    currentUser: '',
    rgArchiveInfo: null,
    rgPermission: null,
    ticketOperate: null
  }

  render() {
    // 2-2. 通过 Provider 组件的 value 将 state 提供出去
    return (
      <TTDetailContext.Provider
        value={{
          score: this.state.score,
          handleScore: this.handleScore,

          showSatisfy: this.state.showSatisfy,
          handleShowSatisfy: this.handleShowSatisfy,

          userInfo: this.state.userInfo,
          handleUserInfo: this.handleUserInfo,

          slaTime: this.state.slaTime,
          handleSLATime: this.handleSLATime,

          ticketDetail: this.state.ticketDetail,
          handleTicketDetail: this.handleTicketDetail,

          currentUser: this.state.currentUser,
          handleCurrentUser: this.handleCurrentUser,

          rgArchiveInfo: this.state.rgArchiveInfo,
          handleRgArchiveInfo: this.handleRgArchiveInfo,

          rgPermission: this.state.rgPermission,
          handleRgPermission: this.handleRgPermission,

          addRefreshCallback: this.registerRefreshCallback,
          removeRefreshCallback: this.unregisterRefreshCallback,
          emitOnRefresh: this.emitOnRefresh,

          ticketOperate: this.state.ticketOperate,
          handleTicketOperate: this.handleTicketOperate
        }}
      >
        {this.props.children}
      </TTDetailContext.Provider>
    )
  }
}

// 3. 创建 Consumer
export const ToggleConsumer = TTDetailContext.Consumer
