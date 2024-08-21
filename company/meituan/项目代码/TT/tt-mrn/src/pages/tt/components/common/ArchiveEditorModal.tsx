import { i18nClient } from '@sailor/i18n-mrn'
import React from 'react'
import {
  Keyboard,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  View,
  StyleSheet,
  SectionList,
  Image,
  FlatList,
} from '@mrn/react-native'
import { SlideModal, Toast } from '@ss/mtd-react-native'
import { ttSlideModalProp } from '@tt/components/common/TTHelper'
import { dStyle } from '@tt/constants/TTStyle'
import { MWSSearchList } from '@src/components/MWSSearchList'

import theme from '@src/common/styles/MWSStyle'
import { ArchiveInfo, ArchiveSearchResultItem } from '@tt/constants/TTServiceModule'
import {
  getArchiveInfo,
  getRgArchiveInfo,
  listArchiveChildren,
  searchArchive,
} from '../../constants/TTApi'
import SafeModalContainer from '@src/components/SafeModalContainer'

const levelPrefices = [
  'components_common_1e4ea4', // { defaultValue: '一级归档：' }),
  'components_common_9ac9d7', // { defaultValue: '二级归档：' }),
  'components_common_6cba3f', // { defaultValue: '三级归档：' }),
  'components_common_8d7f5d', // { defaultValue: '四级归档：' }),
  'components_common_df9202' // { defaultValue: '五级归档：' }),

  // i18nClient.t('components_common_1e4ea4', { defaultValue: '一级归档：' }),
  // i18nClient.t('components_common_9ac9d7', { defaultValue: '二级归档：' }),
  // i18nClient.t('components_common_6cba3f', { defaultValue: '三级归档：' }),
  // i18nClient.t('components_common_8d7f5d', { defaultValue: '四级归档：' }),
  // i18nClient.t('components_common_df9202', { defaultValue: '五级归档：' }),
]

const Separaotr = () => {
  return <View style={styles.separator} />
}
const HighlightText: React.FC<{ text: string; keyword?: string }> = ({ text, keyword }) => {
  if (text.length > 0 && keyword?.length > 0) {
    // ignore case
    const fullText = text.toLowerCase()
    const search = keyword.toLowerCase()
    const spans = []
    for (let start = 0; start < text.length; ) {
      const index = fullText.indexOf(search, start)
      if (index >= 0) {
        spans.push(text.substring(start, index))
        spans.push(
          <Text style={styles.highlightText}>{text.substring(index, index + keyword.length)}</Text>,
        )
        start = index + keyword.length
      } else {
        spans.push(text.substring(start, text.length))
        break
      }
    }
    return <Text style={styles.searchResultText}>{spans}</Text>
  } else {
    return <Text style={styles.searchResultText}>{text}</Text>
  }
}

interface ArchiveSection {
  data: ArchiveInfo[]
  index?: number
}

interface ArchiveEditorModalProps {
  rgId?: number | string
  initialArchiveId?: number | string
  initialArchiveName?: string
  onCancel: () => void
  onFinish: (archiveId: number, archiveName: string) => void
}

interface ArchiveEditorModalState {
  selectedArchiveId?: number
  selectedArchiveName?: string

  requestError?: any
  rootArchiveId?: number

  inSearch: boolean
  isSearching?: boolean
  keyword?: string
  searchResult?: ArchiveSearchResultItem[]

  sections: ArchiveSection[]
  /**
   * expand at most one section
   */
  expandSectionIndex: number
  /**
   * store the coresponding selected archive id for each section
   */
  selectionPath: number[]
}

class ArchiveEditorModal extends React.Component<ArchiveEditorModalProps, ArchiveEditorModalState> {
  constructor(props: Readonly<ArchiveEditorModalProps>) {
    super(props)
    this.state = {
      selectedArchiveId: Number(props.initialArchiveId),
      selectedArchiveName: props.initialArchiveName,

      inSearch: false,
      sections: [],
      expandSectionIndex: 0,
      selectionPath: [],
    }
  }

  componentDidMount() {
    this.fetchNodes()
  }

