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
  ImageBackground,
  ViewStyle,
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
import { renderInsetSeprator } from '@src/components/BaseComponents'
import { isIPhoneWithNotch } from '@src/common/styles/NavigationStyle'
import SafeModalContainer from '@src/components/SafeModalContainer'

interface IProps {
  onCancel: () => void
  onConfirm: (selectedList: Array<CCPersonModel>) => void
  /** 已选中人的列表 */
  selectedPeopleList?: Array<CCPersonModel>
  ticketId?: number
}

interface IState {
  searchKeyWord: string
  isSearching: boolean
  searchResultList: Array<CCPersonModel>
  /** 最近抄送人列表 */
  recentCCPeopleList: Array<CCPersonModel>
  /** 已选中人的 mis 列表 */
  selectedMisList: Array<string>
  recentListRefresh: boolean
}

const CCPersonKey = 'TT_CCPersonList'
const CCPersonTestKey = 'TT_CCPersonList_Test3'

class CCPerson extends Component<IProps, IState> {
  private recentListRef = null
  constructor(props: IProps) {
    super(props)

    let selectdMisList = []
    console.log('selected00', this.props.selectedPeopleList)

    if (this.props.selectedPeopleList?.length > 0) {
      selectdMisList = this.props.selectedPeopleList.map(item => item.username)
      console.log('selected111', selectdMisList)
    }

    this.state = {
      isSearching: false,
      searchKeyWord: '',
      searchResultList: [],
      recentCCPeopleList: [],
      selectedMisList: selectdMisList,
      recentListRefresh: false,
    }

    // TODO: 是否放在其它地方获取？
    this.getRecentPeopleFromStorage()
  }

  // 在开始的时候，从存储中获取最近选中过的人
  async getRecentPeopleFromStorage() {
    const r = await getFromStorage(CCPersonTestKey).catch(e => console.log('获取本地存储失败'))

    console.log('xxx', r)

    console.log('mmmm', r.value)

    let recentListInStorage = []

    if (r?.value != null && r?.value?.length > 0) {
      recentListInStorage = JSON.parse(r.value) as Array<CCPersonModel>
    }

    let tempList = []

    // 有已经选中的
    if (this.props.selectedPeopleList?.length > 0) {
      const selected = this.props.selectedPeopleList

      // 找到本地存储里没有的，存到列表里，用于展示出来给用户选择
      selected.forEach(p => {
        const x = recentListInStorage.find(item => item.username === p.username)
        if (x != null) {
        } else {
          tempList.push(p)
        }
      })
    }

    // 只是一个临时的列表
    let newList = tempList.concat(recentListInStorage)

    console.log('newnewlist', newList)

    this.setState({ recentCCPeopleList: newList })
  }

