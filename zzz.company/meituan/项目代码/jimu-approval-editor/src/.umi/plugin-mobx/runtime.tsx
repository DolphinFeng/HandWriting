// @ts-nocheck
import React from 'react';
import MobxContainer from './MobxContainer';

export function rootContainer(container) {
  return React.createElement(MobxContainer, null, container);
}
