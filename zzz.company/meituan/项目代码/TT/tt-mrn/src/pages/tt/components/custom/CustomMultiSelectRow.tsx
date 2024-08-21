import { i18nClient } from '@sailor/i18n-mrn'
import { TouchableOpacity, View, Text, StyleSheet, Dimensions } from '@mrn/react-native'
import React, { Component } from 'react'
import CreateKeyValueRow from '../create/CreateKeyValueRow'
import theme from '@src/common/styles/MWSStyle'
import { openMultiSelectModal } from '../custom/EditMultiSelect'
import { dStyle } from '../../constants/TTStyle'
import { CustomSelectOptionModel } from './CustomSingleSelectRow'
import { renderInsetSeprator } from '@src/components/BaseComponents'

interface IProps {
  title?: string
  isRequired?: boolean
  selectedValues?: string[]
  optionList: Array<CustomSelectOptionModel>
  tip?: string
  type: 'create' | 'detail'
  onOptionChanged: (values: string[]) => void
}

interface IState {
  selectedValues: string[]
  // selectedIndexs: number[]
}

class CustomMultiSelectRow extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    const { optionList, onOptionChanged, type, selectedValues } = this.props

    let sValues = []
    const list = optionList?.filter(item => item.isDefault === true).map(item => item.value)

    // 模板选项默认值
    if (list?.length > 0) {
      sValues = list
    }
    if (selectedValues?.length > 0) {
      sValues = selectedValues
    }

    this.state = {
      selectedValues: sValues,
    }

    // 只有发起页的时候，需要默认值
    if (list?.length > 0 && type === 'create') {
      onOptionChanged(list)
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
    const labels = this.state.selectedValues
    return (
      <View>
        <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap' }}>
          {labels && labels.length > 0
            ? labels.map(label => (
                <Text key={label} style={dStyle.labelTag}>
                  {label}
                </Text>
              ))
            : null}
        </View>
      </View>
    )
  }

  renderTip() {
    return this.props.tip?.length > 0 ? (
      <Text style={[styles.tip, { marginTop: 2, marginBottom: 14, marginLeft: 16 }]}>
        {this.props.tip ?? ''}
      </Text>
    ) : null
  }

  optionsList = this.props.optionList.map((model, index) => {
    // 这里加1 因为有全选按钮占了index = 0的位置
    return { label: model.value, value: index + 1 }
  })

  openSelect = () => {
    const selectedValues = this.state.selectedValues

    let selectedIndex = []
    this.optionsList.forEach((item, index) => {
      if (this.state.selectedValues?.includes(item.label)) selectedIndex.push(index + 1)
    })

    const instance = openMultiSelectModal({
      title: i18nClient.t('components_custom_153fa6', { defaultValue: '选择' }),
      options: this.optionsList,
      selectedOptionIndex: selectedIndex,
      onCancel: () => {
        instance.close()
      },
      handleConfirmClick: values => {
        instance.close()

        this.setState({ selectedValues: values })
        this.props.onOptionChanged(values)
      },
    })
  }
}

export default CustomMultiSelectRow

const styles = StyleSheet.create({
  label: {
    color: theme.gray87,
    fontSize: theme.size14,
    lineHeight: theme.height22,
  },
  tip: {
    color: theme.gray38,
    fontSize: theme.size12,
    lineHeight: theme.height20,
  },
})
