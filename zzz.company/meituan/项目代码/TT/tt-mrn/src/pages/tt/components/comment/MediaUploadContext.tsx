import { i18nClient } from '@sailor/i18n-mrn'
import React from 'react'
import KNB from '@mrn/mrn-knb'
import { Toast } from '@ss/mtd-react-native'

import { uploadMedia } from '@tt/constants/TTApi'
import { UploadFileInfo } from '@tt/constants/TtServiceModule'
import { AppName } from '@src/common/helpers/app'
import { getKey } from '@src/common/helpers/api'

export declare type Media = UploadFileInfo

export interface IMediaUpload {
  medias: Media[]
  uploadFromGallery: (ticketId: number, area: 'desc' | 'attach' | 'comment') => void
  removeUploaded: (media: Media) => void
  clear: () => void
}

const noop = () => {}

export const MediaUploadContext = React.createContext<IMediaUpload>({
  medias: [],
  uploadFromGallery: noop,
  removeUploaded: noop,
  clear: noop,
})

interface MediaUploadProviderState {
  medias: Media[]
}

export class MediaUploadProvider extends React.Component<any, MediaUploadProviderState> {
  constructor(props: Readonly<any>) {
    super(props)
    this.state = {
      medias: [],
    }
  }

  doUpload = async (
    id,
    uploadType: 'image' | 'video',
    ticketId,
    area: 'desc' | 'attach' | 'comment',
  ) => {
    try {
      const response = await uploadMedia(id, uploadType, ticketId, area)
      if (response && response.code === 200) {
        this.setState({ medias: [...this.state.medias, response.data] })
      } else {
        Toast.open(
          i18nClient.t('components_comment_54e5de', { defaultValue: '上传失败' }) +
            response?.message,
        )
      }
    } catch (e) {
      Toast.open(i18nClient.t('components_comment_54e5de', { defaultValue: '上传失败' }) + e)
    }
  }

  uploadFromGallery = (ticketId, area) => {
    KNB.chooseImage({
      source: 'gallery', //图片类型：'gallery'相册, 'camera'相机，''相机相册
      count: 6, //可选,表示可以选择图片的最大数量,当type: camera时此参数无效。default: 9
      returnType: 'localId', //可选，指定返回类型, localId返回本地URL对应的具体图片。 base64:返回base64编码，返回值以data; image/jpeg; base64开头。default: localId
      success: result => {
        // 蜜蜂APP修改标题栏颜色
        if (getKey('appName') === AppName.bee) {
          KNB.use('setNavigationBar', {
            backgroundColor: '#FFFFFF',
          })
        }
        const photos = result.photoInfos // photoInfos是一个对象数组，每个对象包括以下内容
        photos.forEach(photo => {
          this.doUpload(photo.localId, 'image', ticketId, area)
        })
      },
    })
  }

  removeUploaded = (media: Media) => {
    this.setState({ medias: this.state.medias.filter(m => m !== media) })
  }

  clear = () => this.setState({ medias: [] })

  render() {
    const { children } = this.props
    const { medias } = this.state
    const { uploadFromGallery, removeUploaded, clear } = this
    return (
      <MediaUploadContext.Provider value={{ medias, uploadFromGallery, removeUploaded, clear }}>
        {children}
      </MediaUploadContext.Provider>
    )
  }
}
