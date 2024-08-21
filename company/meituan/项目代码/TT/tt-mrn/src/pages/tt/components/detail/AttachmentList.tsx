import { i18nClient } from '@sailor/i18n-mrn'
import React, { Component, Fragment } from 'react'
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
  ViewStyle,
} from '@mrn/react-native'
import theme from '@common/styles/MWSStyle'
import { dStyle } from '../../constants/TTStyle'
import { TicketDetail, CustomFieldModel } from '../../constants/TTServiceModule'
import {
  updateTicket,
  deleteAttachment,
  uploadAttachFiles,
  uploadAttachFilesNew,
  uploadMedia,
} from '../../constants/TTApi'
import { ActionSheet } from '@ss/mtd-react-native/lib/ActionSheet'
import { TopViewManager, Toast, Tab, Loading } from '@ss/mtd-react-native'
import add from '@images/add.png'
import del from '@images/delete-o.png'
import file from '@images/file.png'
import text from '@images/text.png'
import numbers from '@images/numbers.png'
import excel from '@images/excel.png'
import pages from '@images/pages.png'
import word from '@images/word.png'
import keynote from '@images/keynot.png'
import pdf from '@images/pdf.png'
import ppt from '@images/ppt.png'
import mov from '@images/mov.png'
import KNB from '@mrn/mrn-knb'
import atob from 'atob'
import { request } from '@mrn/mrn-utils'
import { formatDateSeconds } from '@src/common/helpers/FormatDate'
import { formatFileSize } from '@src/common/helpers/StorageHelper'
import { getFileSuffix } from '@src/common/helpers/StorageHelper'
import { getKey } from '@src/common/helpers/api'
import { AppName } from '@src/common/helpers/app'
import { ttTrackDetailClick, TTKeys, ttCreateTTClick } from '../../constants/TTKeys'
import { openSingleSelectModal } from '../custom/EditSingleSelect'
import { uploadImageByBee } from '../common/TTHelper'
import { BottomCancelBtn } from '@src/components/BottomCancelBtn'

export class AttachmentModel {
  localId: string
  name: string
  id: number // 删除附件需要

  size: number
  url: string
  thumbUrl: string
  fileSuffix: string // 文件后缀名表示文件类型
}
interface IProps {
  data?: TicketDetail
  ticketId: number
  area: 'attach' | 'desc'
  attachmentList?: Array<any>
  from: 'create' | 'detail'
  isRequired?: boolean
  isCustom?: boolean
  customFieldList?: CustomFieldModel[]

  addAttachCallback?: (attachmentList: AttachmentModel[]) => void
}

interface IState {
  isCustom?: boolean
  customFieldList?: CustomFieldModel[]

  attachmentList: AttachmentModel[]
}

const selectOptions_android = [
  { label: 'components_detail_da348d', value: 0 },
  { label: 'components_detail_59e197', value: 1 }
]
const selectOptions_ios = [
  { label: 'components_detail_da348d', value: 0 }
]
// const selectOptions: Array<{ label: string; value: number }> = Platform.select({
//   android: [
//     { label: i18nClient.t('components_detail_da348d', { defaultValue: '本地选择图片' }), value: 0 },
//     { label: i18nClient.t('components_detail_59e197', { defaultValue: '本地选择文件' }), value: 1 },
//   ],

//   ios: [
//     { label: i18nClient.t('components_detail_da348d', { defaultValue: '本地选择图片' }), value: 0 },
//   ],
// })

const requiredMarkStyle = {
  color: '#f5483b',
  fontSize: theme.size14,
  lineHeight: theme.height20,
} as ViewStyle

export class AttachmentList extends Component<IProps, IState> {
  instance: TopViewManager
  imageUrlList: string[] = []
  fromText: string = ''

