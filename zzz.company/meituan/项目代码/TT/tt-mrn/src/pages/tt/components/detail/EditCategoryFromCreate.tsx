import { i18nClient } from '@sailor/i18n-mrn'
/**
 * 发起页选择服务目录
 * 发起页支持一二级直接发起TT, 与详情页流转差别比较大，所以新写一个组件
 *
 * 服务目录显示逻辑：
 * step1: 添加节点，节点中‘direct'标识此节点可直接发起TT .
 *        节点来源：一级是‘找不到合适的目录’ 二、三级是 ticketRelated=true并且取defaultCTI
 * step2: 显示目录即renderItem时根据节点的direct显示'不选择目录直接‘发起
 * step3: 自下而上，点击节点时，构建unitModal，如果直接发起则加createLevel字段
 *
 * 服务目录回显逻辑：
 * getInitSelect时根据createLevel构造initSelect；
 * 如果时直接发起目录，则清除当前级别目录选择，让用户重新选择当前级别目录
 */

import React, { Component, Fragment } from 'react'
import { Text, View, Image, TouchableOpacity, FlatList } from '@mrn/react-native'
import { dStyle } from '../../constants/TTStyle'
import { ServiceMap } from '../../constants/ConfigMap'
import { RootTree, CTI } from '../../constants/TTServiceModule'
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
import { getAuthSpaceCti } from '../../constants/TTApi'
import { cloneDeep } from 'lodash'
import store from '../../redux/store'
interface IProps {
  treeData: Array<RootTree>
  initSelect: UintModal // 发起页默认选中tree[0], 详情页是当前ticket的流转目录
  /** domain 空间名称，来自链接跳转 */
  domain?: string
  goDisplay?: (UintModal) => void // 返回服务目录展示页 适用于详情页
  callback?: (data) => void // 适用于发起页
  updateTree?: (tree) => void
}

interface IState {
  currentSelected: UintModal
  displayDataList: any[] // treeData中筛选出的特定level的列表数据
}

const DIRECT_CREATE = '※不选择目录直接发起※';

