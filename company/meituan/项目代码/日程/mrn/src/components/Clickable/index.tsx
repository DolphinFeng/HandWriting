import React from 'react'
import {
  TouchableHighlight,
  TouchableHighlightProps,
  StyleProp,
  TextStyle
} from '@mrn/react-native'

interface IClickableProps extends TouchableHighlightProps {
  onPress: () => void
  style?: StyleProp<TextStyle>
}

export class Clickable extends React.Component<IClickableProps> {
  public render(): React.ReactNode {
    const { style } = this.props
    const underlayColor: string = null

    return (
      <TouchableHighlight
        style={style}
        underlayColor={underlayColor}
        onPress={this.doExpensivePress}
      >
        <>{this.props.children}</>
      </TouchableHighlight>
    )
  }

  private doExpensivePress = (): void => {
    requestAnimationFrame((): void => {
      this.props.onPress()
    })
  }
}