  fetchNodes() {
    this.setState({ requestError: null })
    const { selectedArchiveId } = this.state
    if (selectedArchiveId > 0) {
      this.fetchAscendants()
    } else {
      this.fetchRootNode()
    }
  }

  async fetchRootNode() {
    const { rgId } = this.props
    try {
      const resp = await getRgArchiveInfo(rgId)
      if (resp?.code === 200 && resp?.data?.rootNode) {
        const rootNode = resp.data.rootNode
        this.setState({
          rootArchiveId: rootNode.id,
          sections: [{ data: [rootNode] }],
        })
      } else {
        this.showRequestError()
      }
    } catch (e) {
      this.showRequestError(e)
    }
  }

  async fetchAscendants() {
    const { selectedArchiveId } = this.state
    let id = selectedArchiveId

    const ascendants: ArchiveInfo[] = []
    while (id > 0) {
      try {
        const resp = await getArchiveInfo(id)
        if (resp?.code === 200 && resp?.data) {
          ascendants.unshift(resp.data)
          id = resp.data.parentId
        } else {
          this.showRequestError()
          return
        }
      } catch (e) {
        this.showRequestError(e)
        return
      }
    }
    try {
      const childrenList = await Promise.all(
        ascendants.map(a => (!a.inUse || a.leaf ? [] : this.getChildrenWithCache(a.id))),
      )
      const sections = ascendants.map((_, index) => ({
        data: childrenList[index],
      }))
      // root
      sections.unshift({ data: [ascendants[0]] })
      // trim leaf
      if (!sections[sections.length - 1].data?.length) {
        sections.pop()
      }

      this.setState({
        rootArchiveId: ascendants[0].id,
        sections,
        expandSectionIndex: ascendants.length - 1,
        selectionPath: ascendants.map(a => a.id),
      })
    } catch (e) {
      this.showRequestError(e)
    }
    console.log('ascendants', ascendants, ascendants.length)
  }

  showRequestError(error: any = 'request error') {
    this.setState({ requestError: error })
  }

  async listChildren(parentId: number, sectionIndex: number) {
    try {
      const children = await this.getChildrenWithCache(parentId)
      for (let i = 0; i < children.length; i++) {
        if (!children[i].inUse) {
          children.splice(i, 1)
          i--
        }
      }
      this.setState({
        sections: [...this.state.sections.slice(0, sectionIndex + 1), { data: children }],
      })
    } catch (e) {
      Toast.open(i18nClient.t('components_common_d5993b', { defaultValue: '获取子节点失败' }))
    }
  }

  _childrenCache: Record<number, ArchiveInfo[]> = {}

  async getChildrenWithCache(parentId: number) {
    const cached = this._childrenCache[parentId]
    if (cached) {
      return cached
    }
    const resp = await listArchiveChildren(parentId)
    if (resp?.code === 200 && resp?.data) {
      const children = resp.data.items
      for (let i = 0; i < children.length; i++) {
        if (!children[i].inUse) {
          children.splice(i, 1)
          i--
        }
      }
      this._childrenCache[parentId] = children
      return children
    } else {
      throw new Error('Network request failed, code: ' + resp?.code)
    }
  }

  render() {
    return (
      <SafeModalContainer>
        {this.renderTitle()}
        <View style={dStyle.ticketDivider1} />
        {this.renderBody()}
      </SafeModalContainer>
    )
  }

  renderBody() {
    if (this.state.requestError) {
      return (
        <View style={styles.emptyContainer}>
          <Text onPress={() => this.fetchNodes()}>
            {i18nClient.t('components_common_f8bc6d', {
              defaultValue: '获取归档信息失败，点击重试',
            })}
          </Text>
        </View>
      )
    }
    if (!this.state.rootArchiveId) {
      return null
    }
    return (
      <View style={{ flex: 1 }}>
        <MWSSearchList
          placeHolderTxt={i18nClient.t('components_common_f8d14e', {
            defaultValue: '搜索问题归档',
          })}
          styles={{
            color: theme.yellow800,
          }}
          handleSearchOnFocus={() => this.setState({ inSearch: true })}
          handleSearch={this.handleSearch}
          handleCancelSearch={() => this.handleCancelSearch()}
          handleClearChange={() => console.log('clearChange')}
        />

        {this.state.inSearch ? this.renderSearchResult() : this.renderArchiveTree()}
      </View>
    )
  }

