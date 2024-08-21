import { i18nClient } from '@sailor/i18n-web';
/*
 * @Description: 周视图操作按钮集
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-05-29 14:30:44
 * @LastEditors: zhaojingchao
 * @LastEditTime: 2021-02-02 12:11:29
 * @FilePath: /scheduleweb/src/pages/newWeekly/CreateBtns/index.tsx
 */

import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import dayjs from 'dayjs';
import { Button } from '@ss/mtd-react';
import {
  getQuaterMinuteMoment,
  changeDateOnly,
  addResError,
  routerReplaceWithAppState
} from '@/utils';
import { addModuleClick } from '@/services/lxService';
import { PopUpBtn } from '@/components';
import './index.less';

interface IPropsType {
  global?: any;
  week?: any;
  openEdit?: Function;
}

/**
 * 周视图操作按钮集
 */
@inject(({ global, week }) => ({
  global,
  week
}))
@observer
export default class CreateBtns extends Component<IPropsType> {
  openMeeting = () => {
    this.setPageId();
    routerReplaceWithAppState('/rooms');
    addModuleClick('b_oa_1esextkm_mc');
    addResError('OpenMeeting', '进入找会议室');
  };

  openEdit = () => {
    const {
      week: { getCurrentWeekDay },
      openEdit
    } = this.props;

    const startTime = getQuaterMinuteMoment(
      changeDateOnly({
        momentByTime: dayjs(),
        momentByDate: getCurrentWeekDay()
      })
    );
    const endTime = dayjs(startTime).add(1, 'hour');

    openEdit && openEdit(startTime.valueOf(), endTime.valueOf());
  };

  setPageId = () => {
    const { setData } = this.props.global;
    setData({
      lastPageId: 'weekly'
    });
  };

  render() {
    return (
      <div className="add-schedule-container">
        <Button className="btn cancel topSchedule" onClick={this.openMeeting}>
          {i18nClient.t('crate_btns_book_meeting_room', '订会议室')}
        </Button>
        <Button
          className="btn topSchedule"
          type="primary"
          onClick={this.openEdit}

        >
          {i18nClient.t('crate_btns_creat_schedule', '创建日程')}
        </Button>
        <PopUpBtn />
      </div>
    );
  }
}
