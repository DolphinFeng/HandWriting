import { i18nClient } from '@sailor/i18n-mrn'
import React, { Component } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ViewStyle,
  StyleSheet,
  ImageBackground,
  Dimensions,
} from '@mrn/react-native'
import { KeyValueDisplay } from '@src/components/KeyValueDispaly'
import { Switch, ActionSheet, Toast, SlideModal, Dialog } from '@ss/mtd-react-native'
import { dStyle } from '../../constants/TTStyle'
import right from '@images/right-thick.png'
import CreateKeyValueRow from './CreateKeyValueRow'
import { SLA, Sla2CN, CN2SLA } from '../../constants/ConfigMap'
import theme from '@src/common/styles/MWSStyle'
import CCPerson from '../common/CCPerson'
import {
  CCPersonModel,
  Level,
  RootTree,
  CustomFieldModel,
  CustomFieldSystemType,
} from '../../constants/TTServiceModule'
import SearchPerson from '../common/SearchPerson'
import defaultAvatar from '@images/default-avator.png'
import { renderInsetSeprator } from '@src/components/BaseComponents'
import { getSlaConfig, searchDisplayNameList } from '../../constants/TTApi'
import avatar from '@images/default-avator.png'
import {
  requestCurrentUser,
  ttSlideModalProp,
  ttSlideModal,
  requestInsideUser,
} from '../common/TTHelper'
import CustomSingleSelectRow from '../custom/CustomSingleSelectRow'
import { CustomRequestDataType } from '../custom/CreateCustomInfo'
import { CreateNewTTContext } from './CreateNewTTContext'
import { handleTip, getFieldMeta } from './CreateHelper'
import { TTKeys, ttCreateTTClick } from '../../constants/TTKeys'
import { BottomCancelBtn } from '@src/components/BottomCancelBtn'

const { width, height } = Dimensions.get('window')
interface IProps {
  /** 中文名称 */
  levelValue?: string
  onSelectedLevel: (level: string) => void
  onSelectedCCPeople: (selectedCC: Array<CCPersonModel>) => void
  onSelectedCreator: (selectedCreator: CCPersonModel) => void
  onUpdatePrivate: (status: 'private' | 'public') => void
  rgId: number
  defaultCreator?: CCPersonModel

  // isCustom?: boolean
  // customFieldList?: CustomFieldModel[]
}

interface IState {
  levelValue: string
  privacyValue: string
  // showCC: boolean
  showSearch: boolean
  selectedCCPeople: Array<CCPersonModel>
  selectedCreator: CCPersonModel

  // isCustom?: boolean
  // customFieldList?: CustomFieldModel[]
}

class CreateLevelSection extends Component<IProps, IState> {
  private levelInstance: any

  static contextType = CreateNewTTContext
  context: React.ContextType<typeof CreateNewTTContext>

  defaultDataPopulated = false
  needRefreshDefaultValue = false
  isInsideUser = true
  slaOptions = SLA.map((level, index) => {
    return { label: i18nClient.t(Sla2CN[level]), value: index }
  })
  currentRgId = 0

  constructor(props) {
    super(props)

    this.state = {
      levelValue: this.props.levelValue ?? '',
      privacyValue: '',
      // showCC: false,
      showSearch: false,
      selectedCCPeople: [],
      selectedCreator: this.props.defaultCreator,

      // isCustom: this.props.isCustom,
      // customFieldList: this.props.customFieldList
    }
  }

  componentDidMount() {
    this.getUserInside()
    this.getUserMis()
  }

  componentDidUpdate() {
    if (this.props.rgId && this.props.rgId !== this.currentRgId) {
      this.currentRgId = this.props.rgId
      this.fetchRgSlaOptions()
    }
    // 需要获取列表数据
    if (
      this.context.isCustom &&
      (this.defaultDataPopulated === false || this.needRefreshDefaultValue === true)
    ) {
      console.log('333493849032')

      this.loadDefaultValue(this.context.isCustom, this.context.customFieldList)

      this.defaultDataPopulated = true
      this.needRefreshDefaultValue = false
    }
  }

  render() {
    if (this.checkCustom()) {
      const list = this.getNonHiddenList(this.context.customFieldList)
      if (!(list?.length > 0)) return null
    }

    return (
      <View style={{ backgroundColor: 'white' }}>
        {this.renderLevel()}
        {this.renderReporter()}
        {this.renderPermission()}
        {this.renderCC()}
        {/* {this.renderModalCC()} */}
        {this.renderModalCreater()}
      </View>
    )
  }

  checkCustom = () => {
    return this.context.isCustom
  }

  setNeedRefreshDefaultValue() {
    this.needRefreshDefaultValue = true
  }

