import { i18nClient } from '@sailor/i18n-mrn'
/**
 * 服务目录
 *
 * 整体分两个典型场景：
 * 1、 发起页初始流转时未选择任何服务目录，一步步指引用户选择
 * 2、 详情页流转时已经有服务目录，直接暴露第三级目录
 */

import React, { Component, Fragment } from 'react'
import { Text, View, Image, TouchableOpacity, FlatList } from '@mrn/react-native'
import { dStyle } from '../../constants/TTStyle'
import { ServiceMap } from '../../constants/ConfigMap'
import { RootTree } from '../../constants/TTServiceModule'
import { TopViewManager, Toast } from '@ss/mtd-react-native'
import check from '@images/yellow-check.png'
import {
  UintModal,
  Level,
  SECOND_EMPTY_CATEGORY,
  THIRD_EMPTY_CATEGORY,
  ALL_EMPTY_CATEGORY
} from '../../constants/TTServiceModule'
import { checkNull } from '@src/common/helpers/HelperFunctions'
import { getCtiPrefix } from '../common/TTHelper'
import { getNonWorkSetting, getAuthSpaceCti, getRgSetting } from '../../constants/TTApi'

interface IProps {
  treeData: Array<RootTree>
  initSelect: UintModal // 发起页默认选中tree[0], 详情页是当前ticket的流转目录
  goDisplay?: (UintModal) => void // 返回服务目录展示页 适用于详情页
  callback?: (callback, tree) => void // 适用于发起页
  isCreateCustom: boolean // 区分自定义表单发起和流转，在自定义表单发起时不需要懒加载；非自定义表单发起用了EditCategoryFromCreate组件
}

interface IState {
  currentSelected: UintModal
  displayDataList: any[]
}

export class EditCategory extends Component<IProps, IState> {
  _isWorkHour: boolean = true
  newTreeData: Array<RootTree> // 存储新加载的节点信息，并更新props
  clickTimer = null
  constructor(props: IProps) {
    super(props)
    const tmp = this.getInitSelect()
    this.state = {
      currentSelected: tmp,
      displayDataList: [],
    }
  }

  NEW_ALL_EMPTY_CATEGORY = {
    ...ALL_EMPTY_CATEGORY,
    categoryName: i18nClient.t(ALL_EMPTY_CATEGORY.categoryName, { defaultValue: '请选择' }),
    typeName: i18nClient.t(ALL_EMPTY_CATEGORY.typeName, { defaultValue: '请选择' }),
    itemName: i18nClient.t(ALL_EMPTY_CATEGORY.itemName, { defaultValue: '请选择' }),
  } as UintModal

  NEW_SECOND_EMPTY_CATEGORY = {
    ...SECOND_EMPTY_CATEGORY,
    typeName: i18nClient.t(ALL_EMPTY_CATEGORY.typeName, { defaultValue: '请选择' }),
    itemName: i18nClient.t(ALL_EMPTY_CATEGORY.itemName, { defaultValue: '请选择' }),
  }

  NEW_THIRD_EMPTY_CATEGORY = {
    ...THIRD_EMPTY_CATEGORY,
    itemName: i18nClient.t(ALL_EMPTY_CATEGORY.itemName, { defaultValue: '请选择' }),
  }

  // 如果initSelect = null 如发起页一开始未选择任何服务目录，那默认显示tree[0]
  getInitSelect() {
    this.newTreeData = Object.assign([], this.props.treeData)
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
    console.log('mount', this.props.isCreateCustom, this.state.currentSelected, this.props.treeData)
    if (this.props.isCreateCustom) {
      // 当前加载了自定义表单时，目录的选中情况可能不同，需要展示的目录层级不同
      if (
        this.state.currentSelected?.categoryId &&
        this.state.currentSelected?.typeId &&
        this.state.currentSelected?.itemId
      ) {
        // 如果是配置了默认目录/手动选中目录，有选中目录的状态
        const typeChildren =
          this.newTreeData.find(
            item => item.categoryId === Number(this.state.currentSelected.categoryId),
          )?.children || []
        const itemChildren =
          typeChildren.find(item => item.typeId === Number(this.state.currentSelected.typeId))
            ?.children || []
        this.setState({ displayDataList: itemChildren })
      } else {
        // 如果是配置了RG绑定目录/全部目录，当时不是有选中目录的状态
        this.setState({ displayDataList: this.newTreeData })
      }
    } else {
      const { categoryId, typeId } = this.state.currentSelected
      this.filterTargetLevelData('item', Number(categoryId) || 0, Number(typeId) || 0)
    }
  }

