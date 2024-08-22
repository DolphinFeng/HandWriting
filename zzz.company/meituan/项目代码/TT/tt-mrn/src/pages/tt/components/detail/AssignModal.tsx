import { i18nClient } from '@sailor/i18n-mrn'
/**
 * SLA 状态变化
 */

import React, { Component } from 'react'
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
} from '@mrn/react-native'
import { dStyle } from '../../constants/TTStyle'
import { TicketDetail, RootTree, ThirdTree, UintModal } from '../../constants/TTServiceModule'
import {
  getCategoryTree,
  getOncallUser,
  searchUser,
  getUserCti,
  searchCTIbyName,
} from '../../constants/TTApi'
import { TopViewManager, Toast, SlideModal, Tab } from '@ss/mtd-react-native'
import { MWSSearchList } from '@src/components/MWSSearchList'
import { EditCategory } from './EditCategory'
import { EditPeople } from './EditPeople'
import MWSList from '@src/components/MWSList'
import SectionListPage from './search/SectionListPage'
import { getNavigationHeight } from '@src/common/styles/NavigationStyle'
import { CategorySearch } from './search/CategorySearch'
import { ttSlideModalProp } from '../common/TTHelper'
import theme from '@src/common/styles/MWSStyle'
import { DisplayCategory } from './DisplayCategory'
import { ttTrackDetailClick, TTKeys } from '../../constants/TTKeys'
import check from '@images/ttCheck.png'
import { connectExternalUser, InjectedExternalUserProps } from '../../redux/connectors'
import SafeModalContainer from '@src/components/SafeModalContainer'

interface AssignProps {
  cgiTree: Array<RootTree>
  initStruct: UintModal // 如果没有选择任何服务目录，请传null
  groupMembers?: string[]
  onCancel: () => void
  onFinish: (result: UintModal, needInvite: boolean) => void
  onInviteToGroup?: (misList: string[]) => void
  onFreshTree: (tree) => void
}

interface IState {
  isSearching: boolean
  searchKeyWord: string
  tabType: 'catalog' | 'people' // 服务目录、处理人
  pageType: 'display' | 'edit' // display： 显示当前选择的服务目录结果， edit 选择服务目录页面, 两页面再同一个slideModal里跳转
  _serviceCategory: UintModal // 当前选择的目录，来源于服务目录、处理人
  groupChecked: boolean
}
export const modalMarginBottom = Platform.select({
  android: 24,
  ios: 0,
})

class _AssignModal extends Component<AssignProps & InjectedExternalUserProps, IState> {
  // AssignModal 只有流转页使用，Assign只有发起页使用。
  // 组件内部自己维护数据流，通过callback进行组件间通信

  constructor(props: AssignProps) {
    super(props)
    const init = this.props.initStruct
    this.state = {
      isSearching: false,
      searchKeyWord: '',
      tabType: 'catalog',
      pageType: 'display',
      _serviceCategory: init,
      groupChecked: true,
    }
  }

  componentDidMount() {
    // TODO 全量服务目录内容太多，需要做缓存
    // getCategoryTree().then(res => {
    //   if (res?.code === 200 && res?.data?.items) {
    //     this.setState({tree: res.data.items as Array<RootTree>})
    //   }
    // }).catch(e => {
    //   Toast.open('获取服务目录失败')
    // })
  }
  render() {
    // console.log('render  init   ' + JSON.stringify(this.props.initStruct))
    return this.renderAssignbody()
  }
  handleModalClose = () => {
    this.props.onCancel()
  }

  renderAssignbody() {
    return (
      <SafeModalContainer style={{ marginBottom: modalMarginBottom }}>
        {this.renderTitle()}
        <View style={dStyle.ticketDivider1} />
        {this.renderAssignTabs()}
      </SafeModalContainer>
    )
  }

