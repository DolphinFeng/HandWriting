import React, { Component } from 'react'
import { TouchableOpacity } from '@mrn/react-native'
import { Icon } from '@ss/mtd-react-native'
import MRNUtils from '@mrn/mrn-utils'

interface IProps {
  callback?: () => void
}

// 适合于首页的返回按钮，只有单个按钮
class HeaderLeftBtn extends Component<IProps, any> {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <TouchableOpacity
        onPress={() => {
          try {
            if (this.props.callback) {
              this.props.callback()
            } else {
              MRNUtils.close()
            }
          } catch (error) {
            console.warn('go back error')
          }
        }}
      >
        <Icon type="left" style={{ height: 20, width: 20, marginLeft: 12 }} />
      </TouchableOpacity>
    )
  }
}
export default HeaderLeftBtn
