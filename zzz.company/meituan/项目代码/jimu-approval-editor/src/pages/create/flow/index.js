import { inject } from 'mobx-react';
import { observer } from 'mobx-react-lite';
import React, { Component } from 'react';
import { withRouter } from 'onejs/router';
// import Page from './view';
import Flow from './flow';
import './index.less';

@inject(({ global, approval }) => ({
  ...global,
  setProcess: approval.setProcess,
  process: approval.process
}))
@observer
@withRouter
export default class App extends Component {
  constructor(props) {
    super(props);

    this.flowRef = React.createRef();
  }

  async componentDidMount() {
    this.props.setFlowRef(this.flowRef);
  }

  render() {
    const { setProcess, process } = this.props;
    return (
      <div
        style={{
          width: '100%',
          height: 'calc(100% - 50px)',
          position: 'relative'
        }}
      >
        <Flow
          ref={(ref) => {
            this.flowRef = ref;
          }}
          setProcess={setProcess}
          process={process}
        ></Flow>
      </div>
    );
  }
}
