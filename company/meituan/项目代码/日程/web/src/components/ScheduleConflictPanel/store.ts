/*
 * @Description: 冲突日历store
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-06-17 10:54:05
 * @LastEditors: zhaojingchao
 * @LastEditTime: 2021-03-17 19:17:13
 * @FilePath: /scheduleweb/src/components/ScheduleConflictPanel/store.ts
 */
import dayjs from 'dayjs';
import { observable, action, computed } from 'mobx';
import { busyRecommend } from '@/services/apis';
import { getCalendars } from '@/services/weekly';
import { addModuleClick } from '@/services/lxService';
import { getCurrentDateObj, MAX_CONFLICT_NO } from '@/utils';
import { IEventItem } from '@/pages/newWeekly/CalendarTable/interface';
import { EVENT_COLORS } from '@/pages/newWeekly/const';

const ONE_DAY_MILLISECONDS = 24 * 3600 * 1000;

const getBusyDistance = (periodList) => {
  let firstIndex = -1;
  const busyList = [];
  for (let i = 0; i < periodList.length; i++) {
    if (periodList[i] === 1) {
      if (firstIndex === -1) {
        firstIndex = i;
        if (i + 1 === periodList.length || periodList[i + 1] === 0) {
          busyList.push({
            start: firstIndex,
            distance: 1
          });
          firstIndex = -1;
        }
      } else if (i + 1 === periodList.length || periodList[i + 1] === 0) {
        busyList.push({
          start: firstIndex,
          distance: i - firstIndex + 1
        });
        firstIndex = -1;
      }
    }
  }
  return busyList;
};

const isZeroClockSchecule = (startTime, endTime) => {
  return (
    dayjs(endTime).format('HHmmss') === '000000'
    && dayjs(startTime).format('YYYY-MM-DD')
      === dayjs(endTime - 3600 * 1000).format('YYYY-MM-DD')
  );
};

/**
 * 日程冲突Store
 */
export default class ScheduleConflictPanel {
  // 开始时间
  @observable startTime = null;

  // 结束时间
  @observable endTime = null;

  // 起始日
  @observable originStartTime = null;

  @observable originEndTime = null;

  // 全天
  @observable isAllDay = 0;

  // 参与者
  @observable attendees = [];

  // 添加/删除参与人前的 参与人列表
  @observable preAttendeesList = [];

  // 结束
  @observable appKey = null;

  // 组织者
  @observable organizer = null;

  // 日程ID
  @observable scheduleId = null;

  // 日程开始的block数
  @observable scheduleStart = 0;

  // 日程总共的高度block数
  @observable scheduleHeight = 0;

  // 计算好的冲突列表
  @observable useConflictList = [];

  // 可点击的空闲时间端
  @observable recommendPeriod = [];

  // 当前视图 的用户冲突列表
  @observable currentUseConflictList = [];

  // 冲突数量
  @observable conflictCount = 0;

  // 关键成员
  @observable keyPerson = [];

  // 未选中时间
  @observable noTime = true;

  // 个人详细日程
  @observable selfDetailScheduleList = [];

  @observable failed = false;

  @observable hasRemovePerson = false;


  // 全天和跨天,切换其它天不考虑冲突
  @computed
  get noCheckConflit() {
    return (
      this.noTime
      || this.isAllDay === 1
      || this.startTime >= this.endTime
      // (this.startTime && this.startTime !== this.originStartTime) ||
      || (this.startTime
        && this.endTime
        && dayjs(this.startTime).format('YYYY-MM-DD')
          !== dayjs(this.endTime).format('YYYY-MM-DD')
        && !isZeroClockSchecule(this.startTime, this.endTime))
    );
  }

  @action
  init = () => {
    this.startTime = null;
    this.endTime = null;
    this.originStartTime = null;
    this.originEndTime = null;
    this.isAllDay = 0;
    this.attendees = [];
    this.appKey = null;
    this.organizer = null;
    this.scheduleId = null;
    this.scheduleStart = 0;
    this.scheduleHeight = 0;
    this.useConflictList = [];
    this.recommendPeriod = [];
    this.keyPerson = [];
    this.conflictCount = 0;
    this.noTime = true;
    this.selfDetailScheduleList = [];
  };

