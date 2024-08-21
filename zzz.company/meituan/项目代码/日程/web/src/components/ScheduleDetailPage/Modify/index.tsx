import { i18nClient } from '@sailor/i18n-web';
import React, { Component } from 'react';
import dayjs from 'dayjs';
import { weekObject } from '@/consts/weekly';
import ModifyItem from './ModifyItem';
import AttendeesModify from './AttendeesModify';
import { YearMonthDay1, MonthDay1 } from '@/utils/i18n';
import allstyles from '../index.less';

export interface IModify {
  modifyLog?: any;
}

export default class Modify extends Component<IModify> {
  getTime = (timestamp) => {
    const date = new Date(timestamp);
    const month = date.getMonth() + 1 < 10
      ? `0${date.getMonth() + 1}`
      : date.getMonth() + 1;
    const day = date.getDate() > 9 ? date.getDate() : `0${date.getDate()}`;
    const hour = date.getHours() > 9 ? date.getHours() : `0${date.getHours()}`;
    const minutes = date.getMinutes() > 9 ? date.getMinutes() : `0${date.getMinutes()}`;
    const time = `${hour}:${minutes}`;

    return `${month}-${day} ${time}`;
  };

  changeTime = (ttime, anotherTime) => {
    const timeObj = dayjs(ttime);
    let date = timeObj.format(MonthDay1);

    if (
      !dayjs().isSame(ttime, 'year')
      || (anotherTime && !dayjs().isSame(anotherTime, 'year'))
    ) {
      date = timeObj.format(YearMonthDay1);
    }

    const week = weekObject[timeObj.day()];
    const time = timeObj.format('HH:mm');
    return (
      <>
        <span>
          {date}
          {week}
        </span>
        <span style={{ paddingLeft: '8px' }}>{time}</span>
      </>
    );
  };

  render() {
    const { modifyLog } = this.props;

    return (
      <>
        {/* modify.length != 0 */}
        {modifyLog && modifyLog.length !== 0 && (
          <div
            style={{
              fontSize: '12px',
              color: 'rgba(0,0,0,0.60)',
              lineHeight: '17px',
              borderTop: '1px solid rgba(0,0,0,0.06)',
              paddingTop: '20px'
            }}
          >
            <div
              style={{
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <span>{i18nClient.t('modify_record_changes', '变更记录')}</span>
            </div>
            {modifyLog.map((item, index) => {
              const { content, timestamp } = item;
              const {
                attendees,
                location,
                description,
                trigger,
                name,
                startDate,
                endDate
              } = content;
              return (
                <div key={index} className={allstyles.modify}>
                  <div
                    className={allstyles.detailShowFormInfo}
                    style={{ marginBottom: '4px' }}
                  >
                    {this.getTime(timestamp)}
                  </div>
                  <div>
                    {name && (
                      <ModifyItem
                        ModifyText={i18nClient.t('modify_theme', '主题')}
                        modifyContent={name.after}
                      />
                    )}
                    {startDate && (
                      <ModifyItem
                        ModifyText={i18nClient.t(
                          'modify_start_time',
                          '开始时间'
                        )}
                        modifyContent={this.changeTime(
                          startDate.after,
                          endDate?.after
                        )}
                      />
                    )}
                    {endDate && (
                      <ModifyItem
                        ModifyText={i18nClient.t('modify_end_time', '结束时间')}
                        modifyContent={this.changeTime(
                          endDate.after,
                          startDate?.after
                        )}
                      />
                    )}
                    {location && (
                      <ModifyItem
                        ModifyText={i18nClient.t('modify_place', '位置')}
                        modifyContent={location.after}
                      />
                    )}
                    {attendees && <AttendeesModify attendees={attendees} />}
                    {trigger && (
                      <ModifyItem
                        ModifyText={i18nClient.t('modify_remind', '提醒')}
                        modifyContent={trigger.after}
                      />
                    )}
                    {description && (
                      <ModifyItem
                        ModifyText={i18nClient.t('modify_note', '备注')}
                        modifyContent={description.after}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </>
    );
  }
}
