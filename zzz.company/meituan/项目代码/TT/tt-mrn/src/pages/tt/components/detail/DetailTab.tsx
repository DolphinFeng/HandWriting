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
  Keyboard,
  Dimensions,
  ScrollView,
  ImageBackground,
  Clipboard,
  Platform,
} from '@mrn/react-native'
import { Switch, ActionSheet, Toast, Loading, Dialog, SlideModal, Icon } from '@ss/mtd-react-native'
import { dStyle } from '../../constants/TTStyle'
import {
  TicketType,
  SCORE2CN,
  SOLVED2CN,
} from '../../constants/ConfigMap'
import {
  TicketDetail,
  Label,
  CCPersonModel,
  CustomFieldSystemType,
} from '../../constants/TTServiceModule'
import { WebView } from 'react-native-webview'
// import { preStyle } from '@src/common/helpers/PreHtml'
import { markHyperLink, preStyle } from '@src/common/helpers/PreHtml'
import { BaseScript, arrayEquals, isXiaoXiang } from '../common/TTHelper'
import KNB from '@mrn/mrn-knb'
import { openLink } from '@src/common/helpers/OpenLink'
import { AttachmentList } from './AttachmentList'
import { KeyValueDisplay } from '@components/KeyValueDispaly'
import avatar from '@images/default-avator.png'
import theme from '@src/common/styles/MWSStyle'
import { formatDateSeconds } from '@src/common/helpers/FormatDate'
import right from '@images/right-thick.png'
import down from '@images/down-thick.png'
import up from '@images//up-thick.png'
import edit from '@images/edit-o.png'
import home from '@images/home.png'
import copy from '@images/copy.png'
import {
  updateTicket,
  labelIdByName,
  getScore,
  searchDisplayNameList,
  getOncallUser,
  getMyRg,
  getTicketTime,
  getTicketDetailPermission,
  getNonWorkSetting,
} from '@tt/constants/TTApi'
import { openLabelEditorModal } from '../common/LabelEditorModal'
import CCPerson from '../common/CCPerson'
import { ttSlideModal } from '../common/TTHelper'
import { TTDetailContext } from './DetailContext'
import { openDescEditorModal } from './edit/EditDesc'
import { CustomInfo } from './CustomInfo'
import { getKey, forceGetToken } from '@src/common/helpers/api'
import { ttTrackDetailClick, TTKeys } from '../../constants/TTKeys'
import HTMLDisplay from '../comment/HTMLDisplay'
import { openArchiveEditorModal } from '../common/ArchiveEditorModal'
import { connectExternalUser, InjectedExternalUserProps } from '../../redux/connectors'
import { BottomCancelBtn } from '@src/components/BottomCancelBtn'
interface IProps {
  // data: TicketDetail
  ticketId: number
}

interface IState {
  // stateData: TicketDetail
  slideModal: boolean
  descHeight: number
  currentLables: Label[]
  fold: boolean // 控制desc 折叠、展开
  myRg: Array<any>
  siteCodeSwitch: boolean
  // currentSatisfy:{satisfy: string, suggest: string},
  // userInfoList: any,
  // showPersonPicker: boolean,
  // selectedCCPeople: Array<CCPersonModel>
}

const { width, height, scale } = Dimensions.get('window')
const PEOPLE_WIDTH = width - 156

export class _DetailTab extends Component<IProps & InjectedExternalUserProps, IState> {
  static contextType = TTDetailContext
  context!: React.ContextType<typeof TTDetailContext>

  descWebview: any
  typeInstance: any

  constructor(props: IProps, context) {
    super(props, context)

    this.state = {
      // stateData: this.props.data,
      slideModal: false,
      descHeight: 0,
      currentLables: [],
      fold: true,
      myRg: [],
      siteCodeSwitch: false,
      // currentSatisfy: null,
      // userInfoList: null,
      // showPersonPicker: false,
      // selectedCCPeople: []
    }
  }

  async componentDidMount() {
    if (Platform.OS === 'ios') {
      await forceGetToken()
    }

    const { state, labels, rgId } = this.context.ticketDetail
    this.getCtiPermission()
    if (
      state.name.indexOf(i18nClient.t('components_detail_d7d257', { defaultValue: '已解决' })) ||
      state.name.indexOf(i18nClient.t('components_detail_9c5850', { defaultValue: '已关闭' }))
    ) {
      this.getSatisfy()
    }
    if (labels?.length > 0) {
      this.fetchLabels(labels)
    }
    // userInfo -1 组件首次加载
    this.fetchUserInit()
    this.getMyRgs()

    this.context.addRefreshCallback(this.refreshCallback)

  }

  componentWillUnmount() {
    this.context.removeRefreshCallback(this.refreshCallback)
  }

  private refreshCallback = () => {
    this.fetchUserInit()
    this.getMyRgs()
  }

  getSatisfy() {
    getScore(this.context.ticketDetail.id)
      .then(res => {
        if (res?.code === 200 && res?.data?.satisfy) {
          // this.setState({currentSatisfy: {satisfy: res.data.satisfy, suggest: res.data.suggest}})
          this.context.handleScore(res.data)
        }
      })
      .catch(e => { })
  }

