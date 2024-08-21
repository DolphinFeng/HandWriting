import { i18nClient } from '@sailor/i18n-mrn'
import React, { Component } from 'react'
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from '@mrn/react-native'
import { Icon, Toast } from '@ss/mtd-react-native'
import { MWSStyle } from '@src/common/styles/MWSCommonStyle'
import { pushComment } from '@tt/constants/TTApi'
import { UploadFileInfo, CCPersonModel } from '../../constants/TtServiceModule'
import pictureIcon from '@images/picture.png'
import atIcon from '@images/at.png'
import KNB from '@mrn/mrn-knb'

import { MediaUploadContext } from './MediaUploadContext'
import CommentBarCollapsed, { CommentBarCollapsedProps } from './CommentBarCollapsed'

export interface ReplyTo {
  displayName: string
  mis: string
  id: number
  parentId: number
}

interface IProps {
  ticketId: number
  replyTo?: ReplyTo
  onSentComment?: (id: number) => void
  onClearReplyTo: () => void
  expanded: boolean
  onShowPersonPicker: () => void
  hideMis?: boolean
}

interface IState {
  text: string
  mentions: {
    [mis: string]: {
      name: string
      displayText: string
    }
  }
  isSending: boolean
}

const styles = StyleSheet.create({
  textInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  iconButton: {
    width: 24,
    height: 24,
    tintColor: '#979797',
  },
})

const MAX_COMMENT_IMAGE_COUNT = 9
const MAX_COMMENT_TEXT_LENGTH = 768

class CommentBar extends Component<IProps & CommentBarCollapsedProps, IState> {
  static contextType = MediaUploadContext
  context!: React.ContextType<typeof MediaUploadContext>

  textInputRef?: TextInput = null
  selectionStart: number = 0
  selectionEnd: number = 0

  constructor(props: Readonly<IProps & CommentBarCollapsedProps>, context) {
    super(props, context)
    this.state = {
      text: '',
      mentions: {},
      isSending: false,
    }
    this.onChangeText = this.onChangeText.bind(this)
    this.onPressMention = this.onPressMention.bind(this)
    this.onPressSend = this.onPressSend.bind(this)
  }

  isEmpty() {
    return !this.state.text && !(this.context && this.context.medias && this.context.medias.length)
  }

  focus() {
    this.textInputRef && this.textInputRef.focus()
  }

  blur() {
    this.textInputRef && this.textInputRef.blur()
  }

  onPeopleSelected(selected: CCPersonModel[]) {
    const { text, mentions } = this.state

    const newMentions = {}
    let mentionsText = ''
    for (let { username, i18nDisplayName, displayName } of selected) {
      console.log('selected', selected);
      const displayText = i18nDisplayName ? `@${i18nDisplayName}/${username}` : (displayName ? `@${displayName}/${username}` : `@${username}`)
      mentionsText += displayText
      newMentions[username] = {
        name: i18nDisplayName,
        displayText,
      }
    }
    this.setState(
      {
        text: text + mentionsText,
        mentions: { ...mentions, ...newMentions },
      },
      () => this.focus(),
    )
  }

  onChangeText(text) {
    this.setState({ text: text })
  }

  onSelectionChange(start, end) {
    this.selectionStart = start
    this.selectionEnd = end
  }

  onKeyPress(key) {
    switch (key) {
      case 'Backspace': {
        if (this.selectionStart === 0 && this.selectionEnd === 0) {
          this.props.onClearReplyTo()
        }
        break
      }
      default:
        break
    }
  }

  onPressImage(image: UploadFileInfo) {
    const { medias } = this.context
    KNB.previewImage({
      current: image.url,
      urls: medias.map(img => img.url),
    })
  }

  onPressMention() {
    this.blur()
    this.props.onShowPersonPicker()
  }

  async onPressSend() {
    if (this.isEmpty()) {
      return
    }

    let { text, mentions } = this.state
    const images = this.context.medias

    this.setState({ isSending: true })

    // escape html entities
    text = text.replace(
      /[&<>"]/g,
      str =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&#34;',
      }[str] || str),
    )

    // handle user mentions
    const validMentions: { start; end; mis; displayText }[] = []
    for (let [mis, { displayText }] of Object.entries(mentions)) {
      for (let p = 0; p < text.length;) {
        const index = text.indexOf(displayText, p)
        if (index < 0) {
          break
        }
        p = index + displayText.length
        validMentions.push({
          start: index,
          end: p,
          mis: mis,
          displayText: displayText,
        })
      }
    }
    validMentions.sort((m1, m2) => m1.start - m2.start)
    const toUsers = Array.from(new Set(validMentions.map(({ mis }) => mis)))

    let builder = ''
    let p = 0
    for (let { start, end, mis, displayText } of validMentions) {
      builder += text.substring(p, start)
      builder += `<span class="mention" data-denotation-char="@" data-id="${mis}" data-index="0" data-value="${displayText.substring(
        1,
      )}">﻿<span contenteditable="false"><span class="ql-mention-denotation-char">@</span>${displayText.substring(
        1,
      )}</span>﻿</span>`
      p = end
    }
    builder += text.substring(p)

