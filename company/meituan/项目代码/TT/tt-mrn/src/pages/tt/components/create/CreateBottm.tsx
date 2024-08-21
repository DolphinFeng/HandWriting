import { i18nClient } from '@sailor/i18n-mrn'
import { TouchableOpacity, View, Text, StyleSheet, Dimensions } from '@mrn/react-native'
import React, { Component } from 'react'
// import TTHomeFilterConfirm from "../home/TTHomeFilterConfirm"
import { Button as MTDButton } from '@ss/mtd-react-native'
import { isIPhoneWithNotch } from '@src/common/styles/NavigationStyle'
import { MWSButton } from '@src/components/MWSButton'
import { TTHomeFilterStyle } from '../../constants/TTStyle'
import theme from '@src/common/styles/MWSStyle'
import { renderInsetSeprator } from '@src/components/BaseComponents'

interface IProps {
  handleCancel: () => void
  handleCommit: () => void
}

interface IState {}

class CreateBottm extends Component<IProps, IState> {
  render() {
    return (
      <View style={{ backgroundColor: 'white' }}>
        {renderInsetSeprator()}
        <View style={styles.confirmView}>{this.renderButtons()}</View>
        {isIPhoneWithNotch() ? <View style={{ height: 25 }} /> : null}
      </View>
    )
  }

  renderButtons = () => {
    return (
      <>
        {this.renderResetButton()}
        {this.renderConfirmButton()}
      </>
    )
  }

  renderResetButton = () => {
    return (
      <MWSButton
        // wrapperStyles={[dStyle.flowBtn, { backgroundColor: '#FFC300', height: 48, width: screenWidth - 16 }]}
        wrapperStyles={[TTHomeFilterStyle.button, { backgroundColor: theme.grayF5 }]}
        btnText={i18nClient.t('components_create_625fb2', { defaultValue: '取消' })}
        txtStyle={TTHomeFilterStyle.buttonText}
        onPress={this.props.handleCancel}
      />
    )
  }

  renderConfirmButton = () => {
    return (
      <MWSButton
        // wrapperStyles={[dStyle.flowBtn, { backgroundColor: '#FFC300', height: 48, width: screenWidth - 16 }]}
        wrapperStyles={[TTHomeFilterStyle.button, { backgroundColor: theme.yellow300 }]}
        btnText={i18nClient.t('components_create_939d53', { defaultValue: '提交' })}
        txtStyle={TTHomeFilterStyle.buttonText}
        onPress={this.props.handleCommit}
      />
    )
  }
}

export default CreateBottm

const styles = StyleSheet.create({
  confirmView: {
    // flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 7,
    marginBottom: 7,
    height: 54,
    marginHorizontal: 16,
  },
  resetButton: {
    marginRight: 0,
    borderRadius: 4,
    width: (Dimensions.get('window').width - 32 - 15) / 2,
  },
  confirmButton: {
    marginRight: 0,
    borderRadius: 4,
    width: (Dimensions.get('window').width - 32 - 15) / 2,
  },
})
