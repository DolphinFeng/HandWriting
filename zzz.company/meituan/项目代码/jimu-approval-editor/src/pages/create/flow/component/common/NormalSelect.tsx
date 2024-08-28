import React from 'react';
import { Select } from '@ss/mtd-react';

const { Option } = Select;
interface IOption {
  value: string;
  label: string;
}

export interface INormalSelectPops {
  onChange?: Function;
  value?: String;
  componentProperty?: String;
  style?: React.CSSProperties;
  options: Array<IOption>;
}
export default class NormalSelect extends React.Component<
  INormalSelectPops,
  any
> {
  constructor(props) {
    super(props);
    this.state = {
      value: ''
    };
  }

  handleChange(value) {
    const { onChange } = this.props;
    onChange && onChange(value);
  }

  componentWillMount() {
    this.setState({
      value: this.props.value
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      value: nextProps.value
    });
  }

  render() {
    const { componentProperty, options = [], style } = this.props;
    // fix mtd bug, can not bind "" value; tt number https://tt.sankuai.com/ticket/detail?id=6567044
    if (this.state.value === '') {
      const nullValue = options.filter((x) => {
        return x.value === '';
      });
      // this.state.value =
      this.setState({
        value: nullValue && nullValue[0]
      });
    }
    return (
      <Select
        value={this.state.value}
        style={style}
        onChange={(value) => {
          this.handleChange(value);
        }}
        {...componentProperty}
      >
        {options.map((o) => {
          return (
            <Option key={o.value} value={o.value}>
              {o.label}
            </Option>
          );
        })}
      </Select>
    );
  }
}
