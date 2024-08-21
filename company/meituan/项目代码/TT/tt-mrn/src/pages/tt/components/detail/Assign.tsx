import { i18nClient } from '@sailor/i18n-mrn'
/**
 * SLA 状态变化
 */

import React, { Component } from 'react'
import { Text, View, Image, TouchableOpacity, Dimensions, StatusBar } from '@mrn/react-native'
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
import theme from '@src/common/styles/MWSStyle'
import { EditCategoryFromCreate } from './EditCategoryFromCreate'
import { connectExternalUser, InjectedExternalUserProps } from '../../redux/connectors'
import SafeModalContainer from '@src/components/SafeModalContainer'

interface IProps {
  cgiTree: Array<RootTree>
  initStruct: UintModal // 如果没有选择任何服务目录，请传null
  /** domain 空间名称，来自链接跳转 */
  domain?: string
  onCancel: () => void
  onFinish: (result: UintModal) => void
  onRefreshTree: (tree: RootTree[]) => void
}

interface IState {
  isSearching: boolean
  searchKeyWord: string
  pageType: 'catalog' | 'people'
  _serviceCategory: UintModal // 当前选择的目录，来源于服务目录、处理人
}
class _Assign extends Component<IProps & InjectedExternalUserProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      isSearching: false,
      searchKeyWord: '',
      pageType: 'catalog',
      _serviceCategory: this.props.initStruct,
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
    return this.renderAssignbody() // <>
    //   <SlideModal
    //     useNativeDriver={true}
    //     visible={true}
    //     modalProps={ttSlideModalProp(this.handleModalClose)}
    //   >
    //     {this.renderAssignbody()}
    //   </SlideModal>
    // </>
  }
  handleModalClose = () => {
    this.props.onCancel()
  }

  renderAssignbody() {
    return (
      <SafeModalContainer>
        {this.renderTitle()}
        <View style={dStyle.ticketDivider1} />
        {this.renderAssignTabs()}
      </SafeModalContainer>
    )
  }

  renderTitle() {
    const selected = this.judgeLightUp()
    const color = selected ? '#FF8800' : 'rgba(255,136,0,0.45)'
    return (
      <View style={dStyle.satisfyWrapper}>
        <TouchableOpacity style={dStyle.cancel} onPress={() => this.props.onCancel()}>
          <Text style={dStyle.FontRegul16}>
            {i18nClient.t('components_detail_625fb2', { defaultValue: '取消' })}
          </Text>
        </TouchableOpacity>
        <Text style={dStyle.FontBold16}>
          {i18nClient.t('components_detail_029469', { defaultValue: '选择指派' })}
        </Text>
        {/* <TouchableOpacity
           disabled={!selected}
           style={{right: 0, position: 'absolute'}}
           onPress={() => this.handleFinish()}
          >
           <Text style={[dStyle.finishTxt, {color: color}]}>完成</Text>
          </TouchableOpacity> */}
      </View>
    )
  }

  judgeLightUp() {
    // 三级选中，才亮起“完成”按钮
    return (
      this.state._serviceCategory !== this.props.initStruct &&
      this.state._serviceCategory.itemId != null
    )
  }

  handleFinish() {
    console.log('current select category ' + JSON.stringify(this.state._serviceCategory))
    this.props.onFinish(this.state._serviceCategory)
  }

  renderAssignTabs() {
    const { isSearching, pageType } = this.state

    return (
      <View style={{ flex: 1, marginHorizontal: 16 }}>
        {isSearching ? null : this.renderTabs()}
        {this.renderSearchBar(
          pageType === 'catalog'
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
          value={this.state.pageType}
          options={options}
          onChange={data => {
            this.setState({ pageType: data.value })
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
    const { pageType, isSearching } = this.state
    return (
      <>
        <View style={isSearching ? { display: 'flex', flex: 1 } : { display: 'none' }}>
          {this.renderSearchContent()}
        </View>
        <View style={isSearching ? { display: 'none' } : { display: 'flex', flex: 1 }}>
          {pageType === 'catalog' ? this.renderCatalog() : null}
          {pageType === 'people' ? this.renderPeople() : null}
        </View>
      </>
    )
  }

  renderSearchContent() {
    const { searchKeyWord } = this.state
    return <View style={{ flex: 1 }}>{searchKeyWord !== '' ? this.getSearchList() : null}</View>
  }

  getSearchList() {
    return this.state.pageType === 'catalog' ? (
      <CategorySearch
        keyword={this.state.searchKeyWord}
        isCustomCreate={false}
        treeRange={true}
        treeList={this.props.cgiTree}
        checkedCallback={item => {
          // this.setState({_serviceCategory: item})
          // 产品意见，选择服务目录后，直接关闭弹窗，无需点击“完成”按钮
          this.props.onFinish(item)
        }}
        sceneId={1}
        // 此key用于创建一个component 来刷新页面
        // 适用于子自己props变更时，刷新自组件
        key={this.state.searchKeyWord}
      />
    ) : (
      <SectionListPage
        keyword={this.state.searchKeyWord}
        tree={this.props.cgiTree}
        checkedCallback={item => {
          //  this.setState({_serviceCategory: item})
          // 产品意见，选择人后，直接关闭弹窗，无需点击“完成”按钮
          this.props.onFinish(item)
        }}
        key={this.state.searchKeyWord}
      />
    )
  }

  renderCatalog() {
    // 发起页支持一二级直接发起TT, 与详情页流转差别比较大，所以新写一个组件
    return (
      <EditCategoryFromCreate
        treeData={this.props.cgiTree}
        initSelect={this.state._serviceCategory}
        domain={this.props?.domain}
        callback={currentData => {
          console.log('new category ' + JSON.stringify(currentData))
          // this.setState({_serviceCategory: currentData})
          // 产品意见，选择三级目录后，直接关闭弹窗，无需点击“完成”按钮
          this.props.onFinish(currentData)
        }}
        updateTree={tree => {
          this.props.onRefreshTree(tree)
        }}
      />
    )
  }

  renderPeople() {
    return <EditPeople data={this.props.cgiTree} />
  }
}

export const Assign = connectExternalUser(_Assign)
