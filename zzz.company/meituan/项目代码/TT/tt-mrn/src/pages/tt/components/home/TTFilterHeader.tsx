import { i18nClient } from '@sailor/i18n-mrn'
import {
  TouchableOpacity,
  View,
  Image,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from '@mrn/react-native'
import filterBlue from '@images/filter-o-blue.png'
import filterBlack from '@images/filter-o-black.png'
import React, { Component } from 'react'
import theme from '@src/common/styles/MWSStyle'

interface IProps {
  filterCount?: number
  filterPanelDroppedDown: boolean
  onFilterPress: () => void
  style?: StyleProp<ViewStyle>
  showText?: boolean
}

interface IState {
  filterPanelDroppedDown: boolean
}

class TTFilterHeader extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      filterPanelDroppedDown: this.props.filterPanelDroppedDown ?? false,
    }
  }

  render() {
    const filterCount = this.props.filterCount
    const filterPanelDroppedDown = this.props.filterPanelDroppedDown
    const showFilterCount = filterCount > 0

    const filterStyles = this.getFilterStyles()

    let filterText = i18nClient.t('components_home_c2fe62', { defaultValue: '筛选' })
    if (showFilterCount) filterText = filterText

    const imgW = 16

    return (
      <TouchableOpacity
        style={[styles.filterParent, { width: 70, height: 40, marginRight: 0 }]}
        onPress={this.props.onFilterPress}
      >
        <View style={styles.filterSeprator} />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginRight: 16,
            justifyContent: 'flex-end',
          }}
        >
          {showFilterCount ? null : (
            <Image source={filterBlack} style={{ width: imgW, height: imgW, marginRight: 2 }} />
          )}

          <Text style={styles.text}>{`${filterText}`}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  getFilterStyles(): [any, any] {
    const filterCount = this.props.filterCount
    const filterPanelDroppedDown = this.props.filterPanelDroppedDown

    let fitlerTextStyle
    let filterStyle

    const showFilterCount = filterCount > 0 && filterPanelDroppedDown === false
    let filterTextRight = showFilterCount ? 4 : 16

    let baseFilterTextStyle = {
      fontSize: 12,
      marginRight: filterTextRight,
    }

    if (filterPanelDroppedDown || filterCount > 0) {
      filterStyle = {
        // width: 20,
        // height: 20
        width: 0,
        height: 0,
      }

      fitlerTextStyle = [baseFilterTextStyle, { color: '#1253B5' }]
    } else {
      filterStyle = {
        width: 16,
        height: 16,
        // opacity: 0.6
      }

      fitlerTextStyle = [baseFilterTextStyle, { color: 'rgba(0, 0, 0, 0.6)' }]
    }

    return [filterStyle, fitlerTextStyle]
  }

  setDroppedDown(down: boolean) {
    this.setState({ filterPanelDroppedDown: down })
  }

  renderFilterCount(count: number) {
    return (
      <View
        style={{
          width: 16,
          height: 16,
          borderRadius: 8,
          backgroundColor: '#DBEDFF',
          alignItems: 'center',
          alignContent: 'center',
          // marginRight: 16
        }}
      >
        <Text
          style={{
            fontSize: 10,
            color: '#1253B5',
            fontFamily: 'PingFangSC-Medium',
          }}
        >
          {`${count}`}
        </Text>
      </View>
    )
  }
}

export default TTFilterHeader

const styles = StyleSheet.create({
  filterParent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    // marginLeft: 8,
    // paddingBottom: 8,
    // paddingTop: 8,
  },
  filterSeprator: {
    width: 1,
    height: 14,
    // right: 10,
    backgroundColor: 'rgba(0,0,0,0.07)',
    position: 'absolute',
    left: 0,
    // backgroundColor: 'red'
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.gray84,
  },
})