  // updateState (isCustom?: boolean, customFieldList?: CustomFieldModel[]) {
  //   console.log('updatestate', customFieldList);

  //   this.setState({
  //     isCustom: isCustom,
  //     customFieldList: customFieldList
  //   })

  //   this.loadDefaultValue(isCustom, customFieldList)
  // }

  loadDefaultValue = (isCustom?: boolean, customFieldList?: CustomFieldModel[]) => {
    if (isCustom) {
      // FIXME: sla 没有处理？
      // const slaItem = customFieldList?.find(item => item.identify === CustomFieldSystemType.sla)

      // if (slaItem.defaultValue?.length > 0) {
      //   this.setState({ levelValue: slaItem.defaultValue })
      //   this.props.onSelectedLevel(slaItem.defaultValue)
      // }

      const permissionItem = customFieldList?.find(
        item => item.identify === CustomFieldSystemType.permission,
      )
      if (permissionItem?.defaultValue?.length > 0) {
        this.setState({ privacyValue: permissionItem.defaultValue })
        this.props.onUpdatePrivate(permissionItem.defaultValue as any)
      }

      const ccItem = customFieldList?.find(item => item.identify === CustomFieldSystemType.cc)
      if (ccItem?.defaultValue?.length > 0) {
        console.log('load ccitems', ccItem.defaultValue)

        const list = ccItem.defaultValue?.split(',').map(name => {
          let m = new CCPersonModel()
          m.username = name

          return m
        })

        this.confirmCCSelection(list)
        this.props.onSelectedCCPeople(list)
      }
    }
  }

  renderLevel() {
    const { isCustom, customFieldList } = this.context
    const { needHide, isRequired } = getFieldMeta(
      isCustom,
      customFieldList,
      CustomFieldSystemType.sla,
    )

    // 自定义模板发起等级隐藏时, 取等级的默认值
    if (needHide) {
      const field = customFieldList?.find(item => item.identify === CustomFieldSystemType.sla)

      const defaultOption = field?.options?.filter(item => item.isDefault)
      if (defaultOption[0]?.value) {
        this.props.onSelectedLevel(defaultOption[0].value)
      }
    }

    return needHide ? null : (
      <>
        {this.renderLevelSub(isRequired)}
        {renderInsetSeprator(16)}
      </>
    )
  }

  renderLevelSub(isRequired) {
    const field = this.context.customFieldList?.find(
      item => item.identify === CustomFieldSystemType.sla,
    )

    const newOptions = field?.options?.map(item => {
      return { value: (item as any).label, isDefault: item.isDefault }
    })
    // 当前自定义模板接口里不会返回rg配置的可见sla列表，都是固定的sla
    // 因此需要按rg查询sla并展示

    return this.context.isCustom ? (
      <CustomSingleSelectRow
        optionList={newOptions}
        key={'level'}
        type={'create'}
        title={field.name}
        tip={field.instruction}
        isRequired={isRequired}
        onOptionChanged={option => {
          console.log('33333', option)
          this.props.onSelectedLevel(CN2SLA[option])

          // console.log(Sla2CN[SLA[index]]);
          // this.updateRequestParams(field, option, CustomRequestDataType.string)
        }}
      />
    ) : (
      <CreateKeyValueRow
        isRequired={isRequired}
        label={i18nClient.t('components_create_95e0d7', { defaultValue: '等级' })}
        value={this.state.levelValue}
        onPress={this.openLevelSelection}
      />
    )
  }
  fetchRgSlaOptions() {
    getSlaConfig(this.props.rgId)
      .then(resp => {
        if (resp && resp.code === 200 && resp.data) {
          const slaSettings = resp.data.items
          this.slaOptions = slaSettings
            .sort((a, b) => a.name.localeCompare(b.name))
            .filter(item => item.displayWhenLauch)
            .map(item => ({
              value: item.name,
              label: i18nClient.t(Sla2CN[item.name]),
              instruction: item.description,
            }))
        }
      })
      .catch(e => {
        console.log(e)
      })
  }

  renderReporter() {
    const { isCustom, customFieldList } = this.context
    const { needHide, tip, isRequired } = getFieldMeta(
      isCustom,
      customFieldList,
      CustomFieldSystemType.reporter,
    )

    return needHide || !this.isInsideUser ? null : (
      <>
        <CreateKeyValueRow
          isRequired={isRequired}
          label={i18nClient.t('components_create_d4285a', { defaultValue: '发起人' })}
          renderValue={() => this.renderCreator()}
          onPress={this.openCreatorSelection}
          tip={tip}
        />

        {renderInsetSeprator(16)}
      </>
    )
  }

