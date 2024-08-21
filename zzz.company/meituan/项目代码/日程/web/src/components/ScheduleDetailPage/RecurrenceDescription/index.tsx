import { i18nClient } from '@sailor/i18n-web';
import React, { Component } from 'react';
import dayjs from 'dayjs';
import { YearMonthDay } from '@/utils/i18n';
import allstyles from '../index.less';

export interface IRecurrenceDescription {
  recurrenceDescription: string;
  deadline: number;
  isCyclic: number;
}
export default class RecurrenceDescription extends Component<IRecurrenceDescription> {
  getDescription = (rule): string => {
    const getDay = {
      MO: i18nClient.t('recurrence_description_monday', '周一'),
      TU: i18nClient.t('recurrence_description_tuesday', '周二'),
      WE: i18nClient.t('recurrence_description_wednesday', '周三'),
      TH: i18nClient.t('recurrence_description_thursday', '周四'),
      FR: i18nClient.t('recurrence_description_friday', '周五'),
      SA: i18nClient.t('recurrence_description_saturday', '周六'),
      SU: i18nClient.t('recurrence_description_sunday', '周天')
    };
    switch (rule.freq) {
      case 'WEEKLY':
        return i18nClient.t(
          'recurrence_description_every_week',
          '每周的{byWeekDay}',
          { byWeekDay: getDay[rule.byDay[0]] }
        );
      case 'MONTHLY':
        return i18nClient.t(
          'recurrence_description_every_month',
          '每月的{byMonthDay}',
          {
            byMonthDay: rule.byMonthDay
          }
        );
      case 'DAILY':
        return i18nClient.t(
          'recurrence_description_every_day',
          '每天的{byDay}',
          {
            byDay: rule.interval
          }
        );
      default:
        return '';
    }
  };

  render() {
    const { recurrenceDescription, deadline, isCyclic } = this.props;

    return (
      <>
        {recurrenceDescription && isCyclic === 1 && (
          <div className={allstyles.detailShowFormItem}>
            <div className={allstyles.detailShowFormLabel}>
              <i
                className={`dxcalendar dx-calcycle ${allstyles.labelFontStyle}`}
              />
            </div>
            <div className={allstyles.detailShowFormInfo}>
              {deadline
                ? i18nClient.t(
                  'recurrence_description_deadline',
                  '{recurrenceDescription}，截止到 {deadline}',
                  {
                    recurrenceDescription,
                    deadline: dayjs(deadline).format(YearMonthDay)
                  }
                )
                : recurrenceDescription }
            </div>
          </div>
        )}
      </>
    );
  }
}
