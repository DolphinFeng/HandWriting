import { i18nClient } from '@sailor/i18n-mrn'
import { TouchableOpacity, View, Text, StyleSheet, Dimensions, Image } from '@mrn/react-native'
import React, { Component } from 'react'
import { KeyValueDisplay } from '@src/components/KeyValueDispaly'
import { dStyle } from '../../constants/TTStyle'
import {
  TicketDetail,
  RootTree,
  UintModal,
  CustomFieldModel,
  CustomExtraModel,
  RgUser,
  SecondTree,
  ThirdTree,
  Level,
  CustomFieldSystemType,
} from '../../constants/TTServiceModule'
import { Assign } from '../detail/Assign'
import {
  getCategoryTree,
  getAuthSpaceCti,
  getCategoryByRg,
  getOncallUser,
  getRgUser,
  getTreesFromSpaceId,
  findCategory,
  getSpaceInfoFromDomain,
} from '../../constants/TTApi'
import CreateKeyValueRow from './CreateKeyValueRow'
import CreateAssignHeader from './CreateAssignHeader'
import { renderInsetSeprator } from '@src/components/BaseComponents'
import { ttSlideModal } from '../common/TTHelper'
import { openAssignModal } from '../detail/AssignModal'
import { checkNull } from '@src/common/helpers/HelperFunctions'
import { openAssignSelectPersonModal } from './CreateAssignSelectPerson'
import { CreateNewTTContext } from './CreateNewTTContext'
import right from '@images/right-thick.png'
import { handleFindItem, handleTip } from './CreateHelper'
import { createTipComponet } from '@src/pages/tt/components/create/CreateHelper'
import { CreateAssignSelectCategory } from './CreateAssignSelectCategory'
import { Loading, Toast } from '@ss/mtd-react-native'

export class ExtCatModel {
  cid: number
  tid: number
  iid: number
  category: string
  type: string
  item: string
  domain?: string
  source?: string
  associatedField?: string
}

interface IProps {
  dataModel?: TicketDetail
  updateAssignModelCallback: (model: UintModal, oncallPerson: any, needUpdate: boolean) => void

  isCustom?: boolean
  // customFieldList?: CustomFieldModel[]
  extCatModel?: ExtCatModel

  /** domain 空间名称，来自链接跳转 */
  domain?: string
  /** 空间id, 数字，来自空间首页 */
  spaceId?: string
}

interface IState {
  /** 用于目录选择 */
  tree: Array<RootTree>
  categoryModel?: UintModal
  oncallPerson?: string
  oncallPersonModel?: RgUser
  /** 指定目录的平铺列表，用于搜索 */
  limitedList?: Array<any>
  /** 是否指定目录 */
  limitedRange?: boolean

  /** 外部链接过来的目录 */
  extCatModel?: ExtCatModel

  // oncallPersonList?: RgUser[]

  isCustom?: boolean
  // customFieldList?: CustomFieldModel[]

  // isCustomFetchingTrees?: boolean
  spaceId?: string
}

const { width } = Dimensions.get('window')

class CreateAssignSection extends Component<IProps, IState> {
  static contextType = CreateNewTTContext
  context: React.ContextType<typeof CreateNewTTContext>

  // 防止 didUpdate 循环调用
  categroyDataPrepared = false
  isCustomFetchingTrees = false

  constructor(props: IProps) {
    super(props)

    // const extra = this.props?.screenProps.extra
    
    this.state = {
      tree: [],
      extCatModel: this.props?.extCatModel,
      isCustom: this.props.isCustom,
      // customFieldList: this.props.customFieldList
      spaceId: this.props.spaceId,
    }

    // this.prepareData()
  }

  async componentDidMount() {
    const spaceName = this.props.domain
    // 如果是自定义表单发起，无需加载全量tree，直接取模板配置的目录items
    // 通过自定义表单链接发起时，需要再调用一次prepareData()，更新相关变量，否则会在设置目录隐藏时无法修改处理人
    if (this.state?.isCustom) {
      if (this.checkNeedRender()) {
        // 需要获取列表数据
        if (this.context.isCustom && this.categroyDataPrepared === false) {
          await this.prepareData()
          this.categroyDataPrepared = true
          this.isCustomFetchingTrees = true
        }
      }
      return
    }
    if (spaceName && spaceName?.length > 0) {
      try {
        const r = await getSpaceInfoFromDomain(spaceName)

        if (r?.code === 200 && r?.data != null) {
          const spaceId = r?.data?.id?.toString() ?? ''
          this.setState({ spaceId: spaceId }, () => {
            this.fetchTrees()
          })
        } else {
          Toast.open(
            r?.message ?? i18nClient.t('components_create_a2168d', { defaultValue: '请求出错' }),
          )
        }
      } catch {
        Toast.open(i18nClient.t('components_create_a2168d', { defaultValue: '请求出错' }))
      }
    } else {
      this.fetchTrees()
    }
  }