  constructor(props: IProps) {
    super(props)

    let _attachmentList = []
    if (this.props.data?.attachment != null) {
      _attachmentList = this.props.data?.attachment
    } else if (this.props.attachmentList != null) {
      _attachmentList = this.props.attachmentList
    }

    _attachmentList.forEach(val => {
      if (!val.fileSuffix) {
        val.fileSuffix = getFileSuffix(val.name)
      }
      if (!val.thumbUrl) {
        val.thumbUrl = val.url
      }
      if (this.isImageFileType(val.fileSuffix)) {
        this.imageUrlList.push(val.url)
      }
    })
    console.log(this.props)
    this.state = {
      isCustom: this.props.isCustom,
      customFieldList: this.props.customFieldList,

      attachmentList: _attachmentList,
    }
  }

  componentDidMount() { }
  getformDetail() {
    if (this.props.customFieldList) {
      this.props.customFieldList.map((item: any) => {
        if (item.name === i18nClient.t('components_detail_c9a6ee', { defaultValue: '附件' })) {
          this.fromText = item.instruction
        }
      })
    } else {
      this.fromText = ''
    }
  }

  render() {
    this.getformDetail()
    return (
      <View style={{ backgroundColor: 'white' }}>
        <View style={dStyle.attachWrapper}>
          <Text style={dStyle.FontBold16}>
            {this.props.isRequired && <Text style={requiredMarkStyle}>* </Text>}
            {i18nClient.t('components_detail_c9a6ee', { defaultValue: '附件' })}
          </Text>
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={this.handleAddAttachment}>
            <Image source={add} style={[dStyle.image18, { marginRight: 4 }]} />
            <Text style={dStyle.FontRegul14}>
              {i18nClient.t('components_detail_4c785f', { defaultValue: '添加附件' })}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={this.fromText ? dStyle.preTextStyle : { display: 'none' }}>
          {this.fromText || ''}
        </Text>
        {this.renderAttach(this.state.attachmentList)}
      </View>
    )
  }

  // addAttachment = () => {
  //   // TODO 更新交互形式，区分视频和图片两个入口
  //   this.uploadImage(this.props.ticketId, this.props.area)
  //   // this.uploadVideo(this.props.ticketId)
  // }

  updateState(isCustom?: boolean, customFieldList?: CustomFieldModel[]) {
    console.log('updatestate', customFieldList)

    this.setState(
      {
        isCustom: isCustom,
        customFieldList: customFieldList,
      },
      () => {
        // this.prepareData()
      },
    )
  }

  handleAddAttachment = () => {
    const appName = getKey('appName')
    const supportAddAttach =
      appName === AppName.youxuan || appName === AppName.dingxiang || appName === AppName.qishou
    if (appName === AppName.dx) {
      this.openSelectPosition()
    } else if (supportAddAttach) {
      this.addAttachDingxiang()
    } else if (appName === AppName.bee || appName === AppName.sinan) {
      this.uploadBee()
    } else {
      Toast.open(i18nClient.t('components_detail_b8c4ef', { defaultValue: '暂不支持添加附件' }))
    }
  }

