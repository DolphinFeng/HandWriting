import { i18nClient, withTranslation } from '@sailor/i18n-mrn'
import React, { Component } from 'react'
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SectionList,
  ImageBackground,
  StyleSheet,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from '@mrn/react-native'
import { MWSStyle } from '@src/common/styles/MWSCommonStyle'
import theme from '@src/common/styles/MWSStyle'
import { Icon, Toast } from '@ss/mtd-react-native'
import {
  getCommentRecord,
  deleteComment,
  searchDisplayNameList,
  getUserInfo,
} from '@tt/constants/TTApi'
import {
  Comment as CommentModel,
  CommentChild,
  CommentItem,
  CommentReplied,
} from '../../constants/TtServiceModule'
import { dStyle } from '@tt/constants/TTStyle'
import CommentBar, { ReplyTo } from './CommentBar'
import avatar from '@images/default-avator.png'
import { getKey } from '@common/helpers/api'
import { formatDate, formatDateWithoutCentury } from '@common/helpers/FormatDate'
import HTMLDisplay from './HTMLDisplay'
import CCPerson from '@tt/components/common/CCPerson'
import {
  NavigationScreenConfig,
  NavigationScreenOptions,
  NavigationScreenProps,
} from '@mrn/react-navigation'

import { MediaUploadProvider } from '@tt/components/comment/MediaUploadContext'
import NavLeftBar from '@components/NavLeftBar'
import HeaderRightBtn from '@components/NavRightButton'
import empty from '@images/empty.png'
import { connectExternalUser, InjectedExternalUserProps } from '../../redux/connectors'

interface ListItem {
  createdAt: number
  createdBy: string
  displayName: string
  repliedId: number
  commentType: string
  id: number
  text: string
  toUsers: any[]
  ticketId: number
  parentId: number

  replied?: CommentReplied
}

interface SectionItem extends ListItem {
  data: CommentChild[]
}