    const html = builder
      .split('\n')
      .map(p => '<p>' + p + '</p>')
      .join('')
      .concat(
        images
          .map(img => `<p><img alt="${img.name}" src="${img.url}" style="max-width: 300px;"/></p>`)
          .join(''),
      )

    const { replyTo, onSentComment } = this.props
    const resp = await pushComment({
      commentType: (replyTo && 'REPLIED') || 'ADDED',
      text: html,
      repliedId: (replyTo && replyTo.id) || 0,
      parentId: (replyTo && replyTo.parentId) || 0,
      repliedMis: (replyTo && replyTo.mis) || '',
      ticketId: this.props.ticketId,
      toUsers: toUsers,
    })
    this.setState({ isSending: false })
    if (resp && resp.code === 200) {
      Toast.open(i18nClient.t('components_comment_9db9a7', { defaultValue: '发送成功' }), {
        icon: <Icon type="success-o" tintColor="#FFF" />,
      })
      this.setState({ text: '', mentions: {} })
      this.context.clear()
      onSentComment && onSentComment(resp.data.id)
    } else {
      Toast.open(
        i18nClient.t('components_comment_9ca6a3', { defaultValue: '发送失败' }) + ((resp && resp.message) || ''),
        {
          icon: <Icon type="error-o" tintColor="#FFF" />
        }
      )
    }
  }

  render() {
    if (!this.props.expanded) {
      return <CommentBarCollapsed {...this.props} />
    }

    const { replyTo, ticketId, hideMis } = this.props
    const { text, isSending } = this.state
    const { uploadFromGallery } = this.context
    const name =
      Boolean(replyTo) && (hideMis ? replyTo.displayName : `${replyTo.displayName}/${replyTo.mis}`)
    const placeholder = replyTo
      ? i18nClient.getFormatText('components_comment_ffc61c',`回复@${name}` ,{ name: name })
      : i18nClient.t('components_comment_21e8e0', { defaultValue: '@提醒TA看评论' })
    return (
      <View
        style={[
          MWSStyle.white,
          {
            flexDirection: 'column',
            paddingHorizontal: 16,
            paddingTop: 12,
          },
        ]}
      >
        <View
          style={[
            styles.textInput,
            {
              flexDirection: 'column',
              justifyContent: 'flex-end',
              minHeight: 82,
              maxHeight: 164,
            },
          ]}
        >
          <TextInput
            ref={ref => (this.textInputRef = ref)}
            style={{ flexShrink: 1, padding: 0 }}
            placeholder={placeholder}
            value={text}
            onChangeText={this.onChangeText}
            multiline={true}
            autoFocus={true}
            maxLength={MAX_COMMENT_TEXT_LENGTH}
            onSelectionChange={({
              nativeEvent: {
                selection: { start, end },
              },
            }) => this.onSelectionChange(start, end)}
            onKeyPress={({ nativeEvent: { key } }) => this.onKeyPress(key)}
          />

          {this.renderImages()}
        </View>

        <View style={[MWSStyle.row, { alignItems: 'center', height: 40 }]}>
          <TouchableOpacity
            onPress={() => {
              if (this.context.medias.length < MAX_COMMENT_IMAGE_COUNT) {
                uploadFromGallery(ticketId, 'comment')
              }
            }}
          >
            <Image source={pictureIcon} style={styles.iconButton} />
          </TouchableOpacity>
          <TouchableOpacity onPress={this.onPressMention}>
            <Image source={atIcon} style={[styles.iconButton, { marginLeft: 16 }]} />
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          {isSending && <ActivityIndicator size={16} color="#FF8800" />}
          <TouchableOpacity
            onPress={this.onPressSend}
            disabled={isSending}
            style={{ paddingLeft: 4, paddingVertical: 4 }}
          >
            <Text style={{ color: '#FF8800' }}>
              {i18nClient.t('components_comment_1535fc', { defaultValue: '发送' })}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  renderImages() {
    const images = this.context.medias
    const { removeUploaded } = this.context

    return (
      <ScrollView overScrollMode="never" style={{ flexShrink: 0, marginTop: 8 }} horizontal={true}>
        <View style={{ flexDirection: 'row' }}>
          {images
            // 排除image为空的情况
            .filter(image => image)
            .map(image => (
              <View style={{ marginRight: 8 }} key={image.id}>
                <TouchableOpacity onPress={() => this.onPressImage(image)}>
                  <Image source={{ uri: image.url }} style={{ width: 60, height: 60 }} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => removeUploaded(image)}
                  style={{
                    width: 24,
                    height: 24,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    position: 'absolute',
                    top: 0,
                    right: 0,
                  }}
                >
                  <Icon type="close" tintColor="#FFF" />
                </TouchableOpacity>
              </View>
            ))}
        </View>
      </ScrollView>
    )
  }
}

export default CommentBar
