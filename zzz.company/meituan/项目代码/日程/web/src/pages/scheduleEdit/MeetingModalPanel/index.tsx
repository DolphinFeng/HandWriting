import { i18nClient } from '@sailor/i18n-web';
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import {
  Modal, Select, List, Loading
} from '@ss/mtd-react';
import { observable } from 'mobx';
import classNames from 'classnames';
import { moduleClick } from 'onejs/lx';
import { RetryContent, ScrollTopBtn } from '@/components';
import { windowOption } from '@/consts';
import { messageStore } from '@/store/global';
import { StorageService } from '@/services/storage';
import { IMeetingInfo } from '@/components/Address/interface';
import { getEquipType } from '@/utils';
import styles from './index.less';

interface IPropsType {
  meetingModalPanelStore?: any; // Store
  globalStore?: any;
  formPanelStore?: any; // Store
  startTime: Number;
  endTime: Number;
  meeting: IMeetingInfo;
  onCloseModel: Function; // 关闭弹窗
  onChangeMeetingRoom: Function; // 修改会议室
  isTimeAvaliable: boolean;
}

const popLayerConfig = {
  getContainer: (): HTMLElement => document.querySelector('.meetingPopParent')
};
/**
 * 会议室选择面板
 */
@inject(({ scheduleEditStore, global }) => ({
  meetingModalPanelStore: scheduleEditStore.meetingModalPanelStore,
  formPanelStore: scheduleEditStore.formPanelStore,
  globalStore: global
}))
@observer
export default class extends Component<IPropsType> {
  @observable listLoadingStatus = true;

  @observable listFailed = false;

  @observable showScrollTop = false;

  contanierRef = null;