  fetchLabels(labelNames: string[]) {
    labelIdByName(...labelNames)
      .then(resp => {
        if (resp?.code === 200 && resp?.data?.items) {
          this.setState({
            currentLables: resp.data.items.map((id, index) => ({
              id: Number.parseInt(id, 10),
              name: labelNames[index],
            })),
          })
        }
      })
      .catch(e => { })
  }

  handleUpdateLabels(labels: Label[]) {
    const { ticketDetail, handleTicketDetail } = this.context
    const newLabelIds = labels.map(({ id }) => id)
    const newLabelNames = labels.map(({ name }) => name)
    updateTicket(ticketDetail.id, {
      labels: newLabelIds,
    })
      .then(resp => {
        if (resp && resp.data) {
          const data = resp.data as TicketDetail
          handleTicketDetail({ ...ticketDetail, labels: newLabelNames })
          this.setState({
            currentLables: labels,
          })
          // this.fetchLabels(newLabelNames)
        } else {
          Toast.open(i18nClient.t('components_detail_17eecf', { defaultValue: '标签更新失败' }))
        }
      })
      .catch(e => {
        Toast.open(i18nClient.t('components_detail_54e9d5', { defaultValue: '更新标签失败' }))
      })
  }

  async getCtiPermission () {
    const res = await getTicketDetailPermission(this.context.ticketDetail.id).catch(e => {})
    if (res?.code === 200 && res?.message === 'OK') {
      this.setState({ siteCodeSwitch: res?.data?.detailOperate?.siteCode === 'visible' });
    }
  }
  fetchUserInit = () => {
    const { reporter, assigned, cc } = this.context.ticketDetail
    let t = []
    t.push(reporter)
    t.push(assigned)
    if (cc?.length > 0) {
      t.push.apply(t, cc)
    }
    console.log('fetchUserInit: ', JSON.stringify(t))
    this.getUserInfoByMis(t)
  }

  getUserInfoByMis(misList: Array<string>) {
    const { userInfo, handleUserInfo } = this.context
    searchDisplayNameList(misList)
      .then(resp => {
        console.log('bbbb' + JSON.stringify(resp))
        if (resp?.code === 200 && resp?.data) {
          const tmpUser = userInfo
          for (let key in resp.data) {
            const user = resp.data[key]
            tmpUser[key] = {
              avatar: user.avatar,
              displayName: user.displayName,
              username: key,
              i18nDisplayName: user.i18nDisplayName
            }
          }
          // 补充异常情况，接口resp.data为 {}, 这里做保护，避免context 一直更新
          let abnormal = misList.filter((v, i) => {
            return !resp.data.hasOwnProperty(v)
          })
          abnormal.map((vv, i) => {
            tmpUser[vv] = { avatar: '', displayName: vv, username: vv }
          })
          handleUserInfo(tmpUser)
        }
      })
      .catch(e => { })
  }

