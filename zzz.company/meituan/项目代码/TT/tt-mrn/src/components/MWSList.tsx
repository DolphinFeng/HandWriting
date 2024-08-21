import { i18nClient } from '@sailor/i18n-mrn'
import React, { Component } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  RefreshControl,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
} from '@mrn/react-native'
import empty from '@images/empty.png'
import { Unsubscribe } from 'redux'

interface IProps {
  // delegate: ListHandler
  renderItem: (item: any, index: number) => React.ReactElement<any> | null
  keyExtractor?: (item: any, index: number) => string
  onLoad: (pageSize: number, pageNo: number, refresh: boolean) => Promise<any[]>
  pageSize?: number // 一屏可以显示的item数
  showFooter?: boolean
  // 是否分页
  needLoadByPage?: boolean
  startPageNo?: number
  renderSeparator?: () => JSX.Element | null
  showsVerticalScrollIndicator?: boolean
  ListHeaderComponent?: () => React.ReactElement<any> | null
  ListFooterComponent?: () => React.ReactElement<any> | null
  clickLoad?: boolean // 手动点击加载更多
  showEmptyPlaceholder?: boolean
  dismissKeyboardOnDrag?: boolean
}

interface IState {
  dataSource: Array<any>
  isLoading: boolean
  // isLoaded: boolean,
  // refreshing: boolean,
  pageSize: number // 一屏可以显示的item数
  pageNumber: number // 第几页
  animating: boolean
  flatListScrolling: boolean // 列表是否在滚动，避免 onEndReached 多次调用
}

const { width, height } = Dimensions.get('window')

class MWSList extends Component<IProps, IState> {
  static defaultProps = {
    showEmptyPlaceholder: true,
  }

  private flatListRef = null
  private isForceClear = false
  private noMore = false

  constructor(props: IProps) {
    super(props)

    let size = 20
    const pSize = this.props.pageSize
    if (pSize != null && pSize > 0) {
      size = pSize
    }

    this.state = {
      dataSource: [],
      isLoading: true,
      // isLoaded: false,
      // refreshing: false,
      pageSize: size,
      // fresh: true,
      pageNumber: this.getStartPageNo(),
      animating: true,
      // onEndReachedCalled: true,
      // isEmpty: false
      // slideModal1: false,
      // selectedOption: -1
      // topYOffset: 0,
      // filterPanelDroppedDown: false,
      // listSelectionDroppedDown: false,
      // selectedFiltersCount: 0
      flatListScrolling: false,
    }
  }

  private refreshUnsubscribe: Unsubscribe

  componentDidMount() {
    // this._onRefresh()
    // console.log('mwslist did mount')

    this.props
      .onLoad(this.state.pageSize, this.getStartPageNo(), true)
      .then(items => {
        // console.log('yy refresh 123', items)
        this.handleItems(items, true)
      })
      .catch(e => {
        console.log('yy refresh  123 error', e)
        this.handleItems([], true)
      })
  }

  getStartPageNo(): number {
    return this.props.startPageNo != null ? this.props.startPageNo : 1
  }

  handleItems(items: any[], refresh: boolean) {
    let noMoreData = items.length < this.state.pageSize ? true : false

    // 不需要加载更多时关闭
    if (this.props.needLoadByPage != null && this.props.needLoadByPage === false) {
      noMoreData = true
    }
    // console.log('handleItems', items)

    this.noMore = noMoreData

    if (refresh) {
      console.log('handleItems refreshing ' + items.length)

      this.setState({
        dataSource: items.length > 0 ? items : [],
        isLoading: false,
        pageNumber: this.getStartPageNo(),
      })
    } else {
      console.log('handleItems loading more ' + items.length)
      this.setState({
        dataSource: this.state.dataSource.concat(items),
        isLoading: false,
      })
    }
  }

  render() {
    // const incidents = this.state.dataSource
    const refreshControl = (
      <RefreshControl
        refreshing={this.state.isLoading}
        onRefresh={() => {
          this._onRefresh()
        }}
      />
    )

    const list = (
      <FlatList
        overScrollMode="never"
        data={this.state.dataSource}
        renderItem={({ item, index }) => this.props.renderItem(item, index)}
        keyExtractor={(item, index) => this.props.keyExtractor(item, index)}
        ItemSeparatorComponent={() =>
          this.props.renderSeparator != null ? this.props.renderSeparator() : null
        }
        refreshControl={refreshControl}
        onEndReached={this._onEndReached}
        onEndReachedThreshold={0.1}
        ListHeaderComponent={this.props.ListHeaderComponent ?? null}
        showsVerticalScrollIndicator={this.props.showsVerticalScrollIndicator ?? true}
        ListFooterComponent={
          this.props.ListFooterComponent ??
          (this.props.showFooter ? this.ListFooterComponent : null)
        }
        ref={ref => {
          this.flatListRef = ref
        }}
        onScroll={this._scrolled.bind(this)}
        onScrollBeginDrag={this.props.dismissKeyboardOnDrag ? () => Keyboard.dismiss() : undefined}
      />
    )

    return (
      // TODO: navigation 默认背景 'ios' ? '#F7F7F7' : '#FFF'， 暂时没法修改
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        {this.state.dataSource.length > 0 ? list : this.renderEmpty()}
      </View>
    )
  }

