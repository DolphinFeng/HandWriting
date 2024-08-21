import { i18nClient } from '@sailor/i18n-mrn'
/**
 * 满意度评价
 */

import React, { Component } from 'react'
import { Text, View, Image, TouchableOpacity, Keyboard } from '@mrn/react-native'
import { dStyle } from '../../../constants/TTStyle'
import down from '@images/down-white.png'
import { TopViewManager, Toast } from '@ss/mtd-react-native'
import MWSList from '@src/components/MWSList'
import { searchCti, searchCTIbyName, getNonWorkSetting } from '../../../constants/TTApi'
import check from '@images/yellow-check.png'
import { Level, RootTree, CTI, SecondTree } from '@src/pages/tt/constants/TTServiceModule'
import { _searchHightColor } from '../../common/SearchHightColor'

interface IProps {
  keyword: string
  checkedCallback: (item) => void
  limitedRange?: boolean
  limitedList?: Array<any>
  treeRange?: boolean
  treeList?: Array<RootTree>
  sceneId?: number // 1表示发起场景，2表示流转场景
  isCustomCreate: boolean // 自定义表单发起时，前端搜索；普通发起/流转时，后端搜索
}

interface IState {
  childrenKeyword: string
  categorySeachChecked: any // 服务目录搜索，用户选中的值
}
export class CategorySearch extends Component<IProps, IState> {
  static defaultProps = {
    limitedRange: false,
    limitedList: [],
  }

  count = 0

  constructor(props: IProps) {
    super(props)

    this.state = {
      // 父组件更新props, 若需子组件重新渲染，子组件需将props转换为自己的state
      childrenKeyword: props.keyword,
      categorySeachChecked: null,
    }
  }

  componentDidMount() {}