  render() {
    console.log('3-detail tab --------------')
    const { ticketDetail, slaTime } = this.context
    const {
      createdAt,
      updatedAt,
      closeAt,
      id,
      ticketType,
      desc,
      reporter,
      org,
      assigned,
      categoryName,
      typeName,
      itemName,
      cc,
      labels,
      resolution,
      rgName,
      customFieldContents,
      customFieldValues,
      permission,
      attachment,
    } = ticketDetail
    const appName = getKey('appName')
    console.log('app name ' + appName)
    const isExternalUser = this.props.isExternalUser
    const showCC = !isExternalUser
    const isCCRequired = customFieldContents?.some(
      f => f?.identify === CustomFieldSystemType.cc && f?.isRequired,
    )
    const isLabelsRequired = customFieldContents?.some(
      f => f?.identify === CustomFieldSystemType.labels && f?.isRequired,
    )
    return (
      <ScrollView overScrollMode="never" style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {this.renderWebview(desc)}
        {customFieldValues && customFieldValues.length > 0 ? this.renderCustomField() : null}
        {resolution ? this.renderResolution() : null}
        {this.context.score ? this.renderSatisfy() : null}
        {this.renderDivider8()}

        <>
          <AttachmentList
            ticketId={this.props.ticketId}
            area={'attach'}
            attachmentList={attachment}
            from={'detail'}
          />

          {this.renderDivider8()}
        </>

        <KeyValueDisplay
          label={i18nClient.t('components_detail_d4285a', { defaultValue: '发起人' })}
          paddingTop={16}
          isLast={true}
        >
          {this.getPeopleInfo(reporter, org, 'report', isExternalUser)}
        </KeyValueDisplay>
        {this.renderDivider1()}
        <KeyValueDisplay
          label={i18nClient.t('components_detail_4c8c9d', { defaultValue: '处理人' })}
          isLast={true}
        >
          {this.getPeopleInfo(assigned, rgName, 'assign')}
        </KeyValueDisplay>
        {this.renderDivider1()}
        <KeyValueDisplay
          label={i18nClient.t('components_detail_6eb43a', { defaultValue: '一级目录' })}
          paddingBottom={0}
        >
          {this.getDispalyTxt(categoryName)}
        </KeyValueDisplay>
        <KeyValueDisplay
          label={i18nClient.t('components_detail_871cc8', { defaultValue: '二级目录' })}
          paddingBottom={0}
          paddingTop={0}
        >
          {this.getDispalyTxt(typeName)}
        </KeyValueDisplay>
        <KeyValueDisplay
          label={i18nClient.t('components_detail_f6488e', { defaultValue: '三级目录' })}
          paddingTop={0}
          isLast={true}
        >
          {this.getDispalyTxt(itemName)}
        </KeyValueDisplay>
        {this.renderDivider1()}
        {showCC && (
          <KeyValueDisplay
            isRequired={isCCRequired}
            label={i18nClient.t('components_detail_24969a', { defaultValue: '抄送人' })}
            isLast={true}
          >
            {this.getCC()}
          </KeyValueDisplay>
        )}

        {this.renderDivider1()}
        <KeyValueDisplay
          isRequired={isLabelsRequired}
          label={i18nClient.t('components_detail_14d342', { defaultValue: '标签' })}
          isLast={true}
        >
          {this.getLabels(labels)}
        </KeyValueDisplay>
        {this.renderDivider1()}
        {this.getArchive()}
        {this.renderDivider8()}
        <KeyValueDisplay
          label={i18nClient.t('components_detail_226b09', { defaultValue: '类型' })}
          isLast={false}
        >
          {this.renderAction(ticketType)}
        </KeyValueDisplay>
        <KeyValueDisplay
          label={i18nClient.t('components_detail_d8782f', { defaultValue: '保密' })}
          isLast={false}
        >
          <Switch
            width={32}
            height={20}
            rockerSize={theme.size16}
            backgroundColor={theme.gray24}
            backgroundActiveColor={theme.yellow300}
            elevation={0}
            value={permission === 'private' ? true : false}
            onChange={this.onAuthChange}
            styles={{ container: { borderWidth: 0 } }}
          />
        </KeyValueDisplay>
        <KeyValueDisplay
          label={i18nClient.t('components_detail_c515f3', { defaultValue: '编号' })}
          isLast={false}
        >
          <TouchableOpacity
            onPress={() => {
              Clipboard.setString(id.toString())
              Toast.open(i18nClient.t('components_detail_20a495', { defaultValue: '复制成功' }))
            }}
          >
            {this.getDispalyTxt(id)}
          </TouchableOpacity>
        </KeyValueDisplay>
        <KeyValueDisplay
          label={i18nClient.t('components_detail_eca37c', { defaultValue: '创建时间' })}
          isLast={false}
        >
          {this.getDispalyTxt(formatDateSeconds(createdAt))}
        </KeyValueDisplay>
        <KeyValueDisplay
          label={i18nClient.t('components_detail_a001a2', { defaultValue: '更新时间' })}
          isLast={slaTime != null ? (slaTime.responseAt ? false : true) : false}
        >
          {this.getDispalyTxt(formatDateSeconds(updatedAt))}
        </KeyValueDisplay>

        {this.context.slaTime?.rgCrossTime ? (
          <KeyValueDisplay
            label={i18nClient.t('components_detail_6abbdb', { defaultValue: '流转时间' })}
            isLast={slaTime != null ? (slaTime?.resolvedAt != null ? false : true) : false}
          >
            {this.getDispalyTxt(`${formatDateSeconds(this.context.slaTime.rgCrossTime)}`)}
          </KeyValueDisplay>
        ) : this.context.slaTime?.responseAt ? (
          <KeyValueDisplay
            label={i18nClient.t('components_detail_207c26', { defaultValue: '响应时间' })}
            isLast={slaTime != null ? (slaTime?.resolvedAt != null ? false : true) : false}
          >
            {this.getDispalyTxt(`${formatDateSeconds(this.context.slaTime.responseAt)}`)}
          </KeyValueDisplay>
        ) : null}
        {this.context.slaTime?.resolvedAt ? (
          <KeyValueDisplay
            label={i18nClient.t('components_detail_92b75b', { defaultValue: '解决时间' })}
            isLast={true}
          >
            {this.getDispalyTxt(`${formatDateSeconds(this.context.slaTime.resolvedAt)}`)}
          </KeyValueDisplay>
        ) : null}
        {/* {
           this.state.showPersonPicker ?
           <CCPerson
             selectedPeopleList={this.state.selectedCCPeople}
             onCancel={() => this.setState({showPersonPicker: false})}
             onConfirm={(selected) => {
               this.setState({showPersonPicker: false})
               console.log('ccc ' + JSON.stringify(selected))
               this.setState({selectedCCPeople: selected})
              }}
           /> : null
          } */}
      </ScrollView>
    )
  }

  renderCustomField() {
    return <CustomInfo />
  }

  openCCSelection() {
    // console.log('123', this.state.selectedCCPeople);
    const { handleTicketDetail, ticketDetail, handleUserInfo, userInfo } = this.context
    const instance = ttSlideModal(
      <CCPerson
        onCancel={() => instance.close()}
        onConfirm={selectedList => {
          instance.close()
          let before = ticketDetail.cc
          let after = selectedList.map((item, index) => {
            return item.username
          })
          console.log('vvvv0' + arrayEquals(before, after))
          if (arrayEquals(before, after)) {
            return
          }
          console.log('vvvv1')
          updateTicket(this.props.ticketId, { cc: after })
            .then(res => {
              if (res?.code === 200 && res?.data) {
                handleTicketDetail({ ...ticketDetail, cc: after }) // 变更cc 的mislist， 具体展示时从personInfo里获取详细用户信息
                // userInfo -0 更新context
                let tmp = userInfo
                selectedList.map((v, i) => {
                  if (!userInfo.hasOwnProperty(v.username)) {
                    tmp[v.username] = v
                  }
                })
                handleUserInfo(tmp)
              }
            })
            .catch(e => { })
          ttTrackDetailClick(TTKeys.DetailClick.modifyCC)
        }}
        ticketId={this.props.ticketId}
        selectedPeopleList={this.transferCCModal()}
      />,
    )
  }