  /**
   * 更新数据
   */
  @action.bound
  async setData(data: any, nUnRefresh?: boolean) {
    for (const key in data) {
      this[key] = data[key];
    }
    if (data && data.startTime) {
      this.originStartTime = data.startTime;
    }
    if (data && data.endTime) {
      this.originEndTime = data.endTime;
    }

    if (!nUnRefresh) {
      // 和忙闲有关的变量变更才会重新请求
      const keys = ['startTime', 'endTime', 'attendees', 'scheduleId'];
      const needRefresh = Object.keys(data).some(item => keys.includes(item));
      if (needRefresh) {
        await this.busyPeriod();
      }
    }
  }

  // 快速线上人员,选取完成直接显示不等待请求成功
  @action
  quickShowPersons = () => {
    const useConflictEmpIdsList = this.useConflictList.map(
      item => item.empId
    );
    const appends = this.attendees
      .filter(item => !useConflictEmpIdsList.includes(item.empId))
      .map((item) => {
        return {
          ...item,
          busyPeriod: new Array(96).fill(0),
          busy: [],
          isConflict: !!item.isConflict
        };
      });

    this.useConflictList = [...this.useConflictList, ...appends];
    this.recommendPeriod = [];
    this.currentUseConflictList = [...this.currentUseConflictList, ...appends];
  };

  @action
  busyPeriod = async () => {
    if (this.startTime) {
      const { currentHour, currentMinute } = getCurrentDateObj(
        new Date(this.startTime)
      );

      // 由于有【夏令时】的问题避免直接计算时间戳加减计算日期 ---> 转换为日期间隔加减
      // const duration = this.endTime - this.startTime;
      // const durationBlock = parseInt(`${duration / (15 * 60 * 1000)}`, 10);

      const startTime = dayjs(this.startTime);
      const startHour = startTime.hour();
      const startMinute = startTime.minute();

      const endTime = dayjs(this.endTime);
      const endHour = endTime.hour();
      const endMinute = endTime.minute();

      const durationBlock = (endHour - startHour) * 4 + (endMinute - startMinute) / 15;


      this.scheduleStart = currentHour * 4 + currentMinute / 15;
      this.scheduleHeight = durationBlock;
      // 避免无意义请求
      if (!this.attendees || this.attendees.length === 0) {
        return;
      }
      this.quickShowPersons();
      if (this.attendees && this.attendees.length <= MAX_CONFLICT_NO) {
        const busyPeriodPromise = busyRecommend({
          currentAppKey: this.appKey,
          empIdList: [
            // this.organizer?.empId,
            ...this.attendees?.map(item => item.empId)
          ],
          currentScheduleId: this.scheduleId,
          queryDate: this.startTime
        });

        const selfPromise = getCalendars({
          startTime: dayjs(this.startTime).startOf('days').valueOf(),
          endTime: dayjs(this.startTime)
            .add(1, 'days')
            .startOf('days')
            .valueOf(),
          mtUserIds: this.organizer?.empId,
          appKeyList: window.mobx_app.mobx_stores.week.scheduleSourcePanelStore.scheduleSourceList
            ?.map(item => item.appKey)
            .join(',')
        });
        this.failed = false;
        await this.resetConflictInfo();
        await Promise.all([busyPeriodPromise, selfPromise])
          .then((res) => {
            this.setConflictInfos(
              res[0]?.userPeriodList ? res[0]?.userPeriodList : []
            );
            this.recommendPeriod = res[0]?.recommendPeriodVo?.recommendPeriod;
            // 打点无推荐时间
            if (!this.recommendPeriod?.includes(0)) {
              addModuleClick('b_oa_e0v5o02c_mc', {
                mis: this.attendees.map(item => item.mis).join(',')
              });
            }
            this.setSelfSchedule(res[1]);
          })
          .catch(() => {
            this.failed = true;
          });
      } else {
        // 超过50人 把数据清空展示
        this.setConflictInfos(
          this.attendees.map((item) => {
            return { user: item, busyPeriod: new Array(96).fill(0) };
          })
        );
        this.recommendPeriod = [];
        this.setSelfSchedule([]);
      }
    }
  };

