// import '@ss/mtd-react/lib/style/index.css';
import React, { useState } from 'react';
import { Icon, Button, Tooltip } from '@ss/mtd-react';
import classNames from 'classnames';
import { buildConditionDescription, buildTaskDescription } from '@/utils/form';
import { NODETYPE } from '../const';

export default function nodeBox(props) {
  const { option, type, componentList } = props;
  const { dealWithNodeFn, curNodeIndex } = option || {};
  const isDefault = option.default;

  const [closeVisable, setCloseVisable] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const showClose = !(
    isDefault ||
    type === NODETYPE.Start ||
    type === NODETYPE.End
  );
  let title = '默认节点名称';
  let background = '#a9b4cd';

  switch (type) {
    case NODETYPE.Start:
      title = '发起';
      break;
    case NODETYPE.End:
      title = '结束';
      break;
    case NODETYPE.Task:
      background = '#5b91fe';
      title = option.title || '审批节点';
      break;
    case NODETYPE.Condition:
      background = '#fff';
      title = option.default
        ? '默认'
        : option.title || `条件${option.priority + 1}`;
      break;
    default:
      break;
  }

  /**
   * 右上角，branch 时显示优先级
   */
  const renderTopRight = (nodeType, priority) => {
    /**
     * 审批节点有优先级
     */
    if (nodeType === NODETYPE.Condition) {
      return <span>优先级 {priority + 1}</span>;
    }
    return null;
  };

  const description = ((nodeType, option) => {
    switch (nodeType) {
      case NODETYPE.Condition:
        // eslint-disable-next-line no-case-declarations
        const desc = buildConditionDescription(option);
        if (!desc) {
          return null;
        }

        return (
          <div className='node-detail'>
            <span>{desc}</span>
          </div>
        );
      case NODETYPE.Task:
        if (option?.ccGroups?.length > 0) {
          return (
            <div className='node-detail two-line'>
              <div className='line'>
                审批人:
                {buildTaskDescription(
                  option.approvalGroup || {},
                  componentList || []
                )}
              </div>
              <div className='line'>
                抄送人:
                {option.ccGroups
                  .map((approvalGroup) => {
                    return buildTaskDescription(
                      approvalGroup,
                      componentList || []
                    );
                  })
                  .join(';')}
              </div>
            </div>
          );
        }
        return (
          <div className='node-detail'>
            <span>
              {buildTaskDescription(
                option.approvalGroup || {},
                componentList || []
              )}
            </span>
          </div>
        );
      case NODETYPE.Start:
        if (option?.ccGroups?.length > 0) {
          return (
            <div className='node-detail two-line'>
              <div className='line'>
                抄送人:
                {option.ccGroups
                  .map((approvalGroup) => {
                    return buildTaskDescription(
                      approvalGroup,
                      componentList || []
                    );
                  })
                  .join(';')}
              </div>
            </div>
          );
        }
        return null;
      default:
        return null;
    }
  })(type, option);

  const hasError = option.validateMessage && option.validateMessage.length > 0;

  return (
    <div
      className={classNames(
        'flow-node-box',
        {
          disabled: option.default || type === NODETYPE.End
        },
        { 'has-error': hasError }
      )}
      onMouseOver={() => {
        setCloseVisable(true);
      }}
      onFocus={() => 0}
      onMouseLeave={() => {
        setCloseVisable(false);
      }}
    >
      <div
        className='node-title'
        onClick={(e) => {
          e.stopPropagation();
        }}
        style={{ background, ...option.style }}
      >
        <span>{title}</span>
        {renderTopRight(type, option.priority)}
      </div>
      {description ? (
        <Tooltip message={description}>
          <div className='node-context'>
            {description}
            <Icon type='right'></Icon>
          </div>
        </Tooltip>
      ) : (
        <div className='node-context'>
          <div className='node-detail-origin'>
            {option.default ? '其他情况' : '添加'}
          </div>
          <Icon type='right'></Icon>
        </div>
      )}

      {showClose && (
        <Icon
          type='close'
          style={{ display: closeVisable ? 'block' : 'none' }}
          className='delete-btn'
          onClick={(e) => {
            e.stopPropagation();
            setIsDelete(true);
          }}
        ></Icon>
      )}
      {isDelete && (
        <div className='confirm-delete'>
          <Button
            className='bt-cancel'
            onClick={(e) => {
              e.stopPropagation();
              setIsDelete(false);
            }}
          >
            取消
          </Button>
          <Button
            className='bt-confirm'
            onClick={(e) => {
              e.stopPropagation();

              setIsDelete(false);
              const params = {
                index: curNodeIndex,
                type
              };
              dealWithNodeFn(params, 'delete');
            }}
          >
            确认
          </Button>
        </div>
      )}
    </div>
  );
}
