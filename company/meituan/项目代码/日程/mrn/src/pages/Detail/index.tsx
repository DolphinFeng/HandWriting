/* eslint-disable no-alert */
import React from 'react'
import { observer, Provider } from 'mobx-react'
import { IPageProps } from '@src/common/interfaces'
import { debug } from '@onejs/mrn-utils'
import appStore from '@src/store'
import { Layout } from '@src/components/Layout'
import { NavigationContext } from '@src/context'
import { ErrorCodeException } from '@src/components/Exception'
import { DelayLoading } from '@src/components/DelayLoading'
import { DetailStore } from './stores'
import { ScheduleContainer } from './containers/ScheduleContainer'
import { OperationContainer } from './containers/OperationContainer'
import { NavigationBar } from './containers/NavigationBar'

export interface IDetailParams {
  uid: string
  calendarId: string
  appKey: string
  empId: string
  source: string
}

@observer
export default class Detail extends React.Component<IPageProps> {
  private store = new DetailStore()

  constructor(props) {
    super(props)
    const defaultEmpId = appStore?.userInfo?.user?.empId
    const params = this.getPramas()
    // 日程初始化信息
    const {
      source = '',
      calendarId, // 日程的ID
      appKey = 'schedule', // 日程的类型
      empId = defaultEmpId // 查看该日程的角色，用该用户的视角查看
    } = params
    this.store.init({ appKey, empId, scheduleId: calendarId, source })
  }

  getPramas = (): IDetailParams => {
    // !Warn APP入口处统一参数来源
    const { navigation, screenProps = {} } = this.props
    const { params = {} } = navigation.state as any
    debug('-- Detail Init --', params, screenProps)
    // eslint-disable-next-line prefer-template
    return {
      ...screenProps,
      ...params
    }
  }

  render() {
    const { navigation } = this.props
    const { fetching } = this.store

    return (
      <NavigationContext.Provider value={navigation}>
        <Provider detailStore={this.store} naviagtion={navigation}>
          <Layout>
            <NavigationBar navigation={navigation} />
            <DelayLoading visible={fetching} delay={500} />
            {this.renderSchedule()}
          </Layout>
        </Provider>
      </NavigationContext.Provider>
    )
  }

  renderSchedule = () => {
    const { navigation } = this.props
    const { fetching, errorInfo, hasSchedule } = this.store
    if (hasSchedule) {
      return (
        <>
          <ScheduleContainer />
          <OperationContainer navigation={navigation} />
        </>
      )
    }

    if (fetching) {
      return null
    }
    return <ErrorCodeException errorCode={errorInfo?.errorCode} />
  }
}