  componentWillUnmount() {
    if (this.clickTimer) {
      clearTimeout(this.clickTimer)
    }
  }

  render() {
    if (this.state.currentSelected === null || this.state.currentSelected === undefined) {
      return null
    }
    return this.renderTree()
  }

  renderTree() {
    return (
      <>
        {this.renderHeaderLevel()}
        {this.renderbodyChildren()}
      </>
    )
  }

  renderHeaderLevel() {
    const { categoryId, categoryName, typeId, typeName, itemId, itemName, rgId, rgName, selected } =
      this.state.currentSelected
    let levelData = []
    levelData.push({
      label: categoryName,
      level: Level.category,
      id: categoryId,
    })
    levelData.push({ label: typeName, level: Level.type, id: typeId })
    levelData.push({
      label: rgName ? `${itemName}(${rgName})` : itemName,
      level: Level.item,
      id: itemId,
    }) // 增加rgName 服务组信息显示
    let show = this.judgeHeaderClickStatus()
    return (
      <>
        {levelData.map((unit, index) => {
          const bottom = index === levelData.length - 1 || show[index + 1] === false ? 26 : 0
          return show[index] ? (
            <TouchableOpacity
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'flex-end',
                marginTop: index === 0 ? 16 : 0,
                marginBottom: bottom,
              }}
              onPress={() => {
                // 防止快速多次点击
                if (this.clickTimer) clearTimeout(this.clickTimer)
                this.clickTimer = setTimeout(() => {
                  this.onLevelChange(unit)
                }, 200)
              }}
            >
              <View style={dStyle.lineItem}>
                {index > 0 ? <View style={dStyle.lineVer} /> : null}
                <View style={[dStyle.lineDot, this.getDotColor(selected, unit.level)]} />
              </View>
              <Text style={this.getTxtStyle(selected, unit)}>{`${getCtiPrefix(unit.level)}${
                unit.label
              }`}</Text>
            </TouchableOpacity>
          ) : null
        })}
      </>
    )
  }

  // 判断header各级是否允许点击
  // 主要是场景1 各级header选择有严格的顺序关系 ，一级选择后才能选二级，二级选择后才能选三级
  // 产品需求变更： 不要一开始就选择三级目录，选择目录逐级选择
  judgeHeaderClickStatus(): Array<boolean> {
    const { categoryId, typeId } = this.state.currentSelected
    let show = [true, true, true]
    if (categoryId === null) {
      show[1] = false
    }
    if (typeId === null) {
      show[2] = false
    }
    return show
  }

  showLineVer() {}

  renderbodyChildren() {
    const { selected } = this.state.currentSelected
    const { displayDataList } = this.state
    if (displayDataList === null || displayDataList === undefined) {
      return null
    }
    let count = displayDataList.length
    return (
      <>
        <Text style={dStyle.FontRegul12}>{`${i18nClient.t(ServiceMap[selected])}(${count})`}</Text>
        <View style={[dStyle.ticketDivider1, { marginTop: 4, marginBottom: 16 }]} />

        <FlatList
          overScrollMode="never"
          key={'edit'}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          extraData={this.state} // 这个很重要，否则点击三级children时不更新item
          data={displayDataList}
          renderItem={({ item, index }) => this.renderItem(item, index, selected)}
          ListFooterComponent={this.renderFooter}
        />
      </>
    )
  }
  //特殊机型-底部曲面，无法完全展示flatlist，增加footer占位
  renderFooter = () => {
    return <View style={{ marginBottom: 30 }} />
  }
  // 获取树形数据
  async getTreeData(requestParam: any) {
    try {
      const res = await getAuthSpaceCti(
        {
          domain: 'ticket',
          isMainSpace: true,
        },
        requestParam,
      )
      if (res.data && res.code === 200) {
        return res.data.items || []
      }
      return []
    } catch (error) {
      console.log(error)
      return []
    }
  }

  // 实现“懒加载”功能，判断对应节点是否存在children，无则继续请求
  filterTargetLevelData(level: 'category' | 'type' | 'item', categoryId: number, typeId: number) {
    console.log(
      'filterTargetLevelData circulation',
      this.props.treeData,
      this.newTreeData,
      level,
      categoryId,
      typeId,
    )
    if (level === 'category') {
      // 展示首层节点时，理论上说已有数据，如果没有，再请求看看
      if (!this.newTreeData?.length) {
        this.getTreeData({
          createScene: false,
        })
          .then(res => {
            this.setState({ displayDataList: res })
          })
          .catch(e => console.log(e))
      } else {
        this.setState({ displayDataList: this.newTreeData })
      }
    } else {
      // 展示非首层节点时，已经点击过的节点是有数据的，不再重复请求
      const categoryNode = this.newTreeData.find(category => category.categoryId === categoryId)
      console.log('2322', categoryNode, categoryNode?.children?.length, level)
      if (categoryNode?.children?.length) {
        // 存在所需数据
        if (level === 'type') {
          this.setState({ displayDataList: categoryNode.children })
        } else {
          const typeNode = categoryNode.children.find(type => type.typeId === typeId)
          console.log('4442322', typeNode)
          if (typeNode?.children?.length) {
            if (level === 'item') {
              this.setState({ displayDataList: typeNode.children })
            } else {
              this.formatData(categoryNode.categoryId, typeId, 'type')
            }
          } else {
            this.formatData(categoryNode.categoryId, typeId, 'type')
          }
        }
      } else {
        // 此时虽然没有一级节点的children，但可能是请求完整树的情况，也要判断level
        // 暂时只发现搜索选中三级目录回显时需要
        this.formatData(
          categoryId,
          level === 'item' ? typeId : 0,
          level === 'item' ? 'item' : 'category',
        )
      }
    }
  }
  formatData(categoryId: number, typeId: number, level: 'category' | 'type' | 'item') {
    const param: any = {}
    if (level === 'category') {
      param.categoryIds = [categoryId]
    } else if (level === 'type') {
      param.typeIds = [typeId]
    } else {
      param.categoryIds = [categoryId]
      param.typeIds = [typeId]
    }
    this.getTreeData({
      ...param,
      createScene: false,
    })
      .then(res => {
        console.log('res res', categoryId, typeId, level, res)
        const resCategory = res.find(obj => obj.categoryId === categoryId)
        const resCategoryChildren = resCategory?.children || []
        if (!this.newTreeData?.length) this.newTreeData = res
        const targetCategory = this.newTreeData.find(obj => obj.categoryId === categoryId)
        // 不能直接替换children，第一次传category时拿到的children是完整的，加上typeId后拿到的是不完整的
        if (level === 'category') {
          console.log('11eee', targetCategory, resCategory, resCategoryChildren)
          targetCategory.children = resCategoryChildren
          this.setState({ displayDataList: resCategoryChildren })
        } else if (level === 'type') {
          const resType = resCategoryChildren.find(type => type.typeId === typeId)
          const resTypeChildren = resType?.children || []
          console.log('11', resTypeChildren, targetCategory, targetCategory.children)
          const targetType = targetCategory.children.find(type => type.typeId === typeId)
          console.log('11', targetType)
          targetType.children = resTypeChildren
          this.setState({ displayDataList: resTypeChildren })
        } else {
          // 目前仅存在搜索后选中三级目录回显的情况走以下逻辑，此时category下没有children
          targetCategory.children = resCategoryChildren
          const resType = resCategoryChildren.find(type => type.typeId === typeId)
          const resTypeChildren = resType?.children || []
          this.setState({ displayDataList: resTypeChildren })
        }
      })
      .catch(e => console.log(e))
  }
  getNestData() {
    const { categoryId, typeId, selected } = this.state.currentSelected
    const { treeData } = this.props
    switch (selected) {
      case Level.category:
        return treeData
      case Level.type:
        console.log('get type 二级 ' + categoryId)
        try {
          // 可能存在类型不同的情况，为了lint处理，都转换成Number后进行对比
          let typeData = treeData.find(
            obj => Number(obj.categoryId) === Number(categoryId),
          ).children
          console.log('二级 data ' + JSON.stringify(typeData) + ' size ' + typeData.length)
          return typeData
        } catch (error) {
          return []
        }

      case Level.item:
        console.log('get item 三级 ' + typeId)
        try {
          let typeD = treeData.find(obj => Number(obj.categoryId) === Number(categoryId)).children
          let itemData = typeD.find(obj => Number(obj.typeId) === Number(typeId)).children
          console.log('三级 data ' + JSON.stringify(itemData) + 'size ' + itemData.length)
          return itemData
        } catch (error) {
          return []
        }
    }
  }

  renderItem = (item, index, selected) => {
    return (
      <TouchableOpacity
        key={index}
        style={{
          marginBottom: 30,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
        onPress={() => this.onChildrenClick(item, index, selected)}
      >
        <Text style={{ fontSize: 14, color: 'rgba(0,0,0,0.84)', lineHeight: 20 }}>
          {selected === Level.category
            ? item.categoryName
            : selected === Level.type
            ? item.typeName
            : `${item.itemName}(${item.rgName})`}
        </Text>
        {selected === Level.item ? (
          Number(item.itemId) === Number(this.state.currentSelected.itemId) ? (
            <Image source={check} style={dStyle.image18} />
          ) : null
        ) : (
          <Image
            source={require('@images/right-thick.png')}
            style={dStyle.image18}
            opacity={0.24}
          />
        )}
      </TouchableOpacity>
    )
  }

  getDotColor(selected, current): ViewStyle {
    return {
      borderColor: selected === current ? '#FFC300' : 'rgba(0,0,0,0.12)',
    }
  }
  getTxtStyle(selected, unit): ViewStyle {
    return selected === unit.level
      ? {
          fontSize: 14,
          color: unit?.label?.includes(
            i18nClient.t('constants_708c9d', { defaultValue: '请选择' }),
          )
            ? '#FF8800'
            : 'rgba(0,0,0,0.87)',
          fontWeight: 'bold',
          marginBottom: -4,
        }
      : { fontSize: 14, color: 'rgba(0,0,0,0.60)', marginBottom: -4 }
  }

  onLevelChange(unit) {
    // 自上而下更新
    let tmp
    if (!this.newTreeData?.length) {
      Toast.open(
        i18nClient.t('components_detail_7e5525', { defaultValue: '目录详情请求中，请稍后' }),
      )
      return
    }
    switch (unit.level) {
      case Level.category:
        tmp = this.NEW_ALL_EMPTY_CATEGORY
        this.setState({ displayDataList: this.newTreeData })
        break
      case Level.type:
        tmp = Object.assign({}, this.state.currentSelected, {
          ...this.NEW_SECOND_EMPTY_CATEGORY,
        })
        const typeChildren =
          this.newTreeData.find(
            obj => obj.categoryId === Number(this.state.currentSelected.categoryId),
          ).children || []
        this.setState({ displayDataList: typeChildren })
        break
      case Level.item:
        tmp = Object.assign({}, this.state.currentSelected, {
          ...this.NEW_THIRD_EMPTY_CATEGORY,
        })
        break
    }
    this.setState({ currentSelected: tmp })
  }

  async onChildrenClick(item, index, selected) {
    // 自下而上更新
    // 更新 categoryName typeName itemName
    console.log(
      'circulation click ' + JSON.stringify(this.state.currentSelected) + JSON.stringify(item),
    )
    let tmp = null
    switch (selected) {
      case Level.category:
        if (this.state.currentSelected.typeId === null) {
          // 场景1的处理 发起页-null
          // 0 更新一级内容
          // 1  header进入下一阶段及进入二级目录
          if (!this.props.isCreateCustom) {
            this.setState({ displayDataList: [] })
            this.filterTargetLevelData('type', item.categoryId, 0)
          } else {
            this.setState({ displayDataList: item.children })
          }
          tmp = Object.assign({}, this.state.currentSelected, {
            categoryId: item.categoryId,
            categoryName: item.categoryName,
            selected: Level.type,
          })
        } else {
          // 一级变更，对应二级、三级也变更，二级、三级默认取第一个元素
          let typeChildren = this.newTreeData.find(
            obj => obj.categoryId === item.categoryId,
          ).children
          let itemChildren = typeChildren[0].children
          tmp = Object.assign({}, this.state.currentSelected, {
            categoryId: item.categoryId,
            categoryName: item.categoryName,
            typeId: typeChildren[0].typeId,
            typeName: typeChildren[0].typeName,
            itemId: itemChildren[0].itemId,
            itemName: itemChildren[0].itemName,
          })
        }
        this.setState({ currentSelected: tmp })
        break
      case Level.type:
        if (this.state.currentSelected.itemId === null) {
          // 场景1的处理
          // 0 更新二级内容
          // 1  header进入下一阶段及进入三级目录
          tmp = Object.assign({}, this.state.currentSelected, {
            typeId: item.typeId,
            typeName: item.typeName,
            selected: Level.item,
          })
          if (!this.props.isCreateCustom) {
            this.setState({ displayDataList: [] })
            this.filterTargetLevelData('item', item.parentId, item.typeId)
          } else {
            this.setState({ displayDataList: item.children })
          }
        } else {
          // 二级变更，对应三级也变更，三级默认取第一个元素
          let typeChildren2 = this.newTreeData.find(
            obj => Number(obj.categoryId) === Number(this.state.currentSelected.categoryId),
          ).children
          let itemChildren2 = typeChildren2.find(o => o.typeId === item.typeId).children
          tmp = Object.assign({}, this.state.currentSelected, {
            typeId: item.typeId,
            typeName: item.typeName,
            itemId: itemChildren2[0].itemId,
            itemName: itemChildren2[0].itemName,
            rgId: item.rgId,
            rgName: item.rgName,
          })
        }
        this.setState({ currentSelected: tmp })
        break
      case Level.item:
        // 详情页：点击三极目录时，由于会自动跳转回display，所以先获取工作状态
        let workHour: boolean = true
        // 如切换目录同属一个RG并且设置了同一RG不流转，无需更新流转人
        const oldAssigned = await this.checkIfNeedNewAssigned(item.rgId)
        try {
          const res = await getNonWorkSetting(item.rgId, true)
          let { code, data } = res
          if (code === 200 && data.active === true) {
            workHour = res.data.isWorkHour
          }
        } catch (e) {
          console.log('获取RG工作状态失败', e)
        }
        // 只需三级变更
        tmp = Object.assign({}, this.state.currentSelected, {
          itemId: item.itemId,
          itemName: item.itemName,
          rgId: item.rgId,
          rgName: item.rgName,
          assigned: oldAssigned || '',
          isWorkHour: workHour,
          appointAssigned: false,
        })
        // FIXME: 在修改现有modal时，外面有时候会拿不到处理组
        // 发起和详情交互形式不同，
        // 详情：重新选择了服务目录，清空assign, 自动返回Display页面
        // 发起页： 重新选择了服务目录，点击“完成”回到发起页页面，slideModal弹窗消失
        this.props.goDisplay && this.props.goDisplay(tmp)
        this.props.callback && this.props.callback(tmp, this.newTreeData)
        break
    }
  }
  async checkIfNeedNewAssigned(newRgId: string) {
    const { rgId = '', assigned = '' } = this.getInitSelect() || {}
    if (rgId && rgId === newRgId) {
      try {
        const RgSetting = await getRgSetting(newRgId)
        const { code, data } = RgSetting
        if (code === 200 && data.keepAssignedIfInRgTransfer) {
          return assigned
        }
      } catch (error) {
        return
      }
    }
    return
  }
}
