import {
  TouchableOpacity,
  View,
  Image,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle
} from '@mrn/react-native'
import filterBlue from '@images/filter-o-blue.png'
import filterBlack from '@images/filter-o-black.png'
import React, { Component } from 'react'

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

class FilterHeader extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      filterPanelDroppedDown: this.props.filterPanelDroppedDown ?? false
    }
  }

  render() {
    const filterCount = this.props.filterCount
    const filterPanelDroppedDown = this.props.filterPanelDroppedDown
    const showFilterCount = filterCount > 0 && filterPanelDroppedDown === false

    const filterStyles = this.getFilterStyles()

    return (
      <TouchableOpacity
        style={[styles.filterParent, this.props.style ?? {}]}
        onPress={this.props.onFilterPress}
      >
        <View style={styles.filterSeprator} />
        <Image
          source={
            filterPanelDroppedDown || showFilterCount ? filterBlue : filterBlack
          }
          style={filterStyles[0]}
        />
        {this.props.showText ? this.renderFitlerText() : null}
      </TouchableOpacity>
    )
  }

  renderFitlerText() {
    const filterStyles = this.getFilterStyles()

    return (
      <>
        <Text style={filterStyles[1]}>{' 筛选'}</Text>
        {/* {showFilterCount
          ? this.renderFilterCount(filterCount)
          : null} */}
      </>
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
      marginRight: filterTextRight
    }

    if (filterPanelDroppedDown || filterCount > 0) {
      filterStyle = {
        width: 16,
        height: 16,
        marginLeft: 12
      }

      fitlerTextStyle = [baseFilterTextStyle, { color: '#1253B5' }]
    } else {
      filterStyle = {
        width: 16,
        height: 16,
        marginLeft: 12
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
          alignContent: 'center'
          // marginRight: 16
        }}
      >
        <Text
          style={{
            fontSize: 10,
            color: '#1253B5',
            fontFamily: 'PingFangSC-Medium'
          }}
        >
          {count}
        </Text>
      </View>
    )
  }
}

export default FilterHeader

const styles = StyleSheet.create({
  filterParent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    paddingBottom: 8,
    paddingTop: 8
  },
  filterSeprator: {
    width: 1,
    height: 14,
    // right: 10,
    backgroundColor: 'rgba(0,0,0,0.07)'
    // backgroundColor: 'red'
  }
})
