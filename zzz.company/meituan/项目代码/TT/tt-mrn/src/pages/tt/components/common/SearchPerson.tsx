import { i18nClient } from '@sailor/i18n-mrn'
import React, { Component } from 'react'
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
} from '@mrn/react-native'
import { SlideModal, slideModalStyles } from '@ss/mtd-react-native'
import { MWSSearchList } from '@src/components/MWSSearchList'
import { ttSlideModalProp } from './TTHelper'
import { dStyle } from '../../constants/TTStyle'
import { searchUser } from '../../constants/TTApi'
import { CCPersonModel } from '../../constants/TtServiceModule'
import defaultAvatar from '@images/default-avator.png'
import check from '@images/ttCheck.png'
import theme from '@src/common/styles/MWSStyle'
import { getFromStorage, saveToStorage } from '@src/common/helpers/StorageHelper'
import { renderSearchResultName } from './SearchPersonHelper'
import SafeModalContainer from '@src/components/SafeModalContainer'

interface IProps {
  onCancel: () => void
  onConfirm: (selectedList: Array<CCPersonModel>) => void
}

interface IState {
  searchKeyWord: string
  isSearching: boolean
  searchResultList: Array<CCPersonModel>
  /** 最近抄送人列表 */
  // recentCCPeopleList: Array<CCPersonModel>
  /** 已选中人的 mis 列表 */
  // selectedPeopleList: Array<string>
  recentListRefresh: boolean
}

const { width, height } = Dimensions.get('screen')

class SearchPerson extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      isSearching: false,
      searchKeyWord: '',
      searchResultList: [],
      recentListRefresh: false,
    }
  }

  render() {
    return (
      <SlideModal
        useNativeDriver={true}
        visible={true}
        modalProps={ttSlideModalProp(() => {
          this.props.onCancel()
        })}
        duration={100}
      >
        {this.renderBody()}
      </SlideModal>
    )
  }

  renderBody() {
    return (
      <SafeModalContainer>
        {this.renderTitle()}
        <View style={dStyle.ticketDivider1} />
        {this.renderSearchBar(
          i18nClient.t('components_common_c15264', { defaultValue: '搜索发起人' }),
        )}
        {this.state.isSearching ? this.renderSearchList() : null}
      </SafeModalContainer>
    )
  }

  renderTitle() {
    return (
      <View style={dStyle.satisfyWrapper}>
        <TouchableOpacity style={dStyle.cancel} onPress={() => this.props.onCancel()}>
          <Text style={dStyle.FontRegul16}>
            {i18nClient.t('components_common_625fb2', { defaultValue: '取消' })}
          </Text>
        </TouchableOpacity>
        <Text style={dStyle.FontBold16}>
          {i18nClient.t('components_common_dc5645', { defaultValue: '选择发起' })}
        </Text>
        <TouchableOpacity
          style={{ right: 0, position: 'absolute' }}
          // onPress={() => this.handleConfirm()}
        >
          {/* <Text style={dStyle.FontRegul16}>{`完成${this.state.selectedPeopleList.length}`}</Text> */}
        </TouchableOpacity>
      </View>
    )
  }

  renderSearchBar(placeHolderTxt: string) {
    // TODO 搜索待完善
    return (
      <MWSSearchList
        placeHolderTxt={placeHolderTxt}
        styles={{
          color: theme.yellow800,
        }}
        handleSearchOnFocus={() => this.setState({ isSearching: true })}
        handleSearch={keyWord => {
          console.log('keyword ' + keyWord)
          this.setState({ searchKeyWord: keyWord }, () => {
            this.fetchData()
          })
        }}
        handleCancelSearch={() => {
          this.setState({ isSearching: false, searchKeyWord: '' })
        }}
        handleClearChange={keyWord => {
          console.log('clear' + keyWord)
          // 清空搜索内容
          if (keyWord === '') {
            this.setState({ searchKeyWord: keyWord })
          }
          //
        }}
      />
    )
  }

  renderSearchList() {
    return (
      <FlatList
        // ref={_c => this.listRef = _c}
        overScrollMode="never"
        data={this.state.searchResultList}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => this.renderSearchItem(item, index)}
        onScrollBeginDrag={() => Keyboard.dismiss()}
        // onEndReached={() => this.onReachEnd()}
        // onEndReachedThreshold={0.1}
        // refreshControl={this.renderRefreshControl()}
        // ListFooterComponent={this.ListFooterComponent}
        // onScroll={this._scrolled.bind(this)}
      />
    )
  }

  renderSearchItem(item: CCPersonModel, index: number) {
    const avatar = item.avatar?.length > 0 ? { uri: item.avatar } : defaultAvatar
    const name = item.i18nDisplayName ? `${item.i18nDisplayName}/${item.username}` : (item.displayName ? `${item.displayName}/${item.username}` : item.username)

    const w = 35
    return (
      <TouchableOpacity
        key={index}
        style={{
          flexDirection: 'row',
          height: w,
          alignItems: 'center',
          marginLeft: 16,
          marginTop: index !== 0 ? 18 : 21,
        }}
        onPress={() => this.handleSearchItemPress(item)}
      >
        <Image
          source={avatar}
          defaultSource={defaultAvatar}
          style={{ width: w, height: w, borderRadius: w / 2 }}
        />

        {renderSearchResultName(name, this.state.searchKeyWord)}
        {Boolean(item.external) && (
          <Text style={dStyle.exteranlTag}>
            {i18nClient.t('components_common_96b0a7', { defaultValue: '外部' })}
          </Text>
        )}
      </TouchableOpacity>
    )
  }

  handleSearchItemPress = (item: CCPersonModel) => {
    console.log('clicked', item)

    this.setState({ isSearching: false })
    this.handleSelectSearchPerson(item)
  }

  handleSelectSearchPerson = (item: CCPersonModel) => {
    this.props.onConfirm([item])
  }

  async fetchData() {
    const r = await searchUser(this.state.searchKeyWord)

    // TODO: 需要获取部门信息
    if (r?.data?.items?.length > 0) {
      this.setState({ searchResultList: r?.data?.items })
    } else {
      this.setState({ searchResultList: [] })
    }
  }
}

export default SearchPerson
