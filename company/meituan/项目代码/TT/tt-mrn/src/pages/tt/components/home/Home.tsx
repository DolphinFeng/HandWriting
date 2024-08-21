import React, { Component } from 'react'
import { View, Text } from '@mrn/react-native'
import HomeGeneral from './HomeGeneral'
import { requestCurrentUser } from '../common/TTHelper'
import { i18nClient,withTranslation } from '@sailor/i18n-mrn'

class Home extends Component<any> {
  constructor(props) {
    super(props)
  }

  componentDidMount() {}

  render() {
    return (
      <View style={{ backgroundColor: 'white', flex: 1 }}>
        <HomeGeneral
          navigation={this.props.navigation}
          isPad={this.props.screenProps?.isPad}
        />
      </View>
    )
  }
}

export default withTranslation('', {
	withRef: true
})(Home);
