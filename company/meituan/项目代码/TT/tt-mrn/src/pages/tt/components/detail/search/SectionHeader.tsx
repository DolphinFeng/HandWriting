import { i18nClient } from '@sailor/i18n-mrn'
import React, { Component } from 'react'
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Image,
  Easing,
  ImageBackground,
} from '@mrn/react-native'
import down from '@images/down-thick.png'
import up from '@images/up-thick.png'
import { dStyle } from '@tt/constants/TTStyle'
import defalutAvator from '@images/default-avator.png'
import { _searchHightColor } from '../../common/SearchHightColor'
interface Iprops {
  keyword?: string
  info: any
  handlerSectionHeader: (any) => void
}
interface Istate {
  collapse: boolean
}
export default class SectionHeader extends Component<Iprops, Istate> {
  constructor(props) {
    super(props)
    this.state = {
      collapse: false,
    }
  }

  handlerSectionHeader = info => {
    if (info.section.show) {
      console.log('to hide ' + JSON.stringify(info))
      this.setState({ collapse: false })
    } else {
      console.log('to show ' + JSON.stringify(info))
      this.setState({ collapse: true })
    }
    this.props.handlerSectionHeader(info)
  }

  render() {
    const { info } = this.props
    const arrow = this.state.collapse ? up : down
    return (
      <>
        {/* <View style={styles.container}> */}
        <View style={[dStyle.ticketDivider1, { marginHorizontal: -16 }]} />
        <TouchableOpacity onPress={() => this.handlerSectionHeader(info)} style={styles.subView}>
          <ImageBackground
            style={dStyle.avator}
            source={info.section.avatar ? { uri: info.section.avatar } : defalutAvator}
          />

          <Text numberOfLines={1} ellipsizeMode="tail" style={{ marginLeft: 8, maxWidth: '80%' }}>
            {_searchHightColor(this.props.keyword, info.section.title)}
          </Text>
          {Boolean(info.section.sectionExtra.external) && (
            <Text style={dStyle.exteranlTag}>
              {i18nClient.t('components_detail_search_96b0a7', { defaultValue: '外部' })}
            </Text>
          )}

          <View style={{ flex: 1 }} />
          <Image source={arrow} style={{ height: 20, width: 20, opacity: 0.24 }} />
        </TouchableOpacity>
      </>
      //   </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    height: 48,
    justifyContent: 'center',
  },
  subView: {
    flexDirection: 'row',
    height: 48,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
  },
})
