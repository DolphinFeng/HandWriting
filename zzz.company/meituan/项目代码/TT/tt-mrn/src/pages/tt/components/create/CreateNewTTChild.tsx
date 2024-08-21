import { i18nClient } from '@sailor/i18n-mrn'
import React, { Component } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from '@mrn/react-native'
import { TTCreateStyle } from '../../constants/TTStyle'
import CreateMoreSection from './CreateMoreSection'
import CreateLevelSection from './CreateLevelSection'
import { MWSStyle } from '@src/common/styles/MWSCommonStyle'
import NavLeftBar from '@src/components/NavLeftBar'
import HeaderRightBtn from '@src/components/NavRightButton'
import { Tab, Icon, Toast, Loading } from '@ss/mtd-react-native'
import { AttachmentList, AttachmentModel } from '../detail/AttachmentList'
import theme from '@src/common/styles/MWSStyle'
import {
  Level,
  UintModal,
  CreateTempModel,
  CCPersonModel,
  CustomFieldModel,
  CustomFieldType,
  CustomFieldSystemType,
  CustomCreateModel,
  Label,
  RGSettingsModel,
  RgUser,
} from '../../constants/TTServiceModule'
import CreateAssignSection, { ExtCatModel } from './CreateAssignSection'
import CreateTitleDesc from './CreateTitleDesc'
import CreateBottm from './CreateBottm'
import { isIPhoneWithNotch } from '@src/common/styles/NavigationStyle'
import {
  getTemplateByItem,
  getOncallUser,
  createTicket,
  getCustomForm,
  createCustomTicket,
  uploadAttachFiles,
  getRgSetting,
  getTemplateFromSapceId,
  uploadAttachFilesNew,
  uploadMedia,
} from '../../constants/TTApi'
import CCPerson from '../common/CCPerson'
import { Sla2CN } from '../../constants/ConfigMap'
import { checkNull } from '@src/common/helpers/HelperFunctions'
import { requestCurrentUser, isXiaoXiang } from '../common/TTHelper'
import {
  CreateCustomInfo,
  CustomRequestDataType,
  CustomRequestModel,
} from '../custom/CreateCustomInfo'
import { CreateNewTTContext, CreateNewTTProvider } from './CreateNewTTContext'
import { getKey } from '@src/common/helpers/api'
import { AppName } from '@src/common/helpers/app'
import { getFieldMeta, handleFindItem } from './CreateHelper'
import { TTKeys, ttCreateTTClick } from '../../constants/TTKeys'

export class ExtCustomModel {
  formId: number
  source?: string
  associatedField?: string
}

interface IProps {
  navigation: any
  extCatModel?: ExtCatModel
  extCustomModel?: ExtCustomModel
}

interface IState {
  showAssign: boolean
  itemTemplate?: CreateTempModel
  // customDataModel?: CustomCreateModel
  isCustom: boolean

  formId?: number
  rgId?: number

  nameDescSectionCustomList: CustomFieldModel[]
  assignSectionCustomList: CustomFieldModel[]
  levelSectionCustomList: CustomFieldModel[]
  moreSectionCustomList: CustomFieldModel[]
  attachSectionCustomList: CustomFieldModel[]
}

class CreateNewTTChild extends Component<IProps, IState> {
  static contextType = CreateNewTTContext
  context: React.ContextType<typeof CreateNewTTContext>

  customFormRef: CreateCustomInfo = null

  _descRef: CreateTitleDesc = null
  _createLevelRef: CreateLevelSection = null
  _createMoreRef: CreateMoreSection = null
  _createAssignRef: CreateAssignSection = null
  _createAttachRef: AttachmentList = null

  // 自定义表单 id
  _customFormId: number = null
  // _levelSectionCustomList = []
  // _moreSectionCustomList = []

  oncallPerson = null
  categoryModel: UintModal = null

  // s4
  selectedLevel = 'S4'
  selectedCC = null
  selectedType = '事件' // value 是中文，不需要翻译
  selectedLabels = []
  //   selectedCity = ''

  selectedCreator = null
  reporterModel: CCPersonModel = null

  inputName = ''
  inputDesc = ''

  extrasFromCustom = null

  _customFieldValueList: Array<CustomRequestModel> = []

  _attachmentList: AttachmentModel[] = []

  privateStatus = 'public'

  // 记录TT发起入口来源
  _entranceSource = 'A'

  // 附件是否为必填项
  isFileRequired: boolean = false

