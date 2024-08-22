import React from 'react'
import { observer, Provider } from 'mobx-react'
import { View } from '@mrn/react-native'
import { debug, warn } from '@onejs/mrn-utils'
import { IMRNAppProps } from '@onejs/mrn'
import { createRootStack } from './routers'
import { appStore } from './store'
import boot from './boot'
import { IScreenProps } from './common/interfaces'
// 初始化脚本
boot()

@observer
export class App extends React.Component<IMRNAppProps & IScreenProps> {
  constructor(props) {
    super(props)
    appStore.updateAppProps(props)
    warn('项目启动')
    debug('===>appProps', this.props)
  }

  render() {
    const { isReady, urlParams } = appStore
    if (!isReady) {
      /* 骨架屏定制 */
      return <View />
    }

    const RootStack = createRootStack({
      initialRouteName: urlParams?.routeName /* URL路由到具体页面 */
    })
    return (
      <Provider appStore={appStore}>
        <RootStack screenProps={urlParams /* URL路径参数传递 */} />
      </Provider>
    )
  }
}
