import React from 'react';
import { Input } from '@ss/mtd-react';

export interface INormalInputProps {
  onChange?: Function;
  value?: string;
  componentProperty?: any;
  style?: React.CSSProperties;
}
export default class NormalInput extends React.Component<
  INormalInputProps,
  any
> {
  constructor(props) {
    super(props);
    this.state = {
      value: ''
    };
  }

  handleChange(e) {
    const { onChange } = this.props;
    onChange && onChange(e.target.value);
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
    const { componentProperty, style } = this.props;
    const { value } = this.state;
    return (
      <Input
        onChange={(e: any) => this.handleChange(e)}
        dispatchChange={['onInput']}
        value={value}
        style={style}
        {...componentProperty}
      />
    );
  }
}
