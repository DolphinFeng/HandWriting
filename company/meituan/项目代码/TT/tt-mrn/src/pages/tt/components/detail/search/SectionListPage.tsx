import { i18nClient } from '@sailor/i18n-mrn'
// 搜索处理人 两级展示，可折叠、展开
import React, { Component } from 'react'
import {
  Text,
  View,
  SectionList,
  TouchableOpacity,
  Image,
  Dimensions,
  Keyboard,
} from '@mrn/react-native'
import { dStyle } from '@tt/constants/TTStyle'
import SectionHeader from './SectionHeader'
import { searchUser, getUserCti, getNonWorkSetting } from '../../../constants/TTApi'
import check from '@images/yellow-check.png'
import { isIPhoneWithNotch } from '@src/common/styles/NavigationStyle'
import {
  RootTree,
  CTI,
  NO_SUITABLE_DIRECTORY,
  AUTO_CREATE_NO_DIRECTORY,
} from '@src/pages/tt/constants/TTServiceModule'

const NO_CTI: CTI = {
  categoryId: -1,
  categoryName: i18nClient.t('components_detail_search_688596', {
    defaultValue: '当前用户暂无服务目录，无法指派',
  }),
  itemId: -1,
  itemName: '',
  rgId: -1,
  rgName: '',
  typeId: -1,
  typeName: '',
}

interface IProps {
  keyword: string
  checkedCallback: (item) => void
  tree: Array<RootTree>
}

interface IState {
  childKeyword: string
  cellDataArray: Array<any>
  currentCheckedItem: any // // 缓存当前选择的服务目录
}

const { width } = Dimensions.get('window')
export default class SectionListPage extends Component<IProps, IState> {
  mockDatas: Array<any>
  _directCti: CTI // 全局“找不到合适的目录/找不到合适的目录/找不到合适的目录”对应的id
  constructor(props) {
    super(props)
    this.initDirectCTI()
    this.state = {
      childKeyword: props.keyword,
      //sectionList数据
      cellDataArray: null,
      currentCheckedItem: null,
    }
  }

  initDirectCTI() {
    try {
      let first = this.props.tree.find(
        (value, index) => value.categoryName === NO_SUITABLE_DIRECTORY,
      )
      if (first != null) {
        let second = first.children?.find(
          (value, index) => value.typeName === NO_SUITABLE_DIRECTORY,
        )
        if (second != null) {
          let third = second.children?.find(
            (value, index) => value.itemName === NO_SUITABLE_DIRECTORY,
          )
          if (third != null) {
            this._directCti = {
              categoryId: first.categoryId,
              categoryName: first.categoryName,
              typeId: second.typeId,
              typeName: second.typeName,
              itemId: third.itemId,
              itemName: third.itemName,
              rgId: third.rgId,
              rgName: third.rgName,
            }
          }
        }
      }
    } catch (error) { }
  }

  componentDidMount() {
    this.getList()
  }

  handlerSectionHeader = info => {
    if (info.section.show) {
      this.state.cellDataArray.map((item, index) => {
        if (item === info.section) {
          item.show = !item.show
          item.data = [{ key: 'close' }]
        }
      })
      let newDatas = JSON.parse(JSON.stringify(this.state.cellDataArray))
      // console.log("new status " + JSON.stringify(newDatas))
      this.setState({
        cellDataArray: newDatas,
      })
    } else {
      this.getCtiByUser(info)
    }
  }

  async getCtiByUser(info) {
    console.log('info ' + JSON.stringify(info))
    const t = await getUserCti(info.section.sectionExtra.username)
    let fD = []
    if (t?.code === 200 && t?.data) {
      const model = info.section.sectionExtra

      let d: Array<any> = this.transferUserCti(t.data, model.external)
      d.map((item, index) => {
        fD.push({
          key: index,
          title: `${item.categoryName}/${item.typeName}/${item.itemName}`,
          cellExtra: {
            ...item,
            assigned: model.username,
            assignedI18nDisplayName: model.i18nDisplayName,
            assignedDisplayName: model.displayName,
          },
        })
      })
    }
    // console.log('dd ' + JSON.stringify(fD))
    // 更新二级数据
    let tmp = this.state.cellDataArray
    let i = tmp.findIndex((val, index) => val.key === info.section.key)
    tmp[i].show = !tmp[i].show
    tmp[i].data = fD
    let newDatas = JSON.parse(JSON.stringify(tmp))
    // console.log("new status " + JSON.stringify(newDatas))
    this.setState({
      cellDataArray: newDatas,
    })
  }

  // 用户所属cti预处理
  // 产品形态：处理人都包含“不选择目录直接发起”
  // 现状：后端返回的cti信息不完整，有的返回“找不到合适的目录/xxx"，有的不返回，有的返回多个“找不到合适的目录/xxx"
  // 解决方案： 客户端做兜底
  // step1 隐藏后端返回的“找不到合适的目录/xxx"
  // step2 列表首元素增加”不选择目录直接发起“，其指向全局的”找不到合适的目录/找不到合适的目录/找不到合适的目录“对应的id，这个来源于tree
  transferUserCti(originalData: Array<any>, external: boolean) {
    try {
      // 目前使用layer接口，不返回“找不到合适的目录”，所以不能再用之前的匹配逻辑
      // 直接展示后端返回的列表，并把“找不到合适的目录”包装成“不选择目录直接发起”
      let result = originalData
      // 外部用户没有“不选择目录直接发起”
      if (external) {
        result = result.filter((unit, index) => unit.categoryName !== NO_SUITABLE_DIRECTORY)
      }
      // 提示没有关联目录，无法发起
      if (result.length === 0) {
        result.unshift(NO_CTI)
      }
      return result
    } catch (error) {
      return originalData
    }
  }

