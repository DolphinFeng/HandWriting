import { i18nClient } from '@sailor/i18n-mrn'
/**
 * 全局搜索
 */

import React, { Component } from 'react'
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  Keyboard,
  ViewStyle,
  Platform,
} from '@mrn/react-native'
import { MWSStyle } from '../common/styles/MWSCommonStyle'
import searchImg from '@images/search.png'
import { Input } from '@ss/mtd-react-native'
import { PlatformType } from '@src/common/helpers/PlatfromHelper'

interface IProps {
  placeHolderTxt?: string
  hidePadding?: boolean // 默认有paddingHoritial 这也是最初设计失误的地方
  handleClearChange?: (string) => void
  handleSearchOnFocus?: () => void
  handleSearch?: (string) => void
  handleCancelSearch?: () => void
  marginTop?: number
  marginBottom?: number
  styles?: any
  /** 是否自动搜索(自带 debounce) */
  autoSearch: boolean
  debounceTime?: number
  autoFocus: boolean
}

interface IState {
  searchText: string
  isSearching: boolean
}
export class MWSSearchList extends Component<IProps, IState> {
  static defaultProps = {
    autoSearch: true,
    autoFocus: false,
  }

  lockSearchCallback = false

  constructor(props: IProps) {
    super(props)
    this.state = {
      searchText: '',
      isSearching: false,
    }
  }
  render() {
    return <View>{this.renderSearch()}</View>
  }

  renderSearch() {
    const { hidePadding } = this.props
    return (
      <View
        style={{
          height: 36,
          paddingHorizontal: hidePadding != null ? 0 : 16,
          marginTop: this.props.marginTop ?? 16,
          marginBottom: this.props.marginBottom ?? 4, //FIXME: 调整这里的 margin
          alignItems: 'center',
          flexDirection: 'row',
        }}
      >
        <Image
          source={searchImg}
          style={{
            alignSelf: 'center',
            position: 'absolute',
            width: 18,
            height: 18,
            left: hidePadding != null ? 8 : 30,
          }}
        />

        <Input
          style={{
            height: 36,
            backgroundColor: 'rgba(0,0,0,0.04)',
            borderRadius: 10,
            paddingLeft: 36,
          }}
          styles={{ textInput: { fontSize: 16, textAlignVertical: 'center' } }}
          placeholder={this.props.placeHolderTxt ?? ''}
          value={this.state.searchText}
          autoFocus={this.props.autoFocus}
          onChange={(content: string) => this.handleInputChange(content)}
          clearButtonMode="always"
          onFocus={() => this.searchOnFocusCallback()}
          onSubmitEditing={() => {
            console.log('submit')

            this.props.handleSearch(this.state.searchText)
          }}
          returnKeyType="search"
        />

        {this.state.isSearching ? this.renderCancel() : null}
      </View>
    )
  }

  renderCancel() {
    return (
      <TouchableOpacity onPress={() => this.cancelSearchCallback()}>
        <Text
          style={[MWSStyle.font16blue, { left: 16, paddingRight: 16 }, this.props.styles ?? {}]}
        >
          {i18nClient.t('base_components_625fb2', { defaultValue: '取消' })}
        </Text>
      </TouchableOpacity>
    )
  }

  cancelSearchCallback() {
    console.log('search cacel')
    this.setState({ searchText: '', isSearching: false })
    Keyboard.dismiss()
    this.props.handleCancelSearch()
  }
  searchOnFocusCallback() {
    console.log('search onfocus')
    this.setState({ isSearching: true })
    this.props.handleSearchOnFocus()
  }

  f = debounce(
    (content: string) => this.handleSearchContent(content),
    this.props.debounceTime ?? 300,
  )

  handleInputChange = (content: string) => {
    console.log('search txt ' + content)

    this.setState({ searchText: content })

    if (Platform.OS === 'ios') {
      this.f(content)
    } else {
      // console.log('platform', content, Platform.OS, this.lockSearchCallback);

      // android 不支持 debounce，手动处理
      if (this.lockSearchCallback) return

      this.lockSearchCallback = true

      this.handleSearchContent(content)

      let time = new Date().getTime()

      setTimeout(() => {
        // console.log('timout 设置回来', time - (new Date()).getTime())

        this.lockSearchCallback = false
      }, this.props.debounceTime ?? 300)
    }
  }

  handleSearchContent(content?: string) {
    console.log('debounce', content)
    this.props.handleSearch(content)

    if (content === '') {
      this.props.handleClearChange(content)
    }
  }
}

export const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
  let timeout: number = 0

  const debounced = (...args: any[]) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), waitFor)
  }

  return debounced as (...args: Parameters<F>) => ReturnType<F>
}
