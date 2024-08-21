import { i18nClient } from '@sailor/i18n-mrn'
import React, { Component } from 'react'
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Keyboard } from '@mrn/react-native'
import { Icon } from '@ss/mtd-react-native'
import { MWSSearchList } from '@src/components/MWSSearchList'
import { Label } from '../../constants/TTServiceModule'
import { listRgLabels, searchLabels } from '../../constants/TTApi'
import theme from '@src/common/styles/MWSStyle'

interface LabelEditorProps {
  rgId?: string
  selectedLabels: Label[]
  setSelectedLabels: (labels: Label[]) => void
  newLabel: () => void
}

interface LabelEditorState {
  rgLabels: Label[]
  searchResult: Label[]
  inSearch: boolean
  selectedIdSet: Set<number>
}

export class LabelEditor extends Component<LabelEditorProps, LabelEditorState> {
  static getDerivedStateFromProps = (nextProps: Readonly<LabelEditorProps>) => ({
    selectedIdSet: new Set(nextProps.selectedLabels.map(({ id }) => id)),
  })

  constructor(props: Readonly<LabelEditorProps>) {
    super(props)
    this.state = {
      rgLabels: [],
      searchResult: [],
      inSearch: false,
      selectedIdSet: new Set(),
    }
  }

  componentDidMount() {
    this.fetchRgLabels()
  }

  async fetchRgLabels() {
    const { rgId } = this.props
    if (rgId) {
      try {
        const resp = await listRgLabels(rgId)
        if (resp && resp.data && resp.data.items) {
          this.setState({ rgLabels: resp.data.items })
        }
      } catch (ignored) {}
    }
  }

  handleSearch = async keyword => {
    console.log('search', keyword)
    if (!keyword) {
      this.setState({ searchResult: [] })
      return
    }
    try {
      const resp = await searchLabels(keyword)
      if (resp && resp.data && resp.data.items) {
        this.setState({ searchResult: resp.data.items })
      }
    } catch (e) {}
  }

  handleLabelPress(label: Label) {
    const { selectedLabels } = this.props
    const newData = selectedLabels.filter(({ id }) => id !== label.id)
    if (newData.length === selectedLabels.length) {
      newData.push(label)
    }
    this.props.setSelectedLabels(newData)
  }

  render() {
    const { inSearch, rgLabels, searchResult, selectedIdSet } = this.state
    const labels = inSearch ? searchResult : rgLabels
    return (
      <View style={{ flex: 1 }}>
        {this.renderSelectedLabels()}
        <MWSSearchList
          placeHolderTxt={i18nClient.t('components_common_ff8bd9', {
            defaultValue: '搜索添加标签',
          })}
          styles={{
            color: theme.yellow800,
          }}
          handleSearchOnFocus={() => this.setState({ inSearch: true })}
          handleSearch={this.handleSearch}
          handleCancelSearch={() => this.setState({ inSearch: false })}
          handleClearChange={() => console.log('clearChange')}
        />

        {inSearch || (
          <View
            style={{
              flexDirection: 'row',
              marginHorizontal: 16,
              marginTop: 16,
            }}
          >
            <Text style={{ fontWeight: '500', color: 'rgba(0,0,0,0.84)' }}>
              {i18nClient.t('components_common_7ec2d9', { defaultValue: '常用标签' })}
            </Text>
            <View style={{ flex: 1 }} />
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center' }}
              onPress={() => this.props.newLabel()}
            >
              <Icon type="add" size={14} style={{ tintColor: 'rgba(0,0,0,0.6)' }} />

              <Text style={{ color: 'rgba(0,0,0,0.60)' }}>
                {i18nClient.t('components_common_a1d3bf', { defaultValue: '新增标签' })}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <ScrollView
          overScrollMode="never"
          style={{ flex: 1 }}
          onScrollBeginDrag={() => Keyboard.dismiss()}
        >
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignItems: 'center',
              marginHorizontal: 16,
              marginVertical: 16,
            }}
          >
            {labels.map(label => {
              const { id, name } = label
              const selected = selectedIdSet.has(id)
              return (
                <TouchableOpacity
                  key={'' + id}
                  style={[styles.labelContainer, selected && styles.labelContainerSelected]}
                  onPress={lable => this.handleLabelPress(label)}
                >
                  <Text style={[styles.labelText, selected && styles.labelTextSelected]}>
                    {name}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </ScrollView>
      </View>
    )
  }

  renderSelectedLabels() {
    const { selectedLabels } = this.props
    return (
      selectedLabels.length > 0 && (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            marginHorizontal: 16,
            marginTop: 12,
          }}
        >
          <Text style={{ fontSize: 14, color: 'rgba(0,0,0,0.36)', marginRight: 12 }}>
            {i18nClient.t('components_common_7bf54e', { defaultValue: '已选' })}
          </Text>
          {selectedLabels.map(label => {
            const { id, name } = label
            return (
              <TouchableOpacity
                key={'' + id}
                style={[styles.labelContainer, styles.labelContainerSelected]}
                onPress={() => this.handleLabelPress(label)}
              >
                <Text style={[styles.labelText, styles.labelTextSelected]}>{name}</Text>
                <Icon type="close" size={12} style={{ tintColor: '#FF8800', marginLeft: 4 }} />
              </TouchableOpacity>
            )
          })}
        </View>
      )
    )
  }
}

const styles = StyleSheet.create({
  labelText: {
    fontSize: 14,
    color: 'rgba(0,0,0,0.84)',
  },
  labelTextSelected: {
    color: '#FF8800',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  labelContainerSelected: {
    backgroundColor: '#FFF8EE',
  },
})
