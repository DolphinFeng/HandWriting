import { i18nClient } from '@sailor/i18n-web';
/*
 * @Description: 拖拽日程块
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2021-03-03 16:08:18
 * @LastEditors: zhaojingchao
 * @LastEditTime: 2021-03-29 14:53:30
 * @FilePath: /scheduleweb/src/components/ScheduleConflict/DraggableContainer/index.tsx
 */
import React from 'react';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import Draggable from 'react-draggable';
import classNames from 'classnames';
import { addModuleClick } from '@/services/lxService';
import styles from './index.less';

const minHeight = 9;

interface IDraggableContainer {
  top: number;
  height: number;
  conflictCount: number;
  setStartAndHeight?: any;
  quetoHeight: number;
  isCurrentDay?: boolean;
  setIsDragging?: any;
  noTime: boolean;
  nCanCreate?: boolean;
  createCallBack?: any;
  noCheckConflit: boolean;
  setDraggingTimeQuote?: any;
  chatType?: string;
}

// 拉伸边缘的高度
const RESIZE_ITEM_HEIGHT = 3;

// 区分点击还是拖拽的距离
const POS_DISTANCE = 12;

// 四舍五入获取块的位置和高度
const getRoundQuote = (pos, quoteHeight) => {
  return Math.round(pos / quoteHeight);
};

@observer
export default class DraggableContainer extends React.Component<IDraggableContainer> {
  // 拖动过程中变化的height
  @observable deltaHeight = 0;

  // 拖动过程中变化的top
  @observable deltaTop = 0;

  // 拖动过程中3个元素的偏移量
  @observable itemControlledDragPos = 0;

  @observable btmControlledDragPos = 0;

  @observable topControlledDragPos = 0;

  // 空白区域拖拽
  @observable newTop = 0;

  @observable newBottom = 0;

  @observable blankDragging = false;

  @observable isDragging = false;

  // 拖拽开始的位置
  startTop = 0;

  // 拖拽点击开始的时间 用于区分是拖拽还是点击 如果超过 TIME_DISTANCE 作为拖拽否则作为拉伸
  // TIME_DISTANCE ms后显示拖拽块并启用拖拽逻辑
  // startClickTime = 0;

  @observable showDraggingDiv = false;

  // 用来区分是否拖拽过
  hasDraggle = false;

  // 拖拽过程中设置临时显示时间
  setDraggingTimeQuote = () => {
    const {
      height, top, quetoHeight, setDraggingTimeQuote
    } = this.props;
    setDraggingTimeQuote
      && setDraggingTimeQuote(
        Math.round(
          (top + this.deltaTop + this.itemControlledDragPos) / quetoHeight
        ),
        Math.round((height + this.deltaHeight) / quetoHeight)
      );
  };

  setIsDragging = (value) => {
    const { setIsDragging } = this.props;
    this.isDragging = value;
    setIsDragging && setIsDragging(value);
  };

  // 移动逻辑
  onStartItemDrag = () => {
    this.hasDraggle = false;
    this.setIsDragging(true);
    this.setDraggingTimeQuote();
  };

  onControlledItemDrag = (_, position) => {
    const { y } = position;
    this.itemControlledDragPos = y;
    this.btmControlledDragPos = y;
    this.topControlledDragPos = y;
    this.hasDraggle = true;
    this.setDraggingTimeQuote();
  };

  onStopItemDrag = () => {
    const {
      height, top, nCanCreate, createCallBack, chatType
    } = this.props;
    this.setStartAndHeight(top + this.itemControlledDragPos, height);
    this.setIsDragging(false);
    if (!this.hasDraggle) {
      addModuleClick('b_oa_jjztaha1_mc', { chatType });
      if (nCanCreate) {
        addModuleClick('b_oa_g6v1k77j_mc', { chatType });
        createCallBack && createCallBack();
      }
    }
    this.itemControlledDragPos = 0;
    this.btmControlledDragPos = 0;
    this.topControlledDragPos = 0;
  };

