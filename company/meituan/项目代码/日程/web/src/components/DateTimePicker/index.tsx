import React, {
  useCallback,
  useState,
  useRef,
  useImperativeHandle
} from 'react';
import dayjs from 'dayjs';
import { DatePicker, Checkbox, Cascader } from '@ss/mtd-react';
import classNames from 'classnames';
import { getQuaterMinuteMoment, KEY_CODE, initMtdTabIndex } from '@/utils';
import { week } from './const';
import styles from './index.less';
import { i18nClient } from '@sailor/i18n-web';


// 参数类型
interface IPropsType {
  startTime: number; // 开始时间
  endTime: number; // 结束时间
  isAllDay: number; // 是否全天
  onChange: Function; // 改变时间
  popLayer?: any;
  scheduleId?: any;
  onRef?: any;
}

/**
 * 日期时间选择
 */
export default function DateTimePicker(props: IPropsType) {
  // 切换全天非全天的时候保持状态
  const [saveStartTime, setSaveStartTime] = useState(0);
  const [saveEndTime, setSaveEndTime] = useState(0);
  // 是否满足tab键盘操作，默认收起日期选择器
  const [needAutoHidden, setNeedAutoHidden] = useState([true, true]);
  const allDayRef = useRef(null);
  // 结束是否跟随开始变化
  const [nChangeEndWithStart, setNChangeEndWithStart] = useState(true);
  const {
    startTime,
    endTime,
    isAllDay = 0,
    onChange,
    popLayer,
    scheduleId,
    onRef
  } = props;
  // 上层组件可以调用关闭方法
  useImperativeHandle(onRef, () => ({
    closeDateTimePicker: () => {
      closeAutoHidden();
    }
  }));
  /**
   * 禁用不需要的日期
   */
  const handleDisableDate = useCallback((currentDate) => {
    return (
      currentDate < new Date().setFullYear(new Date().getFullYear() - 2)
      || currentDate > new Date().setFullYear(new Date().getFullYear() + 2)
    );
  }, []);
  /**
   * 修改开始日期
   */
  const handleChangeStartDate = useCallback(
    (value) => {
      // 考虑跨天日程
      let time = value;
      let calEndTime = endTime;
      scheduleId && (time = value + (endTime - startTime));
      if (!scheduleId && nChangeEndWithStart) {
        calEndTime = new Date(time).setHours(
          new Date(endTime).getHours(),
          new Date(endTime).getMinutes(),
          0,
          0
        );
      }
      onChange
        && onChange(
          new Date(value).setHours(
            new Date(startTime).getHours(),
            new Date(startTime).getMinutes(),
            0,
            0
          ),
          calEndTime,
          isAllDay
        );
    },
    [startTime, endTime, isAllDay, scheduleId]
  );

  /**
   * 修改开始时间
   */
  const handleChangeStartTime = useCallback(
    (value) => {
      const start = new Date(startTime).setHours(value[0], value[1], 0, 0);
      // 区分创建页 | 编辑页
      let time = 1 * 3600 * 1000;
      let calEndTime = endTime;
      if (!scheduleId && nChangeEndWithStart) {
        calEndTime = start + time;
      }
      scheduleId && (time = endTime - startTime);
      onChange && onChange(start, calEndTime, isAllDay);
    },
    [startTime, endTime, isAllDay, scheduleId]
  );

  /**
   * 修改结束日期
   */
  const handleChangeEndDate = useCallback(
    (value) => {
      onChange
        && onChange(
          startTime,
          new Date(value).setHours(
            new Date(endTime).getHours(),
            new Date(endTime).getMinutes(),
            0,
            0
          ),
          isAllDay
        );
      setNChangeEndWithStart(false);
    },
    [startTime, endTime, isAllDay]
  );

  /**
   * 修改结束时间
   */
  const handleChangeEndTime = useCallback(
    (value) => {
      onChange
        && onChange(
          startTime,
          new Date(endTime).setHours(value[0], value[1], 0, 0),
          isAllDay
        );
      setNChangeEndWithStart(false);
    },
    [startTime, endTime, isAllDay]
  );

  const appendzero = (num) => {
    return +num < 10 ? `0${num}` : `${num}`;
  };

  /**
   * 设置时间选择器的值
   */
  const initOptions = () => {
    const options = [];

    for (let i = 0; i < 24; i++) {
      const subMinites = ['00', '15', '30', '45'];
      let subOption = null;

      subOption = {
        value: appendzero(i),
        label: appendzero(i),
        children: subMinites.map((item) => {
          return {
            value: item,
            label: item
          };
        })
      };
      options.push(subOption);
    }

    return options;
  };
  /**
   * 修改全天状态
   */
  const handleChangeAllDayStatus = useCallback(
    (e) => {
      // 从今天切到全天，跳到明天
      let startTimeSet = 0;
      let endTimeSet = 0;
      if (!saveStartTime) {
        let isToday = false;
        if (
          e.target.checked
          && new Date(startTime).setHours(0, 0, 0, 0)
            === new Date().setHours(0, 0, 0, 0)
        ) {
          isToday = true;
        }
        let modifyTimeStart = null;
        let modifyTimeEnd = null;
        // 第一次切换到非全天日程，调整时间
        if (!e.target.checked && !saveStartTime) {
          modifyTimeStart = getQuaterMinuteMoment();
          modifyTimeStart = modifyTimeStart.set({
            year: dayjs(startTime).get('year'),
            month: dayjs(startTime).get('month'),
            date: dayjs(startTime).get('date')
          });
          if (scheduleId) {
            modifyTimeEnd = dayjs(modifyTimeStart).add(
              endTime - startTime,
              'millisecond'
            );
          } else {
            modifyTimeEnd = dayjs(modifyTimeStart).add(1, 'hour');
          }
        }
        const oneDay = 24 * 3600 * 1000;

        if (isToday) {
          startTimeSet = startTime + oneDay;
          endTimeSet = endTime + oneDay;
        } else if (modifyTimeStart) {
          startTimeSet = modifyTimeStart.valueOf();
          endTimeSet = modifyTimeEnd.valueOf();
        } else {
          startTimeSet = startTime;
          endTimeSet = endTime;
        }
      }

      onChange
        && onChange(
          saveStartTime || startTimeSet,
          saveEndTime || endTimeSet,
          e.target.checked ? 1 : 0
        );
      setNChangeEndWithStart(true);
      setSaveStartTime(startTime);
      setSaveEndTime(endTime);
      // Cascader 可选中状态
      setTimeout(() => {
        initMtdTabIndex();
      }, 0);
    },
    [startTime, endTime, scheduleId]
  );
  /**
   * 两个【日历选择器】之间的切换隐藏
   */
  const openAutoHidden = (visibleIndex: number, hiddenIndex: number) => {
    needAutoHidden[visibleIndex] = true;
    needAutoHidden[hiddenIndex] = false;
    setNeedAutoHidden([...needAutoHidden]);
    // Cascader 可选中状态
    setTimeout(() => {
      initMtdTabIndex();
    }, 0);
  };
  /**
   * 隐藏全部的【日历选择器】
   */
  const closeAutoHidden = () => {
    setNeedAutoHidden([false, false]);
  };

  return (
    <div>
      <div className={styles.container}>
        <DatePicker
          popLayer={{
            ...popLayer,
            className: needAutoHidden[0] ? '' : styles.hiddenDatePicker
          }}
          className={styles.date}
          disabledDate={handleDisableDate}
          clearable={false}
          value={startTime}
          onChange={handleChangeStartDate}
          // 英文环境周在前，暂时用这个方式处理
          format={i18nClient.language === 'en' ? `${week[new Date(startTime).getDay()]} ${i18nClient.t(
            'date_time_picker_year_month_day',
            'YYYY-MM-DD'
          )}` : `${i18nClient.t(
            'date_time_picker_year_month_day',
            'YYYY-MM-DD'
          )} ${week[new Date(startTime).getDay()]}`}
          valueFormat={'timestamp'}
          key={`${startTime}-1`} // 保证周几能正常刷新,保证和下面key不一样
          onFocus={() => openAutoHidden(0, 1)}
        />
        {!isAllDay && (
          <div onFocus={closeAutoHidden}>
            <Cascader
              className={styles.time}
              data={initOptions()}
              expandTrigger={'hover'}
              separator=":"
              onChange={handleChangeStartTime}
              value={[
                appendzero(dayjs(startTime).hour()),
                appendzero(dayjs(startTime).minute())
              ]}
              clearable={false}
              popLayer={{ ...popLayer, className: styles.timeCascaderPop }}
              key={`${startTime}-st`}
            />
          </div>
        )}
        <span className={styles.separator}>-</span>
        <DatePicker
          popLayer={{
            ...popLayer,
            className: needAutoHidden[1] ? '' : styles.hiddenDatePicker
          }}
          className={classNames(styles.date, {
            [styles.warn]:
              new Date(endTime).setHours(0, 0, 0, 0)
              < new Date(startTime).setHours(0, 0, 0, 0)
          })}
          disabledDate={handleDisableDate}
          clearable={false}
          value={endTime}
          onChange={handleChangeEndDate}
          key={`${endTime}-2`} // 保证周几能正常刷新
          // 英文环境周在前，暂时用这个方式处理
          format={i18nClient.language === 'en' ? `${week[new Date(endTime).getDay()]} ${i18nClient.t(
            'date_time_picker_year_month_day',
            'YYYY-MM-DD'
          )}` : `${i18nClient.t(
            'date_time_picker_year_month_day',
            'YYYY-MM-DD'
          )} ${week[new Date(endTime).getDay()]}`}
          valueFormat={'timestamp'}
          onFocus={() => openAutoHidden(1, 0)}
        />
        {!isAllDay && (
          <div onFocus={closeAutoHidden}>
            <Cascader
              className={classNames(styles.time, {
                [styles.warn]: endTime <= startTime
              })}
              data={initOptions()}
              expandTrigger={'hover'}
              separator=":"
              onChange={handleChangeEndTime}
              value={[
                appendzero(dayjs(endTime).hour()),
                appendzero(dayjs(endTime).minute())
              ]}
              clearable={false}
              popLayer={{ ...popLayer, className: styles.timeCascaderPop }}
              key={`${endTime}-et`}
            />
          </div>
        )}
      </div>
      <div
        onKeyDown={(event) => {
          const { onChange: downChange, checked } = allDayRef.current.props;
          event.keyCode === KEY_CODE.ENTER
            && downChange({ target: { checked: !checked } });
        }}
        onFocus={closeAutoHidden}
        className={styles.checkContainer}
      >
        <Checkbox
          className={styles.check}
          checked={!!isAllDay}
          onChange={handleChangeAllDayStatus}
          ref={allDayRef}
        >
          {i18nClient.t('date_time_picker_all_day', '全天')}
        </Checkbox>
      </div>
    </div>
  );
}
