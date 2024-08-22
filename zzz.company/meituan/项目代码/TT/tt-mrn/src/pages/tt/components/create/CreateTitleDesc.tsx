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
import { renderInsetSeprator, renderFullSeprator } from '@src/components/BaseComponents'
import theme from '@src/common/styles/MWSStyle'
import WebView from 'react-native-webview'
import { BaseScript, requestCurrentUser, requestInsideUser } from '../common/TTHelper'
import { preStyle } from '@src/common/helpers/PreHtml'
import { openLink } from '@src/common/helpers/OpenLink'
import { openTitleEditorModal } from '../detail/edit/EditTitle'
import { openDescEditorModal } from '../detail/edit/EditDesc'
import { CustomFieldModel, CustomFieldSystemType } from '../../constants/TTServiceModule'
import { CreateNewTTContext } from './CreateNewTTContext'
import { createTipComponet, handleTip } from './CreateHelper'
import { getWmDistrictCityTitle } from '../../constants/TTApi'

interface IProps {
  // onInputChanged: ({name, desc}) => void
  onNameChanged: (name: string) => void
  onDescChanged: (desc: string) => void

  isCustom?: boolean
  customFieldList?: CustomFieldModel[]

  inputName?: string
  inputDesc?: string
}

interface IState {
  inputName: string
  inputDesc: string
  descHeight: number
  // showEdit: boolean

  // isCustom?: boolean
  // customFieldList?: CustomFieldModel[]
}

const { width, height, scale } = Dimensions.get('window')

class CreateTitleDesc extends Component<IProps, IState> {
  descWebview: any

  static contextType = CreateNewTTContext
  context: React.ContextType<typeof CreateNewTTContext>

  constructor(props: IProps) {
    super(props)

    console.log('xxxmmmddd', this.props.inputName)

    const { inputName, inputDesc } = this.props
    this.state = {
      inputName: inputName,
      inputDesc: inputDesc,
      descHeight: 36,
      // showEdit: false

      // isCustom: this.props.isCustom,
      // customFieldList: this.props.customFieldList
    }

    if (inputName?.length > 0) {
      this.props.onNameChanged(inputName)
    }

    if (inputDesc?.length > 0) {
      this.props.onDescChanged(inputDesc)
    }
  }

  async componentDidMount() {
    /**
     * 需求描述： 外卖代理商发起TT工单，标题支持自动带入区域信息。普通表单 + 自定义表单 均支持
     * 具体逻辑如下：
     * step1 判断是否是外部用户 getCtiVersion返回结果version === 0代表外部用户
     * step2 getWmDistrictCityTitle获取外卖代理商城市前缀
     */

    let model = await requestCurrentUser()
    if (model?.username != null) {
      const isInsideUser = await requestInsideUser()
      if (!isInsideUser) {
        getWmDistrictCityTitle(model.username).then(res => {
          console.log('res prefix ', res)
          if (res?.code === 200 && res?.data?.prefix) {
            const prefix = res.data.prefix
            this.setState({ inputName: prefix })
            this.props.onNameChanged(prefix)
          }
        })
      }
    }
  }

  render() {
    if (this.checkCustom()) {
      const list = this.getNonHiddenList(this.context.customFieldList)
      if (!(list?.length > 0)) return null
    }

    return (
      <View style={{ backgroundColor: 'white', paddingHorizontal: 16 }}>
        {this.renderNameInput()}
        {renderFullSeprator()}
        {this.renderDescInput()}
        {/* {this.renderEditDesc()} */}
      </View>
    )
  }

  renderNameInput() {
    let needHide = false

    let tip = ''
    if (this.context.isCustom === true) {
      const item = this.context.customFieldList?.find(
        item => item.identify === CustomFieldSystemType.name,
      )
      if (item === undefined || item?.isHidden) {
        needHide = true
      }

      tip = handleTip(needHide, item)
    }

    return needHide ? null : (
      <TouchableOpacity
        style={{ marginVertical: 16, justifyContent: 'center' }}
        onPress={this.showEditTitle}
      >
        {this.state.inputName.length === 0 ? (
          <Text
            style={{
              fontSize: 24,
              lineHeight: 30,
              color: theme.gray36,
            }}
          >
            {i18nClient.t('components_create_6d2a3a', { defaultValue: '请输入问题标题' })}
          </Text>
        ) : (
          <Text
            style={{
              fontSize: 24,
              lineHeight: 30,
              color: theme.gray84,
            }}
          >
            {this.state.inputName}
          </Text>
        )}

        {createTipComponet(tip)}
      </TouchableOpacity>
    )
  }

