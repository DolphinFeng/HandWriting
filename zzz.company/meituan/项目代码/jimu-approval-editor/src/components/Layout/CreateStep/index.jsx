import React from 'react';
import './index.less';

export default class ContentWrp extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      setStep,
      curStep,
      info = ['信息配置', '表单设计', '流程设计', '更多设置', '发布上线']
    } = this.props;
    return (
      <div className='approval-step'>
        {info.map((item, index) => (
          <div
            key={index}
            className={`approval-step-item ${curStep === index &&
              'approval-step-active'}`}
            onClick={() => {
              setStep(index);
            }}
          >
            <span className='step-num'>{index + 1}</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    );
  }
}
