import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ImageBackground
} from '@mrn/react-native'
import React, { Component } from 'react'
import downImage from '@images/down.png'
import { checkNull } from '../HelperFunctions'

interface IProps {
  /** 头部显示文字 */
  pikcerHeaderIndicator: string
  /** placeholder */
  pickerPlaceholder: string
  /** 选中项显示的文字 */
  pickerSelectedText?: string
  /** picker 点击 */
  onPickerPress: () => void
  marginTop?: number
}

interface IState {}

class FilterOptionPicker extends Component<IProps, IState> {
  render() {
    return (
      <View style={{ marginTop: this.props.marginTop ?? 20 }}>
        <Text style={styles.indicatorText}>
          {this.props.pikcerHeaderIndicator}
        </Text>
        <TouchableOpacity
          style={[styles.processTypeButton, styles.top]}
          onPress={this.props.onPickerPress}
        >
          {this.renderText()}
          <ImageBackground
            style={{ width: 10, height: 10, paddingRight: 24, opacity: 0.24 }}
            source={downImage}
          />
        </TouchableOpacity>
      </View>
    )
  }

  renderText() {
    const selectedText = this.props.pickerSelectedText

    return (
      <Text
        style={
          selectedText != null
            ? styles.processTextSelect
            : styles.processTextHint
        }
      >
        {selectedText != null ? selectedText : this.props.pickerPlaceholder}
      </Text>
    )
  }
}

export default FilterOptionPicker

const styles = StyleSheet.create({
  // sectionTop: {
  //   marginTop: 20
  // },
  top: {
    marginTop: 8
  },
  indicatorText: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.6)',
    lineHeight: 20
  },
  processTypeButton: {
    height: 32,
    backgroundColor: '#F7F7F7',
    borderRadius: 3,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row'
  },
  processTextSelect: {
    color: 'black',
    paddingHorizontal: 13
  },
  processTextHint: {
    color: 'rgba(0, 0, 0, 0.24)',
    fontSize: 14,
    paddingHorizontal: 13
  }
})
