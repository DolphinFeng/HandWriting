import { i18nClient } from '@sailor/i18n-mrn'
/**
 * SLA 状态变化
 */

import React, { Component } from 'react'
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  SafeAreaView,
  KeyboardAvoidingView,
} from '@mrn/react-native'
import { dStyle } from '../../../constants/TTStyle'
import { TicketDetail, RootTree, ThirdTree, UintModal } from '../../../constants/TTServiceModule'
import { uploadMedia } from '@tt/constants/TTApi'
import { TopViewManager, Toast, SlideModal, Dialog, Loading } from '@ss/mtd-react-native'
import { MWSSearchList } from '@src/components/MWSSearchList'
import { modalMarginTop, ttSlideModalProp } from '../../common/TTHelper'
import KNB from '@mrn/mrn-knb'
import { getKey } from '@src/common/helpers/api'
import { AppName } from '@src/common/helpers/app'
import HtmlEditor from './HtmlEditor'

interface DescEditProps {
  ticketId: number
  desc: string
  onCancel: () => void
  onFinish: (newDesc) => void
}

interface PrivateDescEditProps {
  __altRef__?: (ref: any) => void
}

interface IState {
  currentDesc: string
  imagesInUpload: number
  isContentMutated: boolean
}
const { height: windowHeight } = Dimensions.get('window')
export class EditDesc extends Component<DescEditProps & PrivateDescEditProps, IState> {
  descRef: any

  constructor(props) {
    super(props)
    this.state = {
      currentDesc: this.props.desc,
      imagesInUpload: 0,
      isContentMutated: false,
    }
  }

  componentDidMount() {
    this.props.__altRef__ && this.props.__altRef__(this)
  }

  componentWillUnmount() {
    this.props.__altRef__ && this.props.__altRef__(null)
  }

  render() {
    const topFromScreen =
      Platform.OS === 'ios' ? modalMarginTop : modalMarginTop + StatusBar.currentHeight
    const height = windowHeight - modalMarginTop

    return (
      <React.Fragment>
        <SafeAreaView style={{ height: height }}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={topFromScreen}
          >
            {this.renderHeader()}
            <View style={dStyle.ticketDivider1} />
            {this.renderBody()}
          </KeyboardAvoidingView>
        </SafeAreaView>
        {Platform.OS !== 'ios' && <StatusBar backgroundColor="rgba(0,0,0,0.6)" animated={true} />}
      </React.Fragment>
    )
  }