  renderPermission() {
    const { isCustom, customFieldList } = this.context
    const { needHide, tip, isRequired } = getFieldMeta(
      isCustom,
      customFieldList,
      CustomFieldSystemType.permission,
    )

    return needHide || !this.isInsideUser ? null : (
      <>
        <CreateKeyValueRow
          isRequired={isRequired}
          label={i18nClient.t('components_create_d8782f', { defaultValue: '保密' })}
          value={''}
          renderValue={this.renderSecretSwitch}
          showArrow={false}
          enablePress={false}
          tip={tip}
        />

        {renderInsetSeprator(16)}
      </>
    )
  }

  renderCC() {
    const { isCustom, customFieldList } = this.context
    const { needHide, tip, isRequired } = getFieldMeta(
      isCustom,
      customFieldList,
      CustomFieldSystemType.cc,
    )

    return needHide || !this.isInsideUser ? null : (
      <>
        <CreateKeyValueRow
          isRequired={isRequired}
          label={i18nClient.t('components_create_24969a', { defaultValue: '抄送人' })}
          renderValue={() => this.renderCCPeople()}
          onPress={this.openCCSelection}
          tip={tip}
        />

        {renderInsetSeprator(16)}
      </>
    )
  }

  renderSecretSwitch = () => {
    return (
      <Switch
        width={32}
        height={20}
        rockerSize={theme.size16}
        backgroundColor={theme.gray24}
        backgroundActiveColor={theme.yellow300}
        elevation={0}
        value={this.state.privacyValue === 'private' ? true : false}
        onChange={this.onSecretChange}
        styles={{ container: { borderWidth: 0 } }}
      />
    )
  }

  // renderModalCC () {
  // return this.state.showCC
  // ?  <CCPerson
  //     onCancel={this.closeCCSelection}
  //     onConfirm={this.confirmCCSelection}
  //     selectedPeopleList={this.state.selectedCCPeople}
  //   />
  // : null
  // }

  renderModalCreater() {
    return this.state.showSearch ? (
      <SearchPerson onCancel={this.closeSearchSelection} onConfirm={this.confirmSearchSelection} />
    ) : null
  }

  renderCreator() {
    const p = this.state.selectedCreator
    return p != null ? (
      <View style={{ flexDirection: 'row', alignItems: 'center', maxWidth: '99%' }}>
        <Image
          source={{ uri: p?.avatar }}
          defaultSource={defaultAvatar}
          style={{ width: 24, height: 24, borderRadius: 12 }}
        />

        <Text style={CreatLevelStyle.creator, {flexShrink: 1}} numberOfLines={1} ellipsizeMode='tail'>{p.i18nDisplayName ? `${p.i18nDisplayName}/${p.username}` : (p.displayName ? `${p.displayName}/${p.username}` : p.username)}</Text>
      </View>
    ) : (
      <Text>{''}</Text>
    )
    //保证显示的样式
  }

  renderCCPeople() {
    const ccList = this.state.selectedCCPeople

    const items = ccList.map((item, index) => {
      let name = item.i18nDisplayName
      let CnName = item.displayName

      // 后台只会返回 username
      // if (!(name?.length > 0)) {
      //   name = item.username
      // }

      return (
        <View style={[dStyle.ccWrapper, { marginTop: 4 }]} key={index}>
          <ImageBackground
            source={item.avatar ? { uri: item.avatar } : avatar}
            defaultSource={avatar}
            style={[dStyle.avatar, { marginRight: 4 }]}
          />

          <Text>{name ? name : (CnName ? CnName : item.username)}</Text>
        </View>
      )
    })
    return <View style={{ flexDirection: 'row', flexWrap: 'wrap', flex: 1 }}>{items}</View>
  }

  confirmCCSelection = (items: Array<CCPersonModel>) => {
    console.log('received', items)
    this.setState({ selectedCCPeople: items })

    this.props.onSelectedCCPeople(items)
  }

  confirmSearchSelection = (items: Array<CCPersonModel>) => {
    console.log('received search', items)
    this.setState({
      selectedCreator: items?.length > 0 ? items[0] : null,
      showSearch: false,
    })
    this.props.onSelectedCreator(items?.length > 0 ? items[0] : null)
  }

  openLevelSelection = () => {
    console.log('open level')
    ttCreateTTClick(TTKeys.CreateClick.slaLevel)

    this.levelInstance = ActionSheet.open({
      title: i18nClient.t('components_create_8dfbf0', { defaultValue: '选择等级' }),
      options: this.slaOptions,
      modalProps: {
        maskClosable: true,
        onClose: data => this.levelInstance.close(),
      },
      footer: <BottomCancelBtn handlePress={() => this.levelInstance.close()} />,
      confirmCallback: (item, index) => {
        this.changeSLA(item, index)
      },
      cancelCallback: () => {
        this.levelInstance.close()
      },
    })
  }