export class EditCategoryFromCreate extends Component<IProps, IState> {
  newTreeData: Array<RootTree>
  constructor(props: IProps) {
    super(props)
    const tmp = this.getInitSelect()
    console.log('init select ', tmp, this.props.treeData)
    this.state = {
      currentSelected: tmp,
      displayDataList: [],
    }
    this.initNewTreeData()
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
    if (checkNull(this.props.initSelect)) {
      try {
        return this.NEW_ALL_EMPTY_CATEGORY
      } catch (error) {
        return null
      }
    } else if (this.props.initSelect?.createLevel) {
      console.log('vvvv1')
      // 回显 - 处理“不选择目录直接发起” 的场景
      const { createLevel, categoryId, categoryName, typeId, typeName } = this.props.initSelect
      switch (createLevel) {
        case Level.category:
          return this.NEW_ALL_EMPTY_CATEGORY
        case Level.type:
          return Object.assign({}, this.NEW_ALL_EMPTY_CATEGORY, {
            categoryId: categoryId,
            categoryName: categoryName,
          })
        case Level.item:
          return Object.assign({}, this.NEW_THIRD_EMPTY_CATEGORY, {
            categoryId: categoryId,
            categoryName: categoryName,
            typeId: typeId,
            typeName: typeName,
          })
      }
    } else {
      console.log('vvvv2')
      return this.props.initSelect
    }
  }
  concatNotFoundCategoryNode(tree: any) {
    try {
      // 普通发起、三级目录链接发起时都会通过layer接口请求数据，该接口不包括“不选择目录直接发起”，因此直接添加
      // step1  一级目录中'找不到合适的目录'的索引
      const treeData = cloneDeep(tree)
      const index = treeData.findIndex(
        (value, i) =>
          value.categoryName === '找不到合适的目录',
      )
      // 仅在普通发起（公共空间）下展示“不选择目录直接发起”
      const { dxAuth } = store.getState()
      const storeDomain = dxAuth?.spaceDomain || 'ticket'
      const showNoCatalog = storeDomain === 'ticket' && !this.state.currentSelected?.categoryId
      // step2 ‘'找不到合适的目录'’CTI信息作为树的首节点, 同时删除原先的'找不到合适的目录'节点
      if (index > -1) {
        const tmpCategory = Object.assign({}, treeData[index], { direct: true })
        const tmpTree = treeData.filter(
          (value, index) =>
            value.categoryName !== '找不到合适的目录',
        )
        console.log(
          'index ' +
            index +
            ' tree length ' +
            treeData.length +
            ' newTree lenght ' +
            tmpTree.length,
        )
        this.newTreeData = [tmpCategory].concat(tmpTree)
      } else if (showNoCatalog) {
        // 无“找不到合适目录”时使用默认tree
        // 如果是URL发起，在初次进入页面时，根据URL请求数据；在当前节点，只进行数据筛选即可
        // 如果是选中目录后再次点击展开，在上次选中三级节点后，回传newTreeData，更新props；在当前节点，只进行数据筛选即可
        // 这里和PC端保持一致，写死了找不到合适目录的ID
        const directCategory = {
          categoryName: '找不到合适的目录',
          categoryId: 14,
          direct: true,
          children: [
            {
              typeName: '找不到合适的目录',
              typeId: 172,
              children: [
                {
                  itemName:  '找不到合适的目录',
                  itemId: 524,
                  rgId: 342,
                  rgName: 'MTMT',
                },
              ],
            },
          ],
        }
        this.newTreeData = [directCategory].concat(treeData)
      } else {
        this.newTreeData = treeData
      }
    } catch (error) {
      console.log('create ' + error)
      this.newTreeData = this.props.treeData
    }
  }
  // 一级“找不到合适目录”-》“不选择目录直接发起“
  initNewTreeData() {
    this.concatNotFoundCategoryNode(this.props.treeData)
  }
  // 实现“懒加载”功能，判断对应节点是否存在children，无则继续请求
  filterTargetLevelData(level: 'category' | 'type' | 'item', categoryId: number, typeId: number) {
    console.log('filterTargetLevelData', level, categoryId, typeId)
    if (level === 'category') {
      // 展示首层节点时，理论上说已有数据，如果没有，再请求看看
      if (!this.props.treeData?.length) {
        this.getTreeData({
          createScene: true,
        })
          .then(res => {
            this.newTreeData = Object.assign([], res)
            this.concatNotFoundCategoryNode(this.newTreeData)
            this.props.updateTree && this.props.updateTree(this.newTreeData)
            this.setState({ displayDataList: this.newTreeData })
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
          //   if (categoryNode.ticketRelated) {
          //     const cti = Object.assign({}, { ...categoryNode.defaultCti }, { createLevel: Level.item })
          //     this.props.callback && this.props.callback(cti)
          //     this.props.updateTree && this.props.updateTree(this.newTreeData)
          //     return;
          //   }
          this.setState({ displayDataList: categoryNode.children })
        } else {
          const typeNode = categoryNode.children.find(type => type.typeId === typeId)
          console.log('4442322', typeNode)
          if (typeNode?.children?.length) {
            if (level === 'item') {
              //   if (typeNode.ticketRelated) {
              //     const cti = Object.assign({}, { ...typeNode.defaultCti }, { createLevel: Level.item })
              //     this.props.callback && this.props.callback(cti)
              //     this.props.updateTree && this.props.updateTree(this.newTreeData)
              //     return;
              //   }
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
  componentDidMount() {
    // 有选中三级ID时传item，没有时兜底传category
    const { initSelect } = this.props
    this.filterTargetLevelData(
      initSelect?.selected || 'category',
      Number(initSelect?.categoryId) || 0,
      Number(initSelect?.typeId) || 0,
    )
  }
  // 请求到树形数据后进行拼接处理
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
      createScene: true,
    })
      .then(res => {
        console.log('res res', this.newTreeData[0], categoryId, typeId, level, res)
        const resCategory = res.find(obj => obj.categoryId === categoryId)
        const resCategoryChildren = resCategory?.children || []
        const targetCategory = this.newTreeData.find(obj => obj.categoryId === categoryId)
        console.log('22333', targetCategory)
        // 从自定义表单跳转普通发起后搜索选中服务目录时，因为没有newTreeData为空，走不到下面的逻辑
        // 不能直接替换children，第一次传category时拿到的children是完整的，加上typeId后拿到的是不完整的
        if (level === 'category') {
          console.log('11eee', targetCategory)
          targetCategory.children = resCategoryChildren
          //   if (targetCategory.ticketRelated) {
          //     targetCategory.defaultCti = resCategory.defaultCti
          //     const cti = Object.assign({}, { ...resCategory.defaultCti }, { selected: 'item' })
          //     this.props.callback && this.props.callback(cti)
          //     this.props.updateTree && this.props.updateTree(this.newTreeData)
          //     return;
          //   }
          this.setState({ displayDataList: resCategoryChildren })
        } else if (level === 'type') {
          const resType = resCategoryChildren.find(type => type.typeId === typeId)
          const resTypeChildren = resType?.children || []
          console.log('11', resTypeChildren, targetCategory, targetCategory.children)
          const targetType = targetCategory.children.find(type => type.typeId === typeId)
          //   if (targetType.ticketRelated) targetType.defaultCti = resType.defaultCti
          console.log('11', targetType)
          targetType.children = resTypeChildren
          this.setState({ displayDataList: resTypeChildren })
        } else {
          // 目前仅存在搜索后选中三级目录回显的情况走以下逻辑，此时category下没有children
          if (targetCategory) {
            targetCategory.children = resCategoryChildren
            const resType = resCategoryChildren.find(type => type.typeId === typeId)
            const resTypeChildren = resType?.children || []
            this.setState({ displayDataList: resTypeChildren })
          }
        }
      })
      .catch(e => console.log(e))
  }

  render() {
    if (this.state.currentSelected === null || this.state.currentSelected === undefined) {
      return null
    }
    // tree length 0
    if (this.newTreeData === null || this.newTreeData === undefined) {
      Toast.open(i18nClient.t('components_detail_8e97bc', { defaultValue: '获取服务目录失败' }))
      return null
    } else if (this.newTreeData.length === 0) {
      return (
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={[dStyle.FontRegul12, { marginTop: 12 }]}>
            {i18nClient.t('components_detail_6f6782', { defaultValue: '暂无可选目录' })}
          </Text>
        </View>
      )
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
              onPress={() => this.onLevelChange(unit)}
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

  async getTreeData(requestParam) {
    try {
      // 在强弱引导场景下，不会更新URL中的domain，因此会将引导空间domain在store中存储
      // 如果storeDomain为私有空间，以storeDomain为准，如果为ticket，以URL中的domain为准
      const { dxAuth } = store.getState()
      const storeDomain = dxAuth?.spaceDomain || 'ticket'
      const res = await getAuthSpaceCti(
        {
          domain: storeDomain !== 'ticket' ? storeDomain : this.props.domain || 'ticket',
          isMainSpace: this.props.domain === 'ticket',
        },
        requestParam,
      )
      if (res.data && res.code === 200) {
        return res.data.items || []
      }
      return []
    } catch (error) {
      return []
    }
  }

  renderItem = (item, index, selected) => {
    const name = this.getName(item, selected)
    let nameColor = name === DIRECT_CREATE ? dStyle.Font14by84 : dStyle.peopleCategory
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
        <Text style={nameColor}>{name}</Text>
        {this.getArrow(item, selected)}
      </TouchableOpacity>
    )
  }

  getName(item, selected) {
    switch (selected) {
      case Level.category:
        return item.direct ? DIRECT_CREATE : item.categoryName
      case Level.type:
        return item.direct ? DIRECT_CREATE : item.typeName
      case Level.item:
        return item.direct ? DIRECT_CREATE : `${item.itemName}(${item.rgName})`
      default:
        return ''
    }
  }

  getArrow(item, selected) {
    switch (selected) {
      case Level.category:
      case Level.type:
        return (
          <Image
            source={require('@images/right-thick.png')}
            style={dStyle.image18}
            opacity={0.24}
          />
        )

      case Level.item:
        return Number(item.itemId) === Number(this.state.currentSelected.itemId) && !item.direct ? (
          <Image source={check} style={dStyle.image18} />
        ) : null
      default:
        return null
    }
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
    //
    let tmp
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
          this.newTreeData?.find(
            obj => obj.categoryId === Number(this.state.currentSelected?.categoryId),
          )?.children || []
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

  onChildrenClick(item, index, selected) {
    // 自下而上更新
    // 更新 categoryName typeName itemName
    console.log('click ' + JSON.stringify(item), selected)
    let tmp = null
    switch (selected) {
      case Level.category:
        // "不选择目录直接发起"
        if (item.direct) {
          console.log('直接发起', item)
          try {
            const tmpType = item.children.find(
              (value, index) =>
                value.typeName === '找不到合适的目录',
            )
            const tmpItem = tmpType.children.find(
              (value, index) =>
                value.itemName === '找不到合适的目录',
            )
            tmp = Object.assign(
              {},
              {
                categoryId: item.categoryId,
                categoryName: item.categoryName,
                typeId: tmpType.typeId,
                typeName: tmpType.typeName,
                itemId: tmpItem.itemId,
                itemName: tmpItem.itemName,
                rgId: tmpItem.rgId,
                rgName: tmpItem.rgName,
                createLevel: Level.category,
              },
            )
          } catch (error) {
            console.log('直接发起出错')
          } finally {
            this.props.callback && this.props.callback(tmp)
            this.props.updateTree && this.props.updateTree(this.newTreeData)
          }
        } else if (this.state.currentSelected.typeId === null) {
          // 不考虑一二级目录直接发起的逻辑
          tmp = Object.assign({}, this.state.currentSelected, {
            categoryId: item.categoryId,
            categoryName: item.categoryName,
            selected: Level.type,
          })
          this.setState({ displayDataList: [] })
          this.filterTargetLevelData('type', item.categoryId, 0)
        } else {
          // 一级变更，对应二级、三级也变更，二级、三级默认取第一个元素
          let typeChildren = this.newTreeData.find(
            obj => obj.categoryId === item.categoryId,
          ).children
          let itemChildren = typeChildren[0].children
          console.log('change cate', typeChildren, itemChildren)
          tmp = Object.assign({}, this.state.currentSelected, {
            categoryId: item.categoryId,
            categoryName: item.categoryName,
            typeId: typeChildren[0].typeId,
            typeName: typeChildren[0].typeName,
            itemId: itemChildren[0].itemId,
            itemName: itemChildren[0].itemName,
          })
        }

        break
      case Level.type:
        // "不选择目录直接发起"
        if (item.direct) {
          try {
            tmp = Object.assign({}, this.state.currentSelected, {
              typeId: item.typeId,
              typeName: item.typeName,
              itemId: item.children[0].itemId,
              itemName: item.children[0].itemName,
              rgId: item.children[0].rgId,
              rgName: item.children[0].rgName,
              createLevel: Level.type,
            })
          } catch (error) {
            console.log('二级直接发起失败')
          } finally {
            this.props.callback && this.props.callback(tmp)
            this.props.updateTree && this.props.updateTree(this.newTreeData)
          }
        } else if (this.state.currentSelected.itemId === null) {
          // 不考虑一二级目录直接发起的逻辑
          tmp = Object.assign({}, this.state.currentSelected, {
            typeId: item.typeId,
            typeName: item.typeName,
            selected: Level.item,
          })
          this.setState({ displayDataList: [] })
          this.filterTargetLevelData('item', item.parentId, item.typeId)
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

        break
      case Level.item:
        if (item.direct) {
          tmp = Object.assign({}, this.state.currentSelected, {
            itemId: item.itemId,
            itemName: item.itemName,
            rgId: item.rgId,
            rgName: item.rgName,
            createLevel: Level.item,
          })
        } else {
          // 只需三级变更
          tmp = Object.assign({}, this.state.currentSelected, {
            itemId: item.itemId,
            itemName: item.itemName,
            rgId: item.rgId,
            rgName: item.rgName,
            selected: Level.item,
            assigned: null,
          })
        }
        console.log('rrr' + JSON.stringify(tmp))
        // FIXME: 在修改现有mdoel 时，外面有时候会拿不到处理组
        // 发起和详情交互形式不同，
        // 详情：重新选择了服务目录，清空assign, 自动返回Display页面
        // 发起页： 重新选择了服务目录，点击“完成”回到发起页页面，slidemodal弹窗消失
        this.props.goDisplay && this.props.goDisplay(tmp)
        this.props.callback && this.props.callback(tmp)
        this.props.updateTree && this.props.updateTree(this.newTreeData)
        break
    }
    this.setState({ currentSelected: tmp })
  }
}
