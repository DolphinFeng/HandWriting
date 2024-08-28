// import '@ss/mtd-react/lib/style/index.css';
import React, { useState } from 'react';
import { Icon, Popover } from '@ss/mtd-react';

export default function AddNode(props) {
  const { option } = props;
  const { dealWithNodeFn, curNodeIndex } = option || {};
  const [addBtVisable, setAddBtVisable] = useState(false);

  function addNodeType(type) {
    const params = {
      index: curNodeIndex,
      type
    };
    dealWithNodeFn(params, 'add');
    setAddBtVisable(false);
  }

  return (
    <div
      className={`add-node-btn${addBtVisable ? ' add-node-btn-active' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <Popover
        placement='right'
        trigger='click'
        getContainer={() => document.querySelector('.flow-editor-root')}
        content={
          <div className='add-node-types'>
            <div
              className='node-type'
              onClick={(e) => {
                e.stopPropagation();
                addNodeType('Task');
              }}
            >
              <Icon
                type='avatar-o'
                className='node-type-icon'
                style={{ color: 'rgb(91, 145, 254)' }}
              ></Icon>
              <div className='node-type-name'>审批人</div>
            </div>
            <div
              className='node-type'
              onClick={(e) => {
                e.stopPropagation();
                addNodeType('Gateway');
              }}
            >
              <Icon
                type='hierarchy-fill'
                className='node-type-icon'
                style={{ color: '#2eb795' }}
              ></Icon>
              <div className='node-type-name'>分支</div>
            </div>
          </div>
        }
      >
        <div className='add-btn'>
          <Icon
            type='add'
            style={{
              fontSize: 13,
              color: '#08c'
            }}
          ></Icon>
        </div>
      </Popover>
    </div>
  );
}
