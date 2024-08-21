import { i18nClient } from '@sailor/i18n-mrn'
import React, { Component } from 'react'
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  ViewStyle,
} from '@mrn/react-native'
import { Switch, ActionSheet, Toast, SlideModal } from '@ss/mtd-react-native'
import theme from '@src/common/styles/MWSStyle'
import WebView from 'react-native-webview'
import { BaseScript } from '../common/TTHelper'
import { preStyle } from '@src/common/helpers/PreHtml'
import CreateKeyValueRow from './CreateKeyValueRow'
import defaultAvatar from '@images/default-avator.png'
import { CCPersonModel, Label } from '../../constants/TTServiceModule'
import { dStyle } from '../../constants/TTStyle'
import { TicketType, SLA, Sla2CN } from '../../constants/ConfigMap'
import { BottomCancelBtn } from '@src/components/BottomCancelBtn'

const { width, height } = Dimensions.get('window')

export const renderName = (inputName: string, onPress: () => void) => {
  return (
    <TouchableOpacity style={styles.nameBg} onPress={onPress}>
      {renderNameText(inputName)}
    </TouchableOpacity>
  )
}

const renderNameText = (inputName: string) => {
  const s = styles.nameText
  return inputName.length === 0 ? (
    <Text style={[s, { color: theme.gray36 }]}>
      {i18nClient.t('components_create_6d2a3a', { defaultValue: '请输入问题标题' })}
    </Text>
  ) : (
    <Text style={[s, { color: theme.gray84 }]}>{inputName}</Text>
  )
}

export const renderDesc = (inputDesc: string, onPress: () => void) => {
  return (
    <TouchableOpacity style={{ minHeight: 98 }} onPress={onPress}>
      {inputDesc.length === 0 ? (
        <Text style={styles.descText}>
          {i18nClient.t('components_create_310b99', { defaultValue: '请输入问题描述' })}
        </Text>
      ) : (
        renderWebview(inputDesc)
      )}
    </TouchableOpacity>
  )
}

const renderWebview = (desc: string) => {
  const newDesc = preStyle(desc, width - 32)
  const { descHeight } = this.state

  return (
    <>
      <WebView
        ref={view => {
          this.descWebview = view
        }}
        originWhitelist={['*']}
        source={{ html: newDesc, baseUrl: '' }}
        style={{
          flex: 1,
          height: descHeight,
          // width: width - 32,
          marginTop: 12,
          // marginHorizontal: 16
        }}
        bounces={false}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        javaScriptEnabled={true}
        automaticallyAdjustContentInsets={true}
        contentInset={{ top: 0, left: 0 }}
        injectedJavaScript={BaseScript}
        onLoadEnd={e => {
          this.descWebview?.injectJavaScript(BaseScript)
        }}
        onMessage={event => this.handleEvent(event)}
      />
    </>
  )
}

export const renderReporter = (onPress: () => void, p?: CCPersonModel) => {
  return (
    <CreateKeyValueRow
      label={i18nClient.t('components_create_d4285a', { defaultValue: '发起人' })}
      onPress={onPress}
      renderValue={() => renderCreator(p)}
    />
  )
}

const renderCreator = (p?: CCPersonModel) => {
  return p != null ? (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Image
        source={{ uri: p?.avatar }}
        defaultSource={defaultAvatar}
        style={{ width: 24, height: 24, borderRadius: 12 }}
      />

      <Text style={styles.creator}>{`${p?.displayName}/${p?.username}`}</Text>
    </View>
  ) : (
    <Text>{''}</Text>
  )
  //保证显示的样式
}

export const renderPermission = (onValueChange: (v: boolean) => void) => {
  return (
    <CreateKeyValueRow
      label={i18nClient.t('components_create_d8782f', { defaultValue: '保密' })}
      value={''}
      renderValue={() => renderSecretSwitch(onValueChange)}
      showArrow={false}
      enablePress={false}
    />
  )
}

const renderSecretSwitch = (onValueChange: (v: boolean) => void) => {
  return (
    <Switch
      width={32}
      height={20}
      rockerSize={theme.size16}
      backgroundColor={theme.gray24}
      backgroundActiveColor={theme.yellow300}
      elevation={0}
      onChange={onValueChange}
      styles={{ container: { borderWidth: 0 } }}
    />
  )
}

export const renderLabels = (labels: Label[], openTagSelection: () => void) => {
  return (
    <TouchableOpacity
      style={{ flex: 1, flexDirection: 'row' }}
      onPress={openTagSelection}
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

export const renderAssociateTicket = () => {}

// 不调整，没有发现引用位置
const TypeList = TicketType.map((item, index) => {
  return { label: i18nClient.t(item.code), value: item.val }
})
export const renderTicketType = (onTypeSelected: (type: string) => void) => {
  return (
    <CreateKeyValueRow
      label={i18nClient.t('components_create_226b09', { defaultValue: '类型' })}
      value={this.state.typeValue}
      onPress={() => openTypeSelection(onTypeSelected)}
    />
  )
}
const openTypeSelection = (onTypeSelected: (type: string) => void) => {
  const typeInstance = ActionSheet.open({
    title: i18nClient.t('components_create_5e1872', { defaultValue: '选择类型' }),
    options: TypeList,
    modalProps: {
      maskClosable: true,
      onClose: data => typeInstance.close(),
    },
    footer: <BottomCancelBtn handlePress={() => typeInstance.close()}/>,
    confirmCallback: item => {
      console.log(item)
      onTypeSelected(item.value)
      // this.setState({ typeValue: item.label })
      // this.props.onSelectedType(item.label)
    },
    cancelCallback: () => {
      typeInstance.close()
    },
  })
}

export const renderSLALevel = () => {
  return (
    <CreateKeyValueRow
      label={i18nClient.t('components_create_95e0d7', { defaultValue: '等级' })}
      value={this.state.levelValue}
      onPress={() => openLevelSelection}
    />
  )
}

const LevelList = SLA.map((level, index) => {
  return { label: i18nClient.t(Sla2CN[level]), value: index }
})
const openLevelSelection = (onLevelSelected: (level: string) => void) => {
  console.log('open level')

  this.levelInstance = ActionSheet.open({
    title: i18nClient.t('components_create_8dfbf0', { defaultValue: '选择等级' }),
    options: LevelList,
    modalProps: {
      maskClosable: true,
      onClose: data => this.levelInstance.close(),
    },
    footer: <BottomCancelBtn handlePress={() => this.levelInstance.close()}/>,
    confirmCallback: (item, index) => {
      console.log(item, index)
      // this.setState({ levelValue: item.label })
      // this.props.onSelectedLevel(SLA[index])
      onLevelSelected(SLA[index])

      // console.log(Sla2CN[SLA[index]])
    },
    cancelCallback: () => {
      this.levelInstance.close()
    },
  })
}

export const renderFile = () => {}

const styles = StyleSheet.create({
  nameBg: {
    marginVertical: 16,
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 24,
    lineHeight: 30,
  },
  descText: {
    fontSize: 14,
    lineHeight: 22,
    color: theme.gray36,
  },
  icon: {},
  creator: {
    ...theme.fontBold,
    fontSize: theme.size14,
    color: theme.gray84,
    lineHeight: theme.height20,
    marginLeft: 4,
  } as ViewStyle,
})

//  /** 发起人 */
//  reporter,
//  /** 权限 */
//  permission,
//  /** 抄送人 */
//  cc,
//  /** 标签 */
//  labels,
//  /** 关联 TT */
//  associateTicket,
//  /** 问题类型 */
//  ticketType,
//  /** 问题等级 */
//  sla,
//  /** 附件 */
//  file