  // 下拉伸逻辑
  onStartBtmDrag = () => {
    this.deltaHeight = 0;
    this.setIsDragging(true);
    this.setDraggingTimeQuote();
  };

  onControlledBtmDrag = (_, position) => {
    const { y } = position;
    const { height } = this.props;
    // 控制日程不小于15分钟
    if (height + y >= minHeight) {
      this.deltaHeight = y;
      this.btmControlledDragPos = y;
      this.setDraggingTimeQuote();
    }
  };

  onStopBtmDrag = () => {
    const { height, top } = this.props;
    this.setStartAndHeight(top, height + this.btmControlledDragPos);
    this.deltaHeight = 0;
    this.btmControlledDragPos = 0;
    this.setIsDragging(false);
  };

  // 上拉伸逻辑
  onStartTopDrag = () => {
    this.deltaHeight = 0;
    this.deltaTop = 0;
    this.setIsDragging(true);
    this.setDraggingTimeQuote();
  };

  onControlledTopDrag = (_, position) => {
    const { y } = position;
    const { height } = this.props;
    // 控制日程不小于15分钟
    if (height - y >= minHeight) {
      this.deltaHeight = -y;
      this.topControlledDragPos = y;
      this.deltaTop = y;
      this.setDraggingTimeQuote();
    }
  };

  onStopTopDrag = () => {
    const { height, top } = this.props;
    this.setStartAndHeight(
      top + this.topControlledDragPos,
      height - this.topControlledDragPos
    );
    this.deltaHeight = 0;
    this.deltaTop = 0;
    this.topControlledDragPos = 0;
    this.setIsDragging(false);
  };

  // 拉伸结束设置区域块
  setStartAndHeight = (start, height) => {
    const { setStartAndHeight, quetoHeight } = this.props;
    setStartAndHeight
      && setStartAndHeight(
        getRoundQuote(start - 1, quetoHeight),
        getRoundQuote(height + 3, quetoHeight)
      );
  };

  // 切换天 点击设置时间
  setNewTime = (e) => {
    const {
      quetoHeight, height, setStartAndHeight, chatType
    } = this.props;
    const { top } = e.target.getBoundingClientRect();
    const start = e.clientY - top;
    // 如果开始时间比结束时间还大 则处理成1小时
    const end = start
      + (height > 0
        ? getRoundQuote(height, quetoHeight) * quetoHeight
        : quetoHeight * 4);
    const maxPos = 24 * 4;
    let startQuote = getRoundQuote(start, quetoHeight);
    // 防止超出去
    startQuote = startQuote >= maxPos ? maxPos - 1 : startQuote;
    let endQuote = getRoundQuote(end, quetoHeight);
    endQuote = endQuote > maxPos ? maxPos : endQuote;
    endQuote = endQuote > startQuote ? endQuote : startQuote + 1;
    setStartAndHeight && setStartAndHeight(startQuote, endQuote - startQuote);
    addModuleClick('b_oa_6serjyio_mc', { chatType });
  };

  getNearestPoint = (num: number) => {
    const { quetoHeight } = this.props;
    const p = Math.round(num / quetoHeight);
    return p * quetoHeight;
  };

  mouseDown = (e) => {
    const { isCurrentDay, noCheckConflit } = this.props;
    if (!isCurrentDay || noCheckConflit) {
      const { top } = e.target.getBoundingClientRect();
      this.newTop = this.getNearestPoint(e.clientY - top);
      this.startTop = this.newTop;
      this.newBottom = -(this.newTop + minHeight);
      this.blankDragging = true;
      this.setIsDragging(true);
    } else if (isCurrentDay && !this.isDragging) {
      // 今天且不在日程块区域点击调整时间
      this.setNewTime(e);
    }
  };

  mouseMove = (e) => {
    if (this.blankDragging) {
      const { top } = e.target.getBoundingClientRect();
      const pos = this.getNearestPoint(e.clientY - top);
      if (pos >= this.startTop) {
        this.newBottom = -Math.max(pos, this.newTop + minHeight);
      } else {
        // this.newBottom = -this.startTop;
        // this.newTop = Math.min(pos, -this.newBottom - minHeight);
      }
      // 点击超过时间或者超过距离就算拖拽
      if (Math.abs(-this.newBottom - this.newTop) >= POS_DISTANCE) {
        this.showDraggingDiv = true;
      }
    }
  };