  handleCancelSearch() {
    this.setState({ inSearch: false })
    this.fetchNodes()
  }

  renderSearchResult() {
    return (
      <FlatList
        overScrollMode="never"
        style={{ paddingTop: 24 }}
        data={this.state.searchResult}
        keyExtractor={item => String(item.id)}
        renderItem={this.renderSearchResultItem}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text>
              {Boolean(this.state.keyword) &&
                !this.state.isSearching &&
                i18nClient.t('components_common_0ee4df', { defaultValue: '暂无结果' })}
            </Text>
          </View>
        )}
        onScrollBeginDrag={() => Keyboard.dismiss()}
      />
    )
  }

  renderSearchResultItem = info => {
    const isSelected = info.item.id === this.state.selectedArchiveId
    return (
      <TouchableHighlight onPress={() => this.handlePressSearchResultItem(info)}>
        <View style={styles.searchResultCell}>
          <HighlightText text={info.item.fullName as string} keyword={this.state.keyword} />

          {isSelected && (
            <Image
              style={styles.selectedIcon}
              source={require('@src/assets/images/yellow-check.png')}
            />
          )}
        </View>
      </TouchableHighlight>
    )
  }

  handlePressSearchResultItem(info) {
    const isSelected = this.state.selectedArchiveId === info.item.id
    if (isSelected) {
      this.setState({
        selectedArchiveId: -1,
        selectedArchiveName: null,
      })
    } else {
      this.setState({
        selectedArchiveId: info.item.id,
        selectedArchiveName: info.item.name,
        selectionPath: [],
      })
    }
  }

  handleSearch = async (keyword: string) => {
    const { rootArchiveId } = this.state
    if (!rootArchiveId) {
      return
    }

    this.setState({ isSearching: true, keyword })
    try {
      const resp = await searchArchive(rootArchiveId, keyword)
      if (resp?.code === 200 && resp?.data) {
        this.setState({ searchResult: resp.data.items })
      }
    } catch (e) {
    } finally {
      this.setState({ isSearching: false })
    }
  }

  renderArchiveTree() {
    return (
      <SectionList
        overScrollMode="never"
        sections={this.state.sections.map((section, index) => ({
          ...section,
          index,
        }))}
        keyExtractor={item => String(item.id)}
        renderItem={this.renderItem}
        renderSectionHeader={this.renderSectionHeader}
        extraData={`${this.state.expandSectionIndex}-${this.state.selectedArchiveId}-${this.state.selectionPath}`}
      />
    )
  }

  renderSectionHeader = info => {
    // console.log(info)
    const sectionIndex = info.section.index
    const expand = sectionIndex === this.state.expandSectionIndex
    const selected = info.section.data.find(
      item => item.id === this.state.selectionPath[sectionIndex],
    )
    return (
      <TouchableHighlight
        style={info.section.data.length > 0 ? {} : { display: 'none' }}
        onPress={() => this.handlePressSectionHeader(info)}
      >
        <View style={styles.surface}>
          <View style={styles.cell}>
            <Text style={styles.levelPrefix}>
              {i18nClient.t(levelPrefices[sectionIndex]) ||
                i18nClient.t('components_common_dbbf77', { defaultValue: '归档：' })}
            </Text>
            <Text style={styles.levelText}>
              {selected?.name ||
                i18nClient.t('components_common_f0409e', { defaultValue: '未选择' })}
            </Text>
            <Image
              style={expand ? styles.collapseIcon : styles.expandIcon}
              source={require('@src/assets/images/tt-down.png')}
            />
          </View>
          <Separaotr />
        </View>
      </TouchableHighlight>
    )
  }

  handlePressSectionHeader(info) {
    // toggle expansion
    const sectionIndex = info.section.index
    const expandSectionIndex = sectionIndex === this.state.expandSectionIndex ? -1 : sectionIndex
    this.setState({ expandSectionIndex: expandSectionIndex })
  }

  renderItem = info => {
    if (info.section.index !== this.state.expandSectionIndex) {
      // collapsed
      return null
    }
    const isSelected =
      info.item.id === this.state.selectedArchiveId ||
      info.item.id === this.state.selectionPath[info.section.index]
    return (
      <TouchableHighlight onPress={() => this.handlePressItem(info, isSelected)}>
        <View style={[styles.surface, styles.cell]}>
          <Text style={styles.itemText}>{info.item.name}</Text>
          {isSelected && (
            <Image
              style={styles.selectedIcon}
              source={require('@src/assets/images/yellow-check.png')}
            />
          )}
        </View>
      </TouchableHighlight>
    )
  }

  handlePressItem(info, isSelected: boolean) {
    const sectionIndex = info.section.index
    if (isSelected) {
      // deselect
      const parentNode = this.state.sections[sectionIndex - 1]?.data?.find(
        a => a?.id === this.state.selectionPath[sectionIndex - 1],
      )
      this.setState({
        sections: this.state.sections.slice(0, sectionIndex + 1),
        selectionPath: this.state.selectionPath.slice(0, sectionIndex),
        selectedArchiveId: parentNode?.id,
        selectedArchiveName: parentNode?.name,
      })
      return
    }
    const newPath = [...this.state.selectionPath]
    newPath[sectionIndex] = info.item.id
    this.setState({
      selectedArchiveId: info.item.id,
      selectedArchiveName: info.item.name,
      selectionPath: newPath,
    })
    if (!info.item.leaf) {
      this.setState({ expandSectionIndex: sectionIndex + 1 })
      this.listChildren(info.item.id, sectionIndex)
    } else {
      this.setState({
        sections: this.state.sections.slice(0, sectionIndex + 1),
      })
    }
  }

  renderTitle() {
    const { selectedArchiveId } = this.state
    const handleCancel = () => this.props.onCancel()
    const handleFinish = () =>
      this.props.onFinish(this.state.selectedArchiveId, this.state.selectedArchiveName)
    const canFinish = Boolean(selectedArchiveId)

    return (
      <View style={dStyle.satisfyWrapper}>
        <TouchableOpacity style={dStyle.cancel} onPress={handleCancel}>
          <Text style={dStyle.FontRegul16}>
            {i18nClient.t('components_common_625fb2', { defaultValue: '取消' })}
          </Text>
        </TouchableOpacity>
        <Text style={dStyle.FontBold16}>
          {i18nClient.t('components_common_87eb9f', { defaultValue: '选择问题归档' })}
        </Text>
        <TouchableOpacity
          style={{ right: 0, position: 'absolute' }}
          onPress={handleFinish}
          disabled={!canFinish}
        >
          <Text style={[dStyle.FontBold16, canFinish && { color: theme.yellow800 }]}>
            {i18nClient.t('components_common_38cf16', { defaultValue: '确定' })}
          </Text>
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  cell: {
    minHeight: 48,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelPrefix: {
    color: 'rgba(0,0,0,0.60)',
  },
  levelText: {
    color: 'rgba(0,0,0,0.87)',
    flex: 1,
  },
  expandIcon: {
    width: 24,
    height: 24,
    tintColor: 'rgba(0,0,0,0.24)',
  },
  collapseIcon: {
    width: 24,
    height: 24,
    tintColor: 'rgba(0,0,0,0.24)',
    transform: [{ scaleY: -1 }],
  },
  itemText: {
    color: 'rgba(0,0,0,0.84)',
    flex: 1,
  },
  selectedIcon: {
    width: 24,
    height: 24,
    marginRight: -4,
  },
  separator: {
    height: 1,
    marginLeft: 16,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  surface: {
    backgroundColor: 'white',
  },
  searchResultCell: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchResultText: {
    fontSize: 17,
    color: 'rgba(0,0,0,0.84)',
    flex: 1,
  },
  highlightText: {
    color: theme.yellow800,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
})

export const openArchiveEditorModal = (props: ArchiveEditorModalProps) => {
  return SlideModal.open({
    useNativeDriver: true,
    visible: true,
    duration: 100,
    modalProps: ttSlideModalProp(props.onCancel),
    children: <ArchiveEditorModal {...props} />,
  })
}
