import { i18nClient } from '@sailor/i18n-mrn'
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Dimensions,
  TextInput,
  ScrollView,
} from '@mrn/react-native'
import React, { Component } from 'react'
import {
  renderInsetSeprator,
  renderFullSeprator,
  renderTTCustomSeprator,
} from '@src/components/BaseComponents'
import theme from '@src/common/styles/MWSStyle'
import { openTitleEditorModal } from '../detail/edit/EditTitle'
import { openDescEditorModal } from '../detail/edit/EditDesc'
import { openTextEditorModal } from './EditText'

interface IProps {
  // onNameChanged: (name: string) => void
  // onDescChanged: (desc: string) => void
  type: 'create' | 'detail'
  multiple: boolean
  title: string
  desc?: string
  tip?: string
  isRequired?: boolean
  onDescChanged: (desc: string) => void
}

interface IState {
  inputDesc: string
}

const { width, height, scale } = Dimensions.get('window')

class CustomLineInputRow extends Component<IProps, IState> {
  descWebview: any

  constructor(props: IProps) {
    super(props)

    const { desc, onDescChanged, type } = this.props

    this.state = {
      inputDesc: desc,
    }

    // 只有发起页的时候，需要默认值
    if (desc?.length > 0 && type === 'create') {
      onDescChanged(desc)
    }
  }

  render() {
    return (
      <TouchableOpacity style={{ marginHorizontal: 16, marginTop: 12 }} onPress={this.openEdit}>
        {this.renderTitle()}
        {this.renderDesc()}
        {this.renderTip()}
        {renderTTCustomSeprator()}
      </TouchableOpacity>
    )
  }

  renderTitle() {
    return (
      <Text style={styles.title}>
        {Boolean(this.props.isRequired) && <Text style={styles.requiredMark}>* </Text>}

        {this.props.title ?? ''}
      </Text>
    )
  }

  renderDesc() {
    const inputDesc = this.state.inputDesc
    const s: any = inputDesc?.length > 0 ? styles.descNormal : styles.descPlaceholder

    return (
      <Text style={[s, { marginTop: 5 }]} numberOfLines={this.props.multiple ? 0 : 1}>
        {inputDesc?.length > 0
          ? inputDesc
          : i18nClient.t('components_custom_02cc4f', { defaultValue: '请输入' })}
      </Text>
    )
  }

  renderTip() {
    return this.props.tip?.length > 0 ? (
      <Text style={[styles.tip, { marginTop: 2 }]}>{this.props.tip ?? ''}</Text>
    ) : null
  }

  openEdit = () => {
    const instance = openTextEditorModal({
      title: this.props.title ?? '',
      initTxt: this.state.inputDesc ?? '',
      tip: this.props.tip ?? '',
      multiple: this.props.multiple ?? false,
      onCancel: () => {
        instance.close()
      },
      onFinish: txt => {
        instance.close()
        console.log('ssss ' + txt)
        this.setState({ inputDesc: txt })
        this.props.onDescChanged(txt)
      },
    })
  }
}

export default CustomLineInputRow

const styles = StyleSheet.create({
  requiredMark: {
    color: '#f5483b',
  },
  title: {
    color: theme.gray60,
    fontSize: theme.size14,
    lineHeight: theme.height22,
  },
  descPlaceholder: {
    color: theme.gray36,
    fontSize: theme.size16,
    lineHeight: theme.height22,
  },
  descNormal: {
    color: theme.gray84,
    fontSize: theme.size16,
    lineHeight: theme.height22,
  },
  tip: {
    color: theme.gray38,
    fontSize: theme.size12,
    lineHeight: theme.height20,
  },
})
