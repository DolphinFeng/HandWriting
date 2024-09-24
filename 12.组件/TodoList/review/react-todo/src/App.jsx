import React, { Component } from 'react'

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: 'data'
    }
  }

  componentDidMount() {
    debugger;
    this.setState({
      data: 'did mount state'
    }, () => {
      console.log("did mount state ", this.state.data);
      // did mount state did mount state
    });

    setTimeout(() => {
      this.setState({
        data: 'setTimeout'
      }, () => {
        console.log("setTimeout ", this.state.data);
        // setTimeout setTimeout
      });
    });
  }

  render() {
    return (
      <div>
        {this.state.data}
      </div>
    );
  }
}