  async componentDidUpdate() {
    console.log('xxxxppppppp update', this.context.isCustom)

    if (this.checkNeedRender()) {
      // 需要获取列表数据
      if (this.context.isCustom && this.categroyDataPrepared === false) {
        console.log('333444999')

        await this.prepareData()
        this.categroyDataPrepared = true
        this.isCustomFetchingTrees = true
      }
    }
  }

  checkNeedRender() {
    const list = this.getAssignSectionCustomList(this.context.customFieldList)

    if (this.checkCustom()) {
      if (list?.length > 0) {
        let item = list[0]
        let extra = item?.extraSettings

        console.log('1239999', extra?.isItemHidden, extra?.isAssignedHidden)

        if (extra?.isItemHidden === true && extra?.isAssignedHidden === true) {
          return false
        }
      }
    }

    return true
  }

  render() {
    console.log('render createassign section')

    // const list = this.getAssignSectionCustomList(this.context.customFieldList)

    if (!this.checkNeedRender()) return null

    // 隐藏section
    // if (this.checkCustom()) {
    //   if (list?.length > 0) {
    //     let item = list[0]
    //     let extra = item?.extraSettings

    //     console.log('1239999', extra?.isItemHidden, extra?.isAssignedHidden);

    //     if (extra?.isItemHidden === true && extra?.isAssignedHidden === true) {
    //       return null
    //     }
    //   }
    // }

    return (
      <View style={{ backgroundColor: 'white' }}>
        {this.renderHeader()}
        {this.renderDisplay()}
      </View>
    )
  }

  renderHeader() {
    const isCustom = this.context.isCustom

    if (!isCustom) {
      if (this.state.categoryModel != null) {
        return null
      } else {
        return this.renderHeaderCustom()
      }
    } else {
      return this.renderHeaderCustom()
    }
  }

  renderHeaderCustom() {
    const list = this.getAssignSectionCustomList(this.context.customFieldList)

    const isCustom = this.context.isCustom

    let titleName = null
    if (isCustom) {
      if (list?.length > 0) {
        titleName = list[0]?.name
      }
    }

    return (
      <>
        <CreateAssignHeader
          key={Math.random()}
          onPress={this.handleOpenAssign}
          title={titleName}
          isCustom={isCustom}
        />

        {renderInsetSeprator(16)}
      </>
    )
  }

  renderDisplay() {
    const model = this.state.categoryModel
    const isCustom = this.context.isCustom

    if (isCustom !== true) {
      return model != null ? this.renderDisplayNormal() : null
    } else {
      return this.renderCustom()
    }
  }

  // 需要有组了以后再选人？
  renderCustom() {
    const list = this.getAssignSectionCustomList(this.context.customFieldList)

    if (list?.length > 0) {
      const field = list[0]
      if (field && field.extraSettings) {
        return (
          <View>
            {this.renderCsutomCategory(field.extraSettings)}
            {this.renderPerson(field.extraSettings)}
            {this.renderTip()}
          </View>
        )
      }
    }

    return null
  }

  renderDisplayNormal() {
    const model = this.state.categoryModel

    console.log('renderDisplayNormal1144', model)

    if (model.onlyPeople === true) {
      let name = model.assigned
      return (
        <View>
          {this.renderCategoryNew()}
          {this.renderPersonNew(name)}
        </View>
      )
    } else if (model.appointAssigned === true) {
      // FIXME: 在普通发起的时候，指定了处理人的带自定义表单的目录，会导致没有 dispaly name
      const i18nDisplayName = model.assignedI18nDisplayName
      const name = model.assignedDisplayName
      const mis = model.assigned

      let finalName = ''
      if (name?.length > 0) {
        finalName = (i18nDisplayName ? i18nDisplayName : name) + '/' + mis
      } else {
        finalName = mis
      }

      console.log('999', name, mis)

      return (
        <View>
          {this.renderCategory()}
          {this.renderPersonNew(finalName)}
        </View>
      )
    }

    return (
      <View>
        {this.renderCategory()}
        {this.renderGroup()}
      </View>
    )
  }

