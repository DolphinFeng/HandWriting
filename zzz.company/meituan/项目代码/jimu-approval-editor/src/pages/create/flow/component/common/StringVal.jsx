import React from 'react';
// 纯文本预览展示组件
export default function(props) {
  try {
    let { value } = props;
    if (typeof value !== 'string' && value) {
      value = JSON.stringify(props.value);
    }
    return (
      <div
        style={{ ...props.style, whiteSpace: 'pre-line' }}
        className='bpm-form-inner-value'
      >
        {value || '--'}
      </div>
    );
  } catch (e) {
    return (
      <div style={{ whiteSpace: 'pre-line' }} className='bpm-form-inner-value'>
        --
      </div>
    );
  }
}