  resetConflictInfo = async () => {
    if (
      !this.hasRemovePerson
      && this.startTime !== this.originStartTime
      && this.attendees
      && this.preAttendeesList
      && this.attendees.length !== this.preAttendeesList.length
    ) {
      try {
        // 参与人变更, 获取当前选中日期的 忙闲信息, 并计算其忙闲状态
        const res = await busyRecommend({
          currentAppKey: this.appKey,
          empIdList: [...this.attendees?.map(item => item.empId)],
          currentScheduleId: this.scheduleId,
          queryDate: this.originStartTime
        });
        if (
          res.userPeriodList
          && res.userPeriodList.length === this.attendees.length
        ) {
          const useList = this.handleConflictInfos(res.userPeriodList);
          this.useConflictList = useList;
          this.conflictCount = useList.filter(item => item.isConflict).length;
          this.sortConflictList();
          this.recommendPeriod = res?.recommendPeriodVo?.recommendPeriod;
        }
      } catch (error) {
        this.failed = true;
      }
    }
    this.preAttendeesList = this.attendees;
  };

  // 按照 useConflictList 顺序 对 currentUseConflictList 重新排序
  sortCurrentConflictList = () => {
    if (!this.currentUseConflictList?.length || !this.useConflictList?.length) {
      return;
    }
    const list = this.useConflictList.map(item => item.empId);
    const currentLists = [];
    let foundEle = null;
    for (const key in list) {
      foundEle = this.currentUseConflictList.find(
        ele => ele.empId === list[key]
      );
      currentLists.push(foundEle || {});
    }
    this.currentUseConflictList = currentLists;
  };

  // 冲突日历数据处理
  @action
  setConflictInfos = (res) => {
    try {
      // 类似闭包处理掉返回和当前不一致的数据
      if (res.length === this.attendees.length) {
        const useList = this.handleConflictInfos(res);
        if (this.startTime === this.originStartTime) {
          this.useConflictList = useList;
          this.conflictCount = useList.filter(item => item.isConflict).length;
        }
        this.currentUseConflictList = useList;
        this.sortConflictList();
      }
    } catch (e) {
      console.log(e);
    }
  };

  handleConflictInfos = (res) => {
    return res.map((item) => {
      return {
        name: item?.user?.name,
        enName: item?.user?.enName,
        empId: item?.user?.empId,
        avatar: item?.user?.avatar,
        busyPeriod: item?.busyPeriod,
        busy: getBusyDistance(item?.busyPeriod),
        isConflict:
          !this.noCheckConflit
          && item?.busyPeriod
            ?.slice(
              this.scheduleStart,
              this.scheduleStart + this.scheduleHeight
            )
            .includes(1)
      };
    });
  };

  @action
  setSelfSchedule = (res) => {
    this.selfDetailScheduleList = res
      .filter(
        item => item.scheduleId !== this.scheduleId // 过滤正在编辑的当前日程
      )
      .map((item = { user: {} }) => {
        const {
          startTime,
          endTime,
          title,
          scheduleId,
          user: { empId },
          isAllDay,
          isOverDay
        } = item;
        const formatStartTime = Math.max(dayjs(this.startTime).startOf('day').valueOf(), startTime);
        const formatEndTime = Math.min(dayjs(this.startTime).add(1, 'day').startOf('day').valueOf(), endTime);

        const eventItem: IEventItem = {
          id: scheduleId,
          start: formatStartTime,
          end: formatEndTime,
          duration: formatEndTime - formatStartTime,
          title,
          isAllDay,
          isOverDay,
          ownerId: empId,
          ownerName: this.organizer.name,
          color: EVENT_COLORS.blue
        };
        return eventItem;
      });
  };

  // 重新设置时间段
  @action
  resetSchedule = (params) => {
    this.setData(params, true);
    this.useConflictList = this.currentUseConflictList.map((item) => {
      return {
        ...item,
        isConflict:
          !this.noCheckConflit
          && item?.busyPeriod
            ?.slice(
              this.scheduleStart,
              this.scheduleStart + this.scheduleHeight
            )
            .includes(1)
      };
    });
    this.conflictCount = this.useConflictList.filter(
      item => item.isConflict
    ).length;
  };

