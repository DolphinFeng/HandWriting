import { i18nClient } from '@sailor/i18n-mrn'
/**
 * 满意度评价
 */

import React, { Component } from 'react'
import { Text, View, Image, TouchableOpacity, Keyboard, Dimensions } from '@mrn/react-native'
import { dStyle } from '../../constants/TTStyle'
import {
  SCORE,
  SOLVEDMAP,
} from '../../constants/ConfigMap'
import { TicketDetail } from '../../constants/TTServiceModule'
import { updateTicket, addScore, getSatisfySetting } from '../../constants/TTApi'
import { TopViewManager, Toast, Input, Button, SlideModal, Tags } from '@ss/mtd-react-native'
import { ttSlideModalProp, lengthOf } from '../common/TTHelper'
import SafeModalContainer from '@src/components/SafeModalContainer'
interface IProps {
  ticketId: number
  rgId?: string
  onCancel: () => void
  onSubmitSuccess: (info) => void
}

interface IState {
  score: 'satisfied' | 'common' | 'Dissatisfied'
  suggest: string
  selectedIndex: number
  reasonSelectedIndex: number[]
  resolution: 'resolved' | 'unresolved' | ''
  resolvedOptionDisplay: boolean
}

const MAX_SUGGEST_LENGTH = 300
export class Satisfy extends Component<IProps, IState> {
  instance: TopViewManager
  isSuggestInputValid: boolean = true

  dissatisfiedReasons: string[] = []
  commonReasons: string[] = []
  disRequire: boolean = false
  comRequire: boolean = false

  constructor(props: IProps) {
    super(props)

    this.state = {
      score: null,
      suggest: '',
      selectedIndex: -1,
      reasonSelectedIndex: [],
      resolution: '',
      resolvedOptionDisplay: true,
    }
  }

  get showHint() {
    const { selectedIndex, reasonSelectedIndex } = this.state
    const isRequiredDis = selectedIndex === 2 && this.disRequire
    const isRequiredCom = selectedIndex === 1 && this.comRequire
    const noDisSelected = isRequiredDis && !reasonSelectedIndex?.length
    const noComSelected = isRequiredCom && !reasonSelectedIndex?.length
    return (noDisSelected && selectedIndex === 2) || (noComSelected && selectedIndex === 1)
  }
  componentDidMount() {
    getSatisfySetting(this.props.rgId).then(res => {
      if (res?.code === 200 && res?.data) {
        const { dissatisfiedReasonDisplayList, dissatisfiedReasonRequire, resolvedOptionDisplay } = res.data
        const { commonReasonDisplayList, commonReasonRequire } = res.data
        this.dissatisfiedReasons = dissatisfiedReasonDisplayList || []
        this.commonReasons = commonReasonDisplayList || []
        this.disRequire = dissatisfiedReasonRequire
        this.comRequire = commonReasonRequire
        !resolvedOptionDisplay &&
          this.setState({
            resolvedOptionDisplay: resolvedOptionDisplay,
          })
      }
    })
  }
  render() {
    return (
      <>
        <SlideModal
          useNativeDriver={true}
          visible={true}
          modalProps={ttSlideModalProp(this.props.onCancel)}
        >
          {this.renderSatisfyBody()}
        </SlideModal>
      </>
    )
  }

