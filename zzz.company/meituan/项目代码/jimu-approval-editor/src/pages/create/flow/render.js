import React from 'react';
import Start from './component/Start.tsx';
import End from './component/End';
import Task from './component/Task/index';
import Gateway from './component/Gateway';
import Condition from './component/Condition/index';

// 渲染策略
/**
 * key 改成了 Math.random, 可能有一些性能损耗，但测了几十个节点没问题。
 * 如果要优化的话，建议打开 Drawer 保存时，单个节点产生一个 Math.random(),然后和 resouceId 拼凑成一起传递过来;
 */
export const NodeRenderStrategies = {
  // 基础输入框组件
  Task: (componentProperty) => {
    return <Task key={Math.random()} {...componentProperty} />;
  },
  Start: (componentProperty) => (
    <Start key={Math.random()} {...componentProperty} />
  ),
  Gateway: (componentProperty) => (
    <Gateway
      key={Math.random()}
      {...componentProperty}
      NodeRenderStrategies={NodeRenderStrategies}
    />
  ),
  Condition: (componentProperty) => (
    <Condition key={Math.random()} {...componentProperty} />
  ),
  End: (componentProperty) => <End key={Math.random()} {...componentProperty} />
};
