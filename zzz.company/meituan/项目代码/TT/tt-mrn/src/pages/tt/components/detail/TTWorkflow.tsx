import { i18nClient } from '@sailor/i18n-mrn'
/**
 * SLA 状态变化
 */

import React, { Component, Fragment } from 'react'
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from '@mrn/react-native'
import { dStyle } from '../../constants/TTStyle'
import {
  TicketStateMap
} from '../../constants/ConfigMap'
import { TicketDetail, UintModal, Level, RootTree } from '../../constants/TTServiceModule'
import {
  updateTicket,
  getGroupInfo,
  addMember,
  addScore,
  getCategoryTree,
  getAuthSpaceCti,
  getCommentRecord,
  getUserInfo,
  getTicketTime,
  getTicketDetail,
  getCtiVersion,
  inviteUserToChat,
  getTicketDetailPermission,
  getNonWorkSetting,
  getRgUser,
  getRgReplyField,
  getRgSetting,
  getCloseReasonList,
} from '../../constants/TTApi'
import {
  TopViewManager,
  SlideModal,
  Toast,
  Tab,
  Button,
  Input,
  ActionSheet,
  Dialog,
  Scrollpicker
} from '@ss/mtd-react-native'
import comment from '@images/comment-fill.png'
import group from '@images/group-fill.png'
import ellipsis from '@images/ellipsis.png'
import { MWSButton } from '@src/components/MWSButton'
import KNB from '@mrn/mrn-knb'
import { BottomCancelBtn } from '@src/components/BottomCancelBtn'
import { Satisfy } from './Satisfy'
import { CreateChat } from './CreateChat'
import { NavigationScreenProps } from '@mrn/react-navigation'
import { ttSlideModal, isXiaoXiang } from '../common/TTHelper'
import { TTDetailContext } from './DetailContext'
import { openAssignModal } from './AssignModal'
import { openCreateReason } from './CreateReason'
import { ttTrackDetailClick, TTKeys } from '../../constants/TTKeys'
import { OpenReason } from './OpenReason'
import HTMLDisplay from '../comment/HTMLDisplay'
import { connectExternalUser, InjectedExternalUserProps } from '../../redux/connectors'
interface IProps {
  ticketId: number
  // data: TicketDetail
  // callbackDetail: (detail) => void
  callbackAssign: (UintModal, needInvite: boolean) => void
  // callbackSatisfy: (any) => void
}

interface IState {
  hasDxGroup: boolean
  currentScore: 'satisfied' | 'common' | 'Dissatisfied'
  suggest: string
  // showChat: boolean
  tree: Array<RootTree>
  totalComment?
  currentUser: string
  // currentServiceCategory: UintModal
  currentState: string
  isSelectDisabled: boolean
  showCustomStatus: string
  pageNum: number
  pageSize: number
  // searchKeyword: string
  closeReasons: any[]
  pendingReasons: any[]
}

// const { width, height } = Dimensions.get('screen')

// const NON_WORK_BTN_TIP = i18nClient.t('components_detail_6b3bdc', {
//   defaultValue: '当前为非工作时间，请您耐心等待，马上就会有人来帮您处理哦～',
// })

// const NON_WORK_GLOBAL_TIP_DEFAULT = i18nClient.t('components_detail_2e586d', {
//   defaultValue: '您好，您的问题已收到，我们将在工作时间立刻为您处理，请您耐心等待～',
// })

class _TTWorkFlow extends Component<
  IProps & NavigationScreenProps & InjectedExternalUserProps,
  IState