  renderEmpty() {
    return this.props.showEmptyPlaceholder ? (
      <ScrollView
        overScrollMode="never"
        refreshControl={
          <RefreshControl refreshing={this.state.isLoading} onRefresh={() => this._onRefresh()} />
        }
      >
        {this.state.isLoading ? null : (
          <View
            style={{
              flexDirection: 'column',
              alignItems: 'center',
              marginTop: height / 4,
            }}
          >
            <Image source={empty} style={styles.emptyIcon} />
            <Text style={styles.emptyContent}>
              {i18nClient.t('base_components_4726ff', { defaultValue: '暂无内容' })}
            </Text>
          </View>
        )}
      </ScrollView>
    ) : null
  }

  _scrolled() {
    this.setState({ flatListScrolling: true })
  }

  _onEndReached = () => {
    if (!this.noMore && this.state.flatListScrolling && this.state.isLoading === false) {
      this.loadData()
    } else {
      console.log('_onEndReached not req net')
    }
  }

  loadData() {
    console.log('mwslist onendreact')
    const { pageNumber } = this.state
    console.log('before more ' + pageNumber)
    let newPageNumber = pageNumber + 1
    this.setState({ pageNumber: newPageNumber })

    this.props
      .onLoad(this.state.pageSize, newPageNumber, false)
      .then(items => {
        console.log('onendreached forceclear', this.isForceClear)

        // 防止在切换tab的时候，之前页面的加载更多的数据添加进来
        // if (this.isForceClear === false) {
        //   this.handleItems(items, false)
        // } else {
        //   this.isForceClear = false
        // }
        this.handleItems(items, false)
      })
      .catch(e => {
        console.log('yy endreacched error', e)
      })
  }

  // refreshTokenTime = null
  _onRefresh(forceClear?: boolean) {
    console.log('mwslist onrefresh')
    this.noMore = false
    this.setState({ pageNumber: this.getStartPageNo(), isLoading: true })

    if (forceClear) {
      console.log('set forceClear true')

      this.isForceClear = true
      this.setState({ dataSource: [] })
    } else {
      console.log('set forceClear false')

      // refresh 的时候恢复，防止对其他有影响
      this.isForceClear = false
    }

    if (this.flatListRef != null) {
      this.flatListRef.scrollToOffset({ x: 0, y: 0, animated: false })
    }

    this.setState({ isLoading: true })

    this.props
      .onLoad(this.state.pageSize, this.getStartPageNo(), true)
      .then(items => {
        this.handleItems(items, true)

        if (this.isForceClear === true) {
          this.isForceClear = false
        }
      })
      .catch(e => {
        console.log('yy refresh error', e)
      })
  }

  getData() {
    return this.state.dataSource
  }

  clearData() {
    this.setState({ dataSource: [] })
  }

  ListFooterComponent = () => {
    return (
      <View>
        <View style={{ height: 1, backgroundColor: 'white' }} />
        <View style={styles.bottomfoot}>
          {this.state.dataSource.length !== 0 ? (
            this.noMore ? (
              <Text style={styles.footText}>
                {i18nClient.t('base_components_e401e6', { defaultValue: '没有更多内容了' })}
              </Text>
            ) : this.props.clickLoad ? (
              this.clickLoad()
            ) : (
              this.autoLoad()
            )
          ) : null}
        </View>
      </View>
    )
  }

  autoLoad() {
    return (
      <View style={styles.activeLoad}>
        <ActivityIndicator size="small" animating={this.state.animating} />
        <Text style={[styles.footText, styles.ml]}>
          {i18nClient.t('base_components_772815', { defaultValue: '加载更多' })}
        </Text>
      </View>
    )
  }

  clickLoad() {
    return (
      <TouchableOpacity
        onPress={() => {
          this.loadData()
        }}
      >
        <Text style={[styles.footText, styles.ml, { marginBottom: 5 }]}>
          {i18nClient.t('base_components_fe8fc6', { defaultValue: '点击加载更多' })}
        </Text>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  header: {
    height: 44,
    flexDirection: 'row',
    // paddingLeft: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    // color: 'rgba(0,0,0,0.87)',
    // textAlign: 'center',
    // flex: 1,
    flexDirection: 'row',
    marginLeft: 16,
    // textAlignVertical: 'center',
    alignItems: 'center',
    paddingRight: 8,
    paddingBottom: 8,
    paddingTop: 8,
  },
  line: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  tip: {
    fontSize: 10,
  },
  item: {
    paddingHorizontal: 16,
    // paddingVertical: 8,
    backgroundColor: '#fff',
    paddingTop: 12,
    // paddingBottom: 16
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    // marginBottom: 8
  },
  avator: {
    height: 22,
    width: 22,
    marginRight: 4,
  },
  leftItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 16,
    color: 'rgba(0,0,0,0.87)',
    fontFamily: 'PingFangSC-Medium',
  },
  rowItem: {
    marginTop: 10,
    flexDirection: 'row',
    flex: 1,
    // marginBottom: 0,
    // alignItems: 'center'
    // width: 0,
    // flexGrow: 1,
  },
  rowItemName: {
    fontSize: 14,
    color: 'rgba(0,0,0,0.38)',
    width: 70,
  },
  status: {
    textAlign: 'right',
    fontSize: 12,
    marginLeft: 25,
    padding: 4,
  },
  bottomfoot: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  footText: {
    marginTop: 5,
    fontSize: 12,
    color: '#999999',
  },
  activeLoad: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ml: {
    marginLeft: 10,
  },
  emptyContent: {
    fontFamily: 'PingFangSC-Medium',
    fontSize: 18,
    color: 'rgba(0,0,0,0.87)',
    lineHeight: 26,
    marginTop: 22,
  },
  emptyIcon: {
    width: 60,
    height: 60,
  },
})

export default MWSList
