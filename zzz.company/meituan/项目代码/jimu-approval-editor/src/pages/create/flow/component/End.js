import { observer } from 'mobx-react';
// import '@ss/mtd-react/lib/style/index.css';
import React, { Component } from 'react';
import NodeBox from './NodeBox';

@observer
export default class End extends Component {
  constructor(props) {
    super(props);

    this.state = {};

    this.flowRef = React.createRef();
  }

  componentDidMount() {}

  render() {
    const curInfo = this.props;
    return (
      <div className='flow-node end'>
        <NodeBox {...curInfo}></NodeBox>
      </div>
    );
  }
}
