import { NavigationScreenProp, NavigationState, NavigationParams } from '@mrn/react-navigation'

export interface IScheduleResponse<V = any> {
  code?: number
  rescode?: number
  message: string
  data: V
}

export interface IAttendee {
  name: string
  mis?: string
  empId?: string
  avatar: string
  dxUserId: string
  xmUid?: string
}
export interface IScreenProps {
  [key: string]: any
}

export type INavigation = NavigationScreenProp<NavigationState, NavigationParams>

export interface IPageProps extends INavigation {
  screenProps: IScreenProps
  navigation: INavigation
}

// 用于堆叠展示的日程块事件
export interface IEventItem {
  id: string
  start: number
  end: number
  duration: number
  title: string
  isAllDay: number
  isOverDay: number
  ownerId?: string
  ownerName?: string
  color?: any
  top?: number
  bottom?: number
  level?: number
  backwardCoord?: number
  forwardCoord?: number
  forwardPressure?: number
  allDayIndex?: number // 全天区域开始
  allDayLength?: number // 全天区域块长度
  allDayTopIndex?: number // 全天区域块距离上边的个数
}

// 日程来源
export interface IApplicationItem {
  appKey: string
  appName: string
  id: number
}
