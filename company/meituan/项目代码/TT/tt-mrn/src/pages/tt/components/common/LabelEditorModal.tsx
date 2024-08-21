import { i18nClient } from '@sailor/i18n-mrn'
import React from 'react'
import { Dimensions, Text, TouchableOpacity, View } from '@mrn/react-native'
import { SlideModal, Input, Toast } from '@ss/mtd-react-native'
import { Label } from '../../constants/TTServiceModule'
import { ttSlideModalProp } from '@tt/components/common/TTHelper'
import { dStyle } from '@tt/constants/TTStyle'
import { LabelEditor } from './LabelEditor'
import { addLabel, labelIdByName } from '../../constants/TTApi'
import SafeModalContainer from '@src/components/SafeModalContainer'

const MAX_LABEL_LENGTH = 20
/**
 * check if the character is in CJK Unified Ideographs (U+4E00..U+9FFF)
 * @param str contains single character
 */
const isCJK = (str: string) => {
  const codePoint = str.codePointAt(0)
  return codePoint >= 0x4e00 && codePoint <= 0x9fff
}
const lengthOf = (str: string) =>
  Array.from(str)
    .map(s => (isCJK(s) ? 2 : 1))
    .reduce((sum, l) => sum + l, 0)

interface LabelEditorModalProps {
  rgId?: string
  initialLabels?: Label[]
  onCancel: () => void
  onFinish: (selectedLabels: Label[]) => void
}

interface LabelEditorModalState {
  selectedLabels: Label[]
  newLabel: boolean
  newLabelText: string
}

class LabelEditorModal extends React.Component<LabelEditorModalProps, LabelEditorModalState> {
  isNewLabelInputValid = false

  constructor(props: Readonly<LabelEditorModalProps>) {
    super(props)
    this.state = {
      selectedLabels: [],
      newLabel: false,
      newLabelText: '',
    }
  }

  componentDidMount() {
    this.setState({ selectedLabels: this.props.initialLabels || [] })
  }

  render() {
    return this.renderBody()
  }

  renderBody = () => {
    const { rgId } = this.props
    const { selectedLabels, newLabel } = this.state
    return (
      <SafeModalContainer>
        {this.renderTitle()}
        <View style={dStyle.ticketDivider1} />
        {newLabel ? (
          this.renderNewLabel()
        ) : (
          <LabelEditor
            rgId={rgId}
            selectedLabels={selectedLabels}
            setSelectedLabels={labels => this.setState({ selectedLabels: labels })}
            newLabel={() => this.setState({ newLabel: true })}
          />
        )}
      </SafeModalContainer>
    )
  }

  renderTitle = () => {
    const { newLabel } = this.state
    const title = newLabel
      ? i18nClient.t('components_common_a1d3bf', { defaultValue: '新增标签' })
      : i18nClient.t('components_common_f9b05d', { defaultValue: '选择标签' })
    const handleCancel = newLabel
      ? () => this.setState({ newLabel: false })
      : () => this.props.onCancel()
    const finishText = newLabel
      ? i18nClient.t('components_common_e83a25', { defaultValue: '确认' })
      : i18nClient.getFormatText('components_common_a67c2d', `完成(${this.state.selectedLabels.length})`,{
          slot0: this.state.selectedLabels.length
        })
    const handleFinish = newLabel
      ? this.handleFinishNewLabel
      : () => this.props.onFinish(this.state.selectedLabels)

    return (
      <View style={dStyle.satisfyWrapper}>
        <TouchableOpacity style={dStyle.cancel} onPress={handleCancel}>
          <Text style={dStyle.FontRegul16}>
            {i18nClient.t('components_common_625fb2', { defaultValue: '取消' })}
          </Text>
        </TouchableOpacity>
        <Text style={dStyle.FontBold16}>{title}</Text>
        <TouchableOpacity style={{ right: 0, position: 'absolute' }} onPress={handleFinish}>
          <Text
            style={[
              dStyle.FontRegul16,
              {
                color: '#FF8800',
                fontWeight: 'bold',
              },
            ]}
          >
            {finishText}
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  handleFinishNewLabel = async () => {
    if (!this.isNewLabelInputValid) {
      Toast.open(
        i18nClient.t('components_common_b62347', {
          defaultValue: '标签不可为空，且长度不应超过 20 个字符或 10 个汉字',
        }),
      )
      return
    }
    try {
      const name = this.state.newLabelText
      try {
        await addLabel(name)
      } catch (ignored) {}
      const resp = await labelIdByName(name)
      if (resp && resp.data && resp.data.items && resp.data.items.length > 0) {
        const id = Number.parseInt(resp.data.items[0], 10)
        this.setState({
          newLabel: false,
          newLabelText: '',
          selectedLabels: [...this.state.selectedLabels, { id, name }],
        })
        Toast.open(i18nClient.t('components_common_a5bfd7', { defaultValue: '新增成功' }))
      } else {
        Toast.open(i18nClient.t('components_common_f50bf4', { defaultValue: '请求失败' }))
      }
    } catch (e) {
      Toast.open(i18nClient.t('components_common_f50bf4', { defaultValue: '请求失败' }))
    }
  }

  handleNewLabelInputChange = (text: string) => {
    const length = lengthOf(text)
    this.isNewLabelInputValid = length > 0 && length <= MAX_LABEL_LENGTH
    this.setState({ newLabelText: text })
  }

  renderNewLabel() {
    return (
      <Input
        style={{ flex: 0, margin: 16 }}
        autoFocus
        placeholder={i18nClient.t('components_common_6f81f3', { defaultValue: '请输入标签名称' })}
        value={this.state.newLabelText}
        onChange={this.handleNewLabelInputChange}
        maxLength={MAX_LABEL_LENGTH}
      />
    )
  }
}

export const openLabelEditorModal = (props: LabelEditorModalProps) => {
  return SlideModal.open({
    useNativeDriver: true,
    visible: true,
    duration: 100,
    modalProps: ttSlideModalProp(props.onCancel),
    children: <LabelEditorModal {...props} />,
  })
}