  transferCCModal() {
    const { userInfo } = this.context
    console.log('user ' + JSON.stringify(userInfo))

    const { cc } = this.context.ticketDetail

    if (cc != null && cc.length > 0) {
      return cc.map((item, index) => {
        console.log('loooooop', userInfo[item])

        return {
          avatar: userInfo[item]?.avatar ?? '',
          displayName: userInfo[item]?.displayName ?? '',
          username: item,
        }
      })
    } else {
      return []
    }
  }

  renderWebview(desc) {
    console.log('4-detail webview desc ' + desc + ' height ' + this.state.descHeight)
    if (desc === null || desc === undefined || desc === '') {
      return null
    }
    const newDesc =
      '<style>img{max-width:100%;max-height:380px;width:auto;}</style>' +
      preStyle(markHyperLink(desc), width - 32)
    // const newDesc = '<style>img{max-width:100%;max-height:380px;width:auto;}</style>' + preStyle(desc, width - 32)
    const { descHeight, fold } = this.state
    const { name } = this.context.ticketDetail.state
    const showFoldBar =
      descHeight > 240 &&
      (name.includes(i18nClient.t('components_detail_d7d257', { defaultValue: '已解决' })) ||
        name.includes(i18nClient.t('components_detail_9c5850', { defaultValue: '已关闭' }))) // 完成状态且高度大于240才显示
    const show = showFoldBar && fold
    const foldTxt = fold
      ? i18nClient.t('components_detail_0467cc', { defaultValue: '查看全部' })
      : i18nClient.t('components_detail_def9e9', { defaultValue: '收起' })
    const showEditButton = this.context.ticketOperate?.detailOperate?.desc === 'editable'
    return (
      <>
        <View
          style={{
            flexDirection: 'row',
            marginHorizontal: 16,
            marginTop: 12,
            marginBottom: 16,
          }}
        >
          <WebView
            ref={view => {
              this.descWebview = view
            }}
            originWhitelist={['*']}
            source={{ html: newDesc, baseUrl: '' }}
            containerStyle={{
              flex: 1,
              height: show ? 240 : descHeight,
              // width: width - 32 -30, // 30是 增加了编辑按钮
              // marginTop: 12,
            }}
            bounces={false}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            javaScriptEnabled={true}
            automaticallyAdjustContentInsets={true}
            contentInset={{ top: 0, left: 0 }}
            // injectedJavaScript={BaseScript}   此处与onLoadEnd 都是计算高度，重复了！！！。相当于不同时机获取高度，获取的高度不同， 导致页面抖动！！！
            onLoadEnd={e => {
              this.descWebview?.injectJavaScript(BaseScript)
            }}
            onMessage={event => this.handleEvent(event)}
          />

          {showEditButton ? (
            <TouchableOpacity style={dStyle.Edit} onPress={this.handleDescEdit}>
              <Image source={edit} style={dStyle.editIcon} />
            </TouchableOpacity>
          ) : (
            <View style={dStyle.EditPlaceHolder} />
          )}
        </View>
        {showFoldBar ? (
          <TouchableOpacity
            style={dStyle.foldBar}
            onPress={() => {
              const { fold } = this.state
              this.setState({ fold: !fold })
            }}
          >
            <Text style={dStyle.FontRegu12}>{foldTxt}</Text>
            <Image source={fold ? down : up} style={dStyle.foldBtn} />
          </TouchableOpacity>
        ) : null}
      </>
    )
  }

  handleDescEdit = () => {
    const { ticketDetail, handleTicketDetail } = this.context
    const descInstance = openDescEditorModal({
      ticketId: this.props.ticketId,
      desc: ticketDetail.desc,
      onCancel: () => descInstance.close(),
      onFinish: newDesc => {
        descInstance.close()
        updateTicket(this.props.ticketId, { desc: newDesc })
          .then(res => {
            if (res?.code === 200 && res?.data) {
              handleTicketDetail({ ...ticketDetail, desc: newDesc })
              // this.setState({stateData:res.data })
            }
          })
          .catch(e => { })
        ttTrackDetailClick(TTKeys.DetailClick.editDesc)
      },
    })
  }

  handleEvent(event: any) {
    try {
      const action = JSON.parse(event.nativeEvent.data)
      if (action.type === 'setHeight' && action.height > 0) {
        this.setState({ descHeight: action.height })
      }
      if (action.type === 'clickImg' && action.currentSrc) {
        KNB.previewImage({
          current: action.currentSrc,
          urls: action.srcList || [action.currentSrc],
        })
      }
      if (action.type === 'clickHref') {
        let href = action.currentHref
        if (href) {
          openLink(href)
        }
      }
    } catch (e) {
      console.warn(e)
    }
  }

  renderDivider1() {
    return <View style={[theme.divider1, { marginLeft: 16 }]} />
  }
  renderDivider8() {
    return <View style={[theme.divider8]} />
  }

