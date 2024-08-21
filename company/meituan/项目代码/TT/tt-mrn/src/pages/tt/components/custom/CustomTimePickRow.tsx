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
import { openDateEditorModal } from './EditDate'
import { formatDate7 } from '@src/common/helpers/FormatDate'
import { renderInsetSeprator } from '@src/components/BaseComponents'
import { TTCreateStyle } from '../../constants/TTStyle'

interface IProps {
  title?: string
  selectedValue?: string
  tip?: string
  isRequired?: boolean
  onUpdateDate: (date: string) => void
  type: 'create' | 'detail'
}

interface IState {
  selectedValue: string
}

class CustomTimePickRow extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    const { selectedValue, onUpdateDate, type } = this.props

    this.state = {
      selectedValue: selectedValue
    }

    // 只有发起页的时候，需要默认值
    if (selectedValue?.length > 0 && type === 'create') {
      onUpdateDate(selectedValue)
    }
  }

  render() {
    return (
      <>
        <CreateKeyValueRow
          label={this.props.title ?? ''}
          isRequired={this.props.isRequired}
          renderValue={this.renderValue}
          onPress={this.openSelect}
          paddingBottom={0}
        />
        {this.renderTip()}
        {renderInsetSeprator(16)}
      </>
    )
  }

  renderValue = () => {
    return (
      <View>
        <Text style={styles.label}>{this.state.selectedValue ?? ''}</Text>
      </View>
    )
  }

  renderTip() {
    return this.props.tip?.length > 0 ? (
      <Text
        style={[
          TTCreateStyle.tip,
          { marginTop: 2, marginBottom: 14, marginLeft: 16 }
        ]}
      >
        {this.props.tip ?? ''}
      </Text>
    ) : null
  }

  openSelect = () => {
    const v = [
      { label: 'sss', value: 1 },
      { label: 'sswws', value: 2 },
      { label: 'ssrrrs', value: 3 }
    ]


    const getDateTime = (val) => {
      const parts = val.split(/[- :]/);
      const date = new Date(
        parts[0],
        parts[1] - 1,
        parts[2],
        parts[3],
        parts[4],
        parts[5]
      )
      console.log(date)
      return date
    }

    const instance = openDateEditorModal({
      initDate: this.state.selectedValue
        ? getDateTime(this.state.selectedValue)
        : null,
      title: this.props.title ?? '',
      onCancel: () => {
        instance.close()
      },
      handleConfirmClick: date => {
        instance.close()
        console.log('ssss ' + JSON.stringify(date))
        let r = formatDate7(date) //
        console.log('fff ' + r)
        this.setState({ selectedValue: r })
        this.props.onUpdateDate(r)
      }
    })
  }
}

export default CustomTimePickRow

const styles = StyleSheet.create({
  label: {
    color: theme.gray87,
    fontSize: theme.size14,
    lineHeight: theme.height22
  }
})
