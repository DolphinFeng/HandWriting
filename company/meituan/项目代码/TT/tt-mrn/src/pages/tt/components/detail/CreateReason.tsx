import { i18nClient } from '@sailor/i18n-mrn'
/**
 * SLA 状态变化
 */

import React, { Component } from 'react'
import {
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  ScrollView,
  ActivityIndicator,
} from '@mrn/react-native'
import { dStyle } from '../../constants/TTStyle'
import { TopViewManager, Toast, SlideModal, Tab, MTDProvider, Radio, Icon } from '@ss/mtd-react-native'
import { ttSlideModalProp } from '../common/TTHelper'
import theme from '@src/common/styles/MWSStyle'
import { MWSSearchList } from '@src/components/MWSSearchList'
import { ttTrackDetailClick, TTKeys } from '../../constants/TTKeys'
import { connectExternalUser, InjectedExternalUserProps } from '../../redux/connectors'
import SafeModalContainer from '@src/components/SafeModalContainer'
import { getCloseReasonList } from '../../constants/TTApi'
import { _searchHightColor } from '../common/SearchHightColor'

interface ReasonProps {
  title: string
  reasonList: string[]
  rgId: number
  onCancel: () => void
  onFinish: (selectedReason: string) => void
  // onSearch: (keyword: string) => void
}

interface IState {
  isSearching: boolean
  searchKeyWord: string
  title: string
  reasonList: string[]
  theme: {
    mtdBrandPrimary: string
  }
  selectedReason: { content: string } | null
  pageNum: number
  pageSize: number
  rgId: number
  totalItems: number
  currentPage: number
  isLoading: boolean
  noMore: boolean
  type: 'CLOSED_REASON' | 'PENDING_REASON';
}
export const modalMarginBottom = Platform.select({
  android: 24,
  ios: 0,
})

class _CreateReason extends Component<ReasonProps & InjectedExternalUserProps, IState> {
  // AssignModal 只有流转页使用，Assign只有发起页使用。
  // 组件内部自己维护数据流，通过callback进行组件间通信

  constructor(props: ReasonProps) {
    super(props)
    const title = this.props.title
    this.state = {
      isSearching: false,
      searchKeyWord: '',
      title: title,
      reasonList: this.props.reasonList,
      selectedReason: null as { content: string } | null,
      pageNum: 1,
      pageSize: 20,
      theme: {
        mtdBrandPrimary: '#FF7700',
      },
      rgId: this.props.rgId,
      totalItems: 0,
      currentPage: 1,
      isLoading: false,
      noMore: false,
      type: this.getReasonType(title), // 根据 title 初始化 type 状态
    }
  }

  async loadMoreReasons(rgId, query?: string) {
    if (!rgId || this.state.isLoading || this.state.noMore) return;

    this.setState({ isLoading: true });

    try {
      const res = await getCloseReasonList({
        rgId: parseInt(rgId, 10),
        type: this.state.type,
        content: query || '',
        pageNum: this.state.pageNum,
        pageSize: this.state.pageSize,
      });

      if (res?.code === 200 && res?.data) {
        const { items, tn, cn } = res.data;
        const newReasonList = items.map(item => ({
          label: item.displayName,
          content: item.content,
          value: item.id,
        }));

        this.setState(prevState => ({
          reasonList: prevState.pageNum === 1 ? newReasonList : prevState.reasonList.concat(newReasonList),
          totalItems: tn,
          currentPage: cn,
          pageNum: prevState.pageNum + 1,
          isLoading: false,
          noMore: newReasonList.length < prevState.pageSize,
        }));
      }
    } catch (e) {
      console.log('获取RG回复失败 ' + e);
      this.setState({ isLoading: false });
    }
  }

  getReasonType(title: string): 'CLOSED_REASON' | 'PENDING_REASON' {
    if (title === i18nClient.t('components_detail_9453fa', { defaultValue: '选择关闭原因' })) {
      return 'CLOSED_REASON';
    } else {
      return 'PENDING_REASON';
    }
  }

  componentDidMount() {
  }
  render() {
    return this.renderAssignbody()
  }
  handleModalClose = () => {
    this.props.onCancel()
  }

  renderAssignbody() {
    return (
      <SafeModalContainer style={{ marginBottom: modalMarginBottom }}>
        {this.renderTitle()} 
        <View style={dStyle.ticketDivider1} />
        {this.renderSearch()}
        {this.renderSelection()}
      </SafeModalContainer>
    )
  }