  constructor(props) {
    super(props)

    let isCustom = this.props.navigation.getParam('iscustom', false)
    // const rgId = this.props.navigation.getParam('rgid', null)
    let formId = this.props.navigation.getParam('formid', null)

    if (this.props.extCustomModel?.formId > 0) {
      console.log('pppmmm', this.props.extCustomModel.formId)

      isCustom = true
      formId = this.props.extCustomModel?.formId
    }

    this.state = {
      showAssign: false,

      isCustom: isCustom,
      formId: formId,
      // rgId: rgId,

      nameDescSectionCustomList: [],
      assignSectionCustomList: [],
      levelSectionCustomList: [],
      moreSectionCustomList: [],
      attachSectionCustomList: [],

      // _attachmentList: []
    }

    // TODO: move
    this.getUserMis()
    if (isCustom && formId && formId > 0) {
      this.handleCustomTemplate(formId, true)
    } else {
      const spaceId = this.props.navigation.getParam('spaceId')
      if (spaceId) {
        this.handleSpaceId(spaceId)
      }
    }

    this._entranceSource = this.getTTCreateSource()
  }

  async handleSpaceId(spaceId: string) {
    const r = await getTemplateFromSapceId(spaceId)

    if (r?.code === 200 && r?.message === 'OK' && r?.data) {
      console.log(r.data)
      this.handleTemplate(r.data as any)
    }
  }

