/**
 * 校验组件
 */

import React, { useState, useCallback } from 'react';
import { Tooltip } from '@ss/mtd-react';

export interface IProps {
  errors: Array<any>;
}

export enum IErrorType {
  base = 'base',
  form = 'form',
  process = 'process'
}

export default function ApprovalValidate(props) {
  const { curStep, setStep, errors } = props;

  const isShow = errors.length > 0;

  const [showError, setShowError] = useState<boolean>(isShow);

  const renderPopover = (err) => {
    return (
      <>
        <div className='popover-box'>
          <div className='title'> 内容不完善</div>
          <div className='valid-content'>
            {err.map((item, index) => {
              switch (item.type) {
                case 'base':
                  return (
                    <div key={index} className='valid-item'>
                      <div className='valid-item-title'>信息配置</div>
                      <div className='valid-item-message'>
                        {item.validateMessage}
                      </div>
                      {curStep !== 0 && (
                        <div
                          className='valid-item-tip'
                          onClick={() => setStep(0)}
                        >
                          去修改
                        </div>
                      )}
                    </div>
                  );
                case 'form':
                  return (
                    <div key={index} className='valid-item'>
                      <div className='valid-item-title'>表单设计</div>
                      <div className='valid-item-message'>
                        {item.validateMessage}
                      </div>
                      {curStep !== 1 && (
                        <div
                          className='valid-item-tip'
                          onClick={() => setStep(1)}
                        >
                          去修改
                        </div>
                      )}
                    </div>
                  );
                case 'process':
                  return (
                    <div key={index} className='valid-item'>
                      <div className='valid-item-title'>流程设计</div>
                      <div className='valid-item-message'>
                        {item.validateMessage}
                      </div>
                      {curStep !== 2 && (
                        <div
                          className='valid-item-tip'
                          onClick={() => setStep(2)}
                        >
                          去修改
                        </div>
                      )}
                    </div>
                  );
                case 'publish':
                  return (
                    <div key={index} className='valid-item'>
                      <div className='valid-item-title'>发布上线</div>
                      <div className='valid-item-message'>
                        {item.validateMessage}
                      </div>
                      {curStep !== 4 && (
                        <div
                          className='valid-item-tip'
                          onClick={() => setStep(4)}
                        >
                          去修改
                        </div>
                      )}
                    </div>
                  );
                default:
                  return null;
              }
            })}
          </div>
        </div>
      </>
    );
  };

  const handleClick = useCallback(() => {
    setShowError((state) => {
      return !state;
    });
  }, [showError, setShowError]);

  if (errors && errors.length > 0) {
    return (
      <Tooltip
        className='approval-header-err'
        placement='bottomRight'
        visible={showError}
        defaultVisible
        trigger='click'
        onDocumentClick={() => {
          setShowError(() => {
            return false;
          });
        }}
        message={renderPopover(errors)}
      >
        <span
          className='approval-header-errInfo'
          onClick={handleClick}
        >{`${errors.length}条内容不完善`}</span>
      </Tooltip>
    );
  }

  return null;
}