  uploadBee = () => {
    const instance = ActionSheet.openIOS({
      title: i18nClient.t('components_detail_af2230', { defaultValue: '选择操作' }),
      options: [
        {
          label: i18nClient.t('components_detail_ce6855', { defaultValue: '上传图片' }),
          value: '1',
        },
        {
          label: i18nClient.t('components_detail_a6fc9e', { defaultValue: '上传文件' }),
          value: '2',
        },
      ],
      footer: <BottomCancelBtn handlePress={() => instance.close()} />,
      modalProps: {
        maskClosable: true,
      },
      confirmCallback: (item: any) => {
        if (
          item?.label === i18nClient.t('components_detail_ce6855', { defaultValue: '上传图片' })
        ) {
          uploadImageByBee(result => {
            // 蜜蜂的接口Android和iOS不统一，返回的数据结构不相同，这里是兼容逻辑。。。
            // Android 图片地址在path字段，iOS图片地址在uri字段
            console.warn('result ', result)
            const imageLocalId = Platform.OS === 'ios' ? result?.uri : result?.path
            if (imageLocalId != null) {
              let id = decodeURIComponent(imageLocalId)
              this.createModel(imageLocalId, id)
            }
          })
        } else if (
          item?.label === i18nClient.t('components_detail_a6fc9e', { defaultValue: '上传文件' })
        ) {
          this.addAttachFromFile()
        }
      },
      cancelCallback: () => {
        console.log('cancel')
      },
      itemActiveOpacity: 0.6,
    })
  }
  createModel(originId, id) {
    let sp = id.split('/')
    let len = sp?.length ?? 0
    let name = sp[len - 1]
    console.log('id ' + id)
    console.log('sp ' + sp)
    console.log('name ' + name)

    let model = new AttachmentModel()
    model.localId = originId
    model.name = name

    this.addAttachment2(model)
  }
  addAttachFromFile = () => {
    const knbSpace =
      getKey('appName') === AppName.bee || getKey('appName') === AppName.sinan
        ? 'bee.chooseFile'
        : 'zhangyu.chooseFile'
    KNB.use(knbSpace, {
      success: result => {
        result.fileInfos.map((file, index) => {
          if (file?.size > 52428800) {
            Toast.open(
              i18nClient.t('components_detail_bdb2f4', { defaultValue: '文件过大，不能超过50M' }),
            )
            return
          }

          let id = decodeURIComponent(file.localId)
          this.createModel(file.localId, id)
        })
      },
      fail: function (err) {
        console.log('www' + JSON.stringify(err))
      },
    })
  }
  openSelectPosition = () => {
    const android = selectOptions_android.map((item, index) => ({
      label: i18nClient.t(item.label),
      value: index
    }))
    const ios = selectOptions_ios.map((item, index) => ({
      label: i18nClient.t(item.label),
      value: index
    }))
    const selectOptions: Array<{ label: string; value: number }> =
      Platform.select({ android, ios })
    const instance = openSingleSelectModal({
      options: selectOptions,
      onCancel: () => {
        instance.close()
      },
      onFinish: data => {
        instance.close()
        if (data?.value === 0) {
          this.addAttachLocalChoose()
        } else {
          this.addAttachDx()
        }
      }
    })
  }

  addAttachDx = () => {
    KNB.use('dxmp.uploadFileToCloudDisk', {
      maxSelectSize: 3,
      uploadType: ['local'],
      success: res => {
        // console.warn('uploadFileToCloudDisk success', res)

        const list = res?.ret
        const item = list[0]

        console.warn('item= ', item)
        console.warn('item', item.url, item.name, item.size)

        this.handleDaxiangItem(item)
      },
      fail: function (err) {
        console.log(`cloudDisk error ${JSON.stringify(err)}`)
      },
    })
  }

  handleDaxiangItem = item => {
    let model = new AttachmentModel()

    model.name = item.name
    model.url = item.url
    model.size = item.size
    model.thumbUrl = item.thumbUrl
    model.fileSuffix = item.fileSuffix

    if (model?.size > 52428800) {
      Toast.open(
        i18nClient.t('components_detail_bdb2f4', { defaultValue: '文件过大，不能超过50M' }),
      )
      return
    }

    this.addAttachment2(model)
  }

  addAttachDingxiang = () => {
    KNB.use('zhangyu.chooseFile', {
      success: result => {
        result.fileInfos.map((file, index) => {
          let id = decodeURIComponent(file.localId)
          let sp = id.split('/')
          let len = sp?.length ?? 0
          let name = sp[len - 1]
          console.log('id ' + id)
          console.log('sp ' + sp)
          console.log('name ' + name)
          if (file?.size > 52428800) {
            Toast.open(
              i18nClient.t('components_detail_bdb2f4', { defaultValue: '文件过大，不能超过50M' }),
            )
            return
          }
          let model = new AttachmentModel()
          model.localId = id
          model.name = name

          this.addAttachment2(model)
          // this.doUploadDingxiang(id, name, 0, 'desc')
          // this.doUpload(file.localId, 'image',0,'desc')
        })
      },
      error: function (err) {
        console.log('www' + JSON.stringify(err))
      },
    })
  }