  //sectionList头部
  _ListHeaderComponent = () => {
    return (
      <Text style={[dStyle.FontBoldl12, { marginTop: 20, marginBottom: 4 }]}>
        {this.state.cellDataArray
          ? i18nClient.getFormatText('components_detail_search_930d29', `搜索结果${this.state.cellDataArray.length}条`, {
            slot0: this.state.cellDataArray.length
          })
          : ''}
      </Text>
    )
  }
  //sectionList底部
  _ListFooterComponent = () => {
    return (
      <View
        style={{
          height: 35,
          backgroundColor: '#CD7F32',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text>SectionList Footer</Text>
      </View>
    )
  }

  //section之间的间隔
  _renderSectionSeparatorComponent = info => {
    return <View style={{ height: 1, backgroundColor: '#f2f2f2' }} />
  }
  //cell之间的间隔
  _renderItemSeparatorComponent = info => {
    return <View style={{ height: 1, backgroundColor: 'blue' }} />
  }
  //section头部
  _renderSectionHeader = info => {
    return (
      <SectionHeader
        keyword={this.props.keyword}
        info={info}
        handlerSectionHeader={this.handlerSectionHeader.bind(this)}
      />
    )
  }

  //cell
  _renderItem = info => {
    // console.log('render item ' + JSON.stringify(info))
    //如果title为undefined （解决空数据section之间不显示问题）
    if (info.item.title === undefined) {
      return null
    }
    const { currentCheckedItem } = this.state
    const noSuitableDirectory = info.item.title?.includes(NO_SUITABLE_DIRECTORY)
    const noCTI = info.item.title?.includes(NO_CTI.categoryName)
    const title = noSuitableDirectory
      ? AUTO_CREATE_NO_DIRECTORY
      : noCTI
        ? NO_CTI.categoryName
        : info.item.title
    return (
      <View style={{ paddingVertical: 15, justifyContent: 'center' }}>
        <TouchableOpacity
          disabled={noCTI}
          style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          onPress={() => this.handleItemClick(info.item)}
        >
          <Text style={[dStyle.peopleCategory, { width: width - 64 }]}>{title}</Text>
          {currentCheckedItem && info.item === currentCheckedItem ? (
            <Image source={check} style={dStyle.image18} />
          ) : null}
        </TouchableOpacity>
      </View>
    )
  }

  async handleItemClick(item) {
    console.log('111888', item)
    this.setState({ currentCheckedItem: item })
    let categoryInfo = item.cellExtra
    
    if (item.cellExtra?.categoryName === NO_SUITABLE_DIRECTORY) {
      categoryInfo = Object.assign({}, item.cellExtra, { onlyPeople: true })
    }
    let _isWorkHour: boolean = true
    try {
      const res = await getNonWorkSetting(categoryInfo?.rgId, true)
      let { code, data } = res
      if (code === 200 && data.active === true) {
        _isWorkHour = res.data.isWorkHour
      }
    } catch (e) {
      console.log('获取RG工作状态失败', e)
    }
    const newModel = Object.assign({}, categoryInfo, {
      appointAssigned: true,
      isWorkHour: _isWorkHour,
    })
    console.log('select people ', newModel)
    this.props.checkedCallback(newModel)
  }
  render() {
    if (this.state.cellDataArray === null) {
      return null
    }
    return (
      <>
        <SectionList
          overScrollMode="never"
          keyExtractor={(section, index) => index.toString() + 'tt'}
          initialNumToRender={25} // 避免视觉上卡顿，实质是重复刷新了。可以研究下VirtualizedList
          ListHeaderComponent={this._ListHeaderComponent}
          // SectionSeparatorComponent={this._renderSectionSeparatorComponent}
          // ItemSeparatorComponent={this._renderItemSeparatorComponent}
          renderSectionHeader={this._renderSectionHeader}
          renderItem={this._renderItem}
          sections={this.state.cellDataArray}
          extraData={this.state}
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={() => Keyboard.dismiss()}
        />

        <View style={{ height: 32 }} />
      </>
    )
  }

  async getList() {
    const { childKeyword } = this.state
    let res = await searchUser(childKeyword)
    if (res?.code === 200 && res?.data?.items) {
      let userList = res.data.items
      this.setState({ cellDataArray: this.formatSectionData(userList) })
    } else {
      this.setState({ cellDataArray: [] })
    }
  }
  // 将网络数据转为sectionlist需要的数据结果
  formatSectionData(netWorkData: Array<any>) {
    let d = []
    netWorkData.map((item, index) => {
      d.push({
        key: index,
        title: item.i18nDisplayName ? `${item.i18nDisplayName}/${item.username}` : (item.displayName ? `${item.displayName}/${item.username}` : item.username),
        avatar: item.avatar,
        sectionExtra: item,
        show: false,
        data: [],
      })
    })

    return d
  }
}