  changeSLA(item, index) {
    console.log(item, index)
    if (item?.label === i18nClient.t('components_create_02d455', { defaultValue: '非常紧急' })) {
      // 非常紧急，提醒抄送leader
      Dialog.open({
        header: i18nClient.t('components_create_02d455', { defaultValue: '非常紧急' }),
        message: i18nClient.t('components_detail_ae92f2', {
          defaultValue:
            '非常紧急代表短时间内不解决会对公司造成经济损失和负面影响的问题。选择非常紧急的同时会抄送您的上级，请您谨慎选择非常紧急。',
        }),

        modalProps: {
          maskOpacity: 0.1,
          maskClosable: true,
        },
        confirmLabel: i18nClient.t('components_home_38cf16', { defaultValue: '确定' }),
        confirmCallback: info => {
          this.updateSLA(item, index)
        },
        cancelLabel: i18nClient.t('components_create_625fb2', { defaultValue: '取消' }),
      })
    } else {
      this.updateSLA(item, index)
    }
  }

  updateSLA(item, index) {
    this.setState({ levelValue: item.label })
    this.props.onSelectedLevel(SLA[index])
  }

  openCreatorSelection = () => {
    ttCreateTTClick(TTKeys.CreateClick.reporter)
    console.log('open creator selection')
    this.setState({ showSearch: true })
  }

  openCCSelection = () => {
    console.log('open CC selection')
    ttCreateTTClick(TTKeys.CreateClick.cc)
    // this.setState({ showCC: true })

    // this.renderModalCC()

    // const instance = SlideModal.open({
    //   useNativeDriver: true,
    //   visible: true,
    //   duration: 100,
    //   modalProps: ttSlideModalProp(() => instance.close()),
    //   children: (
    //     <CCPerson
    //       onCancel={() => instance.close()}
    //       onConfirm={selectedList => {
    //         instance.close()
    //         this.confirmCCSelection(selectedList)
    //       }}
    //       selectedPeopleList={this.state.selectedCCPeople}
    //     />
    //   )
    // })

    const instance = ttSlideModal(
      <CCPerson
        onCancel={() => instance.close()}
        onConfirm={selectedList => {
          instance.close()
          this.confirmCCSelection(selectedList)
        }}
        selectedPeopleList={this.state.selectedCCPeople}
      />,
    )
  }

  // closeCCSelection = () => {
  //   console.log('close CC selection');

  //   this.setState({ showCC: false })
  // }

  closeSearchSelection = () => {
    console.log('close search selection')

    this.setState({ showSearch: false })
  }

  onSecretChange = value => {
    ttCreateTTClick(TTKeys.CreateClick.switchPrivate)
    if (value) {
      // true 保密 激活
      console.log('www' + value)
      this.props.onUpdatePrivate('private')
    } else {
      console.log('sss' + value)
      this.props.onUpdatePrivate('public')
    }
  }

  async getUserMis() {
    let model = await requestCurrentUser()

    console.log('get user mis ', model)

    if (model?.username != null) {
      const avators = await searchDisplayNameList([model?.username])

      if (avators != null && avators.data?.[model?.username]?.avatar != null) {
        model.avatar = avators.data?.[model?.username]?.avatar
      }

      // 保证有mis
      this.setState({ selectedCreator: model })
    }
  }
  async getUserInside() {
    this.isInsideUser = await requestInsideUser()
  }

  getNonHiddenList = (list: CustomFieldModel[]) => {
    const origList = this.getLevelSectionCustomList(list)

    const rList = origList.filter(item => !item.isHidden)

    return rList
  }

  getLevelSectionCustomList(list: CustomFieldModel[]) {
    // const list = this.state.customDataModel?.customFieldContents

    const section = [
      CustomFieldSystemType.sla,
      CustomFieldSystemType.reporter,
      CustomFieldSystemType.permission,
      CustomFieldSystemType.cc,
    ]

    const rList = list.filter(item => section.includes(item.identify))

    return rList
  }

  updateFromSettingsModel(list: Array<CCPersonModel>, priavcy: string) {
    this.confirmCCSelection(list)

    this.setState({ privacyValue: priavcy })
    this.props.onUpdatePrivate(priavcy as any)
  }
}

export default CreateLevelSection

const CreatLevelStyle = StyleSheet.create({
  creator: {
    ...theme.fontBold,
    fontSize: theme.size14,
    color: theme.gray84,
    lineHeight: theme.height20,
    marginLeft: 4,
  } as ViewStyle,
})
