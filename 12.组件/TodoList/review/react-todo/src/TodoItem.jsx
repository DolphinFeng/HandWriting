import React, { Component } from 'react'

export default class TodoItem extends Component {
  render() {
    return (
      <div>
        <ul>
            {
                this.props.list.map((item, index) => {
                    return <li key={index}>{item} <button>x</button></li> 
                })
            }
        </ul>
      </div>
    )
  }
}
