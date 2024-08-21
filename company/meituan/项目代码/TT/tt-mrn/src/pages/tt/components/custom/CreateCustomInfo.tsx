import { i18nClient } from '@sailor/i18n-mrn'
import React, { Component } from 'react'
import { Text, View, Image, TouchableOpacity, Keyboard } from '@mrn/react-native'
import { dStyle } from '../../constants/TTStyle'
import {
  TicketDetail,
  CustomFieldCustomType,
  CustomFieldModel,
  CustomCreateModel,
} from '../../constants/TTServiceModule'
import { updateTicket, getTicketTime } from '../../constants/TTApi'
import { TopViewManager, Toast } from '@ss/mtd-react-native'
import { openTextEditorModal } from '../custom/EditText'
import { openSingleSelectModal } from '../custom/EditSingleSelect'
import { openMultiSelectModal } from '../custom/EditMultiSelect'
import CustomLineInputRow from '../custom/CustomLineInputRow'
import { formatDate4, formatDate5, formatDate7 } from '@src/common/helpers/FormatDate'
import CustomSingleSelectRow from '../custom/CustomSingleSelectRow'
import CustomTimePickRow from '../custom/CustomTimePickRow'
import CustomMultiSelectRow from '../custom/CustomMultiSelectRow'
import CustomRelationVerifyRow from '../custom/CustomRelationVerifyRow'
import { CreateNewTTContext } from '../create/CreateNewTTContext'

// String(1, "字符串"),
// Number(2, "数字类型"),
// List(3, "列表");
// Date(4, "日期");
export enum CustomRequestDataType {
  'string' = 1,
  'number' = 2,
  'list' = 3,
  'date' = 4,
}

const getDataTypeFromItemType = (type: CustomFieldCustomType) => {
  switch (type) {
    case CustomFieldCustomType.singleText:
    case CustomFieldCustomType.multiText:
    case CustomFieldCustomType.relationInterface:
      return CustomRequestDataType.string
    case CustomFieldCustomType.singleDrop:
    case CustomFieldCustomType.multiDrop:
      return CustomRequestDataType.list
    case CustomFieldCustomType.date:
      return CustomRequestDataType.date
  }
}

export class CustomRequestModel {
  customFieldId: number
  dataType: CustomRequestDataType
  value: string
}

interface IProps {
  // propData: CustomCreateModel
  onUpdateCustomFields: (customFieldValueList: Array<CustomRequestModel>) => void
}

interface IState {
  //  stateData: CustomCreateModel,
}
export class CreateCustomInfo extends Component<IProps, IState> {
  instance: TopViewManager
  // 用于回传给发起页的自定义字段list（包含隐藏、未隐藏）
  _paramsList: Array<CustomRequestModel> = []
  // 页面渲染所用的自定义字段list（包含隐藏、未隐藏）
  _fieldList: Array<CustomFieldModel> = []
  // 页面渲染所用的自定义字段list（只包含未隐藏）
  _noHiddenFields: Array<CustomFieldModel> = []

  static contextType = CreateNewTTContext
  context: React.ContextType<typeof CreateNewTTContext>

  constructor(props: IProps) {
    super(props)
    this.state = {
      // stateData: this.props.propData,
    }
  }

  render() {
    if (this.checkCustom()) {
      if (this.context.customFieldList?.length > 0) {
        this._fieldList = this.getCustomList(this.context.customFieldList)
        // 只判断_fieldList中不隐藏的字段
        this._noHiddenFields = this._fieldList?.filter(item => !item.isHidden)
        if (!(this._noHiddenFields?.length > 0)) return null

        this.initParamsWithDefaultValue()
      } else {
        return null
      }
    }

    console.log('render list', this._fieldList)

    return (
      <View style={{ backgroundColor: 'white' }}>
        <View style={[dStyle.ticketDivider1, { paddingLeft: 16 }]} />
        {this.renderCustomBody()}
        <View style={dStyle.ticketDivider1} />
      </View>
    )
  }

  customTypeList = [
    CustomFieldCustomType.singleText,
    CustomFieldCustomType.multiText,
    CustomFieldCustomType.singleDrop,
    CustomFieldCustomType.multiDrop,
    CustomFieldCustomType.date,
    CustomFieldCustomType.relationInterface,
  ]

  renderCustomBody() {
    const fieldList = this._noHiddenFields

    return <View style={{ display: 'flex', flex: 1 }}>{this.handleList(fieldList)}</View>
  }

  handleList(fieldList) {
    return <>{fieldList?.length > 0 ? this.renderList(fieldList) : null}</>
  }

  renderList(fieldList) {
    return (
      <>
        {fieldList.map((field, index) => {
          return this.renderFromType(field, index)
        })}
      </>
    )
  }

