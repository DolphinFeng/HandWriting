import { i18nClient } from '@sailor/i18n-mrn'
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
import { RootTree, UintModal } from '../../constants/TTServiceModule'
import { MWSSearchList } from '@src/components/MWSSearchList'
import { EditCategory } from '../detail/EditCategory'
import SectionListPage from '../detail/search/SectionListPage'
import { getNavigationHeight } from '@src/common/styles/NavigationStyle'
import { CategorySearch } from '../detail/search/CategorySearch'
import theme from '@src/common/styles/MWSStyle'
import SafeModalContainer from '@src/components/SafeModalContainer'

interface IProps {
  cgiTree: Array<RootTree>
  limitedList?: Array<any>
  limitedRange?: boolean
  initStruct: UintModal // 如果没有选择任何服务目录，请传null
  onCancel: () => void
  onFinish: (result: UintModal) => void
}

interface IState {
  isSearching: boolean
  searchKeyWord: string
  pageType: 'catalog' | 'people'
  _serviceCategory: UintModal // 当前选择的目录，来源于服务目录、处理人
}
export class CreateAssignSelectCategory extends Component<IProps, IState> {
  //
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
    return this.renderAssignbody()
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
            {i18nClient.t('components_create_625fb2', { defaultValue: '取消' })}
          </Text>
        </TouchableOpacity>
        <Text style={dStyle.FontBold16}>
          {i18nClient.t('components_create_708c9d', { defaultValue: '请选择' })}
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
          i18nClient.t('components_create_24d1bd', { defaultValue: '搜索服务目录' }),
        )}
        {this.renderBody()}
      </View>
    )
  }

  renderTabs() {
    return (
      <>
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
          {this.renderCatalog()}
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
        limitedRange={this.props.limitedRange}
        limitedList={this.props.limitedList}
        checkedCallback={item => {
          // this.setState({_serviceCategory: item})
          // 产品意见，选择服务目录后，直接关闭弹窗，无需点击“完成”按钮
          this.props.onFinish(item)
        }}
        isCustomCreate={true}
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
    return (
      <EditCategory
        treeData={this.props.cgiTree}
        initSelect={this.state._serviceCategory}
        isCreateCustom={true}
        callback={(currentData, tree) => {
          console.log('new category ' + JSON.stringify(currentData))
          // this.setState({_serviceCategory: currentData})
          // 产品意见，选择三级目录后，直接关闭弹窗，无需点击“完成”按钮
          this.props.onFinish(currentData)
        }}
      />
    )
  }
}
