import { StyleProp, ViewStyle } from '@mrn/react-native'
import React, { PureComponent } from 'react'
import FilterConfirm from '@src/common/helpers/filterPanel/FilterConfirm'
import { MWSButton } from '@src/components/MWSButton'
import { TTHomeFilterStyle } from '../../constants/TTStyle'
import theme from '@src/common/styles/MWSStyle'

interface IProps {
  leftText: string
  rightText: string
  handleLeftPress: () => void
  handleRightPress: () => void

  leftButtonStyle?: StyleProp<ViewStyle>
  rightButtonStyle?: StyleProp<ViewStyle>

  leftTextStyle?: StyleProp<ViewStyle>
  rightTextStyle?: StyleProp<ViewStyle>

  top?: number
  bottom?: number
}

interface IState {}

class TTHomeFilterConfirm extends PureComponent<IProps, IState> {
  render() {
    return (
      <FilterConfirm
        child={
          <>
            {this.renderResetButton()}
            {this.renderConfirmButton()}
          </>
        }
        top={this.props.top}
        bottom={this.props.bottom}
      />
    )
  }

  renderResetButton = () => {
    return (
      <MWSButton
        // wrapperStyles={[dStyle.flowBtn, { backgroundColor: '#FFC300', height: 48, width: screenWidth - 16 }]}
        wrapperStyles={
          this.props.leftButtonStyle
            ? this.props.leftButtonStyle
            : [TTHomeFilterStyle.button, { backgroundColor: theme.grayF5 }]
        }
        btnText={this.props.leftText}
        txtStyle={
          this.props.leftTextStyle
            ? this.props.leftTextStyle
            : TTHomeFilterStyle.buttonText
        }
        onPress={this.props.handleLeftPress}
      />
    )
  }

  renderConfirmButton = () => {
    return (
      <MWSButton
        // wrapperStyles={[dStyle.flowBtn, { backgroundColor: '#FFC300', height: 48, width: screenWidth - 16 }]}
        wrapperStyles={
          this.props.rightButtonStyle
            ? this.props.rightButtonStyle
            : [TTHomeFilterStyle.button, { backgroundColor: theme.yellow300 }]
        }
        btnText={this.props.rightText}
        txtStyle={
          this.props.rightTextStyle
            ? this.props.rightTextStyle
            : TTHomeFilterStyle.buttonText
        }
        onPress={this.props.handleRightPress}
      />
    )
  }
}

export default TTHomeFilterConfirm