  renderCsutomCategory(extras?: CustomExtraModel) {
    const model = this.state.categoryModel

    if (this.context.isCustom && extras != null) {
      if (extras.isItemHidden) {
        return null
      }
    }

    return this.renderCustomCategoryNormal()
  }

  renderCategory(extras?: CustomExtraModel) {
    return this.renderCategoryNormal()
  }

  // 用于根据模板来准备数据
  async prepareData() {
    console.log('prepare data')

    const list = this.getAssignSectionCustomList(this.context.customFieldList)

    const field = list[0]

    console.log('xxyy', field)

    const extras = field?.extraSettings

    let fetched = false

    if (this.context.isCustom && extras != null) {
      if (extras.isItemHidden) {
        // 隐藏时，默认会带当前目录model
        if (extras?.itemsScope != null) {
          const model = extras.itemsScope
          this.handleGroupAndPersonCustom(model, false)
        }
        return
      } else {
        const scope = extras.itemsScope

        // 限制了范围
        if (scope != null) {
          //指定目录
          if (scope.items != null) {
            console.log('获取tree ; maptrees')

            this.categroyDataPrepared = true
            // 手动 map 到tree里去
            this.mapTress(scope.items)
            fetched = true
          } else if (scope.rgId != null) {
            console.log('获取tree; 指定rg 目录')

            this.categroyDataPrepared = true
            // 指定 rgid
            this.fetchTreesFromRg(scope.rgId)
            fetched = true
          }
        }
      }
    }
    // 避免重复请求tree接口
    if (!fetched && checkNull(this.state?.tree)) {
      console.log('获取tree;默认目录')
      this.categroyDataPrepared = true
      this.fetchTrees()
    }
  }

