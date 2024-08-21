import { i18nClient } from '@sailor/i18n-mrn'
import { TouchableOpacity, View, Text, StyleSheet } from '@mrn/react-native'
import React, { Component } from 'react'
import CreateKeyValueRow from '../create/CreateKeyValueRow'
import { CustomExtraModel } from '../../constants/TTServiceModule'
import { openSingleSelectModal } from './EditSingleSelect'
import theme from '@src/common/styles/MWSStyle'
import { getShopDetailInfo } from '../../constants/TTApi'
import { openTextEditorModal } from './EditText'
import { Toast } from '@ss/mtd-react-native'

export interface CustomSelectOptionModel {
  isDefault: boolean
  value: string
}

interface IProps {
  title?: string
  value?: string
  extraSettings?: CustomExtraModel
  tip?: string
  isRequired?: boolean
  onVerifyInputChanged: (value: string) => void
  type: 'create' | 'detail'
}

interface IState {
  poiType: string
  shopId: string
  shopName: string
}

class CustomRelationVerifyRow extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    if (this.props.value?.length > 0) {
      const { poiType, shopId, shopName } = JSON.parse(this.props.value)
      this.state = {
        poiType: poiType,
        shopId: shopId,
        shopName: shopName,
      }
    } else {
      this.state = {
        poiType: 'MEITUAN',
        shopId: '',
        shopName: '',
      }
    }
  }

  render() {
    return (
      <>
        <CreateKeyValueRow
          label={this.props.title ?? ''}
          onPress={this.openSelect}
          renderValue={this.renderValue}
          isRequired={this.props.isRequired}
          paddingBottom={0}
          paddingTop={14}
        />

        {this.renderShopIdView()}
        {this.renderShopName()}
      </>
    )
  }

  renderValue = () => {
    return (
      <View>
        <Text style={styles.label}>
          {this.state.poiType === 'DIANPING'
            ? i18nClient.t('components_custom_f3d2a0', { defaultValue: '点评门店ID' })
            : i18nClient.t('components_custom_269999', { defaultValue: '美团门店ID' })}
        </Text>
      </View>
    )
  }

  renderShopIdView() {
    const shopId = this.state.shopId
    const s: any = shopId?.length > 0 ? styles.label : styles.placeHolder
    return (
      <TouchableOpacity style={{ marginBottom: 14, marginLeft: 16 }} onPress={this.openEdit}>
        <Text style={s}>
          {shopId?.length > 0
            ? shopId
            : i18nClient.t('components_custom_e3aad1', { defaultValue: '请输入门店ID' })}
        </Text>
      </TouchableOpacity>
    )
  }

  renderShopName() {
    return this.state.shopName ? (
      <Text style={[styles.label, { marginBottom: 14, marginLeft: 16 }]}>
        {this.state.shopName}
      </Text>
    ) : null
  }

  openEdit = () => {
    const instance = openTextEditorModal({
      title: this.props.title ?? '',
      initTxt: this.state.shopId ?? '',
      tip: this.props.tip ?? '',
      multiple: false,
      onCancel: () => {
        instance.close()
      },
      onFinish: txt => {
        instance.close()
        console.log('ssss ' + txt)
        this.setState({ shopId: txt, shopName: '' })
        if (txt?.length > 0) {
          this.handleSearch(txt)
        }
      },
    })
  }

  async handleSearch(shopId: string) {
    getShopDetailInfo(shopId, this.state.poiType)
      .then(res => {
        if (res?.code === 200 && res?.data) {
          console.log('res=', res)
          if (res?.data.shopName) {
            this.setState({ shopName: res?.data.shopName })
            let val = JSON.stringify(this.state)
            this.props.onVerifyInputChanged(val)
          } else {
            Toast.open(
              i18nClient.t('components_custom_75ed2c', {
                defaultValue: '未找到门店信息, 请输入正确的门店ID',
              }),
            )
          }
        }
      })
      .catch(e => { })
  }

  openSelect = () => {
    const selectOptions: Array<{ label: string; value: number }> = [
      { label: i18nClient.t('components_custom_269999', { defaultValue: '美团门店ID' }), value: 0 },
      { label: i18nClient.t('components_custom_f3d2a0', { defaultValue: '点评门店ID' }), value: 1 },
    ]
    const instance = openSingleSelectModal({
      options: selectOptions,
      onCancel: () => {
        instance.close()
      },
      onFinish: data => {
        instance.close()
        console.log('ssss ' + JSON.stringify(data))

        this.setState({
          poiType: data?.value === 1 ? 'DIANPING' : 'MEITUAN',
          shopId: '',
          shopName: '',
        })
      },
    })
  }
}

export default CustomRelationVerifyRow

const styles = StyleSheet.create({
  label: {
    color: theme.gray87,
    fontSize: theme.size14,
    lineHeight: theme.height22,
  },
  placeHolder: {
    color: theme.gray36,
    fontSize: theme.size14,
    lineHeight: theme.height22,
  },
})
