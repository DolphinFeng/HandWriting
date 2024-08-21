import { i18nClient } from '@sailor/i18n-mrn'
/**
 * SLA 状态变化
 */

import React, { Component } from 'react'
import { Text, View, Image, TouchableOpacity, Keyboard } from '@mrn/react-native'
import { dStyle } from '../../constants/TTStyle'
import {
  TicketDetail,
  CustomFieldCustomType,
  CustomFieldValue,
} from '../../constants/TTServiceModule'
import {
  updateTicket,
  getTicketTime,
  createCustomTicket,
  updateCustomTicket,
  getTicketDetail,
} from '../../constants/TTApi'
import { TopViewManager, Toast } from '@ss/mtd-react-native'
import { openTextEditorModal } from '../custom/EditText'
import { openSingleSelectModal } from '../custom/EditSingleSelect'
import { openMultiSelectModal } from '../custom/EditMultiSelect'
import CustomLineInputRow from '../custom/CustomLineInputRow'
import { formatDate4, formatDate5, formatDate7 } from '@src/common/helpers/FormatDate'
import CustomSingleSelectRow from '../custom/CustomSingleSelectRow'
import CustomTimePickRow from '../custom/CustomTimePickRow'
import CustomMultiSelectRow from '../custom/CustomMultiSelectRow'
import up from '@images/up-thick.png'
import down from '@images//down-thick.png'
import { TTDetailContext } from './DetailContext'
import { ttTrackDetailClick, TTKeys } from '../../constants/TTKeys'
import CustomRelationVerifyRow from '../custom/CustomRelationVerifyRow'
interface IProps {
  // propData: TicketDetail
}
interface IState {
  //  stateData: TicketDetail,
  collapse: boolean
}
export class CustomInfo extends Component<IProps, IState> {
  static contextType = TTDetailContext
  context!: React.ContextType<typeof TTDetailContext>

  instance: TopViewManager
  filedParam: Array<{ id: number; value: string; dataType: number }>

  constructor(props: IProps, context) {
    super(props, context)
    this.state = {
      // stateData: this.props.propData,
      collapse: false,
    }
  }

  componentDidMount() {}

  render() {
    const { collapse } = this.state
    const arrow = collapse ? down : up
    const { ticketDetail } = this.context
    return (
      <>
        {/* <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}
           onPress={() => {
             this.setState({ collapse: !collapse })
           }}
          >
           <Text style={[dStyle.Font14by84, { marginLeft: 16, marginRight: 8, marginVertical: 8 }]}>
             {`自定义字段(${ticketDetail?.customFieldValues?.length})`}
           </Text>
           <Image source={arrow} style={{ height: 18, width: 18, opacity: 0.60 }} />
          </TouchableOpacity> */}

        <View style={{ height: 8, backgroundColor: '#F5F5F5' }} />
        {this.renderCustomBody()}
      </>
    )
  }

  renderCustomBody() {
    const { customFieldContents, customFieldValues } = this.context.ticketDetail
    this.initParam(customFieldValues)
    // 整合customFieldContents 、customFieldValues 获取自定义表单内容
    const fieldList = customFieldValues.map((item, index) => {
      return {
        ...customFieldContents.find((value, index) => value.id === item.customFieldId),
        ...item,
      }
    })

    return (
      <View
      // style= {this.state.collapse ? {display: 'none'} : {display: 'flex', flex: 1}}
      >
        {fieldList.map((field, index) => {
          switch (field.inputType) {
            case CustomFieldCustomType.singleText:
              return (
                <CustomLineInputRow
                  key={index}
                  type={'detail'}
                  multiple={false}
                  title={field.name}
                  desc={field.value}
                  tip={field.instruction}
                  isRequired={field.isRequired}
                  onDescChanged={txt => this.updateTicket(field, txt)}
                />
              )

            case CustomFieldCustomType.multiText:
              return (
                <CustomLineInputRow
                  key={index}
                  type={'detail'}
                  multiple={true}
                  title={field.name}
                  desc={field.value}
                  tip={field.instruction}
                  isRequired={field.isRequired}
                  onDescChanged={txt => this.updateTicket(field, txt)}
                />
              )

            case CustomFieldCustomType.singleDrop:
              return (
                <CustomSingleSelectRow
                  key={index}
                  type={'detail'}
                  title={field.name}
                  selectedValue={field.value}
                  optionList={field.options}
                  tip={field.instruction}
                  isRequired={field.isRequired}
                  onOptionChanged={option => {
                    this.updateTicket(field, option)
                  }}
                />
              )

            case CustomFieldCustomType.multiDrop:
              return (
                <CustomMultiSelectRow
                  key={index}
                  type={'detail'}
                  title={field.name}
                  selectedValues={field.value ? field.value.split(',') : []}
                  optionList={field.options}
                  onOptionChanged={option => this.updateTicket(field, option.join(','))}
                  tip={field.instruction}
                  isRequired={field.isRequired}
                />
              )

            case CustomFieldCustomType.date:
              return (
                <CustomTimePickRow
                  key={index}
                  type={'detail'}
                  title={field.name}
                  selectedValue={field.value}
                  onUpdateDate={date => this.updateTicket(field, date)}
                  isRequired={field.isRequired}
                />
              )

            case CustomFieldCustomType.relationInterface:
              return (
                <CustomRelationVerifyRow
                  key={index}
                  type={'detail'}
                  title={field.name}
                  value={field.value}
                  onVerifyInputChanged={date => this.updateTicket(field, date)}
                  isRequired={field.isRequired}
                />
              )

            default:
              return null
          }
        })}
      </View>
    )
  }

  initParam(values: Array<CustomFieldValue>) {
    this.filedParam = values.map((item, index) => {
      return { id: item.id, value: item.value, dataType: item.dataType }
    })
    console.log('ss ' + JSON.stringify(this.filedParam))
  }

  updateTicket(field, newData) {
    console.log('field  ' + JSON.stringify(field))
    this.filedParam.forEach((v, i) => {
      if (v.id === field.id) {
        v.value = newData
      }
    })
    const { handleTicketDetail } = this.context
    updateCustomTicket(this.context.ticketDetail.id, {
      customFieldValueList: this.filedParam,
    })
      .then(res => {
        if (res?.code === 200) {
          // TODO 通常网络请求成功后更新UI
          // 最好custominfo维护一个state

          // update接口数据不全，update后需要重新拉取详情
          getTicketDetail(this.context.ticketDetail.id)
            .then(tRes => {
              if (tRes?.code === 200 && tRes?.data) {
                handleTicketDetail(tRes.data)
              }
            })
            .catch(e => {
              Toast.open(
                i18nClient.t('components_detail_8ac03c', { defaultValue: '获取新的详情失败' }),
              )
            })
        }
      })
      .catch(e => {})
    ttTrackDetailClick(TTKeys.DetailClick.modifyCustom)
  }
}
