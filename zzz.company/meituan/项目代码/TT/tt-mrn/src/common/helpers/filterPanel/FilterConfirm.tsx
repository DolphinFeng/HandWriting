import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Dimensions,
  StyleProp,
  ViewStyle
} from '@mrn/react-native'
import React, { Component } from 'react'
import { Button as MTDButton } from '@ss/mtd-react-native'
import { i18nClient } from '@sailor/i18n-mrn'

interface IProps {
  onConfirmPress?: () => void
  onResetPress?: () => void
  enableConfirmButton?: boolean
  child?: JSX.Element
  top?: number
  bottom?: number
}

interface IState {}

class FilterConfirm extends Component<IProps, IState> {
  render() {
    return (
      <View
        style={[
          styles.confirmView,
          this.props.top ? { marginTop: this.props.top } : null,
          this.props.bottom ? { marginBottom: this.props.bottom } : null
        ]}
      >
        {this.props.child != null ? this.props.child : this.renderButtons()}
      </View>
    )
  }

  renderButtons = () => {
    return (
      <>
        <MTDButton
          type="default"
          style={styles.resetButton}
          onPress={this.props.onResetPress}
        >
           {i18nClient.t('components_home_4b9c32', { defaultValue: '重置' })}
          
        </MTDButton>
        <MTDButton
          type="primary"
          style={styles.confirmButton}
          onPress={this.props.onConfirmPress}
          disabled={!this.props.enableConfirmButton ?? false}
        >
        {i18nClient.t('components_home_38cf16', { defaultValue: '确定' })}
        </MTDButton>
      </>
    )
  }
}

export default FilterConfirm

const styles = StyleSheet.create({
  confirmView: {
    // flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
    marginBottom: 16
  },
  resetButton: {
    marginRight: 0,
    borderRadius: 4,
    width: (Dimensions.get('window').width - 32 - 15) / 2
  },
  confirmButton: {
    marginRight: 0,
    borderRadius: 4,
    width: (Dimensions.get('window').width - 32 - 15) / 2
  }
})
