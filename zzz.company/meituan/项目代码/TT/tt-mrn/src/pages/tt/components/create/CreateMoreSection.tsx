import { i18nClient } from '@sailor/i18n-mrn'
import React, { Component } from 'react'
import { View, Text, TouchableOpacity, Image } from '@mrn/react-native'
import { KeyValueDisplay } from '@src/components/KeyValueDispaly'
import { Switch, ActionSheet } from '@ss/mtd-react-native'
import { dStyle } from '../../constants/TTStyle'
import right from '@images/right-thick.png'
import CreateKeyValueRow from './CreateKeyValueRow'
import { TicketType } from '../../constants/ConfigMap'
import CreateMoreRow from './CreateMoreRow'
import { renderInsetSeprator } from '@src/components/BaseComponents'
import { openLabelEditorModal } from '../common/LabelEditorModal'
import { Label, CustomFieldModel, CustomFieldSystemType } from '../../constants/TTServiceModule'
import { CreateNewTTContext } from './CreateNewTTContext'
import { getFieldMeta } from './CreateHelper'
import CustomSingleSelectRow from '../custom/CustomSingleSelectRow'
import { ttSlideModal } from '../common/TTHelper'
import { isIPhoneWithNotch } from '@src/common/styles/NavigationStyle'
import { TTKeys, ttCreateTTClick } from '../../constants/TTKeys'
import {BottomCancelBtn} from '@src/components/BottomCancelBtn'

interface IProps {
  rgId?: string
  typeValue: string
  onSelectedType: (type: string) => void
  onSelectedLabels: (labels: Label[]) => void
  //   onSelectedCity: (cityName: string) => void
  // isCustom?: boolean
  // customFieldList?: CustomFieldModel[]
}

interface IState {
  typeValue: string
  showList: boolean
  currentLables: Label[]

  //   selectedCityName: string
  //   selectedCityValue: string[]

  // isCustom?: boolean
  // customFieldList?: CustomFieldModel[]
}

class CreateMoreSection extends Component<IProps, IState> {
  private typeInstance: any

  static contextType = CreateNewTTContext
  context: React.ContextType<typeof CreateNewTTContext>

  constructor(props) {
    super(props)

    this.state = {
      typeValue: this.props.typeValue ?? '',
      showList: true,
      currentLables: [],

      //   selectedCityName: '',
      //   selectedCityValue: []

      // isCustom: this.props.isCustom,
      // customFieldList: this.props.customFieldList
    }
  }

  componentDidMount() {}

  render() {
    if (this.checkCustom()) {
      const list = this.getNonHiddenList(this.context.customFieldList)
      if (!(list?.length > 0)) return null
    }

    return (
      <View style={{ backgroundColor: 'white' }}>
        <CreateMoreRow showList={this.state.showList} onPress={this.handleShowHideList} />

        {renderInsetSeprator(16)}
        {this.state.showList ? this.renderItemList() : null}
      </View>
    )
  }

  checkCustom = () => {
    return this.context.isCustom
  }

  renderItemList() {
    return (
      <>
        {this.renderTypeRow()}
        {this.renderLabelRow()}
        {/* {this.renderCitiesRow()} */}
      </>
    )
  }

  // updateState (isCustom?: boolean, customFieldList?: CustomFieldModel[]) {
  //   console.log('updatestate', customFieldList);

  //   this.setState({
  //     isCustom: isCustom,
  //     customFieldList: customFieldList
  //   })
  // }

  updateDefaultValue(labelList: Label[]) {
    this.setState({
      currentLables: labelList,
      //   selectedCityName: defaultCity ?? ''
    })

    this.props.onSelectedLabels(labelList)
    // this.props.onSelectedCity(defaultCity ?? '')
  }

  renderTypeRow() {
    const { isCustom, customFieldList } = this.context
    const { needHide, isRequired } = getFieldMeta(
      isCustom,
      customFieldList,
      CustomFieldSystemType.ticketType,
    )

    return needHide ? null : (
      <>
        {this.renderTypeSub(isRequired)}
        {renderInsetSeprator(16)}
      </>
    )
  }

  renderTypeSub(isRequired) {
    const field = this.context.customFieldList?.find(
      item => item.identify === CustomFieldSystemType.ticketType,
    )
    // value 是中文，根据映射找i18n code
    const info = TicketType.find(item => item.val === this.state.typeValue)
    const typeValue = info?.code ? i18nClient.t(info.code) : ''

    return this.context.isCustom ? (
      <CustomSingleSelectRow
        optionList={field?.options}
        key={'typerow'}
        type={'create'}
        title={field.name}
        tip={field.instruction}
        isRequired={isRequired}
        onOptionChanged={option => {
          console.log('334444555', option)
          this.props.onSelectedType(option)
        }}
      />
    ) : (
      <CreateKeyValueRow
        isRequired={isRequired}
        label={i18nClient.t('components_create_226b09', { defaultValue: '类型' })}
        value={typeValue}
        onPress={this.openTypeSelection}
      />
    )
  }

