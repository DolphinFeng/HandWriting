import React from 'react'
import { Provider } from 'mobx-react'
import { Button } from '@mrn/react-native'
import { NavBar } from '@onejs/mrn-components'
import { IconFont } from '@src/components/IconFont'
import { IPageProps } from '@src/common/interfaces'
import { Layout } from '@src/components/Layout'
import { DemoComponent } from './components/DemoComponent'
import { HomeStore } from './stores'

export default class Home extends React.Component<IPageProps> {
  private store = new HomeStore()

  render() {
    const { navigation } = this.props
    return (
      <Provider homeStore={this.store}>
        <Layout>
          <NavBar title='首页' onBack={navigation.back} />
          <DemoComponent desc='Home Page' />
          <Button
            title='Go to Detail'
            onPress={() =>
              navigation.push('Detail', {
                from: 'Home',
                calendarId: '2663403',
                empId: '2213067',
                appKey: 'schedule'
              })
            }
          />
          <Button title='Go to Busy' onPress={() => navigation.push('Busy')} />
          <Button title='Go to Edit' onPress={() => navigation.push('Edit')} />
          {/* IconFont使用方式 */}
          <IconFont icon='dx-calavatar' />
          <IconFont icon='dx-caltoday' />
          <IconFont icon='dx-calwarning_calendar' />
        </Layout>
      </Provider>
    )
  }
}