  renderSatisfyBody() {
    return (
      <SafeModalContainer>
        <View style={dStyle.satisfyWrapper}>
          <TouchableOpacity style={dStyle.cancel} onPress={() => this.props.onCancel()}>
            <Text style={dStyle.FontRegul16}>
              {i18nClient.t('components_detail_625fb2', { defaultValue: '取消' })}
            </Text>
          </TouchableOpacity>
          <Text style={dStyle.FontBold16}>
            {i18nClient.t('components_detail_eb7b9e', { defaultValue: '满意度' })}
          </Text>
        </View>
        <View style={[dStyle.ticketDivider1, { marginBottom: 26 }]} />
        <View
          style={{
            flexDirection: 'row',
            marginBottom: 22,
            marginHorizontal: 16,
          }}
        >
          <Text style={[dStyle.Font14by84, { marginRight: 24 }]}>
            {i18nClient.t('components_detail_cd7bc7', { defaultValue: '评价：' })}
          </Text>
          <View style={{ flexDirection: 'row' }}>
            {SCORE.map((item, index) => {
              return (
                <TouchableOpacity
                  key={index}
                  style={{ marginRight: 40 }}
                  onPress={() => this.handleClick(item, index)}
                >
                  <Text
                    style={[
                      dStyle.FontRegul14,
                      {
                        color:
                          index === this.state.selectedIndex ? '#FF8800' : 'rgba(0, 0, 0, 0.6)',
                      },
                    ]}
                  >
                    {i18nClient.t(item.displayName)}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>
        {this.state.selectedIndex === 1 || this.state.selectedIndex === 2
          ? this.renderUnSatisfy()
          : null}
        {this.state.resolvedOptionDisplay && (
          <View
            style={{
              flexDirection: 'row',
              marginBottom: 22,
              marginHorizontal: 16,
            }}
          >
            <Text style={[dStyle.Font14by84, { marginRight: 24 }]}>
              {i18nClient.t('components_detail_7c5886', { defaultValue: '问题是否解决：' })}
            </Text>
            <View style={{ flexDirection: 'row' }}>
              {SOLVEDMAP.map((item, index) => {
                return (
                  <TouchableOpacity
                    key={index}
                    style={{ marginRight: 40 }}
                    onPress={() => this.handleSolvedItemClick(item)}
                  >
                    <Text
                      style={[
                        dStyle.FontRegul14,
                        {
                          color:
                            item.label === this.state.resolution ? '#FF8800' : 'rgba(0, 0, 0, 0.6)',
                        },
                      ]}
                    >
                      {i18nClient.t(item.displayName)}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>
        )}

        <Text style={[dStyle.Font14by84, { marginLeft: 16 }]}>
          {i18nClient.t('components_detail_7affd9', { defaultValue: '建议：' })}
        </Text>
        <View style={{ height: 100, marginTop: 8, marginHorizontal: 16 }}>
          <Input
            styles={{
              textInput: dStyle.inputTxt,
            }}
            value={this.state.suggest}
            onChange={this.handleNewInputChange}
            multiline
            autoFocus={true}
            maxLength={500}
            placeholder={i18nClient.t('components_detail_9b2fb8', {
              defaultValue: '欢迎对我们的服务作出评价，您反馈的建议我们会及时跟进',
            })}
            clearButtonMode={false}
          />
        </View>

        {this.renderCommitButton()}
      </SafeModalContainer>
    )
  }

  renderUnSatisfy() {
    const reasons =
      this.state.score === 'Dissatisfied' ? this.dissatisfiedReasons : this.commonReasons
    return (
      <>
        {this.showHint ? (
          <Text style={dStyle.satisfyTip}>
            <Text style={dStyle.satisfyMark}>*</Text>
            {i18nClient.t('components_detail_c44a45', {
              defaultValue: '请选择原因，帮助我们做的更好',
            })}
          </Text>
        ) : null}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginHorizontal: 16,
            marginTop: 8,
            marginBottom: 20,
          }}
        >
          {reasons.map((item, index) => {
            const isSelected = this.state.reasonSelectedIndex.includes(index)
            const bgColor = isSelected ? '#FEEDC4' : '#F5F5F5'
            const textColor = isSelected ? dStyle.satisfySelectedTxt : dStyle.satisfyCommonTxt
            return (
              <TouchableOpacity
                key={index}
                style={{
                  marginRight: 8,
                  backgroundColor: bgColor,
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  marginBottom: 4,
                  borderRadius: 4,
                }}
                onPress={() => {
                  // 多选，支持反选
                  const v = this.state.reasonSelectedIndex
                  if (v.includes(index)) {
                    const s = v.filter((value, i) => value !== index)
                    console.log('remove ', s)
                    this.setState({ reasonSelectedIndex: s })
                  } else {
                    console.log('add ', this.state.reasonSelectedIndex)
                    this.setState({ reasonSelectedIndex: v.concat([index]) })
                  }
                }}
              >
                <Text style={textColor}>{item.displayName}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </>
    )
  }

  handleNewInputChange = (txt: string) => {
    const length = lengthOf(txt)
    this.isSuggestInputValid = length > -1 && length <= MAX_SUGGEST_LENGTH
    this.setState({ suggest: txt })
  }

  renderCommitButton() {
    const commitEnable = this.state.score != null
    const txtColor = commitEnable ? 'rgba(0,0,0,0.84)' : 'rgba(0,0,0,0.36)'
    const btnColor = commitEnable ? '#FFC300' : '#FFE9A3'
    return (
      <View style={{ marginVertical: 16, alignItems: 'center' }}>
        <Button
          type="primary"
          disabled={!commitEnable}
          style={[dStyle.satisfyBtn, { backgroundColor: btnColor }]}
          styles={{
            tapBackgroundColor: {
              primary: '#FFC300',
            },
          }}
          onPress={() => {
            if (this.showHint) return
            if (this.isSuggestInputValid) {
              const { score, suggest, reasonSelectedIndex, resolution } = this.state
              const reasonList =
                score === 'Dissatisfied' ? this.dissatisfiedReasons : this.commonReasons
              // label 传递给后端
              const reason = (reasonList.filter((value, index) =>
                  reasonSelectedIndex.includes(index)
                ) || []
              ).map(res => res.label)
              console.log('reason =======', reason)
              addScore({
                ticketId: this.props?.ticketId,
                satisfy: score,
                suggest: suggest,
                reasons: reason,
                resolution: resolution,
              })
                .then(res => {
                  if (res?.code === 200 && res?.data) {
                    this.props.onSubmitSuccess({
                      satisfy: score,
                      suggest,
                      dissatisfiedReasons: reason,
                      resolution,
                    })
                  } else {
                    Toast.open(
                      res?.data?.errorMsg ||
                        i18nClient.t('components_detail_aeef76', {
                          defaultValue: '工单评价已截止',
                        }),
                    )
                  }
                })
                .catch(e => {
                  Toast.open(
                    i18nClient.t('components_detail_466da6', { defaultValue: '评价失败' }),
                    e,
                  )
                })
                .finally(() => {
                  this.props.onCancel()
                })
            } else {
              Toast.open(
                i18nClient.t('components_detail_1aaeb2', {
                  defaultValue: '建议长度不应超过300个字符或150个汉字',
                }),
              )
            }
          }}
        >
          <Text style={{ color: txtColor }}>
            {i18nClient.t('components_detail_939d53', { defaultValue: '提交' })}
          </Text>
        </Button>
      </View>
    )
  }

  handleClick(item, index) {
    this.setState({
      selectedIndex: index,
      score: item.label,
      suggest: '',
      reasonSelectedIndex: [],
    })
  }
  handleSolvedItemClick(item) {
    this.setState({
      resolution: item.label,
    })
  }
}
