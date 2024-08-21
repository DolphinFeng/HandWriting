import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Dimensions,
  ViewStyle,
  StyleProp
} from '@mrn/react-native'
import React, { Component } from 'react'
import theme from '@src/common/styles/MWSStyle'
import { convertHex } from '@src/pages/tt/constants/TTStyle'
import SelectItem from './SelectItem'

export class GroupSelectItem {
  displayName: string
  index: number
  // selected: boolean
}

interface IProps {
  headerTitle: string
  itemList: Array<GroupSelectItem>
  onChange?: (selectedIndex?: Array<number>) => void
  selectedIndex?: Array<number>

  /** 是否多选，默认是多选 */
  isMultpleSelect: boolean

  defaultBgStyle?: StyleProp<ViewStyle>
  defaultTextStyle?: StyleProp<ViewStyle>
  selectedBgStyle?: StyleProp<ViewStyle>
  selectedTextStyle?: StyleProp<ViewStyle>
}

interface IState {
  selectedIndex: Array<number>
}

const itemSpace = 9
const itemHeight = 36
const itemWidth = (Dimensions.get('screen').width - 16 * 2 - itemSpace * 2) / 3

class FilterGroupSelect extends Component<IProps, IState> {
  static defaultProps = {
    isMultpleSelect: true
  }

  constructor(props) {
    super(props)

    this.state = {
      selectedIndex: this.props.selectedIndex ?? []
    }
  }

  render() {
    // const selectedValues = this.props.itemList
    //   .filter(item => item.selected === true)
    //   .map(item => item.index)

    console.log('FilterGroupSelect render', this.state.selectedIndex)
    console.log('this.props.itemList', this.props.itemList)
    // -9去除item的左mrgin
    return (
      <>
        <Text style={styles.headerTitle}>{this.props.headerTitle}</Text>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginHorizontal: -9
          }}
        >
          {this.props.itemList.map(item =>
            this.renderItemNew(
              item.displayName,
              item.index,
              this.state.selectedIndex.includes(item.index)
            )
          )}
        </View>
      </>
    )
  }

  renderItemNew(label: string, index: number, selected?: boolean) {
    return (
      <SelectItem
        label={label}
        selected={selected ?? false}
        index={index}
        key={`FilterGroupSelect${index}`}
        onPress={this.handleItemClick}
        defaultBgStyle={
          this.props.defaultBgStyle
            ? this.props.defaultBgStyle
            : styles.itemDefaultBg
        }
        defaultTextStyle={
          this.props.defaultTextStyle
            ? this.props.defaultTextStyle
            : styles.itemDefaultText
        }
        selectedBgStyle={
          this.props.selectedBgStyle
            ? this.props.selectedBgStyle
            : styles.itemSelectedBg
        }
        selectedTextStyle={
          this.props.selectedTextStyle
            ? this.props.selectedTextStyle
            : styles.itemSelectedText
        }
      />
    )
  }

  handleItemClick = (index: number) => {
    console.log('index', index)

    let selected = this.state.selectedIndex
    let newSelected

    if (this.props.isMultpleSelect) {
      if (selected.includes(index)) {
        newSelected = selected.filter(v => v !== index)
      } else {
        newSelected = selected
        newSelected.push(index)
      }
    } else {
      if (selected.includes(index)) {
        newSelected = []
      } else {
        newSelected = [index]
      }
    }

    this.setState({ selectedIndex: newSelected })

    this.props.onChange && this.props.onChange(newSelected)
  }

  updateSelectedIndex = (newSelectedIndex: Array<number>) => {
    this.setState({ selectedIndex: newSelectedIndex })
  }

  resetSelected = () => {
    this.setState({ selectedIndex: [] })
    this.props.onChange && this.props.onChange([])
  }
}

export default FilterGroupSelect

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: theme.size14,
    color: theme.gray60,
    lineHeight: theme.height20
  },
  itemDefaultBg: {
    width: itemWidth,
    height: itemHeight,
    backgroundColor: theme.gray04,
    marginTop: itemSpace,
    marginLeft: itemSpace,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4
  },
  itemSelectedBg: {
    width: itemWidth,
    height: itemHeight,
    backgroundColor: theme.yellowEE,
    marginTop: itemSpace,
    marginLeft: itemSpace,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4
  },
  itemDefaultText: {
    color: theme.gray84,
    fontSize: theme.size14,
    lineHeight: theme.height22
  } as ViewStyle,
  itemSelectedText: {
    color: theme.yellow800,
    ...theme.fontBold,
    fontSize: theme.size14,
    lineHeight: theme.height20
  } as ViewStyle
})
