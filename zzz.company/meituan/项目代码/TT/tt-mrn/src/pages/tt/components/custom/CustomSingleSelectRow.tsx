import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Dimensions
} from '@mrn/react-native'
import React, { Component } from 'react'
import CreateKeyValueRow from '../create/CreateKeyValueRow'
import theme from '@src/common/styles/MWSStyle'
import { openSingleSelectModal } from './EditSingleSelect'
import { renderInsetSeprator } from '@src/components/BaseComponents'

export interface CustomSelectOptionModel {
  isDefault: boolean
  value: string
}

interface IProps {
  title?: string
  selectedValue?: string
  optionList: Array<CustomSelectOptionModel>
  tip?: string
  isRequired?: boolean
  onOptionChanged: (value: string) => void
  type: 'create' | 'detail'
}

interface IState {
  selectedValue: string
}

class CustomSingleSelectRow extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    const { optionList, onOptionChanged, type } = this.props

    let sValue = ''

    // 模板选项默认值
    const list = optionList?.filter(item => item.isDefault === true)
    if (list?.length > 0) {
      sValue = list[0].value
    }

    if (this.props.selectedValue?.length > 0) {
      sValue = this.props.selectedValue
    }

    this.state = {
      selectedValue: sValue
    }

    // 只有发起页的时候，需要默认值
    if (sValue?.length > 0 && type === 'create') {
      onOptionChanged(sValue)
    }
  }

  render() {
    return (
      <>
        <CreateKeyValueRow
          label={this.props.title ?? ''}
          renderValue={this.renderValue}
          onPress={this.openSelect}
          paddingBottom={0}
          isRequired={this.props.isRequired}
        />
        {this.renderTip()}
        {renderInsetSeprator(16)}
      </>
    )
  }

  renderValue = () => {
    const tip = this.props.tip
    return (
      <View>
        <Text style={styles.label}>{this.state.selectedValue ?? ''}</Text>
      </View>
    )
  }

  renderTip() {
    return this.props.tip?.length > 0 ? (
      <Text
        style={[styles.tip, { marginTop: 2, marginBottom: 14, marginLeft: 16 }]}
      >
        {this.props.tip ?? ''}
      </Text>
    ) : null
  }

  selectOptions = this.props.optionList.map((model, index) => {
    return { label: model.value, value: index }
  })

  openSelect = () => {
    const instance = openSingleSelectModal({
      options: this.selectOptions,
      onCancel: () => {
        instance.close()
      },
      onFinish: data => {
        instance.close()
        console.log('ssss ' + JSON.stringify(data))

        this.setState({ selectedValue: data?.label })
        this.props.onOptionChanged(data?.label)
      }
    })
  }
}

export default CustomSingleSelectRow

const styles = StyleSheet.create({
  label: {
    color: theme.gray87,
    fontSize: theme.size14,
    lineHeight: theme.height22
  },
  tip: {
    color: theme.gray38,
    fontSize: theme.size12,
    lineHeight: theme.height20
  }
})
