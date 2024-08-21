import React from 'react'
import { View, Text } from '@mrn/react-native'
import { IEventItem } from '@src/common/interfaces'
import { CommonTextStyles } from '@src/common/styles'
import styles from './style'

interface IPropsType {
  event: IEventItem
  parentWidth: number
}

/**
 * 纯查看事件组
 */
export default class ShowEvent extends React.PureComponent<IPropsType> {
  // 计算非全天日程块样式
  computedCss = (event: IEventItem) => {
    const { parentWidth } = this.props
    const { backwardCoord } = event // the left side if LTR. the right side if RTL. floating-point
    let { forwardCoord } = event // the right side if LTR. the left side if RTL. floating-point
    let left // amount of space from left edge, a fraction of the total width
    let right // amount of space from right edge, a fraction of the total width

    const shouldOverlap = true
    const isRtl = false
    if (shouldOverlap) {
      // double the width, but don't go beyond the maximum forward coordinate (1.0)
      forwardCoord = Math.min(1, backwardCoord + (forwardCoord - backwardCoord) * 2)
    }

    if (isRtl) {
      left = 1 - forwardCoord
      right = backwardCoord
    } else {
      left = backwardCoord
      right = 1 - forwardCoord
    }

    const props = {
      zIndex: event.level + 1, // convert from 0-base to 1-based
      left: `${left * 100}%`,
      right: `${right * 100}%`,
      top: event.top,
      bottom: -event.bottom + 1,
      width: Math.floor((1 - left - right) * parentWidth),
      borderWidth: event.level > 0 ? 1 : 0
    }

    if (shouldOverlap && event.forwardPressure) {
      // add padding to the edge so that forward stacked events don't cover the resizer's icon
      props[isRtl ? 'marginLeft' : 'marginRight'] = 10 // 10 is a guesstimate of the icon's width
    }

    return { ...props }
  }

  // 非全天日程块处理
  unAllDayRender = () => {
    const { event } = this.props
    // const { level, title, start, end, color } = event || {}
    const positionCss = this.computedCss(event)
    const { bottom, top, width } = positionCss
    const height = Math.abs(bottom) - top
    // const lineHeight = height < 17 ? '12px' : '17px'
    const paddingTop = height < 20 ? 0 : 2
    // const lines = Math.floor(height / 17) === 0 ? 1 : Math.floor(height / 17)
    // const parentHeight = height < 17 ? height : (lines > 2 ? lines - 1 : 1) * 17

    return (
      <View
        style={[
          styles.eventItem,
          {
            ...positionCss,
            paddingTop,
            paddingHorizontal: width > 8 ? 4 : 0
          }
        ]}
      >
        {/* 太窄太矮不显示文字 */}
        {width > 20 && height > 20 && (
          <Text style={CommonTextStyles.eventNormalText}>{event.title}</Text>
        )}
      </View>
    )
  }

  render() {
    return <>{this.unAllDayRender()}</>
  }
}
