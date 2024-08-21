import React, { Component } from 'react'
import { SlideModal, TopViewManager } from '@ss/mtd-react-native'
import {
  getNavigationHeight,
  getPaddingTop
} from '@common/styles/NavigationStyle'

type VisibleChangeCallback = (dropDown: boolean) => void

export enum SlideOpenDirection {
  Up = 'up',
  Down = 'down'
}

class SlideOpenWrapper {
  private visible: boolean = false
  private slideRef: TopViewManager = null
  private childView: any = null
  private visibleCallback: VisibleChangeCallback = null

  private customY?: boolean
  private customYOffset?: number
  private direction: SlideOpenDirection

  constructor(
    childView: any,
    visibleCallback: VisibleChangeCallback,
    customY?: boolean,
    customYOffset?: number,
    direction?: SlideOpenDirection
  ) {
    this.childView = childView
    this.visibleCallback = visibleCallback

    this.customY = customY
    this.customYOffset = customYOffset

    this.direction = direction != null ? direction : SlideOpenDirection.Down
  }

  openClose() {
    console.log('opneclose', this.visible ? '关闭' : '开启')

    this.visible ? this.close() : this.open()
  }

  /** 每次open的时候会用 childview 重新新建一个 */
  private open() {
    if (!this.visible) {
      this.updateVisibleStatus(true)

      const offset =
        this.customY === true
          ? this.customYOffset != null
            ? this.customYOffset
            : 0
          : getNavigationHeight() + getPaddingTop() + 44

      console.log('custom offset', offset)

      this.slideRef = SlideModal.open({
        children:
          //  this.props.childView
          this.childView,
        direction: this.direction,
        offsetY: offset,
        // visible: false,
        modalProps: {
          // 点击mask 或者 关闭按钮时的处理
          onPressClose: () => {
            this.close()
          },
          onClose: () => {
            //  保证状态
            this.updateVisibleStatus(false)
          }
          // animateable: false,
          // containerStyles: {
          //   backgroundColor: '#0A70F5'
          // }
        }
      })
    }
  }

  /** 如果打开的话，会close, 否则什么都不做 */
  close() {
    if (this.visible === true) {
      this.slideRef.close()
      // this.slideRef.remove()
    }
  }

  private updateVisibleStatus(visible: boolean) {
    this.visible = visible
    this.visibleCallback && this.visibleCallback(visible)
  }

  updateChildView(childView: any) {
    this.childView = childView
  }
}

export default SlideOpenWrapper