  renderHeader() {
    const color = '#FF8800'
    return (
      <View style={dStyle.satisfyWrapper}>
        <TouchableOpacity style={dStyle.cancel} onPress={this.handleCancel}>
          <Text style={dStyle.FontRegul16}>
            {i18nClient.t('components_detail_edit_625fb2', { defaultValue: '取消' })}
          </Text>
        </TouchableOpacity>
        <Text style={dStyle.FontBold16}>
          {i18nClient.t('components_detail_edit_80ece5', { defaultValue: '编辑描述' })}
        </Text>
        <TouchableOpacity
          style={{ right: 0, position: 'absolute' }}
          onPress={() => this.handleFinish()}
        >
          <Text style={[dStyle.finishTxt, { color: color }]}>
            {i18nClient.t('components_detail_edit_38cf16', { defaultValue: '确定' })}
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  handleCancel = () => {
    if (this.state.isContentMutated) {
      this.descRef && this.descRef.blur()
      Dialog.alert({
        message: i18nClient.t('components_detail_edit_7dce7f', {
          defaultValue: '放弃此次编辑吗？',
        }),
        confirmLabel: i18nClient.t('components_detail_edit_5ac201', { defaultValue: '放弃' }),
        confirmCallback: this.props.onCancel,
        cancelLabel: i18nClient.t('components_detail_edit_20ce8e', { defaultValue: '继续编辑' }),
      })
    } else {
      this.props.onCancel()
    }
  }

  handleFinish() {
    if (this.state.imagesInUpload > 0) {
      Toast.open(
        i18nClient.t('components_detail_edit_923a6b', { defaultValue: '请等待图片上传完成' }),
      )
    } else {
      this.descRef?.getOuterHTML()
    }
  }

  renderBody() {
    const p = {}
    return (
      <View style={{ flex: 1 }}>
        {this.renderDesc()}
        <View style={dStyle.ticketDivider1} />
        {this.renderBtn()}
      </View>
    )
  }

  renderDesc() {
    const { currentDesc } = this.state
    return (
      <View style={{ flex: 1 }}>
        <HtmlEditor
          html={currentDesc}
          callBack={info => {
            console.log('dddd ' + JSON.stringify(info))
            this.props.onFinish(info)
          }}
          onContentMutated={() => this.setState({ isContentMutated: true })}
          ref={f => {
            this.descRef = f
          }}
        />
      </View>
    )
  }

  renderBtn() {
    // workaround: prevent bottom buttons out of bounds on Android devices, though it looks wired on some other devices
    const marginBottom = Platform.OS === 'android' ? StatusBar.currentHeight : 0
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          height: 36,
          marginBottom,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            this.uploadImage(
              'gallery',
              this.props.ticketId ?? 0,
              'desc',
              this.props.ticketId ? false : true,
            )
          }}
        >
          <Image source={require('@images/picture-fill.png')} style={dStyle.coloredIconButton} />
        </TouchableOpacity>
        {this.renderCamera()}
        <View style={{ flex: 1 }} />
        {
          // this.state.imagesInUpload > 0 &&
          // <Text style={{color: "#979797"}}>{this.state.imagesInUpload} 张图片上传中…</Text>
        }
      </View>
    )
  }

  renderCamera() {
    if (Platform.OS === 'ios' && getKey('appName') === AppName.dx) {
      return null
    }

    return (
      <TouchableOpacity
        style={{ marginLeft: 16 }}
        onPress={() => {
          this.uploadImage('camera', this.props.ticketId ?? 0, 'desc')
        }}
      >
        <Image source={require('@images/camera.png')} style={dStyle.coloredIconButton} />
      </TouchableOpacity>
    )
  }

  uploadImage(source: 'gallery' | 'camera', ticketId, area, isCreate) {
    KNB.chooseImage({
      source: source, //图片类型：'gallery'相册, 'camera'相机，''相机相册
      count: 1, //可选,表示可以选择图片的最大数量,当type: camera时此参数无效。default: 9
      returnType: 'localId', //可选，指定返回类型, localId返回本地URL对应的具体图片。 base64:返回base64编码，返回值以data; image/jpeg; base64开头。default: localId
      success: result => {
        // 蜜蜂APP修改标题栏颜色
        if (getKey('appName') === AppName.bee) {
          KNB.use('setNavigationBar', {
            backgroundColor: '#FFFFFF',
          })
        }
        const photos = result.photoInfos // photoInfos是一个对象数组，每个对象包括以下内容
        console.log('photos', photos)
        let load = null
        if (photos && photos.length > 0) {
          load = Loading.open({
            type: 'iconText',
            content: i18nClient.t('components_detail_edit_077dc1', {
              defaultValue: '图片上传中……',
            }),
          })
        }
        photos.forEach(photo => {
          this.setState({ imagesInUpload: this.state.imagesInUpload + 1 })
          uploadMedia(photo.localId, 'image', ticketId, 'desc', isCreate)
            .then(
              response => {
                if (response && response.code === 200 && response.data) {
                  this.descRef?.addImages(response.data.url)
                } else {
                  Toast.open(
                    i18nClient.t('components_detail_edit_54e5de', { defaultValue: '上传失败' }) +
                      (response?.message || ''),
                  )
                }
              },
              error => {
                Toast.open(
                  i18nClient.t('components_detail_edit_54e5de', { defaultValue: '上传失败' }) +
                    error,
                )
              },
            )
            .catch(e => {
              Toast.open(
                i18nClient.t('components_detail_edit_12fb9d', { defaultValue: '上传图片失败' }) + e,
              )
            })
            .finally(() => {
              this.setState({ imagesInUpload: this.state.imagesInUpload - 1 })
              load != null && load.close()
            })
        })
      },
    })
  }
}

// 外部直接调用这个方法
export const openDescEditorModal = (props: DescEditProps) => {
  // tricky way to obtain the reference to EditDesc instance, since the ref prop will be override by SlideModal
  let editDescRef: EditDesc = null
  const handleCancel = () => editDescRef?.handleCancel()
  const captureRef = ref => (editDescRef = ref)
  return SlideModal.open({
    useNativeDriver: true,
    visible: true,
    duration: 100,
    modalProps: ttSlideModalProp(handleCancel),
    children: <EditDesc {...props} __altRef__={captureRef} />,
  })
}
