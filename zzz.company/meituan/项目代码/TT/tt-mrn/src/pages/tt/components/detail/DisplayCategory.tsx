import { i18nClient } from '@sailor/i18n-mrn'
/**
 * 服务目录 展示页（首页）
 *
 */

import React, { Component, Fragment } from 'react'
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Platform,
} from '@mrn/react-native'
import { dStyle } from '../../constants/TTStyle'
import { RootTree, RgUser } from '../../constants/TTServiceModule'
import { TopViewManager, Toast } from '@ss/mtd-react-native'
import check from '@images/yellow-check.png'
import arrow from '@images/right-thick.png'
import {
  UintModal,
  ALL_EMPTY_CATEGORY,
  Level,
} from '../../constants/TTServiceModule'
import { checkNull } from '@src/common/helpers/HelperFunctions'
import { getRgUser, getOncallUser } from '../../constants/TTApi'

interface IProps {
  treeData: Array<RootTree>
  initSelect: UintModal // 发起页默认选中tree[0], 详情页是当前ticket的流转目录
  goEdit: (UintModal) => void // 返回选中的服务目录
  changePeople: (model: UintModal, userModel?: RgUser) => void
  showArrow?: boolean
  showCat?: boolean
  showNonWorking?: boolean // 是否在非工作时间隐藏值班成员（仅在流转场景下为TRUE）
}

interface IState {
  selectedCategory: UintModal
  peopleList: Array<RgUser>
}

const scrollViewMarginBottom = Platform.select({
  android: 40,
  ios: 0,
})

export class DisplayCategory extends Component<IProps, IState> {
  static defaultProps = {
    showArrow: true,
    showCat: true,
  }

  constructor(props: IProps) {
    super(props)
    const tmp = this.getInitSelect()
    this.state = {
      selectedCategory: tmp,
      peopleList: [],
    }
  }

  NEW_ALL_EMPTY_CATEGORY = {
    ...ALL_EMPTY_CATEGORY,
    categoryName: i18nClient.t(ALL_EMPTY_CATEGORY.categoryName, { defaultValue: '请选择' }),
    typeName: i18nClient.t(ALL_EMPTY_CATEGORY.typeName, { defaultValue: '请选择' }),
    itemName: i18nClient.t(ALL_EMPTY_CATEGORY.itemName, { defaultValue: '请选择' }),
  } as UintModal

  // 如果initSelect = null 如发起页一开始未选择任何服务目录，那默认显示tree[0]
  getInitSelect() {
    if (checkNull(this.props.initSelect)) {
      try {
        return this.NEW_ALL_EMPTY_CATEGORY
      } catch (error) {
        return null
      }
    } else {
      return this.props.initSelect
    }
  }

  componentDidMount() {
    this.getAssignPeople()
  }

  render() {
    if (this.state.selectedCategory === null || this.state.selectedCategory === undefined) {
      return null
    }
    return this.renderContent()
  }

  renderContent() {
    return (
      <>
        {this.props.showCat ? this.renderHeader() : null}
        {this.renderbody()}
      </>
    )
  }

  renderHeader() {
    const { categoryName, typeName, itemName } = this.state.selectedCategory
    return (
      <TouchableOpacity
        style={{ flexDirection: 'row', marginVertical: 16 }}
        onPress={() => {
          // 这是关键 页面之间切换
          this.props.goEdit(this.state.selectedCategory)
        }}
      >
        <Text style={dStyle.FontBold16}>
          {i18nClient.t('components_detail_28148f', { defaultValue: '服务目录' })}
        </Text>
        <View style={{ flex: 1, marginLeft: 16 }}>
          <Text style={dStyle.font16By84}>
            {i18nClient.getFormatText('components_detail_f42885', `一级：${categoryName}`, {
              categoryName: categoryName
            })}
          </Text>
          <Text style={dStyle.font16By84}>
            {i18nClient.getFormatText('components_detail_7a2b20', `二级：${typeName}`,{
              typeName: typeName
            })}
          </Text>
          <Text style={dStyle.font16By84}>
            {i18nClient.getFormatText('components_detail_0d00b4', `三级：${itemName}`,{
              itemName: itemName
            })}
          </Text>
        </View>
        {this.props.showArrow ? (
          <Image source={arrow} style={dStyle.image18} opacity={0.24} />
        ) : null}
      </TouchableOpacity>
    )
  }