  addAttachLocalChoose = () => {
    KNB.chooseImage({
      source: 'gallery', //图片类型：'gallery'相册, 'camera'相机，''相机相册
      count: 5, //可选,表示可以选择图片的最大数量,当type: camera时此参数无效。default: 9
      returnType: 'localId', //可选，指定返回类型, localId返回本地URL对应的具体图片。 base64:返回base64编码，返回值以data; image/jpeg; base64开头。default: localId
      success: result => {
        const photos = result.photoInfos // photoInfos是一个对象数组，每个对象包括以下内容
        console.warn('photos', result)

        photos.forEach(photo => {
          let model = new AttachmentModel()
          model.localId = photo.localId
          model.name = '111.png'

          this.addAttachment2(model)
        })
      },
    })
  }

  // FIXME: temp use
  // addAttachDingxiang2 = () => {
  //   let model = new AttachmentModel()
  //   model.localId = `${Math.random()}`
  //   model.name = `${Math.random()}` + 'jeafjakjdf.adc'

  //   this.addAttachment2(model)
  // }

  addAttachment2 = (item: AttachmentModel) => {
    if (this.props.from === 'create') {
      this.handleCreateAttach(item)
      ttCreateTTClick(TTKeys.CreateClick.createUploadFile)
    } else {
      this.handleDetailAttach(item)
      ttTrackDetailClick(TTKeys.DetailClick.detailUploadFile)
    }
  }

  handleDetailAttach = (item: AttachmentModel) => {
    if (getKey('appName') === AppName.dx) {
      // 本地选择好的文件需要通过TT接口来完成上传
      if (item.localId?.length > 0) {
        this.uploadImage(item, this.props.ticketId, this.props.area)
      } else {
        this.doUploadDx(item, this.props.ticketId)
      }
    } else {
      this.doUpload(item, this.props.ticketId, this.props.area)
    }
  }

  handleCreateAttach = (item: AttachmentModel) => {
    let list = this.state.attachmentList

    list.push(item)
    if (!item.fileSuffix) {
      item.fileSuffix = getFileSuffix(item.name)
    }
    if (!item.thumbUrl) {
      item.thumbUrl = item.url
    }
    if (this.isImageFileType(item?.fileSuffix)) {
      this.imageUrlList.push(item.url)
    }

    this.setState({ attachmentList: list })
    this.props.addAttachCallback && this.props.addAttachCallback(list)
  }

  doUploadDx = (attachment: AttachmentModel, ticketId) => {
    console.log('dx uploading', attachment)

    uploadAttachFilesNew(ticketId, attachment.url, attachment.name, attachment.size, 'attach')
      .then(res => {
        if (res?.code === 200 && res?.data) {
          this.handleCreateAttach(res.data)
        } else {
          Toast.open(
            i18nClient.t('components_detail_76b8de', { defaultValue: '上传文件失败' }) +
            (res?.message ?? ''),
          )
        }
      })
      .catch(error => {
        Toast.open(i18nClient.t('components_detail_54e5de', { defaultValue: '上传失败' }) + error)
      })
  }

  handleDelete = (item: AttachmentModel, index: number) => {
    console.log('delete', item, index)
    if (this.props.from === 'detail') {
      deleteAttachment(item.id)
    }
    const list = Object.assign([], this.state.attachmentList)
    list.splice(index, 1)

    this.setState({ attachmentList: list })
    this.props.addAttachCallback && this.props.addAttachCallback(list)

    this.imageUrlList = this.imageUrlList.filter(value => value !== item.url)
  }

  //   doUploadDingxiang = (id, name ,ticketId, area: 'desc' | 'attach') => {

  //     const parts = [
  //      {
  //        fieldName: 'file', // 一般为 file，由服务器决定
  //        fileName: name, // 上传文件名
  //        mimeType: 'video/mp4', // 文件类型
  //        uri: id // 文件 URI，支持以 knb-media:// 开头的链接
  //      }
  //    ];