  renderFromType(field, index) {
    switch (field.inputType) {
      case CustomFieldCustomType.singleText:
        return (
          <CustomLineInputRow
            key={`custom_single${field?.id ?? index}`}
            type={'create'}
            multiple={false}
            title={field.name}
            desc={field.defaultValue}
            tip={field.instruction}
            isRequired={field.isRequired}
            onDescChanged={text => {
              console.log('111', text)
              this.updateRequestParams(field, text, CustomRequestDataType.string)
            }}
          />
        )

      case CustomFieldCustomType.multiText:
        return (
          <CustomLineInputRow
            key={`custom_multiple${field?.id ?? index}`}
            type={'create'}
            multiple={true}
            title={field.name}
            desc={field.defaultValue}
            tip={field.instruction}
            isRequired={field.isRequired}
            onDescChanged={text => {
              console.log('111', text)
              this.updateRequestParams(field, text, CustomRequestDataType.string)
            }}
          />
        )

      case CustomFieldCustomType.singleDrop:
        return (
          <CustomSingleSelectRow
            optionList={field.options}
            key={`custom_single_select${field?.id ?? index}`}
            type={'create'}
            title={field.name}
            // selectedValue={field.value}
            tip={field.instruction}
            isRequired={field.isRequired}
            onOptionChanged={option => {
              console.log('33333', option)
              this.updateRequestParams(field, option, CustomRequestDataType.string)
            }}
          />
        )

      case CustomFieldCustomType.multiDrop:
        return (
          <CustomMultiSelectRow
            optionList={field.options}
            key={`custom_multiple_select${field?.id ?? index}`}
            type={'create'}
            title={field.name}
            // selectedValues={field.value.split(',')}
            tip={field.instruction}
            isRequired={field.isRequired}
            onOptionChanged={option => {
              console.log('33333', option)
              const r = option.join(',')
              this.updateRequestParams(field, r, CustomRequestDataType.list)
            }}
          />
        )

      case CustomFieldCustomType.date:
        return (
          <CustomTimePickRow
            key={`custom_date${field?.id ?? index}`}
            type={'create'}
            title={field.name}
            selectedValue={field.defaultValue}
            tip={field.instruction}
            isRequired={field.isRequired}
            onUpdateDate={date => {
              console.log('888', date)
              this.updateRequestParams(field, date, CustomRequestDataType.date)
            }}
          />
        )

      case CustomFieldCustomType.relationInterface:
        console.warn('value=', field)
        return (
          <CustomRelationVerifyRow
            key={`custom_relation_interface${field?.id ?? index}`}
            type={'create'}
            title={field.name}
            value={field.defaultValue}
            tip={field.instruction}
            isRequired={field.isRequired}
            extraSettings={field.extraSettings}
            onVerifyInputChanged={content => {
              console.log('relation', content)
              this.updateRequestParams(field, content, CustomRequestDataType.string)
            }}
          />
        )

      default:
        return null
    }
  }

  initParamsWithDefaultValue() {
    const list = this._fieldList?.map(item => {
      let model = new CustomRequestModel()
      model.customFieldId = item.id
      let val = ''
      if (item.defaultValue) {
        val = item.defaultValue
      } else if (item.options && item.options.length > 0) {
        let defaultOptions = []
        item.options.forEach(option => {
          if (option.isDefault) {
            defaultOptions.push(option.value)
          }
        })
        // 如果是多选 默认值是数组
        if (item.inputType === 'MULTI_DROP_DOWN') {
          val = defaultOptions.join(',')
        } else {
          val = defaultOptions[0] || ''
        }
      }
      model.value = val
      model.dataType = getDataTypeFromItemType(item.inputType)
      return model
    })

    this._paramsList = list

    this.props.onUpdateCustomFields(this._paramsList)
  }

  updateRequestParams(field: CustomFieldModel, value: string, dataType: CustomRequestDataType) {
    console.log('field  ' + JSON.stringify(field))
    let i = this._paramsList.findIndex(item => item?.customFieldId === field?.id)

    if (i !== -1) {
      this._paramsList[i].value = value
      this._paramsList[i].dataType = dataType
    } else {
      let model = new CustomRequestModel()
      model.customFieldId = field.id
      model.value = value
      model.dataType = dataType

      this._paramsList.push(model)
    }

    this.props.onUpdateCustomFields(this._paramsList)
  }

  checkRequire(): boolean {
    const rList = this._noHiddenFields?.filter(item => item.isRequired)

    let isOk = true
    rList.forEach(item => {
      const targetItem = this._paramsList.find(v => v.customFieldId === item.id)

      console.log('found custom item', targetItem)

      if (!(targetItem?.value?.length > 0) && isOk) {
        Toast.open(
          i18nClient.getFormatText('components_custom_98de73', `请填写表单${item?.name}！`,{
            slot0: item?.name
          }),
        )
        isOk = false
      }
    })
    return isOk
  }

  getCustomList = (list: CustomFieldModel[]) => {
    return list.filter(item => item?.inputType && this.customTypeList.includes(item?.inputType))
  }

  checkCustom = () => {
    return this.context.isCustom
  }
}