  render() {
    console.log('render rrr')
    const list = (
      <MWSList
        renderItem={(item, index) => this.renderItem(item, index)}
        keyExtractor={(item, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        renderSeparator={this.renderSepetar}
        onLoad={() => this.searchCti()}
        showFooter={false}
        needLoadByPage={false}
        ListHeaderComponent={this.renderHeader}
        ListFooterComponent={this.renderFooter}
        dismissKeyboardOnDrag
      />
    )

    return list
  }

  renderFooter = () => {
    return <View style={{ marginBottom: 30 }} />
  }
  searchCti() {
    return this.props.isCustomCreate ? this.getLocalCTIbyName() : this.getRemoteCTIbyName()
  }
  async getRemoteCTIbyName() {
    const res = await searchCti({
      keyword: this.props.keyword,
      sceneId: this.props.sceneId || 1,
    })
    if (res.data && res.code === 200) {
      this.count = res.data.items?.length
      return res.data.items || []
    }
    return []
  }
  async getLocalCTIbyName() {
    if (this.props.limitedRange && this.props.limitedList?.length > 0) {
      console.log('搜索本地列表', this.props.limitedList)

      const origList = Object.assign([], this.props.limitedList)
      const keyword = this.state.childrenKeyword

      const resultList = origList.filter(item => {
        return (
          item?.categoryName?.includes(keyword) ||
          item?.typeName?.includes(keyword) ||
          item?.itemName?.includes(keyword)
        )
      })

      this.count = resultList.length

      return new Promise<any[]>((resolve, reject) => {
        resolve(resultList)
      })
    } else if (this.props.treeRange && this.props.treeList?.length > 0) {
      console.log('本地搜索，支持一二级搜索', this.props.treeList.length)
      // 扩展 一二级直接TT的搜索
      // 优先展示设置了一、二级能发起TT的且带有关键字的一、二级目录，既有一级也有二级关键字且设置了发起的，一级展示在前（关键字增加高亮）
      const origList = Object.assign([], this.props.treeList)
      const keyword = this.state.childrenKeyword

      const nodeSet = new Set<CTI>()
      let tmpResult = []

      origList.forEach((firstNode: RootTree, index) => {
        // 一级命中
        if (firstNode.categoryName.toLowerCase().includes(keyword.toLowerCase())) {
          if (firstNode.ticketRelated && firstNode.defaultCti) {
            nodeSet.add(
              Object.assign({}, firstNode.defaultCti, {
                createLevel: Level.type,
              }),
            )
          }
          tmpResult = this.getNameByFirstNode(firstNode, keyword, true)
        } else {
          tmpResult = this.getNameByFirstNode(firstNode, keyword, false)
        }

        tmpResult.map(v => {
          nodeSet.add(v)
        })
      })

      const resultList = ([] = Array.from(nodeSet))
      this.count = resultList.length

      return new Promise<any[]>((resolve, reject) => {
        resolve(resultList)
      })
    } else {
      const res = await searchCTIbyName(this.state.childrenKeyword)
      if (res?.code === 200 && res?.data?.items) {
        this.count = res.data.items.length
        return new Promise<any[]>((resolve, reject) => {
          resolve(res.data.items)
        })
      } else {
        return new Promise<any[]>((resolve, reject) => {
          resolve([])
        })
      }
    }
  }

  getNameByFirstNode(firstNode: RootTree, keyword: string, hitFirst) {
    let resultList = []
    let tmpSecond = []
    firstNode?.children?.forEach(secondNode => {
      // 一级或二级命中
      if (secondNode?.typeName?.toLowerCase().includes(keyword.toLowerCase()) || hitFirst) {
        if (secondNode?.ticketRelated && secondNode?.defaultCti) {
          resultList.push(
            Object.assign({}, secondNode.defaultCti, {
              createLevel: Level.item,
            }),
          )
        }
        tmpSecond = this.getNameBySecondNode(firstNode, secondNode, keyword, true)
      } else {
        tmpSecond = this.getNameBySecondNode(firstNode, secondNode, keyword, false)
      }
      resultList = resultList.concat(tmpSecond)
    })
    console.log('llist ', resultList.length)
    return resultList
  }

  getNameBySecondNode(firstNode: RootTree, secondNode: SecondTree, keyword: string, hitSecond) {
    const resultList = []
    secondNode?.children?.forEach(thirdNode => {
      // console.log('vvvvv', firstNode.categoryName, secondNode.typeName, thirdNode.itemName)
      if (thirdNode?.itemName?.toLowerCase().includes(keyword.toLowerCase()) || hitSecond) {
        resultList.push(
          Object.assign(
            {},
            {
              categoryId: firstNode.categoryId,
              categoryName: firstNode.categoryName,
              itemId: thirdNode.itemId,
              itemName: thirdNode.itemName,
              rgId: thirdNode.rgId,
              rgName: thirdNode.rgName,
              typeId: secondNode.typeId,
              typeName: secondNode.typeName,
            },
          ),
        )
      }
    })
    // console.log('lllll', resultList.length)
    return resultList
  }

  renderItem(item, index) {
    const checked =
      this.state.categorySeachChecked != null &&
      item.itemId === this.state.categorySeachChecked.itemId
    const name = this.getName(item)
    return (
      <TouchableOpacity
        style={{ height: 48, alignItems: 'center', flexDirection: 'row' }}
        onPress={async () => {
          // 补充unitModal中selected
          let _isWorkHour: boolean = true
          try {
            const res = await getNonWorkSetting(item.rgId, true)
            let { code, data } = res
            if (code === 200 && data.active === true) {
              _isWorkHour = res.data.isWorkHour
            }
          } catch (e) {
            console.log('获取RG工作状态失败', e)
          }
          const uModal = Object.assign(
            {},
            {
              ...item,
              selected: Level.item,
              isWorkHour: _isWorkHour,
              appointAssigned: false,
            },
          )
          this.setState({ categorySeachChecked: uModal })
          this.props.checkedCallback(uModal)
        }}
      >
        <Text>{_searchHightColor(this.props.keyword, name)}</Text>
        {checked ? <Image source={check} style={dStyle.image18} /> : null}
      </TouchableOpacity>
    )
  }

  getName(item) {
    let name = ''
    if (item.createLevel != null) {
      switch (item.createLevel) {
        case Level.type:
          name = item.categoryName
          break
        case Level.item:
          name = `${item.categoryName}/${item.typeName}`
          break
        default:
          name = `${item.categoryName}/${item.typeName}/${item.itemName}`
          break
      }
    } else {
      name = `${item.categoryName}/${item.typeName}/${item.itemName}`
    }

    return name
  }

  renderSepetar = () => {
    return <View style={[dStyle.ticketDivider1, { marginHorizontal: -16 }]} />
  }

  renderHeader = () => {
    return (
      <Text style={dStyle.FontBoldl12}>
        {i18nClient.getFormatText('components_detail_search_930d29', `搜索结果${this.count}条`,{
          slot0: this.count
        })}
      </Text>
    )
  }
}
