// 顶部导航按钮，可包含左右两个按钮
import React, { Component } from 'react'
import { View, Image, StyleSheet, TouchableOpacity } from '@mrn/react-native'
import { Icon } from '@ss/mtd-react-native'
import home from '@images/home-o.png'

interface PropsValue {
  leftClick: () => void
  rightClick: () => void
}

class NavLeftBar extends Component<PropsValue> {
  constructor(props: PropsValue) {
    super(props)
  }

  render() {
    return (
      <View style={styles.outline}>
        <TouchableOpacity onPress={() => this.props.leftClick()}>
          <Icon type="left" style={styles.icon} />
        </TouchableOpacity>
        <View style={styles.line} />
        <TouchableOpacity onPress={() => this.props.rightClick()}>
          <Image source={home} style={styles.icon} />
        </TouchableOpacity>
      </View>
    )
  }
}
export default NavLeftBar

const styles = StyleSheet.create({
  outline: {
    flexDirection: 'row',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(0,0,0,0.06)',
    width: 88,
    height: 32,
    borderRadius: 20,
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    alignItems: 'center',
    marginLeft: 16
    // marginTop: 6
  },
  line: {
    borderWidth: 0.5,
    height: 18,
    borderColor: 'rgba(0,0,0,0.06)'
  },
  icon: {
    width: 20,
    height: 20
  }
})