  renderDescInput() {
    let needHide = false

    let tip = ''
    if (this.context.isCustom === true) {
      const item = this.context.customFieldList?.find(
        item => item.identify === CustomFieldSystemType.desc,
      )
      if (item === undefined || item?.isHidden) {
        needHide = true
      }

      if (needHide) {
        console.log('用了默认值', item, item?.defaultValue)

        this.props.onDescChanged(item?.defaultValue ?? '')
      }

      tip = handleTip(needHide, item)
    }

    return needHide ? null : (
      <TouchableOpacity style={{ minHeight: 98 }} onPress={this.handleDescEdit}>
        {this.state.inputDesc.length === 0 ? (
          <Text
            style={{
              fontSize: 14,
              lineHeight: 22,
              color: theme.gray36,
              marginTop: 12,
              minHeight: 66,
            }}
          >
            {i18nClient.t('components_create_310b99', { defaultValue: '请输入问题描述' })}
          </Text>
        ) : (
          this.renderWebview(this.state.inputDesc)
        )}

        {createTipComponet(tip)}
      </TouchableOpacity>
    )
  }

  // renderEditDesc () {
  //   const model = new EditDescModel()
  //   model.name = this.state.inputName
  //   model.desc = this.state.inputDesc
  //   model.id = 0

  //   return this.state.showEdit ?
  //     <EditTitleAndDesc
  //       // propData={this.props.data}
  //       editModel={model}
  //       onCancel={() => {this.setState({showEdit: false})}}
  //       onFinish={(info) => {
  //         this.setState({showEdit: false, inputName: info.name, inputDesc: info.desc})

  //         this.props.onInputChanged({name: info.name, desc: info.desc})
  //         // // 标题
  //         // if (info.name !== this.props.data.name) {
  //         //   // 为了效率，可以先显示后网络请求
  //         //   this.setState({showEdit: false, currentName: info.name })
  //         //   updateTicket(this.props.ticketId, {name: info.name})
  //         // }
  //         // // 描述
  //         // if (info.desc !== this.props.data.desc) {
  //         //   this.props.callback(info)
  //         // }

  //       }}
  //     />
  //     : null
  // }

  showEditTitle = () => {
    const instance = openTitleEditorModal({
      ticketId: null,
      title: this.state.inputName,
      onCancel: () => {
        instance.close()
      },
      onFinish: newTitle => {
        instance.close()
        this.setState({ inputName: newTitle })
        this.props.onNameChanged(newTitle)
      },
    })
  }

  handleDescEdit = () => {
    const descInstance = openDescEditorModal({
      ticketId: null,
      desc: this.state.inputDesc,
      onCancel: () => descInstance.close(),
      onFinish: newDesc => {
        descInstance.close()
        this.setState({ inputDesc: newDesc })
        this.props.onDescChanged(newDesc)
      },
    })
  }

  renderWebview(desc) {
    let newDesc = preStyle(desc, width - 32)
    const { descHeight } = this.state

    newDesc = ''.concat(
      '<meta name="viewport" content="initial-scale=1,user-scalable=no">',
      '<style type="text/css">body{margin:0;padding:20px 16px 20px 16px;font-size:16px; line-height:1.3;font-family: sans-serif;}div{outline: none;} img{max-width:100%;max-height:380px;width:auto;}</style>',
      `<div contenteditable="false" id="desc">${newDesc}</div>`,
    )

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
            marginVertical: 12,
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
          onMessage={event => this.handleEvent(event)}
        />
      </>
    )
  }

  handleEvent(event: any) {
    try {
      const action = JSON.parse(event.nativeEvent.data)
      if (action.type === 'setHeight' && action.height > 0) {
        this.setState({ descHeight: action.height })
      }
      // if (action.type === 'clickImg' && action.currentSrc) {
      //   let sList = [action.currentSrc]
      //   KNB.previewImage({
      //     current: action.currentSrc,
      //     urls: sList
      //   })
      // }
      // if (action.type === 'clickHref') {
      //   let href = action.currentHref
      //   if (href) {
      //     openLink(href)
      //   }
      // }
    } catch (e) {
      console.warn(e)
    }
  }

  updateDescFromTemplate(desc: string) {
    this.setState({ inputDesc: desc })
  }

  // updateState (isCustom?: boolean, customFieldList?: CustomFieldModel[]) {
  //   console.log('updatestate', customFieldList);

  //   this.setState({
  //     isCustom: isCustom,
  //     customFieldList: customFieldList
  //   })
  // }

  getNonHiddenList = (list: CustomFieldModel[]) => {
    const origList = this.getTitleDescSectionCustomList(list)

    const rList = origList.filter(item => !item.isHidden)

    return rList
  }

  getTitleDescSectionCustomList = (list: CustomFieldModel[]) => {
    const section = [CustomFieldSystemType.desc, CustomFieldSystemType.name]

    return list.filter(item => section.includes(item.identify))
  }

  checkCustom = () => {
    return this.context.isCustom
  }
}

export default CreateTitleDesc