  renderLabelRow() {
    const { isCustom, customFieldList } = this.context
    const { needHide, tip, isRequired } = getFieldMeta(
      isCustom,
      customFieldList,
      CustomFieldSystemType.labels,
    )

    return needHide ? null : (
      <>
        <CreateKeyValueRow
          isRequired={isRequired}
          label={i18nClient.t('components_detail_14d342', { defaultValue: '标签' })}
          onPress={this.openTagSelection}
          renderValue={() => this.renderLabels(this.state.currentLables)}
          tip={tip}
        />
      </>
    )
  }

  renderLabels = (labels: Label[]) => {
    return (
      <TouchableOpacity
        style={{ flex: 1, flexDirection: 'row' }}
        onPress={this.openTagSelection}
        activeOpacity={1}
      >
        <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap' }}>
          {labels && labels.length > 0
            ? labels.map(label => (
                <Text key={label.id} style={dStyle.labelTag}>
                  {label.name}
                </Text>
              ))
            : null}
        </View>
      </TouchableOpacity>
    )
  }

  //   renderCitiesRow = () => {
  //     const { isCustom, customFieldList } = this.context
  //     const { needHide, tip, isRequired } = getFieldMeta(
  //       isCustom,
  //       customFieldList
  //       CustomFieldSystemType.city
  //     )

  //     return needHide
  //       ? null
  //       : (
  //         <>
  //           {renderInsetSeprator(16)}
  //           <CreateKeyValueRow
  //             isRequired={isRequired}
  //             label={'所在城市'} onPress={this.openCitySelection}
  //             value={`${this.state.selectedCityName}`}
  //             tip={tip}
  //           />
  //         </>
  //       )
  //   }

  //   openCitySelection = () => {
  //     console.log('open city');
  //     ttCreateTTClick(TTKeys.CreateClick.city)

  //     const instance = openSelectCityModal({
  //       value: this.state.selectedCityValue,
  //       onCancel: () => {instance.close()},
  //       onConfirm: (name, value) => {
  //         console.log('receive', name, value);

  //         this.setState({ selectedCityName: name, selectedCityValue: value})

  //         this.props.onSelectedCity(name)

  //       }
  //     })

  //   }

  handleShowHideList = (show: boolean) => {
    this.setState({ showList: show })
  }

  openTypeSelection = () => {
    console.log('open type')
    ttCreateTTClick(TTKeys.CreateClick.type)
    const TypeList = TicketType.map((item, index) => {
      return { label: i18nClient.t(item.code), value: item.val }
    })

    this.typeInstance = ActionSheet.open({
      title: i18nClient.t('components_create_5e1872', { defaultValue: '选择类型' }),
      options: TypeList,
      modalProps: {
        maskClosable: true,
        onClose: data => this.typeInstance.close(),
      },
      footer: <BottomCancelBtn handlePress={() => this.typeInstance.close()}/>,
      confirmCallback: item => {
        console.log(item)
        this.setState({ typeValue: item?.value })
        this.props.onSelectedType(item?.value)
      },
      cancelCallback: () => {
        this.typeInstance.close()
      },
    })
  }

  openTagSelection = () => {
    console.log('open tag selection')
    ttCreateTTClick(TTKeys.CreateClick.label)

    const { currentLables } = this.state
    const instance = openLabelEditorModal({
      rgId: this.props.rgId ?? '', // FIXME: 默认给什么？
      initialLabels: currentLables,
      onCancel: () => instance.close(),
      onFinish: labels => {
        instance.close()
        this.handleUpdateLabels(labels)
      },
    })
  }

  handleUpdateLabels(labels: Label[]) {
    this.setState({ currentLables: labels })
    this.props.onSelectedLabels(labels)
  }

  getNonHiddenList = (list: CustomFieldModel[]) => {
    const origList = this.getLevelSectionCustomList(list)

    const rList = origList.filter(item => !item.isHidden)

    return rList
  }

  getLevelSectionCustomList(list: CustomFieldModel[]) {
    // const list = this.state.customDataModel?.customFieldContents

    const section = [
      CustomFieldSystemType.ticketType,
      CustomFieldSystemType.labels,
      //   CustomFieldSystemType.city,
    ]

    const rList = list.filter(item => section.includes(item.identify))

    return rList
  }
}

export default CreateMoreSection