const styles = StyleSheet.create({
  buttonGray: {
    minWidth: 0,
    minHeight: 24,
    borderRadius: 4,
    paddingHorizontal: 8,
    backgroundColor: theme.grayF5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonGrayText: {
    fontSize: 12,
    fontWeight: 'normal',
    color: theme.gray87,
  },
  emptyIcon: {
    width: 60,
    height: 60,
  },
  emptyText: {
    fontWeight: '500',
    fontSize: 18,
    color: 'rgba(0,0,0,0.87)',
    lineHeight: 26,
    marginTop: 22,
  },
})

interface IProps {
  ticketId: number
}

interface IState {
  comment: CommentModel
  refreshing: boolean
  isFetchingMore: boolean
  isInputExpanded: boolean
  replyTo?: ReplyTo
  selfMis: string
  selfName: string
  avatars: Record<string, string>
  showPersonPicker: boolean
  topFromScreen: number
}

interface NavigationParams {
  __title__?: string
  ticketId: number
  tnCallback?: (tn: number) => void
}

// const mockTicketId = 3168353
const PAGE_SIZE = 20

class _Comment extends Component<
  IProps & NavigationScreenProps<NavigationParams> & InjectedExternalUserProps,
  IState
> {
  containerRef?: View
  commentBarRef?: CommentBar

  constructor(props) {
    super(props)
    this.state = {
      refreshing: false,
      isFetchingMore: false,
      comment: null,
      isInputExpanded: false,
      replyTo: null,
      selfMis: null,
      selfName: null,
      avatars: {},
      showPersonPicker: false,
      topFromScreen: 0,
    }
    this.onRefresh = this.onRefresh.bind(this)
    this.onEndReached = this.onEndReached.bind(this)
    this.onPressReply = this.onPressReply.bind(this)
    this.onSentComment = this.onSentComment.bind(this)
    this.onPressDelete = this.onPressDelete.bind(this)
  }

  async componentDidMount() {
    this.onRefresh()
    i18nClient.on('languageChanged', this.setTitle)
    i18nClient.on('languageChanged', this.onRefresh)
  }

  async onRefresh() {
    if (this.state.refreshing) {
      return
    }
    this.setState({ refreshing: true })
    try {
      if (!this.state.selfMis) {
        // do not block
        this.fetchUserInfo()
      }
      const resp = await getCommentRecord(this.props.ticketId, 1, PAGE_SIZE)
      if (resp?.code != null && resp?.code === 200) {
        let data = resp.data as CommentModel
        this.setState({ comment: data })
        const { navigation } = this.props
        if (navigation) {
          navigation.setParams({
            __title__: i18nClient.getFormatText('components_comment_efe55e', `评论(${data.tn})`, {
              slot0: data.tn
            }),
          })
          const tnCallback = navigation.getParam('tnCallback')
          if (typeof tnCallback === 'function') {
            tnCallback(data.tn)
          }
        }
      } else {
        Toast.open(i18nClient.t('components_comment_74da51', { defaultValue: '获取评论失败' }))
      }
    } catch (e) {
      Toast.open(i18nClient.t('components_comment_74da51', { defaultValue: '获取评论失败' }) + e)
    } finally {
      this.setState({ refreshing: false })
      this.fetchAvatars()
    }
  }

  fetchMore() {
    const { comment } = this.state
    if (comment && comment.pn > comment.cn) {
      this.setState({ isFetchingMore: true })
      getCommentRecord(this.props.ticketId, comment.cn + 1, PAGE_SIZE)
        .then(resp => {
          if (resp && resp.code === 200 && resp.data) {
            const data = resp.data as CommentModel
            this.setState({
              comment: { ...data, items: [...comment.items, ...data.items] },
            })
            this.fetchAvatars()
          }
        })
        .finally(() => {
          this.setState({ isFetchingMore: false })
        })
    }
  }

  async fetchUserInfo() {
    try {
      const resp = await getUserInfo()
      if (resp && resp.code === 200 && resp.data) {
        const { username: mis, displayname: name } = resp.data
        if (!mis) {
          Toast.open(
            i18nClient.t('components_comment_dc486e', { defaultValue: '获取用户信息失败' }) +
            (resp?.message || ''),
          )
        } else {
          this.setState({ selfMis: mis, selfName: name })
        }
      }
    } catch (e) {
      Toast.open(
        i18nClient.t('components_comment_dc486e', { defaultValue: '获取用户信息失败' }) + e,
      )
    }
  }

  async fetchAvatars() {
    const misSet = new Set<string>()
    if (this.state.selfMis) {
      misSet.add(this.state.selfMis)
    }
    const comments = this.state.comment && this.state.comment.items
    const avatars = this.state.avatars
    comments &&
      comments.forEach(comment => {
        if (!avatars.hasOwnProperty(comment.createdBy)) {
          misSet.add(comment.createdBy)
        }
        comment.children &&
          comment.children.forEach(reply => {
            if (!avatars.hasOwnProperty(reply.createdBy)) {
              misSet.add(reply.createdBy)
            }
          })
      })
    Object.keys(this.state.avatars).forEach(mis => misSet.delete(mis))
    if (misSet.size > 0) {
      try {
        const resp = await searchDisplayNameList(Array.from(misSet))
        if (resp && resp.code === 200 && resp.data) {
          this.setState({
            avatars: {
              ...this.state.avatars,
              ...Object.entries(resp.data).reduce((ret, [key, { avatar }]) => {
                ret[key] = avatar
                return ret
              }, {}),
            },
          })
        }
      } catch (e) {
        Toast.open(
          i18nClient.t('components_comment_65a995', { defaultValue: '获取用户头像失败' }) + e,
        )
      }
    }
  }
  componentWillUnmount() {
    i18nClient.off('languageChanged', this.setTitle)
    i18nClient.off('languageChanged', this.onRefresh)
  }

  setTitle = () => {
    const title = this.props.navigation.getParam(
      '__title__',
      i18nClient.t('components_comment_55374d', { defaultValue: '评论' }),
    )
    this.props.navigation.setParams({ title })
  }

  onEndReached({ distanceFromEnd }) {
    const { refreshing, isFetchingMore } = this.state
    if (refreshing || isFetchingMore) {
      return
    }
    this.fetchMore()
  }

  onPressReply(item: ListItem) {
    console.log('onPressReply', item)
    this.setState({
      replyTo: {
        displayName: item.displayName,
        mis: item.createdBy,
        id: item.id,
        parentId: item.parentId || item.id,
      },
      isInputExpanded: true,
    })
    this.commentBarRef && this.commentBarRef.focus()
  }

  onSentComment() {
    this.setState({
      isInputExpanded: false,
      replyTo: null,
    })
    this.onRefresh()
  }

  onPressDelete(item: ListItem) {
    console.log('onPressDelete', item)

    Alert.alert(
      null,
      i18nClient.t('components_comment_6b309c', { defaultValue: '确定要删除此条评论吗？' }),
      [
        {
          text: i18nClient.t('components_comment_625fb2', { defaultValue: '取消' }),
          style: 'cancel',
        },
        {
          text: i18nClient.t('components_comment_2f4aad', { defaultValue: '删除' }),
          style: 'destructive',
          onPress: async () => {
            try {
              const resp = await deleteComment(this.props.ticketId, item.id)
              if (resp && resp.code === 200) {
                Toast.open(
                  i18nClient.t('components_comment_0007d1', { defaultValue: '删除成功' }),
                  {
                    icon: <Icon type="success-o" tintColor="#FFF" />,
                  },
                )
                this.onRefresh()
              } else {
                Toast.open(
                  i18nClient.t('components_comment_acf066', { defaultValue: '删除失败' }) +
                  ((resp && resp.message) || ''),
                  {
                    icon: <Icon type="error-o" tintColor="#FFF" />,
                  },
                )
              }
            } catch (e) {
              Toast.open(
                i18nClient.t('components_comment_acf066', { defaultValue: '删除失败' }) + e,
                {
                  icon: <Icon type="error-o" tintColor="#FFF" />,
                },
              )
            }
          },
        },
      ],
    )
  }

  render() {
    const { ticketId } = this.props
    const { refreshing, comment, isInputExpanded, replyTo, avatars, selfMis } = this.state
    const selfAvatar = avatars[selfMis]
    if (!comment) {
      return this.renderLoading()
    }

    let sections: SectionItem[] = comment.items.map(item =>
      Object.assign({}, item, { data: item.children || [] }),
    )

    let commentBar = (
      <CommentBar
        ref={ref => (this.commentBarRef = ref)}
        expanded={isInputExpanded}
        avatarUri={selfAvatar}
        onPressInput={() => this.setState({ isInputExpanded: true })}
        ticketId={ticketId}
        replyTo={replyTo}
        onSentComment={this.onSentComment}
        onClearReplyTo={() => this.setState({ replyTo: null })}
        onShowPersonPicker={() => this.setState({ showPersonPicker: true })}
        hideMis={this.props.isExternalUser}
      />
    )

    return (
      <View style={{ flex: 1 }}>
        <SafeAreaView
          style={{ flex: 1, backgroundColor: 'white' }}
          ref={ref => (this.containerRef = ref)}
          onLayout={() => {
            this.containerRef?.measure((x, y, width, height, pageX, pageY) => {
              this.setState({ topFromScreen: pageY })
            })
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : null}
            keyboardVerticalOffset={this.state.topFromScreen}
            style={{ flex: 1, flexDirection: 'column' }}
          >
            {/*
              The generic parameter for the section type is missed in SectionList typings.
              It is always resolved as SectionListData<ItemT>.
              Therefore, we have to force cast it as the actual type.
              */}
            <SectionList
              overScrollMode="never"
              style={{ flex: 1 }}
              sections={sections}
              keyExtractor={item => '' + item.id}
              stickySectionHeadersEnabled={false}
              renderSectionHeader={({ section }) => this.renderItem(section as ListItem)}
              renderItem={({ item }) => this.renderItem(item)}
              ItemSeparatorComponent={this.renderSeparator}
              SectionSeparatorComponent={this.renderSeparator}
              ListEmptyComponent={this.renderEmpty()}
              ListFooterComponent={this.renderFooter()}
              contentContainerStyle={{ flexGrow: 1 }}
              refreshing={refreshing}
              onRefresh={this.onRefresh}
              onEndReached={this.onEndReached}
              onEndReachedThreshold={0.1}
              onScrollBeginDrag={() => {
                if (this.commentBarRef && this.commentBarRef.isEmpty()) {
                  this.setState({ isInputExpanded: false })
                }
              }}
            />

            <View style={MWSStyle.divider1} />
            <MediaUploadProvider>{commentBar}</MediaUploadProvider>
          </KeyboardAvoidingView>
        </SafeAreaView>
        {this.state.showPersonPicker && (
          <CCPerson
            onCancel={() => this.setState({ showPersonPicker: false })}
            onConfirm={selected => {
              this.setState({ showPersonPicker: false })
              this.commentBarRef && this.commentBarRef.onPeopleSelected(selected)
            }}
          />
        )}
      </View>
    )
  }

  renderLoading() {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#AAA" />
        <Text>{i18nClient.t('components_comment_227bd8', { defaultValue: '努力加载中…' })}</Text>
      </View>
    )
  }

  renderItem(item: ListItem) {
    const { selfMis, avatars } = this.state
    const isReply = item.replied || false
    const indent = isReply ? 32 : 0

    const isExternalUser = this.props.isExternalUser

    const content =
      item.commentType === 'DELETED' ? (
        <Text style={{ color: '#999' }}>
          {i18nClient.t('components_comment_f33b0f', { defaultValue: '该评论已删除' })}
        </Text>
      ) : (
        <>
          {Boolean(item.replied) && (
            <Text>
              {i18nClient.t('components_comment_1edff0', { defaultValue: '回复' })}{' '}
              <Text style={dStyle.FontBold14}>
                {isExternalUser
                  ? item.replied.displayName
                  : `${item.replied.displayName}/${item.replied.name}`}
              </Text>
              ：
            </Text>
          )}

          {/* TODO: filter @mis */}
          <HTMLDisplay html={item.text} />
          <View style={[MWSStyle.row]}>
            <TouchableOpacity style={styles.buttonGray} onPress={() => this.onPressReply(item)}>
              <Text style={styles.buttonGrayText}>
                {i18nClient.t('components_comment_1edff0', { defaultValue: '回复' })}
              </Text>
            </TouchableOpacity>
            {item.createdBy === selfMis && (
              <TouchableOpacity
                style={[styles.buttonGray, { marginLeft: 6 }]}
                onPress={() => this.onPressDelete(item)}
              >
                <Text style={styles.buttonGrayText}>
                  {i18nClient.t('components_comment_2f4aad', { defaultValue: '删除' })}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )
    const avatarUri = isExternalUser ? null : avatars[item.createdBy]
    const name = isExternalUser ? item.i18nDisplayName : (item.i18nDisplayName ? `${item.i18nDisplayName}/${item.createdBy}` : (item.displayName ? `${item.displayName}/${item.createdBy}` : item.createdBy))

    return (
      <View
        style={[
          MWSStyle.row,
          {
            alignItems: 'flex-start',
            marginLeft: indent,
            paddingHorizontal: 16,
            paddingVertical: 8,
          },
        ]}
      >
        <ImageBackground
          source={{ uri: avatarUri }}
          defaultSource={avatar}
          style={{
            height: 24,
            width: 24,
            marginRight: 8,
            borderRadius: 12,
            overflow: 'hidden',
          }}
        />

        <View style={{ flexDirection: 'column', flex: 1 }}>
          <View style={[MWSStyle.rowWrapper, { flex: 1, marginBottom: 8 }]}>
            <Text style={[dStyle.FontBold14]}>{name}</Text>
            <View style={{ flex: 1 }} />
            <Text style={[{ fontSize: 14, color: theme.gray38 }]}>
              {formatDateWithoutCentury(formatDate(item.createdAt))}
            </Text>
          </View>
          {content}
        </View>
      </View>
    )
  }

  renderEmpty() {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Image source={empty} style={styles.emptyIcon} />
        <Text style={styles.emptyText}>
          {i18nClient.t('base_components_4726ff', { defaultValue: '暂无内容' })}
        </Text>
      </View>
    )
  }

  renderSeparator() {
    return <View style={[MWSStyle.divider1, { marginLeft: 48 }]} />
  }

  renderFooter() {
    const { isFetchingMore } = this.state
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          height: 48,
        }}
      >
        {isFetchingMore ? (
          <>
            <ActivityIndicator size="small" color="#AAA" />
            <Text>
              {i18nClient.t('components_comment_227bd8', { defaultValue: '努力加载中…' })}
            </Text>
          </>
        ) : null}
      </View>
    )
  }
}