  renderbody() {
    return (
      <>
        <View style={[dStyle.ticketDivider1, { marginBottom: 12 }]} />
        {this.props.showCat ? (
          <Text style={dStyle.FontBold16}>
            {i18nClient.t('components_detail_4c8c9d', { defaultValue: '处理人' })}
          </Text>
        ) : null}
        <ScrollView
          overScrollMode="never"
          style={{
            marginHorizontal: -16,
            marginBottom: scrollViewMarginBottom,
          }}
        >
          <FlatList
            overScrollMode="never"
            data={this.state.peopleList}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => this.renderPeopleItem(item, index)}
            extraData={this.state}
          />
        </ScrollView>
      </>
    )
  }

  getAssignPeople() {
    getRgUser({ rgId: Number(this.state.selectedCategory.rgId) })
      .then(res => {
        if (res?.code === 200 && res?.data?.items) {
          if (this.props.showNonWorking) {
            // 流转逻辑
            // 工作时间：增加假的选项“处理组值班人”
            // 非工作时间：只有选项“非工作时间处理人”
            let obj = {
              active: true,
              bgName: res.data.items[0].bgName,
              buName: res.data.items[0].buName,
              displayName: this.state.selectedCategory.isWorkHour
                ? i18nClient.t('components_detail_22a243', { defaultValue: '处理组值班人' })
                : i18nClient.t('components_detail_eb00df', { defaultValue: '非工作时间处理人' }),

              identify: '',
              orgName: res.data.items[0].orgName,
              external: false,
            }
            // 同RG流转和跨RG流转逻辑相同
            if (this.state.selectedCategory.isWorkHour) {
              res.data.items.unshift(obj)
              this.setState({ peopleList: res.data.items })
            } else {
              this.setState({ peopleList: [obj] })
            }
          } else {
            // 发起逻辑
            // 默认显示已选择的处理人，未选择如切换服务目录则默认选中当前值班人员
            if (this.state.selectedCategory.assigned) {
              this.setState({ peopleList: res.data.items })
            } else {
              let tmp = this.state.selectedCategory
              const list = res.data.items
              getOncallUser(this.state.selectedCategory.rgId)
                .then(resp => {
                  if (resp?.code === 200 && resp?.data) {
                    tmp = Object.assign({}, this.state.selectedCategory, {
                      assigned: resp.data.identify,
                    })
                    this.setState({ selectedCategory: tmp, peopleList: list })
                    this.props.changePeople(tmp, list) // 向上传递
                  }
                })
                .catch(e => {})
            }
          }
        }
      })
      .catch(e => {})
  }

  renderPeopleItem(item: RgUser, index) {
    // console.log('render people item:', item, this.state.selectedCategory)
    let selected = false
    if (this.state.selectedCategory.assigned === item.identify) {
      selected = true
    } else if (!this.state.selectedCategory.assigned && !item.identify) {
      selected = true
    } else if (
      item.displayName ===
      i18nClient.t('components_detail_eb00df', { defaultValue: '非工作时间处理人' })
    ) {
      selected = true
    }
    const color = selected ? 'rgba(0,0,0,0.12)' : 'white'
    let label = item.identify ? (item.i18nDisplayName ? `${item.i18nDisplayName}/${item.identify}` : (item.displayName ? `${item.displayName}/${item.identify}` : item.identify)) : `${item.displayName}`
    return (
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          height: 48,
          alignItems: 'center',
          paddingHorizontal: 16,
          backgroundColor: color,
        }}
        onPress={() => {
          this.handleChangePeople(item)
        }}
      >
        <Text numberOfLines={1} ellipsizeMode="tail" style={dStyle.FontRegul16}>{label}</Text>
        {Boolean(item.external) && (
          <Text style={dStyle.exteranlTag}>
            {i18nClient.t('components_common_96b0a7', { defaultValue: '外部' })}
          </Text>
        )}
        <View style={{ flex: 1 }} />
        {selected ? <Image source={check} style={dStyle.image18} /> : null}
      </TouchableOpacity>
    )
  }
  handleChangePeople(item: RgUser) {
    // 更改处理人的时候，如果选择的不是新增项，修改appointAssigned
    const t = Object.assign({
      ...this.state.selectedCategory,
      assigned: item?.identify,
      appointAssigned: item.identify ? true : false,
    })
    this.setState({ selectedCategory: t })
    const userModel = Object.assign({}, item)
    userModel.selectPersonManually = true
    this.props.changePeople(t, userModel) // 向上传递
  }
}
