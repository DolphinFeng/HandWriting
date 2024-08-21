import React from 'react'
import { Text, TextProps } from '@mrn/react-native'
import { decode } from 'html-entities'
import { iconFont, IGlyph } from './font'
import { styles } from './style'

export interface IIconfFontProps extends TextProps {
  icon: string // mtdicon名称，比如直接填 camera
  // style?: StyleProp<TextStyle> // icon的样式，Text所支持的style
}

export class IconFont extends React.PureComponent<IIconfFontProps> {
  private glyph: IGlyph
  // private entities: Html5Entities = new Html5Entities()

  constructor(props: IIconfFontProps) {
    super(props)
  }

  public render(): React.ReactNode {
    const { icon, style, ...restProps } = this.props
    const { glyphs } = iconFont
    this.glyph = glyphs.find((g: IGlyph): boolean => g['glyph-name'] === icon)

    if (this.glyph && this.glyph.unicode) {
      const iconfont: string = this.glyph.unicode

      return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <Text style={[styles.iconfont, style]} {...restProps}>
          {decode(iconfont)}
        </Text>
      )
    }

    return null
  }
}
