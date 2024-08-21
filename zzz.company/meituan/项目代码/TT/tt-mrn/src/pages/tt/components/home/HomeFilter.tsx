import { i18nClient, withTranslation } from '@sailor/i18n-mrn'
import { TouchableOpacity, View, Text, StyleSheet, Dimensions } from '@mrn/react-native'
import React, { Component } from 'react'
import { TTHomeFilterStyle } from '../../constants/TTStyle'
import FilterGroupSelect, {
  GroupSelectItem,
} from '@src/common/helpers/filterPanel/FilterGroupSelect'
import { SLA, Sla2CN } from '../../constants/ConfigMap'
import FilterConfirm from '@src/common/helpers/filterPanel/FilterConfirm'
import store from '../../redux/store'
import { updateFilterSelection } from '../../redux/actions'
import theme from '@src/common/styles/MWSStyle'
import { MWSButton } from '@src/components/MWSButton'
import TTHomeFilterConfirm from './TTHomeFilterConfirm'

export class TTHomeFilterModel {
  /** 选择的状态列表 */
  selectedStatusList: Array<number>
  /** 选择的级别列表 */
  selectedSLAList: Array<number>

  calculateFiltersCount() {
    return (this.selectedStatusList?.length ?? 0) + (this.selectedSLAList?.length ?? 0)
  }
}

interface IProps {
  selectedFilters?: TTHomeFilterModel
}

interface IState {
  /** 临时存放的状态 index 列表 */
  tempSelectedStatusList: Array<number>
  /** 状态 index 列表 */
  // selectedStatusList: Array<number>

  /** 临时存放的级别 index 列表 */
  tempSelectedSLAList: Array<number>
  /** 级别 index 列表 */
  selectedSLAList: Array<number>
}

export const TicketStatusList = [
  {key: 'components_home_2839c8', value: '未处理'},
  {key: 'components_home_9c5850', value: '已关闭'},
  {key: 'components_home_d7d257', value: '已解决'},
  {key: 'components_home_8d63ef', value: '暂停'},
  {key: 'components_home_72db77', value: '重新打开'},
  {key: 'components_home_5d459d', value: '处理中'}

  // i18nClient.t('components_home_2839c8', { defaultValue: '未处理' }),
  // i18nClient.t('components_home_9c5850', { defaultValue: '已关闭' }),
  // i18nClient.t('components_home_d7d257', { defaultValue: '已解决' }),
  // i18nClient.t('components_home_8d63ef', { defaultValue: '暂停' }),
  // i18nClient.t('components_home_72db77', { defaultValue: '重新打开' }),
  // i18nClient.t('components_home_5d459d', { defaultValue: '处理中' }),
]

const getTicketStatusList = () => [
  { key: 'components_home_2839c8', value: i18nClient.t('components_home_2839c8', { defaultValue: '未处理' }) },
  { key: 'components_home_9c5850', value: i18nClient.t('components_home_9c5850', { defaultValue: '已关闭' }) },
  { key: 'components_home_d7d257', value: i18nClient.t('components_home_d7d257', { defaultValue: '已解决' }) },
  { key: 'components_home_8d63ef', value: i18nClient.t('components_home_8d63ef', { defaultValue: '暂停' }) },
  { key: 'components_home_72db77', value: i18nClient.t('components_home_72db77', { defaultValue: '重新打开' }) },
  { key: 'components_home_5d459d', value: i18nClient.t('components_home_5d459d', { defaultValue: '处理中' }) }
];

class HomeFilter extends Component<IProps, IState> {
  private filterStatusList = []
  private filterSLAList = []

  private groupSelectStatus
  private groupSelectSLA

  constructor(props) {
    super(props)

    const selected = this.props.selectedFilters
    console.log('selected xxxx', selected)

    this.state = {
      tempSelectedStatusList: selected?.selectedStatusList ?? [],
      // selectedStatusList: selected?.selectedStatusList ?? [],

      tempSelectedSLAList: selected?.selectedSLAList ?? [],
      selectedSLAList: selected?.selectedSLAList ?? [],
    }

    console.log('TicketStatusList', TicketStatusList);
    this.filterStatusList = TicketStatusList.map((name, index) => {
      const item = new GroupSelectItem()
      item.displayName = i18nClient.t(name?.key)
      item.index = index
      // item.selected = selected?.selectedStatusList?.includes(`${index}`) ?? false

      return item
    })

    this.filterSLAList = SLA.map((level, index) => {
      const item = new GroupSelectItem()
      item.displayName = i18nClient.t(Sla2CN[level])
      item.index = index
      // item.selected = selected?.selectedSLAList?.includes(`${index}`) ?? false

      return item
    })

    console.log('blablabla', this.filterSLAList)
  }