  renderResolution() {
    const { resolution, closedReason, closedDesc } = this.context.ticketDetail
    return (
      <>
        {this.renderUnitTitle(
          i18nClient.t('components_detail_9eb71d', { defaultValue: '处理结果' }),
        )}
        <KeyValueDisplay
          label={i18nClient.t('components_detail_de842a', { defaultValue: '解决方案' })}
          isLast={closedReason ? false : true}
        >
          <HTMLDisplay html={resolution} />
        </KeyValueDisplay>
        {closedReason ? (
          <KeyValueDisplay
            label={i18nClient.t('components_detail_b3fc47', { defaultValue: '关闭原因' })}
            isLast={true}
          >
            <HTMLDisplay html={`<p>${closedReason}</p>  ${closedDesc ? closedDesc : ''}`} />
          </KeyValueDisplay>
        ) : null}
      </>
    )
  }

  renderSatisfy() {
    // const { satisfy, suggest} = this.state.currentSatisfy
    const { score } = this.context
    const txt = i18nClient.t(SCORE2CN[score.satisfy]) ? i18nClient.t(SCORE2CN[score.satisfy]) : score.satisfy
    const regularColor = 'rgba(0, 0, 0, 0.87)'
    const alarmColor = '#F5483B'
    return (
      <>
        {this.renderUnitTitle(i18nClient.t('components_detail_eb7b9e', { defaultValue: '满意度' }))}
        <KeyValueDisplay
          label={i18nClient.t('components_detail_606120', { defaultValue: '评价' })}
          isLast={score?.suggest || score?.dissatisfiedReasons?.length > 0 ? false : true}
        >
          <Text
            style={[dStyle.Font14by87, { color: txt === '不满意' ? alarmColor : regularColor }]}
          >
            {txt}
          </Text>
        </KeyValueDisplay>
        {score?.dissatisfiedReasons?.length > 0 ? (
          <KeyValueDisplay
            label={i18nClient.t('components_detail_41dfb0', { defaultValue: '原因' })}
            isLast={score?.suggest ? false : true}
          >
            {this.getDispalyTxt(score.dissatisfiedReasons.join('、'))}
          </KeyValueDisplay>
        ) : null}
        {score?.resolution ? (
          <KeyValueDisplay
            label={i18nClient.t('components_detail_211e32', { defaultValue: '问题是否解决' })}
            isLast={score?.suggest ? false : true}
          >
            <Text
              style={[
                dStyle.Font14by87,
                {
                  color: score.resolution === 'unresolved' ? alarmColor : regularColor,
                },
              ]}
            >
              {i18nClient.t(SOLVED2CN[score.resolution])}
            </Text>
          </KeyValueDisplay>
        ) : null}
        {score?.suggest ? (
          <KeyValueDisplay
            label={i18nClient.t('components_detail_19444e', { defaultValue: '建议' })}
            isLast={true}
          >
            {this.getDispalyTxt(score.suggest)}
          </KeyValueDisplay>
        ) : null}
      </>
    )
  }