  renderTitle() {
    const { selectedReason } = this.state;
    const titleTxt = this.state.title
    const isDisabled = !selectedReason;
    return (
      <View style={dStyle.satisfyWrapper}>
        <TouchableOpacity
          style={dStyle.cancel}
          onPress={() => { this.props.onCancel() }}
        >
          <Text style={dStyle.FontRegul16}>{i18nClient.t('components_detail_625fb2', { defaultValue: '取消' })}</Text>
        </TouchableOpacity>
        <Text style={dStyle.FontBold16}>{titleTxt}</Text>
        <TouchableOpacity
          style={{ right: 0, position: 'absolute' }}
          onPress={() => this.handleFinish()}
          disabled={isDisabled}
        >
        <Text style={[dStyle.finishTxt, { color: isDisabled ? '#999' : '#FF8800' }]}>{i18nClient.t('components_home_38cf16', { defaultValue: '确定' })}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  handleFinish() {
    const { selectedReason } = this.state;
    this.props.onFinish(selectedReason.content); // 将 selectedReason 传递给父组件的回调函数
  }

  renderSearch() {
    const getPlaceHolderText = (title: string) => {
        if (title === i18nClient.t('components_detail_9453fa', { defaultValue: '选择关闭原因' })) {
            return i18nClient.t('search_for_reason_for_closure', { defaultValue: '搜索关闭原因' });
        } else {
            return i18nClient.t('reason_for_search_pause', { defaultValue: '搜索暂停原因' });
        }
    };
    return (
      <MWSSearchList
        placeHolderTxt={getPlaceHolderText(this.state.title)}
        marginTop={18}
        marginBottom={0}
        styles={{
          color: theme.yellow800
        }}
        handleSearchOnFocus={() => {
          this.setState({ isSearching: true })
        }}
        handleSearch={keyWord => {
          console.log('keyword ' + keyWord)
          this.setState({
            searchKeyWord: keyWord,
            reasonList: [], // 清空当前的 reasonList
            pageNum: 1, // 重置分页信息
            noMore: false, // 重置 noMore 状态
            selectedReason: null
          }, () => {
            this.loadMoreReasons(this.state.rgId, keyWord);
          });
        }}
        handleCancelSearch={() => {
          this.setState({ isSearching: false, searchKeyWord: '' })
        }}
        handleClearChange={keyWord => {
          console.log('clear' + keyWord)
          // 清空搜索内容
          if (keyWord === '') {
            this.setState({ searchKeyWord: keyWord })
          }
        }}
      />
    )
  }

  isCloseToBottom({ layoutMeasurement, contentOffset, contentSize }) {
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
  }
  

  renderSelection() {
    const { reasonList, selectedReason } = this.state
    return (
        <View style={{ flex: 1 }}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }} // 确保内容容器样式
            scrollEnabled={true}
            nestedScrollEnabled={true}
            onScroll={({ nativeEvent }) => {
              if (this.isCloseToBottom(nativeEvent)) {
                this.loadMoreReasons(this.state.rgId, this.state.searchKeyWord);
              }
            }}
            scrollEventThrottle={400}
          >
            <MTDProvider theme={this.state.theme}>
              <View style={{ backgroundColor: '#fff', paddingVertical: 6, width: '100%' }}>
                <Radio
                  checkedValue={selectedReason}
                  onChange={value => {
                    this.setState({ selectedReason: value });
                  }}
                  iconPosition="right"
                  style={{ padding: 10 }}
                >
                  {reasonList.map((reason, index) => (
                    <Radio.Item 
                      key={index} 
                      label={_searchHightColor(this.state.searchKeyWord, reason.content)}
                      hasLine 
                      value={reason} />
                  ))}
                </Radio>
              </View>
              {this.state.isLoading && (
                <View style={{ padding: 10, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color={this.state.theme.mtdBrandPrimary} />
                  <Text style={{ color: '#999999' }}>
                    {i18nClient.t('base_components_772815', { defaultValue: '加载更多' })}
                  </Text>
                </View>
              )}
            </MTDProvider>
          </ScrollView>
        </View>
    )
  }
}

export const CreateReason = connectExternalUser(_CreateReason)

// 外部直接调用这个方法
export const openCreateReason = (props: ReasonProps) => {
  return SlideModal.open({
    useNativeDriver: true,
    visible: true,
    duration: 100,
    modalProps: ttSlideModalProp(props.onCancel),
    children: <CreateReason {...props} />,
  })
}