  render() {
    // 由于自定义表单的渲染耦合在renderNormal()中，所以在此处做判断
    // state中的isCustom根据发起链接判断，context中的isCustom根据接口返回值判断
    let renderType = 'normal'
    // context中isCustom为TRUE时，说明已通过接口验证为自定义表单，可渲染
    if (!this.context?.isCustom && this.state?.isCustom) {
      // 需要调接口判断发起链接是否为自定义表单，所以先进入loading状态
      renderType = 'custom'
    }
    return renderType === 'normal' ? (
      <>{this.renderNormal()}</>
    ) : (
      <View
        style={{
          backgroundColor: theme.white,
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator />
        <Text style={{ marginTop: 5 }}>
          {i18nClient.t('components_create_26b5bd', { defaultValue: '加载中...' })}
        </Text>
      </View>
    )
  }

  renderNormal() {
    return (
      <View style={{ backgroundColor: theme.grayF5, flex: 1 }}>
        <ScrollView key={i18nClient.getCurrentLocale()} overScrollMode="never">
          {this.renderAssign()}
          {this.renderNameDescSection()}
          {this.context.isCustom ? this.renderCustomSection() : null}

          {this.renderAttachment()}

          {this.renderLevelSection()}
          {this.renderMoreSection()}
          {this.renderDivider8()}
        </ScrollView>
        <CreateBottm
          handleCancel={this.handleCancel}
          handleCommit={() => {
            this.context.isCustom ? this.handleCustomCommit() : this.handleCommit()
          }}
        />
      </View>
    )
  }

  renderDivider8() {
    return <View style={[theme.divider8]} />
  }

  renderAttachment = () => {
    // 普通表单、 自定义表单设置了附件上传
    if (this.context.isCustom === true) {
      const list = this.getAttachSectionCustomList(this.context.customFieldList)
      if (list.length > 0) {
        this.isFileRequired = list[0].isRequired
        return this.renderAttachmentSection(this.isFileRequired)
      }
    } else {
      // 普通表单时上传附件不是必填项
      this.isFileRequired = false
      return this.renderAttachmentSection(this.isFileRequired)
    }

    return null
  }

  renderAttachmentSection = isRequired => {
    return (
      <>
        {this.renderDivider8()}
        <AttachmentList
          attachmentList={[]}
          ticketId={null}
          area={'attach'}
          from={'create'}
          isCustom={this.context.isCustom}
          customFieldList={this.context.customFieldList}
          ref={r => {
            this._createAttachRef = r
          }}
          isRequired={isRequired}
          addAttachCallback={this.handleAttachemntCallback}
        />
      </>
    )
  }

  handleAttachemntCallback = (list: AttachmentModel[]) => {
    this._attachmentList = list
  }

  renderNameDescSection() {
    // if (this.context.isCustom === true && !(this.state.levelSectionCustomList.length > 0)) {
    //   return null
    // } else {
    //   return this.renderNameDescSub()
    // }

    return this.renderNameDescSub()
  }

  renderNameDescSub() {
    // const needCustom = this.context.isCustom === true && this.state.nameDescSectionCustomList.length > 0

    const { isCustom, customFieldList } = this.context
    const d1 = getFieldMeta(isCustom, customFieldList, CustomFieldSystemType.name)

    const defaultName = d1.defaultValue

    const d2 = getFieldMeta(isCustom, customFieldList, CustomFieldSystemType.desc)

    const defaultDesc = d2.defaultValue

    // 在有 default 值的时候存到本地变量
    // 因为在 下面的 d2.id 可能因为都是 0，导致不会在render 的时候重新生成，进入不了 constructor
    if (defaultName?.length > 0) this.inputName = defaultName
    if (defaultDesc?.length > 0) this.inputDesc = defaultDesc

    return (
      <>
        {this.renderDivider8()}
        <CreateTitleDesc
          ref={_r => {
            this._descRef = _r
          }}
          key={`name_desc_${(d1?.id ?? 0) + (d2?.id ?? 0)}`}
          // onInputChanged={r => this.handleNameDescChanged(r.name, r.desc)}
          onNameChanged={this.handleNameChanged}
          onDescChanged={this.handleDescChanged}
          inputName={defaultName}
          inputDesc={defaultDesc}
          // isCustom={needCustom}
          // customFieldList={this.state.nameDescSectionCustomList ?? null}
        />
      </>
    )
  }

  renderAssign() {
    // if (this.context.isCustom === true ) {

    //   if (!(this.state.assignSectionCustomList.length > 0)) {
    //     return null
    //   } else {
    //     let item = this.state.assignSectionCustomList[0]
    //     let extra = item?.extraSettings

    //     if (extra?.isItemHidden === true && extra?.isAssignedHidden === true) {
    //       return null
    //     }
    //   }
    // }

    return this.renderAssignSub()
  }

  handleCustomAssignData() {
    if (this.context.isCustom === true && this.state.assignSectionCustomList?.length > 0) {
      let item = this.state.assignSectionCustomList[0]
      let extra = item?.extraSettings

      // 隐藏指派
      if (extra?.isItemHidden === true && extra?.isAssignedHidden === true) {
        if (extra.itemsScope != null) {
          this.extrasFromCustom = extra.itemsScope
          if (extra.itemsScope.rgId != null) {
            this.requestOncallUser(extra.itemsScope.rgId)
          }
        }
      }
    }
  }

  renderAssignSub() {
    // const needCustom = this.context.isCustom === true && this.state.assignSectionCustomList.length > 0

    if (!this.checkNeedRenderAssign()) {
      // 处理隐藏指派的情况
      this.handleAssignWhenHide()
      return null
    }

    return (
      <>
        {this.renderDivider8()}
        <CreateAssignSection
          dataModel={null}
          updateAssignModelCallback={(model, person, needUpdate) =>
            this.handleUpdateAssignModel(model, person, needUpdate)
          }
          isCustom={this.state?.isCustom}
          // customFieldList={this.state.moreSectionCustomList}
          extCatModel={this.props?.extCatModel}
          ref={r => {
            this._createAssignRef = r
          }}
          domain={this.props?.extCatModel?.domain}
          spaceId={this.props.navigation.getParam('spaceId')}
        />
      </>
    )
  }

  handleAssignWhenHide() {
    const list = this.getAssignSectionCustomList(this.context.customFieldList)

    if (list?.length > 0) {
      let item = list[0]
      let extras = item?.extraSettings

      const model = extras.itemsScope
      this.handleGroupAndPersonCustom(model)
    }
  }

  // 处理默认的目录和人
  handleGroupAndPersonCustom = async (categoryModel: UintModal) => {
    let oncallPersonModel: RgUser

    this.categoryModel = categoryModel

    const res = await getOncallUser(categoryModel.rgId)

    if (res?.code === 200 && res?.message === 'OK') {
      oncallPersonModel = res?.data

      this.oncallPerson = oncallPersonModel?.identify
    }
  }

  checkNeedRenderAssign() {
    const list = this.getAssignSectionCustomList(this.context.customFieldList)

    if (this.checkCustom()) {
      if (list?.length > 0) {
        let item = list[0]
        let extra = item?.extraSettings

        if (extra?.isItemHidden === true && extra?.isAssignedHidden === true) {
          return false
        }
      }
    }

    return true
  }

  getAssignSectionCustomList(list: CustomFieldModel[]) {
    const section = [CustomFieldSystemType.assigned]

    const rList = list.filter(item => section.includes(item.identify))

    return rList
  }

  checkCustom = () => {
    return this.context.isCustom
  }

  renderCustomSection() {
    return (
      <CreateCustomInfo
        // propData={this.state.customDataModel}
        onUpdateCustomFields={this.handleUpdateCustomFields}
        ref={r => {
          this.customFormRef = r
        }}
      />
    )
  }

  renderLevelSection() {
    // if (this.context.isCustom === true && !(this.state.levelSectionCustomList.length > 0)) {
    //   return null
    // } else {
    //   return this.renderLevelSub()
    // }

    return this.renderLevelSub()
  }

  renderLevelSub() {
    // const needCustom = this.context.isCustom === true && this.state.levelSectionCustomList.length > 0
    return (
      <>
        {this.renderDivider8()}
        <CreateLevelSection
          levelValue={i18nClient.t(Sla2CN[this.selectedLevel])}
          onSelectedLevel={level => this.handleSelectedLevel(level)}
          onSelectedCCPeople={ccPeople => this.handleSelectedCC(ccPeople)}
          onSelectedCreator={person => this.handleSelectedCreator(person)}
          onUpdatePrivate={status => this.handleUpdatePrivate(status)}
          defaultCreator={this.reporterModel}
          rgId={this.state.rgId}
          // isCustom={needCustom}
          // customFieldList={this.state.levelSectionCustomList ?? null}
          ref={r => {
            this._createLevelRef = r
          }}
        />
      </>
    )
  }

  renderMoreSection() {
    // if (this.context.isCustom === true && !(this.state.moreSectionCustomList.length > 0)) {
    //   return null
    // } else {
    //   return this.renderMoreSub()
    // }

    return this.renderMoreSub()
  }

  renderMoreSub() {
    // const needCustom = this.context.isCustom === true && this.state.moreSectionCustomList.length > 0

    return (
      <>
        {this.renderDivider8()}
        <CreateMoreSection
          onSelectedType={type => this.handleSelectedType(type)}
          onSelectedLabels={this.handleSelectedLabels}
          //   onSelectedCity={this.handleSelectedCityName}
          typeValue={this.selectedType}
          // isCustom={needCustom}
          // customFieldList={this.state.moreSectionCustomList}
          ref={r => {
            this._createMoreRef = r
          }}
        />
      </>
    )
  }

  // 切换指派model处理
  async handleUpdateAssignModel(model: UintModal, oncallPerson: string, needUpdate?: boolean) {
    let newModel = Object.assign({}, model)
    newModel.assigned = oncallPerson

    this.setState({ rgId: Number(model?.rgId) || 0 })
    // CreateAssingSecion 里控制是否需要更新template
    if (needUpdate) {
      // if (this.context.isCustom) {
      //   this.categoryModel = model
      //   this.oncallPerson = oncallPerson
      // } else {

      // 获取template 并处理
      if (model?.rgId != null && parseInt(model?.itemId, 10) > 0) {
        this.handleGetTemplate(newModel)
        // this.handleRequestRgSettings(newModel.rgId)
      }
      // }
    } else {
      if (model) {
        // 只更新 服务目录相关数据
        this.handleCatData(newModel)
      } else {
        this.handleCatData(null)
      }
    }
  }

  async handleGetTemplate(model: UintModal) {
    const loading = Loading.open()
    const res = await getTemplateByItem(parseInt(model.itemId, 10)).catch(e => {})
    loading.close()
    if (res?.code === 200 && res?.message === 'OK') {
      const template = res?.data as CreateTempModel

      this.handleTemplate(template, model)
    }
  }

  async handleRequestRgSettings(rgId: string) {
    const res = await getRgSetting(rgId).catch(e => {})
    if (res?.code === 200 && res?.message === 'OK') {
      const settingModel = res?.data as RGSettingsModel
      this.handleRgSettings(settingModel)
    }
  }

  async handleRgSettings(model: RGSettingsModel) {
    let ccList = []

    if (model?.ccSwitch === 'on' && model?.userMap) {
      const userMap = new Map(Object.entries(model.userMap))

      userMap.forEach((value, key) => {
        let model = new CCPersonModel()
        model.displayName = value
        model.username = key

        ccList.push(model)
      })

      this._createLevelRef?.updateFromSettingsModel(ccList, model.auth)
    }

    console.log('final cclist', ccList)
  }

  async handleTemplate(template: CreateTempModel, categoryModel?: UintModal) {
    let isCustom = this.props.navigation.getParam('iscustom', false)
    let formId = this.props.navigation.getParam('formid', null)

    if (this.props.extCustomModel?.formId > 0) {
      isCustom = true
      formId = this.props.extCustomModel?.formId
    }

    // 只处理带模板的情况
    // 不处理有 formid 但是没有自定义模板的情况
    if (isCustom && formId > 0 && template?.type === 'CUSTOM' && template?.id > 0) {
      // 自定义表单的时候会切换
      console.log('自定义表单', template?.id)

      // 自定义模板
      this.handleCustomTemplate(template.id)
      this.handleCatData(categoryModel)
    } else {
      console.log('默认没有模板', isCustom, formId)
      // 常规情况
      if (template != null) {
        const type = template?.type
        if (type != null) {
          if (type !== 'NORMAL') {
            if (type === 'CUSTOM' && template?.id > 0) {
              console.log('自定义表单', template?.id)

              // 自定义模板
              this.handleCustomTemplate(template.id)
              this.handleCatData(categoryModel)
            } else {
              Toast.open(
                i18nClient.t('components_create_443c81', { defaultValue: '暂不支持该表单' }),
              )
            }
          } else {
            // 普通模板
            console.log('set template', template)

            this.resetIfCustom()

            if (template?.content?.length > 0) {
              this.inputDesc = this.inputDesc + '\n' + template?.content
              this._descRef?.updateDescFromTemplate(this.inputDesc)
            }

            this.handleCatData(categoryModel)
          }
        } else {
          this.resetIfCustom()
          // 没有模板
          this.handleCatData(categoryModel)
        }
      } else {
        this.resetIfCustom()
        // 没有模板
        this.handleCatData(categoryModel)
      }
    }
  }

  resetIfCustom() {
    console.log('ooopppp', this.context.isCustom)

    if (this.context.isCustom) {
      console.log('111111', 'resetIfCustom')

      this.context.updateCustom(false, [])
      // 如果切换到了非自定义表单目录，需要把state中的isCustom置为FALSE，否则无法渲染普通表单
      this.setState({ isCustom: false })
      // this._createLevelRef?.updateState(false)
      // this._createMoreRef?.updateState(false)
      // this._createAssignRef?.updateState(false)
    }
  }

  async handleCustomTemplate(customFormId: number, requestRgSettings?: boolean) {
    this._customFormId = customFormId

    const instance = Loading.open()
    const result = await getCustomForm(customFormId)
    instance.close()

    console.log('result', result?.data)

    const customList = result?.data?.customFieldContents
    // const nameList = this.getTitleDescSectionCustomList(customList)
    // const assignList = this.getAssignSectionCustomList(customList)
    // const levelList = this.getLevelSectionCustomList(customList)
    // const moreList = this.getMoreSectionCustomList(customList)
    // const attachList = this.getAttachSectionCustomList(customList)

    if (result?.data != null) {
      console.log('custom fields', customList)

      this._createLevelRef?.setNeedRefreshDefaultValue()
      this._createAssignRef?.resetCategoryData()

      this.context.updateCustom(true, customList ?? [])

      //   if (requestRgSettings && result.data.rgId) {
      //     this.handleRequestRgSettings(result.data.rgId)
      //   }

      const { labelList } = this.getDefaultLabelAndCity(true, customList ?? [])
      this._createMoreRef?.updateDefaultValue(labelList)
      // this.setState({ customDataModel: result?.data })

      // this.setState({
      //   customDataModel: result?.data,
      //   isCustom: true,
      //   levelSectionCustomList: levelList,
      //   moreSectionCustomList: moreList,
      //   assignSectionCustomList: assignList,
      //   attachSectionCustomList: attachList
      // }, () => {
      //   this.handleCustomAssignData()
      // })

      // const origNameList = this.getOrigTitleDescSectionCustomList(customList)

      // //
      // if (nameList?.length > 0)  { this._descRef?.updateState(true, origNameList) }
      // if (levelList?.length > 0) { this._createLevelRef?.updateState(true, levelList) }
      // if (moreList?.length > 0) { this._createMoreRef?.updateState(true, moreList) }
      // if (assignList?.length > 0) { this._createAssignRef?.updateState(true, assignList)}
      // if (attachList?.length > 0) { this._createAttachRef?.updateState(true, attachList)}
    }
  }

  // renderFromModel (model: CustomFieldModel) {
  //   // 系统默认的
  //   if (model.type === CustomFieldType.system) {
  //     switch (model.identify) {
  //       case CustomFieldSystemType.assigned:
  //         return this.renderAssign()
  //       case CustomFieldSystemType.name:
  //         return
  //     }
  //   } else if (model.type === CustomFieldType.custom) {
  //     // 自定义的
  //   }
  // }

  getDefaultLabelAndCity(isCustom, customFieldList) {
    const labelFiled = getFieldMeta(isCustom, customFieldList, CustomFieldSystemType.labels)

    // const cityFiled = getFieldMeta(
    //     isCustom,
    //     customFieldList,
    //     CustomFieldSystemType.city
    // )
    let labelList: Label[] = []
    if (labelFiled?.defaultValue) {
      labelFiled?.defaultValue.split(',')?.forEach((item, index) => {
        labelList.push({ id: index, name: item })
      })
    }
    // let defaultCity = cityFiled?.defaultValue ?? ''
    return { labelList }
  }

  handleUpdateCustomFields = (customFieldValueList: Array<CustomRequestModel>) => {
    console.log('received', customFieldValueList)

    this._customFieldValueList = customFieldValueList
  }

  handleUpdatePrivate(status: 'private' | 'public') {
    this.privateStatus = status
  }

  async handleCatData(categoryModel: UintModal) {
    if (categoryModel) {
      this.categoryModel = categoryModel

      if (categoryModel.assigned != null && categoryModel.assigned.length > 0) {
        this.oncallPerson = categoryModel.assigned
      } else {
        this.categoryModel = categoryModel
        this.requestOncallUser(categoryModel.rgId)

        const res = await getOncallUser(categoryModel.rgId)
        console.log('oncall', res)

        if (res?.code === 200 && res?.message === 'OK') {
          this.oncallPerson = res?.data?.identify
          this.categoryModel = categoryModel

          console.log('yyy', this.oncallPerson)
        }
      }
    } else {
      this.categoryModel = null
      this.oncallPerson = null
    }
  }

  async requestOncallUser(rgId: string) {
    const res = await getOncallUser(rgId)
    console.log('oncall', res)

    if (res?.code === 200 && res?.message === 'OK') {
      this.oncallPerson = res?.data?.identify

      console.log('yyy', this.oncallPerson)
    }
  }

  handleNameChanged = (name: string) => {
    this.inputName = name
  }

  handleDescChanged = (desc: string) => {
    this.inputDesc = desc
  }

  handleNameDescChanged(name: string, desc: string) {
    this.inputName = name
    this.inputDesc = desc
  }

  handleSelectedLevel(level: string) {
    this.selectedLevel = level
  }

  handleSelectedCC(cc: Array<CCPersonModel>) {
    console.log('new cc', cc)

    this.selectedCC = cc
  }

  handleSelectedCreator(p: CCPersonModel) {
    console.log('new creator', p)

    this.selectedCreator = p
  }

  handleSelectedType(type: string) {
    console.log('new type', type)

    this.selectedType = type
  }

  handleSelectedLabels = (labels: Label[]) => {
    console.log('new labes', labels)

    this.selectedLabels = labels
  }

  //   handleSelectedCityName = (name: string) => {
  //     console.log('new city', name);
  //     this.selectedCity = name
  //   }

  handleCancel = () => {
    console.log('cancel')
    this.props.navigation.back()
  }

  poplulateNoramlModel = (): any => {
    const ccMisList = this.selectedCC?.map(item => (item as CCPersonModel).username)

    const reporterMis =
      this.selectedCreator != null
        ? (this.selectedCreator as CCPersonModel)?.username
        : this.reporterModel?.username

    const labelId = this.selectedLabels.map(item => item.id)
    const labelName = this.selectedLabels.map(item => item.name)

    const extModel = this.props?.extCatModel || this.props?.extCustomModel

    const t1 = {
      cc: ccMisList ?? [],
      desc: this.inputDesc,
      name: this.inputName,
      ticketType:
        this.selectedType ?? i18nClient.t('constants_10b276', { defaultValue: '事件' }),
      sla: this.selectedLevel ?? 'S4',
      permission: this.privateStatus,
      labels: labelId,
      labelNames: labelName,
      reporter: reporterMis ?? '',

      //   city: this.selectedCity ?? '',

      source: extModel?.source || 'ticket.MOBILE',
      associatedField: extModel?.associatedField || '',

      sourceId: 1,

      assigned: this.oncallPerson ?? '',
      entranceSource: this._entranceSource,
    }

    const model = { ...this.categoryModel, ...t1 }

    return model
  }

  async handleCommit() {
    console.log('commit')
    console.log('temp', this.categoryModel)
    ttCreateTTClick(TTKeys.CreateClick.commitNormal)

    if (checkNull(this.inputDesc) || this.inputDesc?.length === 0) {
      Toast.open(i18nClient.t('components_create_310b99', { defaultValue: '请输入问题描述' }))
      return
    }

    if (checkNull(this.categoryModel)) {
      Toast.open(i18nClient.t('components_create_4c718e', { defaultValue: '请选择指派目录' }))
      return
    }

    const model = this.poplulateNoramlModel()

    if (checkNull(this.inputName) || this.inputName?.length === 0) {
      model.name = this.inputDesc.replace(/<[^>]*(>|$)|&nbsp;|&zwnj;|&raquo;|&laquo;|&gt;/g, ' ')
    }

    const instance = Loading.open()
    const r = await createTicket(model).catch(e => {
      console.log('请求出错')
      ttCreateTTClick(TTKeys.CreateClick.commitNormalFail)
    })

    if (r?.code === 200 && r?.message === 'OK') {
      const ticketId = r.data?.id
      if (ticketId > 0) {
        ttCreateTTClick(TTKeys.CreateClick.commitNormalSuccess)
        await this.handleUploadAttachment(ticketId)
        console.log('普通表单 结束上传')
        instance.close()

        this.props.navigation.push('Detail', {
          ticketId: ticketId,
          goBackKey: this.props.navigation.state.key,
        })
      }
    } else {
      Toast.open(i18nClient.t('components_create_a2168d', { defaultValue: '请求出错' }))
      ttCreateTTClick(TTKeys.CreateClick.commitNormalFail)
    }
  }

  handleCustomCommit = async () => {
    ttCreateTTClick(TTKeys.CreateClick.commitCustom)
    const fields = this.context.customFieldList

    // if (checkNull(this.inputDesc) || this.inputDesc?.length === 0) {
    //   Toast.open('请输入问题描述')
    //   return
    // }

    // if (checkNull(this.categoryModel)) {
    //   Toast.open('请选择指派目录')
    //   return
    // }

    let model = this.poplulateNoramlModel()

    if (checkNull(this.inputName) || this.inputName?.length === 0) {
      model.name = this.inputDesc.replace(/<[^>]*(>|$)|&nbsp;|&zwnj;|&raquo;|&laquo;|&gt;/g, ' ')
    }

    const requiredFields = fields.filter(
      item => item.isRequired === true && item.isHidden === false,
    )

    console.log('start check')

    // FIXME: TEMP USE
    if (!this.handleRequireCheck(requiredFields)) return

    // 验证附件必填
    if (this.isFileRequired && !this._attachmentList.length) {
      Toast.open(i18nClient.t('components_create_435d09', { defaultValue: '请上传附件' }))
      return
    }

    model.customFormId = this._customFormId

    console.log('commit', model)

    if (this.extrasFromCustom != null) {
      model = Object.assign({}, model, this.extrasFromCustom)
    }

    console.log('commit2', model)

    const finalModel = {
      ticket: model,
      customFieldValueList: this._customFieldValueList,
    }
    console.log('full custom commit', finalModel)

    const instance = Loading.open()
    const r = await createCustomTicket(finalModel).catch(e => {
      console.log('请求出错')
      ttCreateTTClick(TTKeys.CreateClick.commitCusomFail)
    })

    if (r?.code === 200 && r?.message === 'OK') {
      const ticketId = r.data?.id

      if (ticketId > 0) {
        ttCreateTTClick(TTKeys.CreateClick.commitCustomSuccess)
        await this.handleUploadAttachment(ticketId)
        console.log('结束上传')
        instance?.close()

        this.props.navigation.push('Detail', {
          ticketId: ticketId,
          goBackKey: this.props.navigation.state.key,
        })
      }
    } else {
      if (r?.data?.errorMsg != null) {
        Toast.open(r?.data?.errorMsg)
      } else {
        Toast.open(i18nClient.t('components_create_a2168d', { defaultValue: '请求出错' }))
      }

      ttCreateTTClick(TTKeys.CreateClick.commitCusomFail)
    }

    instance?.close()
  }

  handleUploadAttachment = async ticketId => {
    console.log('开始上传', this._attachmentList)

    const list = this._attachmentList

    if (list?.length > 0) {
      await Promise.all(
        list.map(async item => {
          if (getKey('appName') === AppName.dx) {
            if (item.localId?.length > 0) {
              return await this.uploadImage(item, ticketId, 'attach')
            } else {
              return await this.doUploadNew(item, ticketId)
            }
          } else {
            return await this.doUpload(item, ticketId)
          }
        }),
      )
    }

    return
  }

  doUploadNew = async (attachment: AttachmentModel, ticketId) => {
    console.log('uploading', attachment)

    const response = await uploadAttachFilesNew(
      ticketId,
      attachment.url,
      attachment.name,
      attachment.size,
      'attach',
    ).catch(error => {
      Toast.open(i18nClient.t('components_comment_54e5de', { defaultValue: '上传失败' }) + error)
    })

    return response
  }

  doUpload = async (attachment: AttachmentModel, ticketId) => {
    console.log('uploading', attachment)

    const parts = [
      {
        fieldName: 'file', // 一般为 file，由服务器决定
        fileName: attachment.name, // 上传文件名
        //  mimeType: '', // 文件类型
        uri: attachment.localId, // 文件 URI，支持以 knb-media:// 开头的链接
      },
    ]

    let params = {
      ticketId: ticketId,
      area: 'attach',
    }
    let data = {
      parts: parts,
    }

    const response = await uploadAttachFiles(params, data).catch(error => {
      Toast.open(i18nClient.t('components_comment_54e5de', { defaultValue: '上传失败' }) + error)
    })

    return response
  }

  async uploadImage(attachModel: AttachmentModel, ticketId, area: 'desc' | 'attach') {
    try {
      const response = await uploadMedia(attachModel.localId, 'image', ticketId, area)
      if (response && response.code === 200) {
        return response.data
      } else {
        Toast.open(
          i18nClient.t('components_comment_54e5de', { defaultValue: '上传失败' }) +
            response?.message,
        )
      }
    } catch (e) {
      Toast.open(i18nClient.t('components_comment_54e5de', { defaultValue: '上传失败' }) + e)
    }
  }

  handleRequireCheck(requiredFields: CustomFieldModel[]) {
    // const reporterMis = this.selectedCreator != null
    //   ? (this.selectedCreator as CCPersonModel).username
    //   : this.reporterModel?.username

    const ccMisList = this.selectedCC?.map(item => (item as CCPersonModel).username)

    console.log('required fiedls', requiredFields)

    if (!(this.oncallPerson?.length > 0)) {
      const item = handleFindItem(requiredFields, CustomFieldSystemType.assigned)
      if (item && item.isRequired) {
        Toast.open(i18nClient.t('components_create_5c7961', { defaultValue: '请选择指派' }))
        return false
      }
    }

    if (!(this.inputName?.length > 0)) {
      console.log('check name')

      const item = handleFindItem(requiredFields, CustomFieldSystemType.name)
      if (item && item.isRequired) {
        console.log('check name required')

        Toast.open(i18nClient.t('components_create_96641a', { defaultValue: '请输入标题' }))
        return false
      }
    }

    if (!(this.inputDesc?.length > 0)) {
      console.log('check desc')
      const item = handleFindItem(requiredFields, CustomFieldSystemType.desc)
      if (item && item.isRequired) {
        Toast.open(i18nClient.t('components_create_11956a', { defaultValue: '请输入描述' }))
        return false
      }
    }

    console.log('check custom')
    if (!this.customFormRef?.checkRequire()) return false

    if (!(this.selectedLevel?.length > 0)) {
      const item = handleFindItem(requiredFields, CustomFieldSystemType.sla)
      if (item && item.isRequired) {
        Toast.open(i18nClient.t('components_create_6bf68d', { defaultValue: '请选择问题等级' }))
        return false
      }
    }

    // if (!(reporterMis?.length > 0)) {
    //   const item = handleFindItem(requiredFields, CustomFieldSystemType.reporter)
    //   if (item && item.isRequired) { Toast.open('请选择发起人')}
    // }

    if (!(this.privateStatus?.length > 0)) {
      const item = handleFindItem(requiredFields, CustomFieldSystemType.permission)
      if (item && item.isRequired) {
        Toast.open(i18nClient.t('components_create_2e10fd', { defaultValue: '请选择权限' }))
        return false
      }
    }

    if (!(ccMisList?.length > 0)) {
      console.log('check cc')
      const item = handleFindItem(requiredFields, CustomFieldSystemType.cc)
      if (item && item.isRequired) {
        Toast.open(i18nClient.t('components_create_5837c7', { defaultValue: '请选择抄送人' }))
        return false
      }
    }

    if (!(this.selectedType?.length > 0)) {
      const item = handleFindItem(requiredFields, CustomFieldSystemType.ticketType)
      if (item && item.isRequired) {
        Toast.open(i18nClient.t('components_create_b4967a', { defaultValue: '请选择问题类型' }))
        return false
      }
    }

    // if (!(this.selectedCity?.length > 0)) {
    //   const item = handleFindItem(requiredFields, CustomFieldSystemType.city)
    //   if (item && item.isRequired) {
    //     Toast.open('请选择城市')
    //     return false
    //   }
    // }

    if (!(this.selectedLabels?.length > 0)) {
      const item = handleFindItem(requiredFields, CustomFieldSystemType.labels)
      if (item && item.isRequired) {
        Toast.open(i18nClient.t('components_create_ce7cf5', { defaultValue: '请选择标签' }))
        return false
      }
    }

    // if (!(this.selectedType?.length > 0)) {
    //   const item = handleFindItem(requiredFields, CustomFieldSystemType.ticketType)
    //   if (item && item.isRequired) { Toast.open('请选择问题类型')}
    // }

    return true
  }

  getAttachSectionCustomList(list: CustomFieldModel[]) {
    // const list = this.state.customDataModel?.customFieldContents

    const section = [CustomFieldSystemType.file]

    const rList = list.filter(item => section.includes(item.identify) && !item.isHidden)

    return rList
  }

  // "displayname": "陈晓晖",
  // 	"email": "chenxiaohui11@test.com",
  // 	"id": 2645111,
  // 	"sysAdmin": false,
  // 	"tenantId": "1",
  // 	"username": "chenxiaohui11"

  // 只使用了 mis
  async getUserMis() {
    let model = await requestCurrentUser()

    if (model?.username != null) {
      this.reporterModel = model
    }
  }

  // wiki: https://km.sankuai.com/page/765704147
  getTTCreateSource(): string {
    let extModel = this.props?.extCatModel
    let domainName = extModel?.domain
    const appName = getKey('appName')
    if (appName === AppName.dingxiang) {
      return 'E'
    } else if (appName === AppName.bee) {
      return 'F'
    } else if (appName === AppName.mws) {
      return 'G'
    } else if (appName === AppName.qishou) {
      return 'H'
    } else if (appName === AppName.youxuan) {
      return 'I'
    } else if (appName === AppName.pangu) {
      return 'J'
    } else if (appName === AppName.youxuanBD) {
      return 'K'
    } else if (appName === AppName.starfire) {
      return 'L'
    } else if (appName === AppName.aboluo) {
      return 'M'
    } else if (appName === AppName.sinan) {
      return 'N'
    } else if (appName === AppName.tiangong) {
      return 'O'
    } else if (
      this.props.navigation.getParam('spaceId') ||
      (domainName && domainName !== 'ticket' && domainName !== 'public')
    ) {
      return 'B'
    } else if (extModel?.category || extModel?.cid) {
      return 'C'
    } else if (this.props.extCustomModel?.formId > 0) {
      return 'D'
    } else {
      return 'A'
    }
  }
}

export default CreateNewTTChild