  componentDidMount() {
    i18nClient.on('languageChanged', this.setTicketStatusList);
    i18nClient.on('languageChanged', this.setFilterLists);
  }

  componentWillUnmount() {
    i18nClient.off('languageChanged', this.setTicketStatusList);
    i18nClient.off('languageChanged', this.setFilterLists);
  }

  setTicketStatusList = () => {
    this.filterStatusList = getTicketStatusList().map((name, index) => {
      const item = new GroupSelectItem();
      item.displayName = name.value;
      item.index = index;
      // item.selected = this.state.tempSelectedStatusList?.includes(index) ?? false;
      return item;
    });
  };

  setFilterLists = () => {
    this.filterSLAList = SLA.map((level, index) => {
      const item = new GroupSelectItem();
      item.displayName = i18nClient.t(Sla2CN[level]);
      item.index = index;
      // item.selected = this.state.tempSelectedSLAList?.includes(index) ?? false;
      return item;
    });
  };

  // filterStatusList = TicketStatusList.map((name, index) => {
  //   const item = new GroupSelectItem()
  //   item.displayName = name
  //   item.index = index

  //   return item
  // })

  // filterSLAList = SLA.map((level, index) => {
  //   const item = new GroupSelectItem()
  //   item.displayName = Sla2CN[level]
  //   item.index = index

  //   return item
  // })

  render() {
    // return <Text>32333</Text>
    return (
      <View style={TTHomeFilterStyle.whole}>
        <View style={{ marginTop: 12 }}>
          <FilterGroupSelect
            headerTitle={i18nClient.t('components_home_3fea7c', { defaultValue: '状态' })}
            itemList={this.filterStatusList}
            ref={r => {
              this.groupSelectStatus = r
            }}
            onChange={this.handleStatusChanged.bind(this)}
            selectedIndex={this.state.tempSelectedStatusList}
          />
        </View>
        <View style={{ marginTop: 23 }}>
          <FilterGroupSelect
            headerTitle={i18nClient.t('components_home_95e0d7', { defaultValue: '等级' })}
            itemList={this.filterSLAList}
            ref={r => {
              this.groupSelectSLA = r
            }}
            onChange={this.handleSLALevelChanged.bind(this)}
            selectedIndex={this.state.tempSelectedSLAList}
          />
        </View>
        <TTHomeFilterConfirm
          leftText={i18nClient.t('components_home_4b9c32', { defaultValue: '重置' })}
          rightText={i18nClient.t('components_home_38cf16', { defaultValue: '确定' })}
          handleLeftPress={this.handleResetPress}
          handleRightPress={this.handleConfirmPress}
        />
      </View>
    )
  }

  // value 值 ['0', '1']
  handleStatusChanged(value?: Array<number>) {
    console.log('111', value)
    const selectedIndex = value
    this.setState({ tempSelectedStatusList: selectedIndex })
  }

  handleSLALevelChanged(value?: Array<number>) {
    console.log('222', value)
    const selectedIndex = value
    this.setState({ tempSelectedSLAList: selectedIndex })
  }

  handleResetPress = () => {
    console.log('reset press')
    this.setState({ tempSelectedStatusList: [], tempSelectedSLAList: [] })
    ;(this.groupSelectSLA as FilterGroupSelect).updateSelectedIndex([])
    ;(this.groupSelectStatus as FilterGroupSelect).updateSelectedIndex([])

    // const model = new TTHomeFilterModel()
    // store.dispatch(updateFilterSelection(model, model.calculateFiltersCount(), false, true))
  }

  handleConfirmPress = () => {
    // const statusList = this.state.tempSelectedStatusList.map((value, index) => TicketStatusList[value])
    // const levelList = this.state.tempSelectedSLAList.map((value, index) => SLA[value])

    const model = new TTHomeFilterModel()
    model.selectedStatusList = this.state.tempSelectedStatusList
    model.selectedSLAList = this.state.tempSelectedSLAList
    console.log('confirm result', model)
    store.dispatch(updateFilterSelection(model, model.calculateFiltersCount(), true))
  }
}

// export default HomeFilter
export default withTranslation('', {
	withRef: true
})(HomeFilter);