  renderUnitTitle(title) {
    return (
      <>
        {this.renderDivider8()}
        <Text style={[dStyle.FontBold16, { marginLeft: 16, marginVertical: 12 }]}>{title}</Text>
        <View style={[dStyle.ticketDivider1, { marginLeft: 16 }]} />
      </>
    )
  }
  getPeopleInfo(mis, org, type: 'report' | 'assign', isExternalUser?: boolean) {
    const { userInfo, ticketDetail } = this.context
    let tmpName = ''
    let tmpAvatar = ''
    try {
      tmpName = userInfo[mis].i18nDisplayName || userInfo[mis].displayName
      tmpAvatar = isExternalUser ? null : userInfo[mis].avatar
    } catch (error) { }
    const dispalyName = isExternalUser ? tmpName ?? '' : tmpName ? `${tmpName}/${mis}` : mis
    const InfoText = ({ label, value }) => (
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginVertical: 4 }}>
        <Text style={[dStyle.InfoText, { color: 'rgba(0, 0, 0, 0.87)', width: 80 }]}>
          {label}
        </Text>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
          <Text style={[dStyle.InfoText, { color: 'rgba(0, 0, 0, 0.6)', flex: 1, flexWrap: 'wrap' }]}>
            {value}
            <View style={{ marginRight: 1 }} /> {/* 添加一个 View 组件来增加间距 */}
            <TouchableOpacity onPress={() => {
              Clipboard.setString(value.toString())
              Toast.open(i18nClient.t('base_components_20a495', { defaultValue: '复制成功' }))
            }}>
              <Image 
                source={copy} 
                style={[dStyle.copyIcon, { marginBottom: Platform.select({
                  android: -2,
                  ios: -13,
                }) }]} 
              />
            </TouchableOpacity>
          </Text>
        </View>
      </View>

    );
    return mis ? (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
        }}
      >
        <ImageBackground
          source={tmpAvatar ? { uri: tmpAvatar } : avatar}
          defaultSource={avatar}
          style={[dStyle.image24, { borderRadius: 12, overflow: 'hidden' }]}
        />

        <View style={{ marginLeft: 8 }}>
          <View style={{ flexDirection: 'row', maxWidth: '85%' }}>
            <Text style={dStyle.FontBold14, {flexShrink: 1}} numberOfLines={1} ellipsizeMode='tail'>{dispalyName}</Text>
            {type === 'assign' ? this.assignToMe() : null}
            {type === 'report' && (
            <>
              <TouchableOpacity onPress={() => this.setState({ slideModal: true })}>
                {/* {this.state.siteCodeSwitch && (
                  <Image source={home} style={dStyle.homeIcon} />
                )} */}
              {this.state.siteCodeSwitch && (
                (ticketDetail?.reporterDetail?.siteCode || ticketDetail?.reporterDetail?.buildingName || ticketDetail?.reporterDetail?.address) && (
                  <Image source={home} style={dStyle.homeIcon} />
                )
              )}
              </TouchableOpacity>
              <SlideModal
                visible={this.state.slideModal}
                useNativeDriver={true}
                key={this.state.slideModal}
                title={i18nClient.t('initiators_address', { defaultValue: '发起人地址' })}
                rightLabel={
                  <Icon 
                    type="close" 
                    style={{
                      marginLeft: Dimensions.get('window').width * 0.16,
                    }}
                    size={20} />
                }
                rightCallback={() => {
                  this.setState({
                    slideModal: false
                  })
                }}
                wrapperStyles={{
                  borderTopLeftRadius: 12,  // 上左角圆角
                  borderTopRightRadius: 12, // 上右角圆角
                }}         
              >
              <View
                style={[
                  { backgroundColor: '#fff'}
                ]}
              >
                <ScrollView style={{ maxHeight: Dimensions.get('window').height * 0.9 }}>
                  <View style={{ paddingLeft: 16, paddingRight: 16 }}>
                    <InfoText label="Site Code" value={ticketDetail?.reporterDetail?.siteCode} />
                    <View style={dStyle.DevideLine} />
                    <InfoText label={i18nClient.t('office_building_namei8l', { defaultValue: '办公楼名' })} value={ticketDetail?.reporterDetail?.buildingName} />
                    <View style={dStyle.DevideLine} />
                    <InfoText label={i18nClient.t('office_address2md', { defaultValue: '办公地址' })} value={ticketDetail?.reporterDetail?.address} />
                  </View>
                </ScrollView>
              </View>
              </SlideModal>
            </>
            )}
          </View>

          {!isExternalUser && (
            <Text style={[dStyle.FontRegu12, { width: PEOPLE_WIDTH, marginTop: 2 }]}>{org}</Text>
          )}
        </View>
      </View>
    ) : null
  }


  assignToMe() {
    const { currentUser, ticketDetail } = this.context
    const { categoryId, categoryName, typeId, typeName, itemId, itemName, rgId, rgName, assigned } =
      ticketDetail
    if (currentUser === '') {
      return null
    }
    // 当前用户属于服务目录成员
    if (
      ticketDetail.assigned !== currentUser &&
      this.state.myRg.findIndex((v, i) => Number(v.id) === Number(ticketDetail.rgId)) > -1
    ) {
      return (
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center' }}
          onPress={() => {
            const o = {
              categoryId: categoryId,
              categoryName: categoryName,
              typeId: typeId,
              typeName: typeName,
              itemId: itemId,
              itemName: itemName,
              rgId: rgId,
              rgName: rgName,
              assigned: currentUser,
              appointAssigned: true,
            }
            console.log('oooo' + JSON.stringify(o))
            this.handleUpdateAssign(o)
          }}
        >
          <View style={dStyle.vDivider} />
          <Text style={dStyle.assignMe}>
            {i18nClient.t('components_detail_31a796', { defaultValue: '分配给我' })}
          </Text>
        </TouchableOpacity>
      )
    } else {
      return null
    }
  }

  getMyRgs() {
    getMyRg()
      .then(res => {
        if (res?.code === 200 && res?.data?.items) {
          this.setState({ myRg: res.data.items })
        }
      })
      .catch(e => { })
  }

  getCC() {
    const { ticketDetail } = this.context
    return (
      <TouchableOpacity
        style={{ flex: 1, flexDirection: 'row' }}
        onPress={() => this.openCCSelection()}
      >
        <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap' }}>
          {this.renderCC(ticketDetail.cc)}
        </View>
        <Image source={right} style={[dStyle.image24, { opacity: 0.24 }]} />
      </TouchableOpacity>
    )
  }

  renderCC(cc: any) {
    return cc?.length > 0 ? (
      this.renderCCPeople(cc)
    ) : (
      <Text style={dStyle.addTag}>
        {i18nClient.t('components_detail_b58c75', { defaultValue: '添加' })}
      </Text>
    )
  }

  renderCCPeople(ccs: any) {
    const { userInfo } = this.context
    console.log('user ' + JSON.stringify(userInfo))
    return ccs.map((item, index) => (
      <View style={dStyle.ccWrapper} key={index}>
        <ImageBackground
          source={userInfo[item]?.avatar ? { uri: userInfo[item]?.avatar } : avatar}
          defaultSource={avatar}
          style={[dStyle.avatar, { marginRight: 4 }]}
        />

        <Text>{userInfo[item]?.i18nDisplayName ? userInfo[item]?.i18nDisplayName : (userInfo[item]?.displayName ? userInfo[item]?.displayName : item)}</Text>
      </View>
    ))
  }

  getArchive() {
    const {
      ticketDetail: { archiveId, archiveName, rgId },
      rgArchiveInfo,
    } = this.context
    if (!rgArchiveInfo?.active) {
      return null
    }

    const isArchived = Number.parseInt(archiveId, 10) > 0
    const canEdit = this.state.myRg.some(rg => String(rg?.id) === String(rgId))

    return (
      <KeyValueDisplay
        label={i18nClient.t('components_detail_801a99', { defaultValue: '问题归档' })}
        isLast={true}
        onPress={canEdit ? this.openArchiveModal : null}
      >
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          {isArchived ? (
            <Text style={[dStyle.Font14by87, { flex: 1 }]} numberOfLines={1}>
              {archiveName}
            </Text>
          ) : (
            <Text style={{ flex: 1, textAlign: 'right', color: 'rgba(0,0,0,0.36)' }}>
              {i18nClient.t('components_detail_ecf7eb', { defaultValue: '未分类' })}
            </Text>
          )}

          {canEdit && <Image source={right} style={[dStyle.image24, { opacity: 0.24 }]} />}
        </View>
      </KeyValueDisplay>
    )
  }

  openArchiveModal = () => {
    const {
      ticketDetail: { archiveId, archiveName },
    } = this.context
    const instance = openArchiveEditorModal({
      rgId: this.context.ticketDetail.rgId,
      initialArchiveId: archiveId,
      initialArchiveName: archiveName,
      onCancel: () => instance.close(),
      onFinish: (archiveId, archiveName) => {
        instance.close()
        this.archiveTicket(archiveId, archiveName)
      },
    })
  }

  async archiveTicket(archiveId: number | string, archiveName: string) {
    const loading = Loading.open()
    try {
      const resp = await updateTicket(this.context.ticketDetail.id, {
        archiveId: String(archiveId),
      })
      if (resp?.code === 200 && resp?.data) {
        this.context.handleTicketDetail({
          ...this.context.ticketDetail,
          archiveId,
          archiveName,
        })
      } else {
        Toast.open(i18nClient.t('components_detail_5badb3', { defaultValue: '修改失败' }))
      }
    } catch (e) {
      Toast.open(i18nClient.t('components_detail_5badb3', { defaultValue: '修改失败' }))
    } finally {
      loading.close()
    }
  }

  onPressLabels = () => {
    const { rgPermission } = this.context
    ttTrackDetailClick(TTKeys.DetailClick.modifyLabel)
    // 默认允许修改
    if (!(rgPermission?.label ?? true)) {
      Toast.open(
        i18nClient.t('components_detail_781852', {
          defaultValue: '暂无修改权限，如需修改请联系处理人',
        }),
      )
      return
    }
    const { currentLables } = this.state
    const instance = openLabelEditorModal({
      rgId: this.context.ticketDetail.rgId,
      initialLabels: currentLables,
      onCancel: () => instance.close(),
      onFinish: labels => {
        instance.close()
        this.handleUpdateLabels(labels)
      },
    })
  }

  getLabels(labels: Array<string>) {
    return (
      <TouchableOpacity style={{ flex: 1, flexDirection: 'row' }} onPress={this.onPressLabels}>
        <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap' }}>
          {labels && labels.length > 0 ? (
            labels.map(label => (
              <Text key={label} style={dStyle.labelTag}>
                {label}
              </Text>
            ))
          ) : (
            <Text style={dStyle.addTag}>
              {i18nClient.t('components_detail_b58c75', { defaultValue: '添加' })}
            </Text>
          )}
        </View>
        <Image source={right} style={[dStyle.image24, { opacity: 0.24 }]} />
      </TouchableOpacity>
    )
  }

  getDispalyTxt(txt) {
    return <Text style={[dStyle.Font14by87, { width: width - 108 }]}>{txt}</Text>
  }
  // todo h5页只有wording ，无法操作
  // 若允许操作，还需考虑二次弹窗和pc 一致
  onAuthChange = value => {
    const { ticketDetail, handleTicketDetail } = this.context
    updateTicket(this.props.ticketId, {
      permission: value ? 'private' : 'public',
    })
      .then(res => {
        if (res?.code === 200 && res?.data) {
          handleTicketDetail({
            ...ticketDetail,
            permission: value ? 'private' : 'public',
          })
          // let stateData = this.state.stateData
          // stateData.permission = res.data.permission
          // this.setState({stateData})
        }
      })
      .catch(e => { })
    ttTrackDetailClick(TTKeys.DetailClick.changePermission)
  }

  renderAction(txt) {
    const { ticketOperate } = this.context
    console.log('text', txt);
    const translations = {
      '服务故障': i18nClient.t('constants_9038cd', { defaultValue: '服务故障' }),
      '事件': i18nClient.t('constants_10b276', { defaultValue: '事件' }),
      '缺陷': i18nClient.t('constants_615ae1', { defaultValue: '缺陷' }),
      '需求': i18nClient.t('constants_e6cefb', { defaultValue: '需求' }),
      '问题咨询': i18nClient.t('constants_41e840', { defaultValue: '问题咨询' }),
      '建议': i18nClient.t('constants_19444e', { defaultValue: '建议' }),
    }
  
    const translatedTxt = translations[txt] || txt;
    const typeOperator = ticketOperate?.detailOperate?.ticketType === 'editable'
    return (
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          flex: 1,
        }}
        onPress={this.onChangeType}
        disabled={!typeOperator}
      >
        <Text style={dStyle.Font14by87}>{translatedTxt}</Text>
        {typeOperator ? <Image source={right} style={[dStyle.image24, { opacity: 0.24 }]} /> : null}
      </TouchableOpacity>
    )
  }

  onChangeType = () => {
    this.typeInstance = ActionSheet.open({
      title: i18nClient.t('components_detail_5e1872', { defaultValue: '选择类型' }),
      options: this.transferType(),
      modalProps: {
        maskClosable: true,
        containerStyles: {
          borderTopRightRadius: 10,
          borderTopLeftRadius: 10,
        },
        onClose: data => this.typeInstance.close(),
      },
      footer: <BottomCancelBtn handlePress={() => this.typeInstance.close()} />,
      confirmCallback: item => {
        console.log(item)
        // 此接口会返回更新后的detail, 直接刷新页面即可
        const { ticketDetail, handleTicketDetail } = this.context
        updateTicket(this.props.ticketId, { ticketType: item.value })
          .then(res => {
            if (res?.code === 200 && res?.data) {
              handleTicketDetail({ ...ticketDetail, ticketType: item.label });
              // let stateData = this.state.stateData
              // stateData.ticketType = res.data.ticketType
              // this.setState({stateData})
            }
          })
          .catch(e => { })
        ttTrackDetailClick(TTKeys.DetailClick.changeType)
      },
      cancelCallback: () => { },
    })
  }

  transferType() {
    let typeArr = []
    TicketType.forEach((item, index) => {
      typeArr.push({ label: i18nClient.t(item.code), value: item.val })
    })
    return typeArr
  }

  async handleUpdateAssign(serviceCategory, needInvite = false) {
    const { ticketDetail, handleTicketDetail, handleSLATime, handleTicketOperate } = this.context
    if (!serviceCategory?.hasOwnProperty('assigned')) {
      serviceCategory.assigned = ''
    }
    serviceCategory &&
      Object.keys(serviceCategory).map(i => {
        if (['categoryId', 'typeId', 'itemId', 'rgId'].includes(i)) {
          serviceCategory[i] = parseInt(serviceCategory[i], 10)
        }
      })
    try {
      // 更新tt
      let updatedRes = await updateTicket(this.props.ticketId, {
        ...serviceCategory,
        inviteNewAssigned: needInvite && (serviceCategory?.isWorkHour || false),
      })
      if (updatedRes?.code === 200 && updatedRes?.data) {
        // Toast.open('更新成功')
        serviceCategory.assigned = updatedRes.data.assigned
        serviceCategory.cc = Object.assign([], updatedRes.data.cc)
        // 之前用serviceCategory更新，但没有包含cc
        handleTicketDetail({ ...ticketDetail, ...serviceCategory })
        if (!this.context.userInfo?.hasOwnProperty(updatedRes.data?.assigned)) {
          this.getUserInfoByMis([updatedRes.data.assigned])
        }
        if (serviceCategory.rgId !== ticketDetail.rgId) {
          // 跨RG流转时才需要更新SLA
          try {
            // 请求当前tt的slaTime
            let slaRes = await getTicketTime(ticketDetail.id)
            if (slaRes?.code === 200 && slaRes?.data) {
              handleSLATime(slaRes.data)
            }
          } catch (error) {
            console.log('get ticketTime error')
          }
          try {
            // 请求当前tt的权限
            let permissionRes = await getTicketDetailPermission(ticketDetail.id)
            if (permissionRes?.code === 200 && permissionRes?.data?.detailOperate) {
              this.setState({ siteCodeSwitch: permissionRes?.data?.detailOperate?.siteCode === 'visible' });
              handleTicketOperate(permissionRes?.data)
              const showNonWorkDialog =
                permissionRes?.data?.detailOperate?.nonWorkingWarn === 'visible' &&
                permissionRes?.data?.isWorkHour === false
              if (showNonWorkDialog) {
                this.fetchNonWorkSetting()
              }
            }
          } catch (error) {
            console.log('get ticketPermission error')
          }
        }
      }
    } catch (error) {
      console.log('update ticket error')
    }
  }
  fetchNonWorkSetting() {
    const NON_WORK_GLOBAL_TIP_DEFAULT = i18nClient.t('components_detail_2e586d', {
      defaultValue: '您好，您的问题已收到，我们将在工作时间立刻为您处理，请您耐心等待～',
    })
    getNonWorkSetting(this.context.ticketDetail.rgId, true)
      .then(res => {
        if (res?.code && res?.code === 200 && res?.data?.active === true) {
          console.log('update non working')
          this.nonWorkDialog(res?.data?.hint ?? NON_WORK_GLOBAL_TIP_DEFAULT)
        }
      })
      .catch(e => { })
  }
  nonWorkDialog(msg) {
    // 流转到非工作时间RG后，弹框提示
    Dialog.alert({
      title: i18nClient.t('components_detail_84a76a', { defaultValue: '发起成功' }),
      body: (
        <ScrollView overScrollMode="never" style={{ marginTop: 8, maxHeight: 100 }}>
          <HTMLDisplay html={msg} />
        </ScrollView>
      ),

      confirmLabel: i18nClient.t('components_home_38cf16', { defaultValue: '确定' }),
      modalProps: {
        maskClosable: true,
      },
    })
  }
  // handleUpdatesatisfy(satisfyInfo) {
  //     // this.setState({currentSatisfy: {satisfy: satisfyInfo.satisfy, suggest: satisfyInfo.suggest}})
  // }
}

export const DetailTab = connectExternalUser(_DetailTab)