  //    let params = {
  //      'ticketId': ticketId,
  //      'area': area
  //    }
  //    let data = {
  //      parts: parts
  //    }

  //    uploadAttachFiles(params, data)
  //      .then(response => {
  //        console.log('响应:' + JSON.stringify(response));
  //      })
  //      .catch(error => {
  //        Toast.open('上传失败 ' + error)
  //      });
  //  }

  // uploadImage(ticketId, area) {
  //   KNB.chooseImage({
  //     source: 'gallery', //图片类型：'gallery'相册, 'camera'相机，''相机相册
  //     count: 6, //可选,表示可以选择图片的最大数量,当type: camera时此参数无效。default: 9
  //     returnType: 'localId', //可选，指定返回类型, localId返回本地URL对应的具体图片。 base64:返回base64编码，返回值以data; image/jpeg; base64开头。default: localId
  //     success: (result) => {
  //       var photos = result.photoInfos // photoInfos是一个对象数组，每个对象包括以下内容
  //       photos.forEach(photo => {
  //         // FIXME: 发起页需要暂存，因为一开始没有 ticketId
  //         this.doUpload(photo.localId, 'image', ticketId, area)
  //       });
  //     }
  //   });
  // }

  // uploadVideo(ticketId, area) {
  //   KNB.use('chooseVideo', {
  //     source: 'album', // album 相册选择，camera 相机录制
  //     success: (result) => {
  //       var videoId = result.videoId;
  //       this.doUpload(videoId, 'video', ticketId, area)
  //     }
  //   })
  // }

  doUpload = (attachModel: AttachmentModel, ticketId, area: 'desc' | 'attach') => {
    const parts = [
      {
        fieldName: 'file', // 一般为 file，由服务器决定
        fileName: attachModel.name, // 上传文件名
        // mimeType: 'image/png', // 文件类型
        uri: attachModel.localId, // 文件 URI，支持以 knb-media:// 开头的链接
      },
    ]

    let params = {
      ticketId: ticketId,
      area: area,
    }
    let data = {
      parts: parts,
    }
    const load = Loading.open()
    uploadAttachFiles(params, data)
      .then(response => {
        console.log('响应:' + JSON.stringify(response))
        if (response?.code === 200 && response?.data) {
          this.handleCreateAttach(response.data)
        }
      })
      .catch(error => {
        Toast.open(i18nClient.t('components_detail_54e5de', { defaultValue: '上传失败' }) + error)
      })
      .finally(() => {
        load.close()
      })
  }

  async uploadImage(attachModel: AttachmentModel, ticketId, area: 'desc' | 'attach') {
    try {
      const response = await uploadMedia(attachModel.localId, 'image', ticketId, area)
      if (response && response.code === 200) {
        const { name, size, url, id } = response.data
        let model = new AttachmentModel()
        model.name = name
        model.size = size
        model.url = url
        model.id = id
        this.handleCreateAttach(model)
      } else {
        Toast.open(
          i18nClient.t('components_detail_54e5de', { defaultValue: '上传失败' }) +
          response?.message,
        )
      }
    } catch (e) {
      Toast.open(i18nClient.t('components_detail_54e5de', { defaultValue: '上传失败' }) + e)
    }
  }