  // 在确定的时候更新选中的人到存储中
  async saveRecentPeopleToStorage(value: string) {
    const r = await saveToStorage(CCPersonTestKey, value).catch(e => console.log('存储倒本地失败'))

    console.log(JSON.stringify(r))
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
          i18nClient.t('components_common_cead1d', { defaultValue: '搜索抄送人' }),
        )}
        {this.state.isSearching ? this.renderSearchList() : this.renderSelectedPeople()}
      </SafeModalContainer>
    )
  }

  renderTitle() {
    const count = this.state.selectedMisList.length
    const countText = count > 0 ? `(${count})` : ''
    return (
      <View style={dStyle.satisfyWrapper}>
        <TouchableOpacity style={dStyle.cancel} onPress={() => this.props.onCancel()}>
          <Text style={dStyle.FontRegul16}>
            {i18nClient.t('components_common_625fb2', { defaultValue: '取消' })}
          </Text>
        </TouchableOpacity>
        <Text style={dStyle.FontBold16}>
          {i18nClient.t('components_common_1a9cd1', { defaultValue: '选择抄送' })}
        </Text>
        <TouchableOpacity
          style={{ right: 0, position: 'absolute' }}
          onPress={() => this.handleConfirm()}
        >
          <Text style={[dStyle.FontRegul16, { color: theme.yellow800, fontWeight: 'bold' }]}>
          {i18nClient.getFormatText('components_common_0ad691',`确定${countText}` ,{
              countText: countText
            })}
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  handleConfirm() {
    const list = this.state.recentCCPeopleList.filter(item =>
      this.state.selectedMisList.includes(item.username),
    )
    this.props.onConfirm(list)

    this.props.onCancel()
  }

  // 已选中的人
  renderSelectedPeople() {
    return (
      <>
        {this.renderSelectedAvatars()}
        {this.renderRecentCC()}
        {this.renderRecentCCList()}
        {isIPhoneWithNotch() ? <View style={{ height: 20 }} /> : null}
      </>
    )
  }

  renderSelectedAvatars() {
    const selectedPeople = this.state.recentCCPeopleList.filter(item =>
      this.state.selectedMisList.includes(item.username),
    )

    return selectedPeople.length > 0 ? (
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginTop: 12,
          marginHorizontal: 16,
        }}
      >
        {this.renderAvatarList(selectedPeople)}
      </View>
    ) : null
  }

  renderAvatarList(list: Array<CCPersonModel>) {
    return (
      <>
        {list.map((item, index) => {
          const img = item?.avatar?.length > 0 ? { uri: item.avatar } : defaultAvatar
          return (
            <TouchableOpacity
              onPress={() => this.handleItemCheck(item)}
              activeOpacity={1}
              key={'cc_avatarlist' + `${item.username}`}
            >
              <ImageBackground
                source={img}
                defaultSource={defaultAvatar}
                style={{
                  width: 35,
                  height: 35,
                  borderRadius: 17.5,
                  marginLeft: 8,
                  marginTop: 8,
                  overflow: 'hidden',
                }}
              />
            </TouchableOpacity>
          )
        })}
      </>
    )
  }

  renderRecentCC = () => {
    return (
      <>
        <Text style={CCPersonStyle.recentCCTitle}>
          {i18nClient.t('components_common_074835', { defaultValue: '最近抄送人' })}
        </Text>
        {renderInsetSeprator(null, null, theme.grayE9, 4)}
      </>
    )
  }

  // 最近抄送人列表
  renderRecentCCList() {
    return (
      <FlatList
        overScrollMode="never"
        // ref={_c => this.recentListRef = _c}
        data={this.state.recentCCPeopleList}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => this.renderCCPeopleItem(item, index)}
        // onEndReached={() => this.onReachEnd()}
        // onEndReachedThreshold={0.1}
        // refreshControl={this.renderRefreshControl()}
        // ListFooterComponent={this.ListFooterComponent}
        // onScroll={this._scrolled.bind(this)}
        extraData={this.state.recentListRefresh} // extraData 强制刷新
      />
    )
  }

  renderCCPeopleItem(item: CCPersonModel, index: number) {
    const avatar = item.avatar?.length > 0 ? { uri: item.avatar } : defaultAvatar
    const name = item.i18nDisplayName?.length > 0 ? `${item.i18nDisplayName}/${item.username}` : (item.displayName ? `${item.displayName}/${item.username}` : item.username)

    let selected = this.state.selectedMisList.includes(item.username)

    // console.log('renderCCItem', item.username, selected);

    return (
      <View>
        <TouchableOpacity
          key={index}
          style={{
            flexDirection: 'row',
            height: 35,
            alignItems: 'center',
            marginLeft: 16,
            maxWidth: Dimensions.get('window').width - 80, // 确保内容不超出屏幕宽度
            // marginTop: index !== 0 ? 24 : 21,
            // backgroundColor: 'red',
            marginTop: 10,
            marginBottom: 8,
          }}
          onPress={() => this.handleItemCheck(item)}
          activeOpacity={1}
        >
          {this.renderCCCheck(selected)}
          <ImageBackground
            source={avatar}
            defaultSource={defaultAvatar}
            style={{
              width: 35,
              height: 35,
              borderRadius: 17.5,
              marginLeft: 12,
              overflow: 'hidden',
            }}
          />

          <Text style={[dStyle.font16By84, { marginLeft: 11 }]} numberOfLines={1} ellipsizeMode='tail'>{name}</Text>

        </TouchableOpacity>
        {renderInsetSeprator(50)}
      </View>
    )
  }

  handleItemCheck(item: CCPersonModel) {
    console.log('handle item', item.username)

    let currentSelected = Object.assign([], this.state.selectedMisList)

    if (currentSelected.includes(item.username)) {
      console.log('has')

      currentSelected = currentSelected.filter(v => v !== item.username)
    } else {
      console.log('no has')

      currentSelected.push(item.username)
      console.log('result1', currentSelected, currentSelected.length)
    }

    // 通过
    this.setState({
      selectedMisList: currentSelected,
      recentListRefresh: !this.state.recentListRefresh,
    })

    console.log('result2', currentSelected)
  }

  renderCCCheck(checked: boolean) {
    const w = 20
    return checked ? (
      <View
        style={{
          width: w,
          height: w,
          borderRadius: w / 2,
          backgroundColor: theme.yellow300,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Image source={check} />
      </View>
    ) : (
      <View
        style={{
          width: w,
          height: w,
          borderColor: theme.gray24,
          borderWidth: 1,
          borderRadius: w / 2,
        }}
      />
    )
  }

  renderSearchBar(placeHolderTxt) {
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
        overScrollMode="never"
        // ref={_c => this.listRef = _c}
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

  async fetchData() {
    const r = await searchUser(this.state.searchKeyWord, this.props.ticketId)

    // TODO: 需要获取部门信息
    if (r?.data?.items?.length > 0) {
      // const items = r?.data?.items as Array<CCPersonModel>

      // console.log('items', items);

      // const misIdList = items.map(item => item.username)
      // console.log('misid', misIdList);

      // // TODO: 提换成 tt 的接口
      // const avatars = await fetchAvatorList(misIdList)

      // if (misIdList.length === avatars.length) {
      //   const newItems = items.map((item, index) => {
      //     const newItem = Object.assign({}, item)
      //     newItem.avatar = misIdList[index]
      //     return newItem
      //   })

      //   this.setState({ dataList: newItems })
      this.setState({ searchResultList: r?.data?.items })
    } else {
      this.setState({ searchResultList: [] })
    }
  }

  // renderRefreshControl () {
  //   return this.state.enableRefreshAndLoadMore ?  (
  //     <RefreshControl
  //     refreshing={this.state.isRefreshing}
  //     onRefresh={() => {
  //       this.onRefresh()
  //     }}
  //   />)
  //   : null
  // }

  renderSearchItem(item: CCPersonModel, index: number) {
    const avatar = item.avatar?.length > 0 ? { uri: item.avatar } : defaultAvatar
    const name = item.i18nDisplayName ? `${item.i18nDisplayName}/${item.username}` : item.username
    return (
      <TouchableOpacity
        key={index}
        style={{
          flexDirection: 'row',
          height: 35,
          alignItems: 'center',
          marginLeft: 16,
          marginTop: index !== 0 ? 18 : 21,
        }}
        onPress={() => this.handleSearchItemPress(item)}
      >
        <ImageBackground
          source={avatar}
          defaultSource={defaultAvatar}
          style={{
            width: 35,
            height: 35,
            borderRadius: 17.5,
            overflow: 'hidden',
          }}
        />

        {renderSearchResultName(name, this.state.searchKeyWord)}
        {this.renderExternalBadge(item.external)}
      </TouchableOpacity>
    )
  }

  renderExternalBadge(external: boolean) {
    if (!external) return null
    return (
      <Text style={dStyle.exteranlTag}>
        {i18nClient.t('components_common_96b0a7', { defaultValue: '外部' })}
      </Text>
    )
  }

  handleSearchItemPress = (item: CCPersonModel) => {
    console.log('clicked', item)

    this.setState({ isSearching: false })
    this.handleSelectSearchPerson(item)
  }

  handleSelectSearchPerson = (item: CCPersonModel) => {
    const x = this.state.recentCCPeopleList.filter(i => i.username === item.username)

    if (x.length === 0) {
      let newRecentCCList = Object.assign([], this.state.recentCCPeopleList)

      console.log('ccccc', newRecentCCList)

      newRecentCCList.unshift(item)

      this.state.selectedMisList.push(item.username)

      this.setState({
        recentCCPeopleList: newRecentCCList,
        recentListRefresh: !this.state.recentListRefresh,
      })

      // 选人后更新最近联系人
      // FIXME: TEMP
      this.saveRecentPeopleToStorage(JSON.stringify(newRecentCCList))
    }
  }
}

export default CCPerson

const CCPersonStyle = StyleSheet.create({
  name: {
    fontSize: theme.size17,
    lineHeight: theme.height24,
    color: theme.gray87,
  },
  recentCCTitle: {
    marginTop: 16,
    marginLeft: 16,
    fontSize: theme.size12,
    lineHeight: theme.height17,
    color: theme.gray36,
    ...theme.fontBold,
  } as ViewStyle,
})
