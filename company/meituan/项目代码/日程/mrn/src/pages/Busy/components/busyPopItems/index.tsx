import React from 'react'
import { observer } from 'mobx-react'
import { Text, View, TouchableHighlight } from '@mrn/react-native'
import { device } from '@onejs/mrn-utils'
import { Clickable } from '@src/components/Clickable'
import { IconFont } from '@src/components/IconFont'

import styles, { POP_WIDTH, TRANGLE_WIDTH, POP_BORDER_RADIUS } from './style'

export interface IBusyPopItems {
  centerX: number
  showLeft: boolean // 显示置于最左
  clearPop: () => void
  setEmpLeft: () => void
  removeEmp: () => void
}

@observer
export class BusyPopItems extends React.Component<IBusyPopItems> {
  public render() {
    const { centerX, clearPop, showLeft, setEmpLeft, removeEmp } = this.props
    const { width } = device.screen
    // 防止pop溢出屏幕外
    const left = Math.min(Math.max(centerX - POP_WIDTH / 2, 0), width - POP_WIDTH)
    // 防止pop箭头在极限位置错误
    const tangleLeft = Math.min(
      centerX - TRANGLE_WIDTH,
      width - TRANGLE_WIDTH - 2 * POP_BORDER_RADIUS
    )
    const underlayColor = 'rgba(0, 0, 0, 0.04)'
    return (
      <Clickable onPress={clearPop} style={styles.popContanier}>
        <View
          style={[
            styles.popItems,
            {
              left
            }
          ]}
        >
          {showLeft && (
            <TouchableHighlight
              underlayColor={underlayColor}
              style={styles.popBtns}
              onPress={setEmpLeft}
            >
              <>
                <IconFont icon='dx-calplaceonleft' style={styles.popIcons} />
                <Text style={styles.popText}>置于最前</Text>
              </>
            </TouchableHighlight>
          )}
          <TouchableHighlight
            underlayColor={underlayColor}
            style={styles.popBtns}
            onPress={removeEmp}
          >
            <>
              <IconFont icon='dx-calcancelinvite' style={styles.popIcons} />
              <Text style={styles.popText}>取消邀请</Text>
            </>
          </TouchableHighlight>
        </View>
        <View style={[styles.popTrangle, { left: tangleLeft }]} />
      </Clickable>
    )
  }
}