  renderAttach(attachment: Array<any>) {
    console.log('render acc 0')
    if (attachment === null || attachment === undefined || attachment.length === 0) {
      return null
    }
    console.log('render acc 00')
    return (
      <Fragment>
        <View style={dStyle.ticketDivider1} />
        {attachment.map((item, index) => {
          return (
            <Fragment key={index}>
              <View style={dStyle.attachInner}>
                <TouchableOpacity
                  style={{ flexDirection: 'row' }}
                  onPress={() => this.handlePreviewBaseOnFileType(item)}
                >
                  {this.renderIcon(item)}
                  {this.renderName(item)}
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ justifyContent: 'center' }}
                  onPress={() => this.handleDelete(item, index)}
                >
                  <Image source={del} style={[dStyle.image18, { opacity: 0.6 }]} />
                </TouchableOpacity>
              </View>
              {index < attachment.length - 1 ? (
                <View style={[dStyle.ticketDivider1, { marginLeft: 16 }]} />
              ) : null}
            </Fragment>
          )
        })}
      </Fragment>
    )
  }

  renderIcon(item: any) {
    if (item?.thumbUrl === undefined) {
      return <Image source={text} style={dStyle.fileIcon} />
    }

    const fileSuffix = item?.fileSuffix?.toLowerCase()
    if (fileSuffix === 'pdf') {
      return <Image source={pdf} style={dStyle.fileIcon} />
    } else if (fileSuffix === 'key') {
      return <Image source={keynote} style={dStyle.fileIcon} />
    } else if (fileSuffix === 'doc' || fileSuffix === 'docx') {
      return <Image source={word} style={dStyle.fileIcon} />
    } else if (fileSuffix === 'ppt') {
      return <Image source={ppt} style={dStyle.fileIcon} />
    } else if (fileSuffix === 'numbers') {
      return <Image source={numbers} style={dStyle.fileIcon} />
    } else if (fileSuffix === 'pages') {
      return <Image source={pages} style={dStyle.fileIcon} />
    } else if (fileSuffix === 'xls' || fileSuffix === 'xlsx') {
      return <Image source={excel} style={dStyle.fileIcon} />
    } else if (this.isVideoFileType(item?.fileSuffix)) {
      return <Image source={mov} style={dStyle.fileIcon} />
    } else if (this.isImageFileType(item?.fileSuffix)) {
      return <Image source={{ uri: item.thumbUrl }} resizeMode="center" style={dStyle.fileIcon} />
    } else {
      return <Image source={text} style={dStyle.fileIcon} />
    }
  }

  renderName(item: any) {
    return (
      <View
        style={{
          justifyContent: 'center',
          width: Dimensions.get('window').width - 100,
        }}
      >
        <Text style={dStyle.Font14by84}>{item?.name}</Text>
        {item?.size ? <Text style={dStyle.FontBoldl12}>{formatFileSize(item?.size)}</Text> : null}
      </View>
    )
  }

  isImageFileType(fileSuffix: string): boolean {
    const fileSuffixLowerCase = fileSuffix?.toLowerCase()
    return (
      fileSuffixLowerCase === 'png' ||
      fileSuffixLowerCase === 'jpg' ||
      fileSuffixLowerCase === 'jpeg' ||
      fileSuffixLowerCase === 'heic' ||
      fileSuffixLowerCase === 'bmp' ||
      fileSuffixLowerCase === 'webp' ||
      fileSuffixLowerCase === 'gif'
    )
  }

  isVideoFileType(fileSuffix: string): boolean {
    const fileSuffixLowerCase = fileSuffix?.toLowerCase()
    return (
      fileSuffixLowerCase === 'mp4' ||
      fileSuffixLowerCase === 'avi' ||
      fileSuffixLowerCase === '3gp' ||
      fileSuffixLowerCase === 'mkv' ||
      fileSuffixLowerCase === 'mov'
    )
  }

  handlePreviewBaseOnFileType(item) {
    if (getKey('appName') !== 'dx') {
      return
    }
    if (item?.url == null) {
      return
    }

    if (this.isImageFileType(item?.fileSuffix)) {
      KNB.previewImage({
        current: item.url, // 默认展示的图片
        urls: this.imageUrlList || [item.url],
      })
    } else {
      this.handlePreview(item)
    }
  }

  handlePreview(item) {
    if (getKey('appName') !== 'dx') {
      return
    }
    if (item?.url == null) {
      return
    }

    KNB.use('dxmp.previewFile', {
      fileUrl: item.url,
      fileSize: item?.size,
      fileName: item?.name,
      createTime: item?.createdAt,
      success: function (res) {
        console.log('preview success', res)
      },
      fail: function (err) {
        console.log('preview error ', err)
      },
    })
  }
}