const Comment = connectExternalUser(_Comment)

const CommentScreen = (props: NavigationScreenProps<NavigationParams>) => (
  <Comment ticketId={props.navigation.getParam('ticketId')} {...props} />
)

// const navigationOptions: NavigationScreenConfig<NavigationScreenOptions> = ({ navigation }) => ({
//   title: navigation.getParam(
//     '__title__',
//     i18nClient.t('components_comment_55374d', { defaultValue: '评论' }),
//   ),
//   headerStyle: MWSStyle.headerStyle,
//   headerTitleStyle: MWSStyle.headerTitleStyle,
//   gesturesEnabled: true,
//   headerLeft: (
//     <TouchableOpacity
//       onPress={() => {
//         navigation.navigate('Detail', {})
//       }}
//     >
//       <Icon type="left" style={{ height: 20, width: 20, marginLeft: 12 }} />
//     </TouchableOpacity>
//   ),

//   headerBackTitle: null,
//   headerRight: (
//     <HeaderRightBtn
//       pageType={2}
//       pageInfo={{
//         name: 'TT',
//         brief: i18nClient.t('components_detail_ab47e6', { defaultValue: 'TT详情' }),
//         listLink: '',
//         detailLink:
//           getKey('env') === 'test'
//             ? `http://tt.cloud.test.sankuai.com/ticket/detail?id=${navigation.getParam(
//               'ticketId',
//               0,
//             )}`
//             : `https://tt.sankuai.com/ticket/detail?id=${navigation.getParam('ticketId', 0)}`,
//         lxCopyKey: '',
//         lxShareListKey: '',
//         lxShareDetailKey: '',
//       }}
//     />
//   ),
// })
// CommentScreen.navigationOptions = navigationOptions

// export default CommentScreen

export default withTranslation('', {
	withRef: true
})(CommentScreen);