  mouseUp = (e) => {
    if (this.blankDragging) {
      const { top } = e.target.getBoundingClientRect();
      const pos = this.getNearestPoint(e.clientY - top);
      if (pos >= this.startTop) {
        this.newBottom = -Math.max(pos, this.newTop + minHeight);
      } else {
        // this.newBottom = -this.startTop;
        // this.newTop = Math.min(pos, -this.newBottom - minHeight);
      }
      // 拖拽超过一定高度 作为拖拽处理
      // 拖拽低于一定高度作为点击处理
      if (this.showDraggingDiv) {
        this.setStartAndHeight(
          this.newTop,
          Math.max(-this.newBottom - this.newTop, minHeight)
        );
      } else {
        this.setNewTime(e);
      }
      this.blankDragging = false;
      this.showDraggingDiv = false;
      this.setIsDragging(false);
    }
  };

  renderDraggleDiv = () => {
    const {
      top, height, conflictCount, quetoHeight, nCanCreate
    } = this.props;
    return (
      <>
        <Draggable
          bounds="parent"
          position={{ x: 0, y: this.topControlledDragPos }}
          onStart={this.onStartTopDrag}
          onStop={this.onStopTopDrag}
          onDrag={this.onControlledTopDrag}
          axis="y"
          grid={[quetoHeight, quetoHeight]}
        >
          <div
            className={classNames(styles.draggleItem, styles.top)}
            style={{
              height: RESIZE_ITEM_HEIGHT,
              top
            }}
          />
        </Draggable>
        <Draggable
          bounds="parent"
          position={{ x: 0, y: this.itemControlledDragPos }}
          onDrag={this.onControlledItemDrag}
          onStart={this.onStartItemDrag}
          onStop={this.onStopItemDrag}
          axis="y"
          grid={[quetoHeight, quetoHeight]}
        >
          <div
            style={{
              top: top + this.deltaTop,
              height: height + this.deltaHeight
            }}
            className={classNames(styles.scheduleTime, styles.draggleItem, {
              [styles.busyScheduleTime]: conflictCount > 0,
              [styles.draggingScheduleTime]: this.isDragging
            })}
          >
            {nCanCreate && height + this.deltaHeight > minHeight && (
              <span>
                {i18nClient.t(
                  'draggable_container_click_again_creat_calendar',
                  '再次点击创建日程'
                )}
              </span>
            )}
          </div>
        </Draggable>
        <Draggable
          bounds="parent"
          position={{ x: 0, y: this.btmControlledDragPos }}
          onStart={this.onStartBtmDrag}
          onStop={this.onStopBtmDrag}
          onDrag={this.onControlledBtmDrag}
          axis="y"
          grid={[quetoHeight, quetoHeight]}
        >
          <div
            className={classNames(styles.draggleItem, styles.bottom)}
            style={{
              height: RESIZE_ITEM_HEIGHT,
              top: top + height - RESIZE_ITEM_HEIGHT
            }}
          />
        </Draggable>
      </>
    );
  };

  render() {
    const { isCurrentDay, noCheckConflit } = this.props;
    return (
      <div
        className={styles.columns}
        onMouseDown={this.mouseDown}
        onMouseMove={this.mouseMove}
        onMouseUp={this.mouseUp}
      >
        {/* （拖拽一段距离后显示块） */}
        {this.showDraggingDiv && (
          <div className={styles.shadowItemBlankDrag}>
            <div
              className={classNames(styles.scheduleTime, styles.draggleItem)}
              style={{
                bottom: this.newBottom + 3,
                top: this.newTop
              }}
            />
          </div>
        )}
        {isCurrentDay && !noCheckConflit && this.renderDraggleDiv()}
      </div>
    );
  }
}