> {
  static contextType = TTDetailContext
  context!: React.ContextType<typeof TTDetailContext>

  moreInstance: TopViewManager // 负责more 入口
  otherInstance: TopViewManager // 负责关闭、暂停等

  // 客户端重排按钮位置，区分最左边和最右边按钮
  _more = []
  _right = []

  // 群按钮需要客户端自己判断
  _chatRoomId: number = 0
  _chatMembers: string[]
  // 是否为TT历史群
  _isFromTicket: boolean = false

  _permissionItems: any = null

  _isWorkHour: boolean = true

  // closeReasons: any = []
  // pendingReasons: any = []
  pendingTimeSwitch: boolean = false
  pendingTime: any = null
  timeUnit: string = ''
  menuItems: Array<{ value: number, label: string }> = [];

  constructor(props: IProps & NavigationScreenProps & InjectedExternalUserProps, context) {
    super(props, context)

    this.state = {
      hasDxGroup: false,
      currentScore: null,
      suggest: '',
      // showChat: false,
      tree: [],
      currentUser: '',
      // currentServiceCategory: {...this.context.ticketDetail, selected: Level.item}
      currentState: '',
      pageNum: 1,
      pageSize: 20,
      // searchKeyword: '',
      closeReasons: [],
      pendingReasons: [],
    }
  }

  componentDidMount() {
    this.checkSatisfyPanel()
    this.updateGroupInfo()
    // 获取cti服务目录 先放这个时机
    this.fetchTrees()
    this.fetchTotalComment()
    this.fetchCurrentUser()
    this.getNonWorkingState()
    // this.getRgCloseReasons(this.context?.ticketDetail?.rgId)
    this.loadMoreCloseReasons(this.context?.ticketDetail?.rgId)
    this.getRgPendingReasons(this.context?.ticketDetail?.rgId)
    this.getRgPendingTimeSwitch(this.context?.ticketDetail?.rgId)
    // this.loadMorePendingReasons(this.context?.ticketDetail?.rgId)
    this.getStatuses(this.context?.ticketDetail?.rgId)
    this.getCurrentState()
    this.getTicketDetailPermission()
  }

  async getCurrentState() {
    try {
      const tRes = await getTicketDetail(this.props.ticketId);
      if (tRes?.code === 200 && tRes?.data) {
        this.setState({
          currentState: tRes.data.customStatusDisplayName
        });
        console.log('现在的状态', this.state.currentState);
      }
    } catch (e) {
      Toast.open(i18nClient.t('components_detail_5fa802', { defaultValue: '操作失败' }));
    }
  }

  async getStatuses (rgId) {
    rgId &&
      getRgReplyField({
        rgId: parseInt(rgId, 10),
        type: 'CUSTOM_STATUS',
      })
        .then(res => {
          if (res?.code === 200 && res?.data) {
            this.menuItems = res?.data?.items?.map(item => {
              return {
                label: item.content,
                value: item.id,
              }
            })
          }
        })
        .catch(e => {
          console.log('获取RG状态失败 ' + e)
        })
  }

  checkSatisfyPanel() {
    const { state } = this.context.ticketDetail

    if (
      this.context?.showSatisfy &&
      (state?.name === '已关闭' || state?.name === '已解决') &&
      this.context.score === null
    ) {
      this.openSatisfy()
    }
  }

  updateGroupInfo() {
    getGroupInfo(this.props.ticketId)
      .then(res => {
        if (res?.code === 200 && res?.data) {
          const { data } = res
          console.log('chat room info: ' + JSON.stringify(res))
          if (data?.status === 'CREATED' || data?.status === 'DISBANDED') {
            this._chatRoomId = data.group?.groupId || 0
            this._chatMembers = data.group?.members.map(mem => mem.userId) || []
            this._isFromTicket = data.group?.isTicket || false
          }
          this.setState({
            hasDxGroup: data?.status === 'CREATED' ? true : false,
          })
        }
      })
      .catch(e => {
        console.warn('room info error', e)
      })
  }

  getNonWorkingState() {
    getNonWorkSetting(parseInt(this.context.ticketDetail.rgId, 10), true)
      .then(res => {
        if (res?.code && res?.code === 200 && res?.data?.active === true) {
          this._isWorkHour = res.data.isWorkHour
        }
        console.log('123', this._isWorkHour)
      })
      .catch(e => {
        console.log('获取RG工作状态失败', e)
      })
  }
  // 获取树形数据
  async getTreeData(requestParam: any) {
    try {
      const res = await getAuthSpaceCti(
        {
          domain: 'ticket', // 流转场景下直接传ticket，会包含私有空间目录
          isMainSpace: true,
        },
        requestParam,
      )
      if (res.data && res.code === 200) {
        return res.data.items || []
      }
      return []
    } catch (error) {
      console.log(error)
      return []
    }
  }
  async fetchTrees() {
    // 根据当前工单所属目录，请求路径上的tree
    const { categoryId, typeId, itemId } = this.context.ticketDetail
    let requestParam = {}
    if (categoryId && typeId && itemId) {
      requestParam = {
        categoryIds: [categoryId],
        typeIds: [typeId],
      }
    }
    const treeData = await this.getTreeData({
      ...requestParam,
      createScene: false,
    })
    this.setState({ tree: treeData as Array<RootTree> })
  }

  fetchTotalComment() {
    getCommentRecord(this.props.ticketId, 1, 1)
      .then(resp => {
        if (resp && resp.code === 200 && resp.data) {
          this.setState({ totalComment: resp.data.tn })
        }
      })
      .catch(e => {
        console.log('getCommentRecord ' + e)
      })
  }

  fetchCurrentUser() {
    const { handleCurrentUser } = this.context
    getUserInfo()
      .then(res => {
        if (res?.code === 200 && res?.data) {
          this.setState({ currentUser: res.data.username })
          handleCurrentUser(res.data.username)
        }
      })
      .catch(e => { })
  }

  async getRgCloseReasons(rgId) {
    rgId &&
      getRgReplyField({
        rgId: parseInt(rgId, 10),
        type: 'CLOSED_REASON',
      })
        .then(res => {
          if (res?.code === 200 && res?.data) {
            this.setState({
                closeReasons: res?.data?.items?.map(item => ({
                  label: item.displayName,
                  content: item.content,
                  value: item.id,
              })),
            });
          }
        })
        .catch(e => {
          console.log('获取RG回复失败 ' + e)
        })
  }

  async loadMoreCloseReasons(rgId, query?: string) {
    if (!rgId) return;
  
    try {
      const res = await getCloseReasonList({
        rgId: parseInt(rgId, 10),
        type: 'CLOSED_REASON',
        content: query || '',
        pageNum: this.state.pageNum,
        pageSize: this.state.pageSize
      });
      if (res?.code === 200 && res?.data) {
        const { items } = res.data;
        this.setState({
          closeReasons: res?.data?.items?.map(item => ({
            label: item.displayName,
            content: item.content,
            value: item.id,
        })),
      });
      }
    } catch (e) {
      console.log('获取RG回复失败 ' + e);
    }
  }

  async loadMorePendingReasons(rgId, query?: string) {
    if (!rgId) return;
  
    try {
      const res = await getCloseReasonList({
        rgId: parseInt(rgId, 10),
        type: 'PENDING_REASON',
        content: query || '',
        pageNum: this.state.pageNum,
        pageSize: this.state.pageSize
      });
      if (res?.code === 200 && res?.data) {
        const { items } = res.data;
        this.setState({
          pendingReasons: res?.data?.items?.map(item => ({
            label: item.displayName,
            content: item.content,
            value: item.id,
        })),
      });
      }
    } catch (e) {
      console.log('获取RG回复失败 ' + e);
    }
  }
  


  async getRgPendingReasons(rgId) {
    rgId &&
      getRgReplyField({
        rgId: parseInt(rgId, 10),
        type: 'PENDING_REASON',
      })
        .then(res => {
          if (res?.code === 200 && res?.data) {
            this.setState({
              pendingReasons: res?.data?.items?.map(item => ({
                label: item.displayName,
                content: item.content,
                value: item.id,
            })),
          });
          }
        })
        .catch(e => {
          console.log('获取RG回复失败 ' + e)
        })
  }

  async getRgPendingTimeSwitch(rgId) {
    rgId &&
      getRgSetting(rgId)
        .then(res => {
          if (res?.code === 200 && res?.data) {
            this.pendingTimeSwitch = res.data.pendingTimeSwitch
          }
        })
        .catch(e => {
          console.log('获取pendingTimeSwitch失败 ' + e)
        })
  }

  render() {
    console.log('render ttworkflow --------------')
    const { totalComment } = this.state
    this.reorganizate()
    const { ticketOperate } = this.context
    const groupOperator = ticketOperate?.detailOperate?.createChatRoom !== 'editable'
    // 允许外部账号建群
    // const disableGroup = this.props.isExternalUser || groupOperator
    return (
      <View
        style={{
          flexDirection: 'row',
          height: 56,
          alignItems: 'center',
          marginRight: 8,
        }}
      >
        {(this._more.length <= 0 && this.state.showCustomStatus === 'disabled')
          ? null
          : this.renderImageFlow(
            i18nClient.t('components_create_0ec9ea', { defaultValue: '更多' }),
            ellipsis,
            '更多'
          )}
          {/* {
            this.renderImageFlow(
              i18nClient.t('components_create_0ec9ea', { defaultValue: '更多' }),
              ellipsis,
              '更多'
            )
          } */}
        {this.renderImageFlow(
          typeof totalComment === 'number'
            ? i18nClient.getFormatText('components_detail_9963bd', `评论(${totalComment})`, {
              totalComment: totalComment,
            })
            : i18nClient.t('components_comment_55374d', { defaultValue: '评论' }),
          comment,
          '评论'
        )}
        {groupOperator
          ? null
          : this.renderImageFlow(
            this.state.hasDxGroup
              ? i18nClient.t('components_detail_caad09', { defaultValue: '已建群' })
              : i18nClient.t('components_detail_528c6b', { defaultValue: '创建群聊' }),
            group,
            this.state.hasDxGroup ? '已建群' : '创建群聊',
          )}

        {this.renderSatisfyOrAssign()}

        {this._right.map((item, index) => {
          return (
            <MWSButton
              key={index}
              wrapperStyles={[dStyle.flowBtn, { backgroundColor: '#FFC300', marginRight: 8 }]}
              txtStyle={dStyle.Font14by84}
              btnText={i18nClient.t(TicketStateMap[item.name].text_code)}
              onPress={() => this.handleClick(TicketStateMap[item.name].text)}
            />
          )
        })}

        {/* {
             this.renderChat()
           } */}
      </View>
    )
  }

  renderSatisfyOrAssign() {
    const { reporter, state } = this.context.ticketDetail
    console.log('wwww' + this.state.currentUser)
    if (
      state?.name === '已关闭' ||
      state?.name === '已解决'
    ) {
      // 自己是发起人
      if (this.checkSatisfyBtn()) {
        return this.satisfyEnter()
      } else {
        return this.assignEnter()
      }
    } else {
      return this.assignEnter()
    }
  }

  checkSatisfyBtn() {
    const { reporter } = this.context.ticketDetail
    const showSatisfyButton = this.context.ticketOperate?.detailOperate?.evaluation !== 'disabled'
    // 新增：rg关闭评价功能后，隐藏按钮
    return this.state.currentUser === reporter && this.context.score === null && showSatisfyButton
  }

  satisfyEnter() {
    return (
      <MWSButton
        wrapperStyles={[dStyle.flowBtn, { backgroundColor: '#FFC300', marginRight: 8 }]}
        txtStyle={dStyle.Font14by84}
        btnText={i18nClient.t('components_detail_606120', { defaultValue: '评价' })}
        onPress={() =>
          this.handleClick('评价')
        }
      />
    )
  }

  assignEnter() {
    // https://km.sankuai.com/page/597021387
    const { ticketOperate } = this.context
    const circulationOperator = ticketOperate?.detailOperate?.circulation !== 'editable'
    if (circulationOperator) return null
    // https://km.sankuai.com/page/471640319
    return (
      <MWSButton
        wrapperStyles={[dStyle.flowBtn, { backgroundColor: '#rgba(0,0,0,0.84)', marginRight: 8 }]}
        txtStyle={dStyle.Font14byFF}
        btnText={i18nClient.t('components_detail_54b17a', { defaultValue: '流转' })}
        onPress={() =>
          this.handleClick('流转')
        }
      />
    )
  }

  reorganizate() {
    // 状态机
    const { state, nextStates, assigned, cc } = this.context.ticketDetail
    const { currentUser } = this.state
    const { ticketOperate } = this.context
    this._more = []
    this._right = []
    const disabledDoing = ticketOperate?.detailOperate?.doingTicket === 'disabled'
    const disabledPend = ticketOperate?.detailOperate?.pendTicket === 'disabled'
    const disabledClose = ticketOperate?.detailOperate?.closeTicket === 'disabled'
    const disabledDone = ticketOperate?.detailOperate?.doneTicket === 'disabled'
    // 兼容“处理中-ONES”、“暂停中-ONES”的状态
    const stateName = state.name?.split('-')[0]
    switch (stateName) {
      case '未处理':
        if (!disabledClose) {
          this._more.push({
            name: '已关闭',
            description: i18nClient.t('components_detail_9c5850', { defaultValue: '已关闭' }),
          })
        }
        if (!disabledPend) {
          this._more.push({
            name: '暂停中',
            description: i18nClient.t('components_detail_741acc', { defaultValue: '暂停中' }),
          })
        }
        if (!disabledDoing) {
          this._right = [
            {
              name: '处理中',
              description: i18nClient.t('components_detail_5d459d', { defaultValue: '处理中' }),
            },
          ]
        }
        break
      case '开始处理':
      case '重新打开':
        // 重新打开 - 处理中
        // 开始处理 - ?
        // this._right = nextStates
        if (!disabledDoing) {
          this._right = [
            {
              name: '处理中',
              description: i18nClient.t('components_detail_5d459d', { defaultValue: '处理中' }),
            },
          ]
        }
        break
      case '处理中':
        if (!disabledClose) {
          this._more.push({
            name: '已关闭',
            description: i18nClient.t('components_detail_9c5850', { defaultValue: '已关闭' }),
          })
        }
        if (!disabledPend) {
          this._more.push({
            name: '暂停中',
            description: i18nClient.t('components_detail_741acc', { defaultValue: '暂停中' }),
          })
        }
        if (!disabledDone) {
          this._right = [
            {
              name: '已解决',
              description: i18nClient.t('components_detail_d7d257', { defaultValue: '已解决' }),
            },
          ]
        }
        break
      case '暂停中':
      case '挂起中':
        if (!disabledClose) {
          this._more = [
            {
              name: '已关闭',
              description: i18nClient.t('components_detail_9c5850', { defaultValue: '已关闭' }),
            },
          ]
        }
        if (!disabledDoing) {
          this._right = [
            {
              name: '处理中',
              description: i18nClient.t('components_detail_5d459d', { defaultValue: '处理中' }),
            },
          ]
        }
        break
      case '已解决':
        this._more = [
          {
            name: '重新打开',
            description: i18nClient.t('components_detail_72db77', { defaultValue: '重新打开' }),
          },
        ]
        if (!disabledClose) {
          this._right = [
            {
              name: '已关闭',
              description: i18nClient.t('components_detail_9c5850', { defaultValue: '已关闭' }),
            },
          ]
        }
        break
      case '已关闭':
        this._right = [
          {
            name: '重新打开',
            description: i18nClient.t('components_detail_72db77', { defaultValue: '重新打开' }),
          },
        ]
        break
    }
    if (this.state.showCustomStatus !== 'disabled') {
      this._more.push({ name: '添加自定义状态', description: i18nClient.t('add_custom_state', { defaultValue: '添加自定义状态' }) })
    }
  }

  renderImageFlow(txt, img, clickTxt?) {
    return (
      <TouchableOpacity
        onPress={() => this.handleClick(clickTxt || txt)}
        style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}
      >
        <Image source={img} style={{ height: 22, width: 22, marginBottom: 4 }} />

        <Text style={dStyle.FlowBtn}>{txt}</Text>
      </TouchableOpacity>
    )
  }

  handleClick = flowTxt => {
    console.log('flowTxt ==========', flowTxt)
    switch (flowTxt) {
      case '更多':
        this.flowActionSheet()
        ttTrackDetailClick(TTKeys.DetailClick.moreBtn)
        break
      case '评论':
        this.props.navigation.push('Comment', {
          ticketId: this.props.ticketId,
          tnCallback: (tn: number) => this.setState({ totalComment: tn }),
        })
        ttTrackDetailClick(TTKeys.DetailClick.comment)
        break
      case '创建群聊':
        this.renderChat()
        ttTrackDetailClick(TTKeys.DetailClick.createChat)
        break
      case '已建群':
        this.handleEnterGroup()
        ttTrackDetailClick(TTKeys.DetailClick.enterChat)
        break
      case '流转':
        this.openAssignSelection()
        ttTrackDetailClick(TTKeys.DetailClick.assign)
        break
      case '评价':
        this.openSatisfy()
        ttTrackDetailClick(TTKeys.DetailClick.satisfy)
        break
      case '处理完成':
        this.handleReslove()
        ttTrackDetailClick(TTKeys.DetailClick.finishTT)
        break
      case '开始处理':
        updateTicket(this.props.ticketId, {
          state: '处理中' // 接口传递需要中文
        })
          .then(res => this.updateDetail(res))
          .catch(e => { })
        ttTrackDetailClick(TTKeys.DetailClick.beginTT)
        break
      case '重新处理':
        this.reopenReason()
        ttTrackDetailClick(TTKeys.DetailClick.reopen)
        break
      case '暂停TT':
        this.otherActionSheet(
          i18nClient.t('components_detail_7b8c6d', { defaultValue: '选择暂停原因' }),
          '暂停TT',
          this.state.pendingReasons,
        )
        // let titleTxt2 = i18nClient.t('components_detail_7b8c6d', { defaultValue: '选择暂停原因' })
        // this.openReasonSelection(titleTxt2, this.state.pendingReasons)
        ttTrackDetailClick(TTKeys.DetailClick.pauseTT)
        break
      case '关闭TT':
        ttTrackDetailClick(TTKeys.DetailClick.closeTT)
        if (this.requireArchive() || this.requireLabel()) {
          break
        }
        let titleTxt1 = i18nClient.t('components_detail_9453fa', { defaultValue: '选择关闭原因' })
        this.openReasonSelection(titleTxt1, this.state.closeReasons)
        break
      case '添加自定义状态':
        if (!this.state.isSelectDisabled) {
          this.otherActionSheet(
            i18nClient.t('components_detail_S_C_S', { defaultValue: '选择自定义状态' }),
            '添加自定义状态',
            this.menuItems,
          )
        }
        break
    }
  }

  updateDetail(res) {
    const { handleTicketDetail } = this.context
    if (res?.code === 200 && res?.data) {
      // this.props.callbackDetail(res.data)
      // update接口数据不全，update后需要重新拉取详情
      getTicketDetail(this.props.ticketId)
        .then(tRes => {
          if (tRes?.code === 200 && tRes?.data) {
            this.getCurrentState()
            handleTicketDetail(tRes.data)
            Toast.open(i18nClient.t('components_detail_33130f', { defaultValue: '操作成功' }))
            this.updateSLADesc()
            this.updateTicketPermission()
          }
        })
        .catch(e => {
          Toast.open(i18nClient.t('components_detail_8ac03c', { defaultValue: '获取新的详情失败' }))
        })
    } else {
      Toast.open(i18nClient.t('components_detail_5fa802', { defaultValue: '操作失败' }))
    }
  }
  getTicketDetailPermission() {
    const { ticketDetail, handleTicketOperate } = this.context
    getTicketDetailPermission(ticketDetail.id)
      .then(res => {
        if (res?.code === 200 && res?.data?.detailOperate) {
          this.setState({
            isSelectDisabled: res.data.detailOperate.customStatus !== 'editable',
            showCustomStatus: res.data.detailOperate.customStatus
          })
        }
      })
      .catch(e => {
        console.log('ticket - operate', e)
      })
  }
  updateTicketPermission() {
    const { ticketDetail, handleTicketOperate } = this.context
    getTicketDetailPermission(ticketDetail.id)
      .then(res => {
        if (res?.code === 200 && res?.data?.detailOperate) {
          handleTicketOperate(res?.data)
        }
      })
      .catch(e => {
        console.log('ticket - operate', e)
      })
  }
  updateSLADesc() {
    // sla -1 被动更新
    const { ticketDetail, handleSLATime } = this.context
    getTicketTime(ticketDetail.id)
      .then(res => {
        if (res?.code === 200 && res?.data) {
          handleSLATime(res.data)
        }
      })
      .catch(e => {
        console.log('sla - 1', e)
      })
  }

  /**
   * 需要先进行问题归档，再关闭工单
   */
  requireArchive() {
    const { rgPermission, rgArchiveInfo, ticketDetail } = this.context
    const archiveId = Number.parseInt(ticketDetail.archiveId, 10)
    if (
      rgArchiveInfo?.active /* Rg启用了问题归档 */ &&
      rgPermission?.archiveRequire /* Rg设置了工单必须归档才能关闭 */ &&
      archiveId === 0 /* 工单未归档 */
    ) {
      Toast.open(i18nClient.t('components_detail_2d7777', { defaultValue: '请先选择问题归档' }))
      return true
    }
  }
  requireLabel() {
    const { rgPermission, ticketDetail } = this.context
    const hasLabels = ticketDetail?.labels?.length
    if (rgPermission?.labelRequired /* Rg设置了标签必填 */ && !hasLabels /* 工单未选择标签 */) {
      Toast.open(i18nClient.t('components_detail_795f6e', { defaultValue: '请先选择标签' }))
      return true
    }
  }

  handleReslove() {
    if (this.requireArchive() || this.requireLabel()) {
      return
    }
    Dialog.prompt({
      header: i18nClient.t('components_detail_e56c9b', { defaultValue: '完成问题处理' }),
      message: '',
      placeholder: i18nClient.t('components_detail_408884', { defaultValue: '请输入处理方案' }),
      cancelLabel: i18nClient.t('components_detail_625fb2', { defaultValue: '取消' }),
      wrapperStyles: {
        width: 284,
      },
      inputStyle: {
        width: 236,
        height: 'auto',
        paddingTop: 12,
        paddingBottom: 12,
      },
      inputWrapperStyle: {
        paddingTop: 4,
      },
      styles: {
        btnConfirmText: {
          color: '#FF8800',
        },
      },
      cancelCallback: info => {
        console.warn('cancle ' + info)
      },
      confirmLabel: i18nClient.t('components_detail_e83a25', { defaultValue: '确认' }),
      confirmCallback: info => {
        const value = info?.inputValue
        updateTicket(this.props.ticketId, {
          state: '已解决', // 后端需要中文状态，不翻译
          resolution: value,
        })
          .then(res => this.updateDetail(res))
          .catch(e => { })
      },
      modalProps: {
        containerStyles: {
          alignItems: 'center',
        },
        keyboardBehavior: Platform.OS === 'ios' ? 'padding' : null,
        keyboardVerticalOffset: 88,
      },
    })
  }

  async flowActionSheet() {
    this.getTicketDetailPermission()
    await this.getCurrentState()
    this.getStatuses(this.context?.ticketDetail?.rgId)
    this.moreInstance = ActionSheet.open({
      options: this.transferMoreFlow().map(item => {
        // 添加 noAutoClose 属性到需要的选项
        if ((item.label === '添加自定义状态' && this.state.isSelectDisabled) || (item.label === `自定义状态：${this.state.currentState}` && this.state.isSelectDisabled)) {
            return { ...item, noAutoClose: true };
        }
        return item;
      }),
      modalProps: {
        maskClosable: true,
        onClose: data => this.moreInstance.close(),
        containerStyles: {
          borderTopRightRadius: 10,
          borderTopLeftRadius: 10,
        },
      },
      footer: <BottomCancelBtn handlePress={() => this.moreInstance.close()} />,
      renderItem: (item, index) => {
        let itemStyle = {};
        if ((item.label === '添加自定义状态' && this.state.showCustomStatus === 'disabled') || (item.label === `自定义状态：${this.state.currentState}` && this.state.showCustomStatus === 'disabled')) {
          return null; // 隐藏选项
        }
        if ((item.label === '添加自定义状态' && this.state.isSelectDisabled) || (item.label === `自定义状态：${this.state.currentState}` && this.state.isSelectDisabled)) {
          itemStyle = { color: "#999" };
        }
        return (
          <View key={index}>
            <Text style={itemStyle}>{item.label}</Text>
          </View>
        );
      },
      confirmCallback: item => {
        switch (item.value) {
          case '重新处理':
            this.reopenReason()
            break
          case '关闭TT':
            if (this.requireArchive() || this.requireLabel()) {
              break
            }
            let titleTxt1 = i18nClient.t('components_detail_9453fa', { defaultValue: '选择关闭原因' })
            this.openReasonSelection(titleTxt1, this.state.closeReasons)
            break
          case '暂停TT':
            if (this.pendingTimeSwitch) {
              this.renderPendingTimeModal()
            } else {
              this.otherActionSheet(
                i18nClient.t('components_detail_7b8c6d', { defaultValue: '选择暂停原因' }),
                '暂停TT',
                this.state.pendingReasons,
              )
            }
            break
          case '进入大象群聊':
            this.handleEnterGroup()
            break
          case '添加自定义状态':
            if (this.state.showCustomStatus === 'editable') {
              this.otherActionSheet(
                i18nClient.t('components_detail_S_C_S', { defaultValue: '选择自定义状态' }),
                '添加自定义状态',
                this.menuItems,
              )
            }
            break
        }
      },
      cancelCallback: () => { },
    })
  }

  transferMoreFlow() {
    let moreOptions = []
    let currentState = this.state.currentState
    this._more.map((item, index) => {
      let label;
      if (TicketStateMap[item.name].text_code === 'add_custom_state') {
        if (currentState) {
          label = `自定义状态：${currentState}`
        } else {
          label = '添加自定义状态'
        }
      } else {
        label = i18nClient.t(TicketStateMap[item.name].text_code)
      }
      moreOptions.push({ label: label, value: TicketStateMap[item.name].text })
    })
    return moreOptions
  }  

  handleEnterGroup() {
    if (
      this.state.currentUser != null &&
      this._chatMembers.length > 0 &&
      this._chatMembers.indexOf(this.state.currentUser) < 0
    ) {
      Dialog.alert({
        message: i18nClient.t('components_detail_5fc994', {
          defaultValue: '是否加入问题处理大象群？',
        }),
        modalProps: {
          maskOpacity: 0.1,
          maskClosable: true,
        },
        cancelLabel: i18nClient.t('components_detail_625fb2', { defaultValue: '取消' }),
        cancelCallback: () => { },
        confirmLabel: i18nClient.t('components_home_38cf16', { defaultValue: '确定' }),
        confirmCallback: () => {
          this.inviteAndUpdateGroup([this.state.currentUser], true)
        },
      })
      return
    }
    this.enterDxChat()
  }

  inviteAndUpdateGroup(userList, enter: boolean) {
    if (this._isFromTicket) {
      // 历史群调用TT拉人接口
      inviteUserToChat({
        ticketId: this.props.ticketId,
        roomId: this._chatRoomId,
        userList: userList,
      })
        .then(res => {
          if (res?.code === 200 && res?.data) {
            if (enter === true) {
              this.enterDxChat()
            }
          }
        })
        .catch(e => { })
    } else {
      addMember({
        groupId: this._chatRoomId,
        memberIds: userList,
      })
        .then(res => {
          if (res?.code === 200 && res?.message === 'SUCCESS') {
            if (enter === true) {
              this.enterDxChat()
            }
            this.updateGroupInfo()
          }
        })
        .catch(e => { })
    }
  }

  enterDxChat() {
    // TODO 第三方App请验证
    if (isXiaoXiang()) {
      Toast.open(i18nClient.t('components_detail_01f46e', { defaultValue: '请至大象查看' }))
    }
    let dxUrl = `mtdaxiang://www.meituan.com/chat?gid=${this._chatRoomId}`
    console.warn('dxurl ' + dxUrl)
    KNB.use('openScheme', {
      url: dxUrl,
      success: function () {
        console.warn('enter group success')
      },
      fail: function () {
        console.warn('enter group error')
      },
    })
  }

  openSatisfy() {
    const satisfyInstance = ttSlideModal(
      <Satisfy
        ticketId={this.props.ticketId}
        rgId={this.context.ticketDetail.rgId}
        onCancel={() => {
          satisfyInstance.close()
        }}
        onSubmitSuccess={info => {
          satisfyInstance.close()
          // this.setState({currentScore: info.Satisfy})
          this.context.handleScore(info)
          // this.props.callbackSatisfy(info)
        }}
      />,
    )
  }

  reopenReason() {
    const { ticketOperate } = this.context
    if (ticketOperate?.detailOperate?.reopen) {
      // reopen未获取到值时，disabledReopen为FALSE，可能会令无权限的用户重新打开工单
      const disabledReopen = ticketOperate?.detailOperate?.reopen === 'disabled'
      if (disabledReopen) {
        this.disableReopenDialog()
        return
      }
      const openReasonInstance = ttSlideModal(
        <OpenReason
          ticketId={this.props.ticketId}
          onCancel={() => {
            openReasonInstance.close()
          }}
          onSubmitSuccess={info => {
            openReasonInstance.close()
            console.log('reason ', info)
            updateTicket(this.props.ticketId, {
              state: '重新打开', // 后端需要中文不翻译
              reopenReason: info,
            })
              .then(res => this.updateDetail(res))
              .catch(e => { })
          }}
        />,
      )
    }
  }

  disableReopenDialog() {
    Dialog.alert({
      title: i18nClient.t('components_detail_06a95e', { defaultValue: '请重新发起工单' }),
      message: i18nClient.t('components_detail_413abe', {
        defaultValue: '您好，当前处理组不支持重新打开工单，请您重新提问。',
      }),
      modalProps: {
        maskOpacity: 0.1,
        maskClosable: true,
      },
      cancelLabel: i18nClient.t('components_detail_625fb2', { defaultValue: '取消' }),
      cancelCallback: () => { },
      confirmLabel: i18nClient.t('components_detail_c9d7e2', { defaultValue: '重新提问' }),
      confirmCallback: () => {
        const { categoryId, typeId, itemId } = this.context.ticketDetail

        const params = {
          cid: categoryId,
          tid: typeId,
          iid: itemId,
        }
        this.props.navigation.push('CreateNewTT', {
          extra: params,
        })
      },
    })
  }

  openAssignSelection() {
    console.log('open assign')
    const { categoryId, categoryName, typeId, typeName, itemId, itemName, rgId, rgName, assigned } =
      this.context.ticketDetail
    let init = {
      categoryId: categoryId,
      categoryName: categoryName,
      typeId: typeId,
      typeName: typeName,
      itemId: itemId,
      itemName: itemName,
      rgId: rgId,
      rgName: rgName,
      isWorkHour: this._isWorkHour,
      assigned: assigned, //处理人
      selected: Level.item,
    } as UintModal
    const instance = openAssignModal({
      cgiTree: this.state.tree,
      initStruct: init,
      groupMembers: this._chatMembers,
      onCancel: () => {
        instance.close()
      },
      onFinish: (serviceCategory, needInvite) => {
        // 有变更才发起网络请求
        instance.close()
        if (
          init?.itemId === serviceCategory?.itemId &&
          init?.assigned === serviceCategory?.assigned
        ) {
          return
        } else {
          // this.setState({currentServiceCategory: serviceCategory})
          if (serviceCategory.rgId !== this.context.ticketDetail.rgId) {
            this.getRgPendingReasons(serviceCategory.rgId)
            // this.getRgCloseReasons(serviceCategory.rgId)
            this.loadMoreCloseReasons(serviceCategory.rgId)
            // this.getRgPendingReasons(serviceCategory.rgId)
            // this.loadMorePendingReasons(serviceCategory.rgId)
          }
          this.props.callbackAssign(serviceCategory, needInvite)
          this._isWorkHour = serviceCategory.isWorkHour
        }
      },
      onInviteToGroup: misList => {
        if (misList?.length > 0) {
          this.inviteAndUpdateGroup(misList, false)
        }
      },
      onFreshTree: tree => {
        this.setState({ tree })
      },
    })
  }

  handleReasonSelected = (selectedReason, title) => {
    console.log('Selected Reason:', selectedReason);
    let updateData;
  
    if (title === i18nClient.t('components_detail_9453fa', { defaultValue: '选择关闭原因' })) {
      updateData = {
        state: '已关闭',
        closedReason: selectedReason,
      };
    } else if (title === i18nClient.t('components_detail_7b8c6d', { defaultValue: '选择暂停原因' })) {
      updateData = {
        state: '暂停中',
        pendingReason: selectedReason,
      };
    }

    updateTicket(this.props.ticketId, updateData)
    .then(res => this.updateDetail(res))
    .catch(e => { })
  }

  openReasonSelection(title, reasonList) {
      const instance = openCreateReason({
        title,
        reasonList,
        rgId: parseInt(this.context?.ticketDetail?.rgId, 10),
        onCancel: () => {
          instance.close()
        },
        onFinish: (selectedReason) => {
          instance.close()
          this.handleReasonSelected(selectedReason, title)
        },
      })
  }
  renderChat() {
    // console.log('renderChat ' + JSON.stringify(this.context.selectedCCPeople))
    const chatInstance = SlideModal.open({
      useNativeDriver: true,
      visible: true,
      duration: 100,
      modalProps: {
        maskClosable: true,
        containerStyles: {
          // 默认有个白色的底色
          borderTopRightRadius: 10,
          borderTopLeftRadius: 10,
        },
        onClose: () => chatInstance.close(),
      },
      children: (
        <CreateChat
          ticketId={this.props.ticketId}
          reporter={this.context.ticketDetail.reporter}
          assigned={this.context.ticketDetail.assigned}
          cc={this.context.ticketDetail.cc}
          userNameList={this.context.userInfo}
          name={this.context.ticketDetail.name}
          rgId={parseInt(this.context.ticketDetail.rgId, 10)}
          onClose={() => {
            chatInstance.close()
            this.updateGroupInfo()
          }}
        />
      ),
    })
  }

  otherActionSheet(title, type, options) {
    this.otherInstance = ActionSheet.open({
      title: title,
      options: options,
      modalProps: {
        maskClosable: true,
        containerStyles: {
          borderTopRightRadius: 10,
          borderTopLeftRadius: 10,
        },
        onClose: data => this.otherInstance.close(),
      },
      footer: <BottomCancelBtn handlePress={() => this.otherInstance.close()} />,
      confirmCallback: item => {
        switch (type) {
          case '关闭TT':
            updateTicket(this.props.ticketId, {
              state: '已关闭',
              closedReason: item.content,
            })
              .then(res => this.updateDetail(res))
              .catch(e => { })
            break
          case '暂停TT':
            let requestData = {
              state: '暂停中',
              pendingReason: item.content,
            };
            let pendingCancelAt = this.computePendingCancelAt(this.pendingTime, this.timeUnit);
            if (this.pendingTimeSwitch && pendingCancelAt) {
              requestData.pendingCancelAt = pendingCancelAt
            }
            updateTicket(this.props.ticketId, requestData)
              .then(res => this.updateDetail(res))
              .catch(e => { })
            break
          case '添加自定义状态':
              updateTicket(this.props.ticketId, {
                customStatusId: item.value,
                customStatusDisplayName: item.label
              })
              .then(res => this.updateDetail(res))
              .catch(e => { })
            break
        }
      },
      cancelCallback: () => { },
    })
  }

  /**
   * 根据暂停时长(0-60)和时间单位计算结束时间的时间戳
   * @param pendingTime 暂停时长
   * @param timeUnit 单位
   * @returns 结束时间的时间戳
   */
  computePendingCancelAt(pendingTime, timeUnit) {
    let currentDate = new Date()
    let futureDate = new Date(currentDate)
    if (pendingTime === 0) return null
    switch (timeUnit) {
      case '年':
        futureDate.setFullYear(futureDate.getFullYear() + pendingTime);
        break
      case '月':
        futureDate.setMonth(futureDate.getMonth() + pendingTime);
        break
      case '周':
        futureDate.setDate(futureDate.getDate() + (pendingTime * 7));
        break
      case '天':
        futureDate.setDate(futureDate.getDate() + pendingTime);
        break
      case '小时':
        futureDate.setHours(futureDate.getHours() + pendingTime);
        break
      case '分钟':
        futureDate.setMinutes(futureDate.getMinutes() + pendingTime);
        break
      default:
        // console.error('无效的时间单位');
        return null
    }
    return futureDate.getTime() // 返回时间戳（毫秒）
  }

  /**
   * 选择暂停时长的弹窗
   */
  renderPendingTimeModal() {
    let pendingTimeList = [] //存储选择的时间长度和时间单位
    const onConfirm = async () => {
      this.pendingTime = pendingTimeList[0]
      this.timeUnit = pendingTimeList[1]
      pendingTimeInstance.close()
      this.otherActionSheet(
        i18nClient.t('components_detail_7b8c6d', { defaultValue: '选择暂停原因' }),
        '暂停TT',
        this.state.pendingReasons
      )
    }
    const timeUnits = [
      { label: `${i18nClient.t('select_pend_time_minute', { defaultValue: '分钟' })}`, value: '分钟' },
      { label: `${i18nClient.t('select_pend_time_hour', { defaultValue: '小时' })}`, value: '小时' },
      { label: `${i18nClient.t('select_pend_time_day', { defaultValue: '天' })}`, value: '天' },
      { label: `${i18nClient.t('select_pend_time_week', { defaultValue: '周' })}`, value: '周' },
      { label: `${i18nClient.t('select_pend_time_month', { defaultValue: '月' })}`, value: '月' },
      { label: `${i18nClient.t('select_pend_time_year', { defaultValue: '年' })}`, value: '年' }
    ]
    const timeValues = Array.from({ length: 61 }, (v, k) => ({ label: `${k}`, value: k }));
    const pendingTimeInstance = SlideModal.open({
      useNativeDriver: true,
      visible: true,
      duration: 100,
      modalProps: {
        maskClosable: true,
        containerStyles: {
          borderTopRightRadius: 10,
          borderTopLeftRadius: 10,
        },
        onClose: () => pendingTimeInstance.close()
      },
      children: (
        <View>
          <View style={dStyle.satisfyWrapper}>
            <TouchableOpacity style={dStyle.cancel} onPress={() => pendingTimeInstance.close()}>
              <Text style={dStyle.FontRegul16}>
                {i18nClient.t('components_detail_625fb2', { defaultValue: '取消' })}
              </Text>
            </TouchableOpacity>
            <Text style={dStyle.FontBold16}>
              {i18nClient.t('select_pause_duration', { defaultValue: '选择暂停时长' })}
            </Text>
            <TouchableOpacity style={dStyle.createChat} onPress={onConfirm}>
              <Text style={dStyle.chatTxt}>
                {i18nClient.t('components_detail_769d88', { defaultValue: '完成' })}
              </Text>
            </TouchableOpacity>
          </View>
          <Scrollpicker
            list={[timeValues, timeUnits]}
            onChange={value => {
              pendingTimeList = value
              console.log('onChange', value)
            }}
            onInit={(value, info) => {
              pendingTimeList = value
              console.log('onInit', value)
            }}
          />
        </View>
      ),
    });
  };
}

export const TTWorkFlow = connectExternalUser(_TTWorkFlow)
