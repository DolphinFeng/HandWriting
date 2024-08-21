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
import {
  TicketDetail,
  RootTree,
  ThirdTree,
  UintModal,
  RgUser,
} from '../../constants/TTServiceModule'
import {
  getCategoryTree,
  getOncallUser,
  searchUser,
  getUserCti,
  searchCTIbyName,
} from '../../constants/TTApi'
import { TopViewManager, Toast, SlideModal, Tab } from '@ss/mtd-react-native'
import { MWSSearchList } from '@src/components/MWSSearchList'
// import { EditCategory } from './EditCategory'
// import { EditPeople } from './EditPeople'
import MWSList from '@src/components/MWSList'
import { getNavigationHeight } from '@src/common/styles/NavigationStyle'
// import { CategorySearch } from './search/CategorySearch'
import { ttSlideModalProp } from '../common/TTHelper'
import theme from '@src/common/styles/MWSStyle'
import { EditPeople } from '../detail/EditPeople'
import { DisplayCategory } from '../detail/DisplayCategory'
import { noop } from '@ss/mtd-react-native/lib/common/utils/fns'
import SafeModalContainer from '@src/components/SafeModalContainer'
// import { DisplayCategory } from './DisplayCategory'

interface AssignProps {
  cgiTree: Array<RootTree>
  initStruct: UintModal // 如果没有选择任何服务目录，请传null
  onCancel: () => void
  onFinish: (newName: string, userModel?: RgUser) => void
}

interface IState {
  isSearching: boolean
  searchKeyWord: string
  tabType: 'catalog' | 'people' // 服务目录、处理人
  pageType: 'display' | 'edit' // display： 显示当前选择的服务目录结果， edit 选择服务目录页面, 两页面再同一个slideModal里跳转
  _serviceCategory: UintModal // 当前选择的目录，来源于服务目录、处理人
  userModel?: RgUser
}
export class CreateAssignSelectPerson extends Component<AssignProps, IState> {
  constructor(props: AssignProps) {
    super(props)
    const init = this.props.initStruct
    this.state = {
      isSearching: false,
      searchKeyWord: '',
      tabType: 'catalog',
      pageType: 'display',
      _serviceCategory: init,
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
    console.log('render  init   ' + JSON.stringify(this.props.initStruct))
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

    const titleTxt = i18nClient.t('components_create_4c8c9d', { defaultValue: '处理人' })
    const leftTxt = i18nClient.t('components_create_5f4112', { defaultValue: '返回' })
    return (
      <View style={dStyle.satisfyWrapper}>
        <TouchableOpacity
          style={dStyle.cancel}
          onPress={() => {
            this.props.onCancel()
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
          {
            <Text style={[dStyle.finishTxt, { color: color }]}>
              {i18nClient.t('components_create_769d88', { defaultValue: '完成' })}
            </Text>
          }
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

  // 点击完成
  handleFinish() {
    console.log('current select category ' + JSON.stringify(this.state._serviceCategory))

    if (this.state._serviceCategory?.assigned != null) {
      this.props.onFinish(this.state._serviceCategory.assigned, this.state.userModel)
    }
  }

  renderAssignTabs() {
    return <View style={{ flex: 1, marginHorizontal: 16 }}>{this.renderBody()}</View>
  }

  renderBody() {
    const { tabType } = this.state
    return (
      <>
        <View style={{ display: 'flex', flex: 1 }}>{this.renderSelectPerson()}</View>
      </>
    )
  }

  renderSelectPerson() {
    return (
      <DisplayCategory
        treeData={this.props.cgiTree}
        initSelect={this.state._serviceCategory}
        goEdit={noop}
        showArrow={false}
        showCat={false}
        changePeople={(categoryModel, userModel) => {
          console.log('current111', categoryModel, userModel)

          this.setState({
            _serviceCategory: categoryModel,
            userModel: userModel,
          })
        }}
      />
    )
  }
}

// 外部直接调用这个方法
export const openAssignSelectPersonModal = (props: AssignProps) => {
  return SlideModal.open({
    useNativeDriver: true,
    visible: true,
    duration: 100,
    modalProps: ttSlideModalProp(props.onCancel),
    children: <CreateAssignSelectPerson {...props} />,
  })
}