  @action
  sortConflictList = () => {
    // 组织者排在最前面，kp排在其次，冲突接着，不冲突最后
    const list = [
      ...this.useConflictList.filter(
        item => item.empId === this.organizer?.empId
      ),
      ...this.useConflictList
        .filter(item => this.keyPerson.includes(item.empId))
        .sort((a, b) => {
          const aIndex = this.keyPerson.findIndex(x => x === a.empId);
          const bIndex = this.keyPerson.findIndex(x => x === b.empId);
          return aIndex - bIndex;
        }),
      ...this.useConflictList.filter(
        item => item.isConflict
          && item.empId !== this.organizer?.empId
          && !this.keyPerson.includes(item.empId)
      ),
      ...this.useConflictList.filter(
        item => !item.isConflict
          && item.empId !== this.organizer?.empId
          && !this.keyPerson.includes(item.empId)
      )
    ];
    this.useConflictList = list;
    this.sortCurrentConflictList();
  };

  @action
  nextDay = () => {
    this.startTime += ONE_DAY_MILLISECONDS;
    this.endTime += ONE_DAY_MILLISECONDS;
    this.busyPeriod();
  };

  @action
  preDay = () => {
    this.startTime -= ONE_DAY_MILLISECONDS;
    this.endTime -= ONE_DAY_MILLISECONDS;
    this.busyPeriod();
  };

  @action
  selectDay = (time: number) => {
    // 计算timepicker和startTime的零点差值再赋值
    const startDay = dayjs(this.startTime).set('hour', 0).set('minute', 0).set('second', 0);
    const today = dayjs(time).set('hour', 0).set('minute', 0).set('second', 0);
    const diff = today.diff(startDay, 'day');
    this.startTime += ONE_DAY_MILLISECONDS * diff;
    this.endTime += ONE_DAY_MILLISECONDS * diff;
    this.busyPeriod();
  };

  @action
  today = (isInMeetingNoJump) => {
    if (isInMeetingNoJump) {
      const start = dayjs(this.startTime)
        .set('year', dayjs().year())
        .set('month', dayjs().month())
        .set('date', dayjs().date())
        .valueOf();
      // 开始时间回到今天
      // 结束时间保持和以前一致
      this.endTime += start - this.startTime;
      this.startTime = start;
    } else {
      this.startTime = this.originStartTime;
      this.endTime = this.originEndTime;
    }
    this.busyPeriod();
  };

  @action
  setKeyPerson = (empId) => {
    const index = this.keyPerson.findIndex(item => item === empId);
    // 调整kp顺序
    // 无该kp者插入头
    // 有该kp先删除 再插入
    const sIndex = this.useConflictList.findIndex(
      item => item.empId === empId
    );
    const cIndex = this.currentUseConflictList.findIndex(
      item => item.empId === empId
    );
    if (index > 0) {
      this.keyPerson.splice(index, 1);
    }
    this.keyPerson.unshift(empId);
    // 调整显示顺序
    if (sIndex >= 0) {
      const item = this.useConflictList[sIndex];
      this.useConflictList.splice(sIndex, 1);
      this.useConflictList.splice(1, 0, item);
    }
    // 调整下方显示顺序
    if (cIndex >= 0) {
      const item = this.currentUseConflictList[sIndex];
      this.currentUseConflictList.splice(sIndex, 1);
      this.currentUseConflictList.splice(1, 0, item);
    }
  };

  @action
  removePerson = (empId) => {
    // 需要移除冲突日历和kp中的内容已经attendees的内容
    this.hasRemovePerson = true;
    const itemIndex = this.useConflictList.findIndex(
      sItem => sItem.empId === empId
    );
    const cIndex = this.currentUseConflictList.findIndex(
      item => item.empId === empId
    );
    const kpIndex = this.keyPerson.findIndex(kItem => kItem === empId);
    const attendeesIndex = this.attendees.findIndex(
      kItem => kItem.empId === empId
    );
    if (itemIndex >= 0) {
      if (this.useConflictList[itemIndex].isConflict) {
        this.conflictCount--;
      }
      this.useConflictList.splice(itemIndex, 1);
    }
    if (cIndex >= 0) {
      this.currentUseConflictList.splice(cIndex, 1);
    }
    if (kpIndex >= 0) {
      this.keyPerson.splice(kpIndex, 1);
    }
    if (attendeesIndex >= 0) {
      this.attendees.splice(attendeesIndex, 1);
    }
    // 人数从多于最多人不查询冲突移除到需要重新请求， 看有更好的方式没
    this.busyPeriod();
    this.hasRemovePerson = false;
  };
}