  renderTitle() {
    const selected = this.judgeLightUp()
    const color = selected ? '#FF8800' : 'rgba(255,136,0,0.45)'
    const isEditCategory = this.state.tabType === 'catalog' && this.state.pageType === 'edit'
    const titleTxt = isEditCategory
      ? i18nClient.t('components_detail_28148f', { defaultValue: '服务目录' })
      : i18nClient.t('components_detail_029469', { defaultValue: '选择指派' })
    const leftTxt = isEditCategory
      ? i18nClient.t('components_detail_5f4112', { defaultValue: '返回' })
      : i18nClient.t('components_detail_625fb2', { defaultValue: '取消' })
    return (
      <View style={dStyle.satisfyWrapper}>
        <TouchableOpacity
          style={dStyle.cancel}
          onPress={() => {
            isEditCategory
              ? this.setState({ pageType: 'display', isSearching: false })
              : this.props.onCancel()
          }}
        >
          <Text style={dStyle.FontRegul16}>{leftTxt}</Text>
        </TouchableOpacity>
        <Text style={dStyle.FontBold16}>{titleTxt}</Text>
        <TouchableOpacity
          disabled={!selected}
          style={{ right: 0, position: 'absolute' }}
          onPress={() => this.handleFinish()}
        >
          {isEditCategory ? null : (
            <Text style={[dStyle.finishTxt, { color: color }]}>
              {i18nClient.t('components_detail_769d88', { defaultValue: '完成' })}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    )
  }

  judgeLightUp() {
    // 三级选中，选择处理人/处理组，才亮起“完成”按钮
    // console.log('finish btn 0 ' + JSON.stringify(this.state._serviceCategory))
    // console.log('finish btn 1 ' + JSON.stringify(this.props.initStruct))
    // TODO 处理人、处理组的判断
    return this.state._serviceCategory?.itemId != null
  }

  handleFinish() {
    // console.log('current _serviceCategory ' + JSON.stringify(this.state._serviceCategory))
    // 将流转拉人情况一并传回
    let needInvite: boolean = false
    if (this.state.groupChecked === true && this.needShowInvite() === true) {
      needInvite = true
    }
    this.props.onFinish(this.state._serviceCategory, needInvite)

    ttTrackDetailClick(TTKeys.DetailClick.finishAssign)
  }

  renderAssignTabs() {
    const { isSearching, tabType } = this.state
    const isEditCategory = this.state.tabType === 'catalog' && this.state.pageType === 'edit'
    const isDisplayCategory = this.state.tabType === 'catalog' && this.state.pageType === 'display'
    return (
      <View style={{ flex: 1, marginHorizontal: 16 }}>
        {isSearching || isEditCategory ? null : this.renderTabs()}
        {isDisplayCategory
          ? null
          : this.renderSearchBar(
              tabType === 'catalog'
                ? i18nClient.t('components_detail_24d1bd', { defaultValue: '搜索服务目录' })
                : i18nClient.t('components_detail_425c3f', { defaultValue: '搜索处理人' }),
            )}
        {this.renderBody()}
      </View>
    )
  }

  renderTabs() {
    const options = this.props.isExternalUser
      ? [
          {
            value: 'catalog',
            label: i18nClient.t('components_detail_28148f', { defaultValue: '服务目录' }),
          },
        ]
      : [
          {
            value: 'catalog',
            label: i18nClient.t('components_detail_28148f', { defaultValue: '服务目录' }),
          },
          {
            value: 'people',
            label: i18nClient.t('components_detail_4c8c9d', { defaultValue: '处理人' }),
          },
        ]

    return (
      <>
        <Tab
          suteTabUnderLineWidth={true}
          isBalanced={true}
          activeUnderlineStyle={dStyle.ActivieUnderline}
          activeTextStyle={dStyle.FontBold16}
          value={this.state.tabType}
          options={options}
          onChange={data => {
            this.setState({ tabType: data.value })
          }}
        />

        <View style={dStyle.ticketDivider1} />
      </>
    )
  }

  renderSearchBar(placeHolderTxt) {
    return (
      <MWSSearchList
        placeHolderTxt={placeHolderTxt}
        hidePadding={true}
        styles={{
          color: theme.yellow800,
        }}
        handleSearchOnFocus={() => {
          this.setState({ isSearching: true })
        }}
        handleSearch={keyWord => {
          console.log('keyword ' + keyWord)
          this.setState({ searchKeyWord: keyWord })
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
        }}
      />
    )
  }

  renderBody() {
    const { tabType, isSearching } = this.state
    return (
      <>
        <View style={isSearching ? { display: 'flex', flex: 1 } : { display: 'none' }}>
          {this.renderSearchContent()}
        </View>
        <View style={isSearching ? { display: 'none' } : { display: 'flex', flex: 1 }}>
          {tabType === 'catalog' ? this.renderCatalog() : null}
          {tabType === 'people' ? this.renderPeople() : null}
        </View>
      </>
    )
  }

  renderSearchContent() {
    const { searchKeyWord } = this.state
    return <View style={{ flex: 1 }}>{searchKeyWord !== '' ? this.getSearchList() : null}</View>
  }

  getSearchList() {
    if (this.state.tabType === 'catalog') {
      ttTrackDetailClick(TTKeys.DetailClick.searchCategory)
    } else {
      ttTrackDetailClick(TTKeys.DetailClick.searchPeople)
    }

    return this.state.tabType === 'catalog' ? (
      <CategorySearch
        keyword={this.state.searchKeyWord}
        checkedCallback={item => {
          console.log('search result ' + JSON.stringify(item))
          this.setState({
            _serviceCategory: item,
            pageType: 'display',
            isSearching: false,
          })
        }}
        isCustomCreate={false}
        sceneId={2}
        // 此key用于创建一个component 来刷新页面
        // 适用于子自己props变更时，刷新自组件
        key={this.state.searchKeyWord}
      />
    ) : (
      <>
        {this.judgeInvite()}
        <SectionListPage
          keyword={this.state.searchKeyWord}
          tree={this.props.cgiTree}
          checkedCallback={item => {
            this.setState({ _serviceCategory: item })
          }}
          key={this.state.searchKeyWord}
        />
      </>
    )
  }

  renderCatalog() {
    return this.state.pageType === 'display' ? (
      <>
        {this.judgeInvite()}
        <DisplayCategory
          showNonWorking={true}
          treeData={this.props.cgiTree}
          initSelect={this.state._serviceCategory}
          goEdit={currentData => {
            console.log('display category ' + JSON.stringify(currentData))
            this.setState({ _serviceCategory: currentData, pageType: 'edit' })
          }}
          changePeople={currentData => {
            this.setState({ _serviceCategory: currentData })
          }}
        />
      </>
    ) : (
      <EditCategory
        treeData={this.props.cgiTree}
        isCreateCustom={false}
        initSelect={this.state._serviceCategory}
        goDisplay={currentData => {
          this.setState({ pageType: 'display', _serviceCategory: currentData })
        }}
        callback={(currentData, tree) => {
          this.props.onFreshTree(tree)
        }}
      />
    )
  }

  renderPeople() {
    return <EditPeople data={this.props.cgiTree} />
  }

  judgeInvite() {
    return this.needShowInvite() === true ? this.renderInvite() : null
  }

  needShowInvite() {
    if (this.props.groupMembers == null || this.props.groupMembers.length === 0) {
      return false
    }

    if (
      this.state._serviceCategory?.assigned != null &&
      this.state._serviceCategory?.assigned !== this.props.initStruct.assigned &&
      this.props.groupMembers.indexOf(this.state._serviceCategory?.assigned) === -1
    ) {
      return true
    }

    return false
  }

  renderInvite() {
    let checked = this.state.groupChecked
    return (
      <TouchableOpacity
        style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center' }}
        onPress={() => {
          this.setState({ groupChecked: !checked })
        }}
      >
        {this.renderGroupCheck(checked)}
        <Text style={{ marginLeft: 8, fontSize: 14, color: 'rgba(0,0,0,0.6)' }}>
          {i18nClient.t('components_detail_b5e01e', {
            defaultValue: '已建群沟通，邀请当前处理人进群',
          })}
        </Text>
      </TouchableOpacity>
    )
  }

  renderGroupCheck(checked: boolean) {
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
}

export const AssignModal = connectExternalUser(_AssignModal)

// 外部直接调用这个方法
export const openAssignModal = (props: AssignProps) => {
  return SlideModal.open({
    useNativeDriver: true,
    visible: true,
    duration: 100,
    modalProps: ttSlideModalProp(props.onCancel),
    children: <AssignModal {...props} />,
  })
}