  // 获取树形数据
  async getTreeData(requestParam: any) {
    try {
      const res = await getAuthSpaceCti(
        {
          domain: this.props.domain || 'ticket',
          isMainSpace: this.props.domain === 'ticket',
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

  mapTress(models: UintModal[]) {
    if (models?.length > 0) {
      this.setState({ limitedList: models, limitedRange: true })
      let rootTreeList: RootTree[] = []

      let rootSet = new Set()
      // let rootTree = new RootTree()
      models.forEach(item => {
        if (item?.categoryId != null) {
          // 没存过的话存进去
          if (!rootSet.has(item?.categoryId)) {
            let tree = new RootTree()
            tree.categoryId = Number(item.categoryId)
            tree.categoryName = item.categoryName

            rootTreeList.push(tree)

            rootSet.add(item?.categoryId)
          }
        }
      })

      console.log('treee 111', rootTreeList)

      const treeCopy = Object.assign([], rootTreeList)
      treeCopy.forEach((item, index) => {
        const list = models.filter(m => Number(m.categoryId) === item.categoryId)

        let secondList: SecondTree[] = []
        let set = new Set()
        list.forEach(i => {
          if (i?.typeId != null) {
            if (!set.has(i.typeId)) {
              let tree = new SecondTree()
              tree.typeId = Number(i.typeId)
              tree.typeName = i?.typeName

              secondList.push(tree)

              set.add(i.typeId)
            }
          }
        })

        rootTreeList[index].children = secondList
      })

      console.log('treee222', rootTreeList)

      const treeCopy2 = Object.assign([], rootTreeList)

      treeCopy2.forEach((i, indexI) => {
        i.children.forEach((j, indexJ) => {
          const r = models
            .filter(m => Number(m.categoryId) === i.categoryId && Number(m.typeId) === j.typeId)
            .map(n => {
              let tree = new ThirdTree()
              tree.itemId = Number(n.itemId)
              tree.itemName = n.itemName
              tree.rgId = Number(n.rgId)
              tree.rgName = n.rgName

              return tree
            })

          rootTreeList[indexI].children[indexJ].children = r
        })
      })

      console.log('treee3333', rootTreeList)
      this.setState({ tree: rootTreeList })

      if (!this.checkCurrentCategoryInTree(rootTreeList)) {
        const { categoryModel, oncallPerson, oncallPersonModel } = this.state
        
        if (categoryModel || oncallPerson || oncallPersonModel) {
          this.setState(
            {
              categoryModel: null,
              oncallPersonModel: null,
              oncallPerson: null,
            },
            () => {
              this.props.updateAssignModelCallback(null, null, null)
            },
          )
        }
      }
    }
  }

  checkCurrentCategoryInTree = (tree: Array<RootTree>) => {
    const { categoryModel } = this.state
    // if (tree.some(firstLevel => String(firstLevel.categoryId) === String(model.categoryId))) {
    if (categoryModel) {
      const i = tree.findIndex(
        level => String(level.categoryId) === String(categoryModel.categoryId),
      )

      if (i !== -1) {
        const j = tree[i].children.findIndex(
          level => String(level.typeId) === String(categoryModel.typeId),
        )

        if (j !== -1) {
          const k = tree[i].children[j].children.findIndex(
            level => String(level.itemId) === String(categoryModel.itemId),
          )

          if (k !== -1) {
            return true
          }
        }
      }
    }

    return false
  }

  handleCategoryPrefix(level: string) {
    return level + '：'
  }

  renderLevelRow(prefix: string, value: string) {
    let newPrefix = this.handleCategoryPrefix(prefix)
    return <>{this.getDispalyTxt(`${newPrefix}${value ?? ''}`)}</>
  }

  renderCategoryNormal() {
    const model = this.state.categoryModel

    console.log('model xxxyyy', model)

    let showArrow = true

    let maxLevel = 4
    if (model.createLevel != null) {
      switch (model.createLevel) {
        case Level.category:
          maxLevel = 1
          break
        case Level.type:
          maxLevel = 2
          break
        case Level.item:
          maxLevel = 3
          break
      }
    }

    // 空间链接时处理
    if (this.props.domain && this.props.domain?.length > 0) {
      // 当前目录包含在tree中，显示箭头，可以修改目录
      const isCategoryInTree = this.checkTreeContain(model)
      showArrow = isCategoryInTree
    }

    return (
      <>
        <CreateKeyValueRow
          label={i18nClient.t('components_create_28148f', { defaultValue: '服务目录' })}
          showArrow={showArrow}
          enablePress={showArrow}
          paddingBottom={14}
          paddingTop={14}
          onPress={() => {
            showArrow && this.handleOpenAssign()
          }}
          renderValue={() => {
            return (
              <View>
                {this.renderNewLevelRow(model, 1, maxLevel)}
                {this.renderNewLevelRow(model, 2, maxLevel)}
                {this.renderNewLevelRow(model, 3, maxLevel)}
                {/* {maxLevel > 0 ? this.renderLevelRow('一级', model?.categoryName) : null}
                  {maxLevel > 1 ? this.renderLevelRow('二级', model?.typeName) : null}
                  {maxLevel > 2 ? this.renderLevelRow('三级', model?.itemName) : null} */}
              </View>
            )
          }}
        />

        {renderInsetSeprator(16)}
      </>
    )
  }

  noCategoryText = '找不到合适的目录'
  newNoCategoryText = '※不选择目录直接发起※'
  renderNewLevelRow(model: UintModal, currentLevel: number, maxLevel: number) {
    if (currentLevel === 1) {
      if (maxLevel > 0) {
        if (model.categoryName === this.noCategoryText) {
          return this.renderLevelRow(
            i18nClient.t('components_create_117bf1', { defaultValue: '一级' }),
            this.newNoCategoryText,
          )
        } else {
          return this.renderLevelRow(
            i18nClient.t('components_create_117bf1', { defaultValue: '一级' }),
            model?.categoryName,
          )
        }
      } else {
        return null
      }
    }

    if (currentLevel === 2) {
      if (maxLevel > 1) {
        if (maxLevel === 2) {
          return this.renderLevelRow(
            i18nClient.t('components_create_301d4d', { defaultValue: '二级' }),
            this.newNoCategoryText,
          )
        } else {
          return this.renderLevelRow(
            i18nClient.t('components_create_301d4d', { defaultValue: '二级' }),
            model?.typeName,
          )
        }
      } else {
        return null
      }
    }

    if (currentLevel === 3) {
      if (maxLevel > 2) {
        if (maxLevel === 3) {
          return this.renderLevelRow(
            i18nClient.t('components_create_3ba8ac', { defaultValue: '三级' }),
            this.newNoCategoryText,
          )
        } else {
          return this.renderLevelRow(
            i18nClient.t('components_create_3ba8ac', { defaultValue: '三级' }),
            model?.itemName,
          )
        }
      } else {
        return null
      }
    }
  }

  renderCustomCategoryNormal(showArrow?: boolean) {
    const model = this.state.categoryModel

    if (
      model?.categoryName?.length > 0 &&
      model?.typeName?.length > 0 &&
      model?.itemName?.length > 0
    ) {
      return this.renderSelectedCategory()
    }

    return this.renderNotSelectedCategory()
  }

  renderNotSelectedCategory() {
    console.log('not selected')

    const name = this.context.isCustom
      ? i18nClient.t('components_create_5fcb1e', { defaultValue: '选择分类' })
      : i18nClient.t('components_create_f8b833', { defaultValue: '向谁发起' })
    return (
      <>
        <CreateKeyValueRow
          label={name}
          showArrow={true}
          enablePress={true}
          paddingBottom={0}
          paddingTop={14}
          onPress={this.handleOpenAssign}
        />

        {renderInsetSeprator(16)}
      </>
    )
  }

  renderSelectedCategory() {
    console.log('selected category')
    const model = this.state.categoryModel

    return (
      <>
        <TouchableOpacity
          style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          onPress={this.handleOpenAssign}
        >
          <View style={{ marginVertical: 14, marginHorizontal: 16 }}>
            {this.renderLevelRow(
              i18nClient.t('components_create_117bf1', { defaultValue: '一级' }),
              model?.categoryName,
            )}
            {this.renderLevelRow(
              i18nClient.t('components_create_301d4d', { defaultValue: '二级' }),
              model?.typeName,
            )}
            {this.renderLevelRow(
              i18nClient.t('components_create_3ba8ac', { defaultValue: '三级' }),
              model?.itemName,
            )}
          </View>
          <Image
            source={right}
            style={[dStyle.image24, { opacity: 0.24, marginTop: 16, marginRight: 16 }]}
          />
        </TouchableOpacity>
        {renderInsetSeprator(16)}
      </>
    )
  }

  renderGroup() {
    const model = this.state.categoryModel
    console.log('123', model.rgName, model)
    let left = i18nClient.t('components_create_99c377', { defaultValue: '处理组' })
    let right = `${model?.rgName ?? ''}`

    const isNoSelectCat = model.categoryName === this.noCategoryText
    if (isNoSelectCat) {
      left = ''
      right = i18nClient.t('components_create_42ed49', {
        defaultValue: 'TT团队将帮助您寻找问题处理方',
      })
    }

    return (
      <KeyValueDisplay label={left} paddingTop={12} paddingBottom={12}>
        {this.getDispalyTxt(right)}
      </KeyValueDisplay>
    )
  }

  renderPerson(extras?: CustomExtraModel) {
    const model = this.state.categoryModel

    if (this.context.isCustom && extras != null) {
      if (extras.isAssignedHidden) {
        return null
      } else {
      }
    }

    return this.renderPersonGeneral(extras)
  }

  renderPersonGeneral(extras?: CustomExtraModel) {
    let name = ''
    let canSelectPerson = false
    if (this.state.oncallPersonModel != null) {
      const model = this.state.oncallPersonModel
      name = `${model?.displayName}/${model?.identify}`

      canSelectPerson = extras?.specificAssigned ?? false
    } else if (this.state.oncallPerson != null) {
      name = this.state.oncallPerson
    }

    return (
      <CreateKeyValueRow
        label={i18nClient.t('components_create_4c8c9d', { defaultValue: '处理人' })}
        paddingTop={12}
        paddingBottom={12}
        // showArrow={true} enablePress={true}
        showArrow={canSelectPerson}
        enablePress={canSelectPerson}
        onPress={this.handleShowSelectPerson}
        renderValue={() => {
          return this.getDispalyTxt(`${name}`)
        }}
      />
    )

    // {/* {this.getDispalyTxt(`${model?.rgName ?? ''}`)} */}
  }

  renderCategoryNew() {
    const name = i18nClient.t('components_create_7f64e2', { defaultValue: '不选择直接发给处理人' })
    return (
      <>
        <CreateKeyValueRow
          label={i18nClient.t('components_create_28148f', { defaultValue: '服务目录' })}
          showArrow={true}
          enablePress={true}
          paddingBottom={0}
          paddingTop={14}
          onPress={this.handleOpenAssign}
          renderValue={() => {
            return this.getDispalyTxt(`${name}`)
          }}
        />

        {renderInsetSeprator(16)}
      </>
    )
  }

  renderPersonNew(name: string) {
    return (
      <CreateKeyValueRow
        label={i18nClient.t('components_create_4c8c9d', { defaultValue: '处理人' })}
        paddingTop={12}
        paddingBottom={12}
        showArrow={false}
        enablePress={false}
        // onPress={this.handleShowSelectPerson}
        renderValue={() => {
          return this.getDispalyTxt(`${name}`)
        }}
      />
    )
  }

  renderTip() {
    const item = handleFindItem(this.context.customFieldList, CustomFieldSystemType.assigned)
    const tip = handleTip(false, item)

    if (tip?.length > 0) {
      return <>{createTipComponet(tip, 16, 6)}</>
    }

    return null
  }

  // FIXME: 选人
  handleShowSelectPerson = () => {
    console.log('show select')

    this.openAssignPersonSelection()
  }

  getDispalyTxt(txt) {
    return <Text style={[dStyle.Font14by87, { width: width - 133 }]}>{txt}</Text>
  }

  async showAssign() {
    // 调用“指派”需带参数， 此UintModal很重要，Assign组件会返回用户选中的服务目录
    // let mock = {
    //   categoryId: 1301,
    //   categoryName: "2000-法务",
    //   typeId: 3687,
    //   typeName: '7000测试',
    //   itemId: 10798,
    //   itemName: '张宁测试',
    //   rgId: 5973,
    //   rgName: '前端专用测试RG',
    //   selected: Level.category
    // }

    // 自定义表单只选择目录
    if (this.context.isCustom) {
      console.log(
        '自定义表单打开',
        this.state.limitedRange,
        this.state.limitedList,
        this.state.tree,
        this.state.categoryModel,
      )

      const instance = ttSlideModal(
        <CreateAssignSelectCategory
          initStruct={this.state.categoryModel}
          onFinish={model => {
            instance.close()
            this.handleAssignModelCallback(model)
          }}
          onCancel={() => {
            instance.close()
          }}
          cgiTree={this.state.tree}
          limitedList={this.state.limitedList}
          limitedRange={this.state.limitedRange}
        />,
      )
    } else {
      console.log('普通表单打开')

      const instance = ttSlideModal(
        <Assign
          initStruct={this.state.categoryModel}
          domain={this.props?.domain}
          onFinish={model => {
            instance.close()
            this.handleAssignModelCallback(model)
          }}
          onRefreshTree={tree => {
            this.setState({ tree })
          }}
          onCancel={() => {
            instance.close()
          }}
          cgiTree={this.state.tree}
        />,
      )
    }

    // const instance = openAssignModal({
    //   cgiTree: this.state.tree,
    //   initStruct: this.state.categoryModel,
    //   onFinish: (serviceCategory) => {
    //     instance.close()
    //     this.setState({ categoryModel: serviceCategory })

    //     this.props.updateAssignModelCallback(serviceCategory)
    //     console.log('new service category ' + JSON.stringify(serviceCategory))
    //   },
    //   onCancel: () => instance.close(),

    // })
  }

  openAssignPersonSelection() {
    console.log('open assign')
    // const {categoryId,categoryName,typeId,typeName,itemId,itemName,rgId,rgName, assigned} = this.state.currentServiceCategory

    let model = Object.assign({}, this.state.categoryModel)
    model.selected = Level.item

    console.log('wwwww ' + JSON.stringify(model))
    const instance = openAssignSelectPersonModal({
      cgiTree: this.state.tree,
      initStruct: model,
      onCancel: () => {
        instance.close()
      },
      onFinish: (oncallName, userModel) => {
        instance.close()

        if (oncallName?.length > 0) {
          let catModel = Object.assign({}, this.state.categoryModel)
          catModel.assigned = oncallName
          catModel.appointAssigned = userModel?.selectPersonManually ?? false

          this.setState({
            oncallPerson: oncallName,
            oncallPersonModel: userModel,
            categoryModel: catModel,
          })
          
          this.props.updateAssignModelCallback(catModel, oncallName, false)
          // this.setState({currentServiceCategory: serviceCategory})
          // this.props.callbackAssign(serviceCategory)
        }
      },
    })
  }

  handleAssignModelCallback = async (model: UintModal) => {
    console.log('回调assignmodel', model)

    if (this.context.isCustom === true) {
      this.handleGroupAndPersonCustom(model)
    } else {
      this.handleGroupAndPersonNormal(model)
    }

    // this.getOncallList(model)
    // this.setState({ categoryModel: serviceCategory })

    // this.props.updateAssignModelCallback(serviceCategory)
    console.log('new service category ' + JSON.stringify(model))
  }

  handleGroupAndPersonNormal = async (categoryModel: UintModal) => {
    let oncallPerson: string
    let oncallPersonModel: RgUser

    let model = Object.assign({}, categoryModel)

    if (model.assigned != null && model.assigned.length > 0) {
      oncallPerson = model.assigned
    } else {
      const res = await getOncallUser(model.rgId)
      console.log('oncall', res)

      if (res?.code === 200 && res?.message === 'OK') {
        oncallPersonModel = res?.data
        oncallPerson = oncallPersonModel?.identify

        console.log('yyy', oncallPersonModel)
      }
    }

    model.assigned = oncallPerson

    if (model.onlyPeople === true) {
      model.createLevel = Level.category
    }

    this.setState({
      categoryModel: model,
      oncallPerson: oncallPerson,
      oncallPersonModel: oncallPersonModel,
    })
    this.props.updateAssignModelCallback(model, oncallPerson, true)
    // this.resetCategoryData()
  }

  // 让组件更新的时候重新获取category数据
  resetCategoryData() {
    this.categroyDataPrepared = false
    this.isCustomFetchingTrees = false
  }

  handleGroupAndPersonCustom = async (categoryModel: UintModal, needUpdate: boolean = true) => {
    let oncallPerson: string
    let oncallPersonModel: RgUser

    if (categoryModel.assigned != null && categoryModel.assigned.length > 0) {
      oncallPerson = categoryModel.assigned
    } else {
      const res = await getOncallUser(categoryModel.rgId)
      console.log('oncall', res)

      if (res?.code === 200 && res?.message === 'OK') {
        oncallPersonModel = res?.data
        oncallPerson = oncallPersonModel?.identify

        console.log('yyy', oncallPersonModel)
      }
    }

    categoryModel.assigned = oncallPerson

    this.setState({
      categoryModel: categoryModel,
      oncallPerson: oncallPerson,
      oncallPersonModel: oncallPersonModel,
    })
    this.props.updateAssignModelCallback(categoryModel, oncallPerson, needUpdate)
    // this.resetCategoryData()
  }

  // getOncallList(catModel: UintModal) {
  //   getRgUser({rgId: Number(catModel?.rgId)}).then(res => {
  //     if (res?.code === 200 && res?.data?.items) {
  //       this.setState({ oncallPersonList: res?.data?.items })
  //       console.log('items', res?.data?.items);

  //     }
  //   })
  // }

  // updateState (isCustom?: boolean, customFieldList?: CustomFieldModel[]) {
  //   console.log('updatestate', customFieldList);

  //   this.setState({
  //     isCustom: isCustom,
  //     customFieldList: customFieldList,
  //     isCustomFetchingTrees: true
  //   }, () => {
  //     this.prepareData()
  //   })
  // }

  getAssignSectionCustomList(list: CustomFieldModel[]) {
    const section = [CustomFieldSystemType.assigned]

    const rList = list.filter(item => section.includes(item.identify))
    
    return rList
  }

  checkCustom = () => {
    return this.context.isCustom
  }

  fetchTreesFromRg(rgId: number) {
    getCategoryByRg(rgId)
      .then(res => {
        if (res?.code === 200 && res?.data?.items) {
          this.setState({ tree: res.data.items as Array<RootTree> })
          this.prepareListFromRgTree(res.data.items)

          if (!this.checkCurrentCategoryInTree(res.data.items as Array<RootTree>)) {
            this.setState(
              {
                categoryModel: null,
                oncallPersonModel: null,
                oncallPerson: null,
              },
              () => {
                this.props.updateAssignModelCallback(null, null, null)
              },
            )
          }
        }
      })
      .catch(e => {
        console.log('getCategoryTree ' + e)
      })
  }

  prepareListFromRgTree(tree: Array<RootTree>) {
    let list = []

    tree.forEach(firstLevel => {
      const catName = firstLevel.categoryName
      const catId = firstLevel.categoryId

      firstLevel.children.forEach(secondLevel => {
        const typeName = secondLevel.typeName
        const typeId = secondLevel.typeId

        secondLevel.children.forEach(thirdLevel => {
          const { itemName, itemId, rgId, rgName } = thirdLevel

          let model = new UintModal()
          model.categoryName = catName
          model.categoryId = catId.toString()
          model.typeName = typeName
          model.typeId = typeId.toString()
          model.itemName = itemName
          model.itemId = itemId.toString()
          model.rgName = rgName
          model.rgId = rgId.toString()

          list.push(model)
        })
      })
    })

    this.setState({ limitedList: list, limitedRange: true })
  }

  requestTrees = async () => {
    const { spaceId } = this.state

    console.log('111222333', spaceId)

    if (spaceId && spaceId !== '1') {
      // 获取私有目录
      return getTreesFromSpaceId(spaceId, '1')
    } else {
      // 获取公共目录
      return getTreesFromSpaceId('1', '1')
    }
  }

  fetchTrees = async () => {
    const instance = Loading.open()
    // 根据所选目录请求树形数据；
    console.log('get tree in create', this.state.extCatModel)
    if (!this.state.extCatModel) {
      instance.close()
      return
    }
    const { cid, tid, iid } = this.state.extCatModel
    let requestParam = {}
    if (cid && tid && iid) {
      // 移动端仅在三级目录链接完整时回显目录
      requestParam = {
        categoryIds: [cid],
        typeIds: [tid],
      }
    }
    const treeData = await this.getTreeData({
      ...requestParam,
      createScene: true,
    })
    if (treeData) {
      const { tree } = this.state

      if (this.context.isCustom && tree?.length > 0 && this.isCustomFetchingTrees) {
      } else {
        console.log('fetch tress final')

        const r = treeData as Array<RootTree>
        // this.handleExtCat(r)
        this.handleExtCatNew()
        this.setState({ tree: r, limitedRange: false, limitedList: [] })

        if (!this.checkCurrentCategoryInTree(r)) {
          this.setState({
            categoryModel: null,
            oncallPersonModel: null,
            oncallPerson: null,
          })
        }
      }
    }
    console.log('test tree', this.state.tree)
    // this.setState({ tree: res, limitedRange: false, limitedList: [] })
    instance.close()
  }

  /** 检查是否包含目录 */
  checkTreeContain = (model: UintModal) => {
    const { tree } = this.state
    if (tree != null) {
      if (tree.some(firstLevel => String(firstLevel.categoryId) === String(model.categoryId))) {
        return true
      } else {
        return false
      }
    }

    return true
  }

  // 处理链接自带目录的情况
  handleExtCat(tree: Array<RootTree>) {
    const model = this.state.extCatModel
    if (model && [model.cid, model.tid, model.iid].every(i => i > 0)) {
      let categoryModel = new UintModal()
      const firstTree = tree.find(i => i.categoryId === model.cid)

      if (firstTree != null) {
        categoryModel.categoryId = `${firstTree.categoryId}`
        categoryModel.categoryName = firstTree.categoryName
      } else {
        return
      }

      const secondTree = firstTree?.children.find(i => i.typeId === model.tid)

      if (secondTree != null) {
        categoryModel.typeId = `${secondTree.typeId}`
        categoryModel.typeName = secondTree.typeName
      } else {
        return
      }

      const thirdTree = secondTree?.children.find(i => i.itemId === model.iid)

      if (thirdTree != null) {
        categoryModel.itemId = `${thirdTree.itemId}`
        categoryModel.itemName = thirdTree.itemName

        categoryModel.rgId = `${thirdTree.rgId}`
        categoryModel.rgName = thirdTree.rgName
      } else {
        return
      }

      categoryModel.selected = Level.item

      this.handleAssignModelCallback(categoryModel)
    }
  }

  // 调用后端接口获取兼容新老url,无需查本地tree
  async handleExtCatNew() {
    const model = this.state.extCatModel
    if (
      model &&
      ([model.cid, model.tid, model.iid].every(i => i > 0) ||
        [model.category, model.type, model.item].every(i => i != null))
    ) {
      const result = await findCategory(this.state.extCatModel)
      console.log('ccc ', result)
      if (result?.code === 200 && result?.data?.category) {
        const { cid, category, tid, type, iid, item, rgId, rgName } = result.data
        
        let categoryModel = new UintModal()
        categoryModel.categoryId = cid
        categoryModel.categoryName = category
        categoryModel.typeId = tid
        categoryModel.typeName = type
        categoryModel.itemId = iid
        categoryModel.itemName = item
        categoryModel.rgId = rgId
        categoryModel.rgName = rgName
        categoryModel.selected = Level.item
        

        this.handleAssignModelCallback(categoryModel)
      }
    }
  }

  handleOpenAssign = async () => {
    // this.setState({ showAssign: true })
    // 自定义表单发起时，无需请求tree，此时state中tree为空，将非空判断放在 prepareData()
    // if (checkNull(this.state.tree)) {
    await this.prepareData()
    // }
    console.log(' prepare data', this.state.tree)
    this.showAssign()
  }
}

export default CreateAssignSection