  componentDidMount() {
    this.initParmas();
    window.addEventListener('scroll', this.handleTableScroll, true);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleTableScroll, true);
  }

  initParmas = async (): Promise<void> => {
    const {
      meetingModalPanelStore: {
        getCityBuildingFloorData,
        getEquipList,
        getCapacityList
      },
      globalStore: { lastPageId }
    } = this.props;

    try {
      await Promise.all([
        getCityBuildingFloorData(lastPageId === 'rooms'), // 区分是否从会议室页面带入城市和大厦
        getEquipList(),
        getCapacityList()
      ]);
    } finally {
      this.listLoadingStatus = false;
    }
    this.getMeetingList();
  };

  getMeetingList = async (type?: string) => {
    this.listFailed = false;
    const {
      isTimeAvaliable,
      formPanelStore: { startTime, endTime },
      meetingModalPanelStore: { getMeetingList }
    } = this.props;
    try {
      this.listLoadingStatus = true;
      await getMeetingList(startTime, endTime, type, isTimeAvaliable);
    } catch (e) {
      this.listFailed = true;
    } finally {
      this.listLoadingStatus = false;
    }
  };

  // 改变select选项
  handleChangeSelectValue = (type, item) => {
    const {
      globalStore: { lastPageId },
      meetingModalPanelStore: { setData, cityBuildingFloorData }
    } = this.props;
    setData({ [`${type}Selected`]: item });
    let buildItems = [];
    switch (type) {
      case 'city': {
        buildItems = cityBuildingFloorData
          .find(bItem => bItem.cityId === +item.value)
          ?.buildingAndFloorVoList?.map((bItem) => {
            return {
              value: bItem.building.id,
              label: bItem.building.name
            };
          });
        const buildingSelected = buildItems && buildItems.length > 0 ? [buildItems[0]] : [];
        setData({
          buildingSelected,
          floorSelected: []
        });
        if (lastPageId !== 'rooms') {
          StorageService.setItem('citySelected', item);
          StorageService.setItem('buildingSelected', buildingSelected);
        }
        break;
      }
      case 'building':
        if (item.length !== 1) {
          setData({ floorSelected: [] });
        }
        if (lastPageId !== 'rooms') StorageService.setItem('buildingSelected', item);
        break;
      default:
        break;
    }
    this.getMeetingList();
  };

  // 切换会议室
  handleChangeMeetingRoom = async (item) => {
    const {
      formPanelStore: {
        checkMeetingFree, startTime, endTime, scheduleId
      },
      onChangeMeetingRoom
    } = this.props;
    const meetingStatus = await checkMeetingFree({
      roomId: item.room.id,
      startTime,
      endTime,
      scheduleId
    });
    if (meetingStatus?.isFreePeriod) {
      onChangeMeetingRoom({
        id: item.room.id,
        name: item.room.name,
        floorName: item.room.floorName,
        buildingName: item.room.buildingName,
        buildingId: item.room.buildingId,
        email: item.room.email
      });
      this.handleCloseWindow();
    } else {
      messageStore.error(
        i18nClient.t('meeting_modal_panel_booked_already', '会议室已被预订')
      );
      this.getMeetingList();
    }
  };

  // 关闭弹窗
  handleCloseWindow = () => {
    const { onCloseModel } = this.props;
    onCloseModel && onCloseModel();
    const {
      meetingModalPanelStore: { setData }
    } = this.props;
    setData({
      meetingList: []
    });
  };

  handleTableScroll = () => {
    if (this.contanierRef && this.contanierRef.scrollTop > 900) {
      this.showScrollTop = true;
    } else {
      this.showScrollTop = false;
    }
  };

  scrollToTop = () => {
    if (this.contanierRef) {
      const scrollOptions = {
        left: 0,
        top: 0,
        behavior: 'smooth'
      };
      if (this.contanierRef) {
        // 兼容不支持scrollTo的浏览器
        if (this.contanierRef.scrollTo) {
          this.contanierRef.scrollTo(scrollOptions);
        } else {
          this.contanierRef.scrollTop = 0;
        }
      }
    }
  };

  render() {
    const {
      meeting,
      meetingModalPanelStore: {
        cityList,
        buildingList,
        floorList,
        equipList,
        capacityList,
        citySelected,
        buildingSelected,
        floorSelected,
        equipSelected,
        capacitySelected,
        windowSelected,
        meetingList
      },
      globalStore: {
        currentUser: { mis }
      }
    } = this.props;
    const buildSelecting = buildingSelected?.map(item => item.value) || [];
    const buildingSelectedShow = buildingSelected;
    return (
      <Modal
        maskClosable={false}
        className={styles.container}
        title={
          meeting && meeting.id
            ? i18nClient.t('meeting_modal_modify_meeting', '修改会议室')
            : i18nClient.t('meeting_modal_add_meeting', '添加会议室')
        }
        onClose={() => {
          this.handleCloseWindow();
          moduleClick('b_oa_hqbz6y9u_mc', {
            userMis: mis
          });
        }}
      >
        <Modal.Body>
          <div
            style={{ width: '100%', height: '100%', overflow: 'auto' }}
            ref={(ref) => {
              this.contanierRef = ref;
            }}
          >
            <div className="meetingPopParent" style={{ position: 'relative' }}>
              <div className={styles.filterForm}>
                <div className={styles.line}>
                  <span className={styles.label}>
                    {i18nClient.t('meeting_modal_city', '城市')}:
                  </span>
                  <Select
                    popLayer={popLayerConfig}
                    placeholder={i18nClient.t('meeting_modal_chose', '请选择')}
                    className={styles.select}
                    filterable={false}
                    clearable={false}
                    value={citySelected}
                    onChange={this.handleChangeSelectValue.bind(this, 'city')}
                  >
                    {cityList?.map(item => (
                      <Select.Option key={item.value} value={item.value}>
                        {item.label}
                      </Select.Option>
                    ))}
                  </Select>
                  <span className={classNames(styles.label, styles.rightLabel)}>
                    {i18nClient.t('meeting_modal_building', '大厦')}:
                  </span>
                  <Select
                    popLayer={popLayerConfig}
                    placeholder={i18nClient.t(
                      'meeting_modal_most_three',
                      '请选择，最多3项'
                    )}
                    className={styles.select}
                    value={buildingSelectedShow}
                    onChange={this.handleChangeSelectValue.bind(
                      this,
                      'building'
                    )}
                    filterable={false}
                    multiple
                  >
                    {buildingList?.map(item => (
                      <Select.Option
                        key={item.value}
                        value={item.value}
                        disabled={
                          buildingSelected.length > 2
                          && !buildSelecting.includes(item.value)
                        }
                      >
                        {item.label}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
                <div className={styles.line}>
                  <span className={styles.label}>
                    {i18nClient.t('meeting_modal_floor', '楼层')}:
                  </span>
                  <Select
                    popLayer={popLayerConfig}
                    placeholder={i18nClient.t('meeting_modal_no_limit', '不限')}
                    className={classNames(styles.select, {
                      [styles.disabled]: buildingSelected.length !== 1
                    })}
                    value={floorSelected}
                    onChange={this.handleChangeSelectValue.bind(this, 'floor')}
                    filterable={false}
                    disabled={buildingSelected.length !== 1}
                    multiple
                  >
                    {floorList?.map(item => (
                      <Select.Option key={item.value} value={item.value}>
                        {item.label}
                      </Select.Option>
                    ))}
                  </Select>
                  <span className={classNames(styles.label, styles.rightLabel)}>
                    {i18nClient.t('meeting_modal_appliance', '设备')}:
                  </span>
                  <Select
                    popLayer={popLayerConfig}
                    placeholder={i18nClient.t('meeting_modal_no_limit', '不限')}
                    className={styles.select}
                    filterable={false}
                    value={equipSelected}
                    onChange={this.handleChangeSelectValue.bind(this, 'equip')}
                    multiple
                  >
                    {equipList?.map((item, index) => (
                      <Select.Option key={index} value={item.id}>
                        {item.name}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
                <div className={styles.line}>
                  <span className={styles.label}>
                    {i18nClient.t('meeting_modal_people_number', '人数')}:
                  </span>
                  <Select
                    popLayer={popLayerConfig}
                    placeholder={i18nClient.t('meeting_modal_no_limit', '不限')}
                    className={styles.select}
                    filterable={false}
                    clearable={false}
                    value={capacitySelected}
                    onChange={this.handleChangeSelectValue.bind(
                      this,
                      'capacity'
                    )}
                  >
                    {capacityList?.map((item, index) => (
                      <Select.Option key={index} value={item.capacityMax}>
                        {item.name}
                      </Select.Option>
                    ))}
                  </Select>
                  <span className={classNames(styles.label, styles.rightLabel)}>
                    {i18nClient.t('meeting_modal_windows', '窗户')}:
                  </span>
                  <Select
                    popLayer={popLayerConfig}
                    placeholder={i18nClient.t('meeting_modal_no_limit', '不限')}
                    className={styles.select}
                    filterable={false}
                    clearable={false}
                    value={windowSelected}
                    onChange={this.handleChangeSelectValue.bind(this, 'window')}
                  >
                    {windowOption?.map((item, index) => (
                      <Select.Option key={index} value={item.value}>
                        {item.label}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              </div>
              {!this.listFailed && buildingSelectedShow.length > 0 && (
                <div className={styles.list}>
                  {this.listLoadingStatus ? (
                    <div className={styles.listLoading}>
                      <Loading />
                      <div className={styles.text}>
                        {i18nClient.t('meeting_modal_loading', '正在加载中')}
                      </div>
                    </div>
                  ) : (
                    <List>
                      {meetingList && meetingList.length > 0 ? (
                        meetingList.map(item => (
                          <List.Item
                            key={item.room.id}
                            onClick={this.handleChangeMeetingRoom.bind(
                              this,
                              item
                            )}
                          >
                            <span
                              title={item.room.name}
                              className={styles.listName}
                            >
                              {item.room.name}
                            </span>
                            <span className={styles.listEquip}>
                              {/* umeet图标 */}
                              {+item.room.equipId === 6 && (
                                <span
                                  style={{
                                    color: 'rgba(0,0,0,0.36)',
                                    fontSize: 18
                                  }}
                                  className={'dxcalendar dx-calumeet'}
                                />
                              )}
                              {/* zoom图标 */}
                              {+item.room.equipId === 7 && (
                                <div className={styles.zoomEquip} />
                              )}
                              {/* 腾讯图标 */}
                              {+item.room.equipId === 9 && (
                                <div className={styles.tencentEquip} />
                              )}
                              {/* 非特殊类型会议室图标 */}
                              {![6, 7, 9].includes(+item.room.equipId) && (
                                <span
                                  style={{ color: 'rgba(0,0,0,0.36)' }}
                                  className={`icon-${getEquipType(
                                    item.room.equipId
                                  )}`}
                                />
                              )}
                              <div className={styles.equipName}>
                                {item.room.equipName}
                              </div>
                            </span>
                            <span className={styles.listCapacity}>
                              {item.room.capacity <= 1
                                && i18nClient.t(
                                  'meeting_modal_capacity_person',
                                  '{capacity}人',
                                  { capacity: item.room.capacity }
                                )}
                              {item.room.capacity > 1
                                && i18nClient.t(
                                  'meeting_modal_capacity_persons',
                                  '{capacity}人',
                                  { capacity: item.room.capacity }
                                )}
                            </span>
                            <span
                              title={item.room.buildingName}
                              className={styles.listBuilding}
                            >
                              {item.room.buildingName}
                            </span>
                            <span
                              title={item.room.floorName}
                              className={styles.listFloor}
                            >
                              {item.room.floorName}
                            </span>
                          </List.Item>
                        ))
                      ) : (
                        <div className={styles.listEmpty}>
                          <div className={styles.title}>
                            {i18nClient.t(
                              'meeting_modal_no_useable_meeting',
                              '暂无可用会议室，请修改日程时间'
                            )}
                          </div>
                        </div>
                      )}
                    </List>
                  )}
                </div>
              )}
              {this.listFailed && buildingSelectedShow.length > 0 && (
                <RetryContent
                  style={{ marginTop: 114 }}
                  onRetry={this.getMeetingList}
                />
              )}
              {buildingSelectedShow.length === 0 && (
                <div className={styles.list}>
                  <div className={styles.listEmpty}>
                    <div className={styles.title}>
                      {i18nClient.t(
                        'meeting_modal_chose_city',
                        '请选择城市和大厦'
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            {this.showScrollTop && (
              <ScrollTopBtn
                onScrollTop={this.scrollToTop}
                style={{ position: 'absolute', bottom: 24, right: 24 }}
              />
            )}
          </div>
        </Modal.Body>
      </Modal>
    );
  }
}
