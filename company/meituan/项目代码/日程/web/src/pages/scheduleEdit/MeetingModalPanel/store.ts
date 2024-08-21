import {
  observable, action, computed
} from 'mobx';
import {
  getCityBuildingFloorData,
  getEquipList,
  getCapacityList,
  getMeetingList
} from '@/services/apis';
import { windowOption } from '@/consts';
import { RoomsStorageService, StorageService } from '@/services/storage';

/**
 * 会议弹窗Store
 */
export default class MeetingModalPanelStore {
  // 城市、大厦及楼层数据
  @observable cityBuildingFloorData = [];

  // 获取设备列表
  @observable equipList = [];

  // 获取人员范围列表
  @observable capacityList = [];

  // 选中的城市
  @observable citySelected = StorageService.getItem('citySelected') || null;

  // 选中的大厦
  @observable buildingSelected =
  StorageService.getItem('buildingSelected') || [];

  // 选中的楼层
  @observable floorSelected = [];

  // 选中的设备
  @observable equipSelected = [];

  // 选中的人员范围
  @observable capacitySelected = null;

  // 选中的窗户
  @observable windowSelected = windowOption[0];

  // 会议室列表
  @observable meetingList = [];

  requestIndex = 0;

  // 城市列表
  @computed
  get cityList() {
    return this.cityBuildingFloorData.map((item) => {
      return {
        value: item.cityId,
        label: item.cityName
      };
    });
  }

  // 大厦列表
  @computed
  get buildingList() {
    try {
      return this.cityBuildingFloorData
        .find(item => item.cityId === +this.citySelected?.value)
        .buildingAndFloorVoList.map((item) => {
          return {
            value: item.building.id,
            label: item.building.name
          };
        });
    } catch (error) {
      return [];
    }
  }

  // 楼层列表
  @computed
  get floorList() {
    try {
      return this.buildingSelected.length === 1
        ? this.cityBuildingFloorData
          .find(item => item.cityId === +this.citySelected?.value)
          .buildingAndFloorVoList.find(
            item => item.building.id === +this.buildingSelected[0].value
          )
          .floors.map((item) => {
            return {
              value: item.id,
              label: item.name
            };
          })
        : [];
    } catch (error) {
      return [];
    }
  }

  // 最小容量
  @computed
  get capacityMin() {
    return this.capacityList.find(
      item => item.capacityMax === this.capacitySelected.value
    ).capacityMin;
  }

  // 最小容量
  @computed
  get capacityMax() {
    return this.capacitySelected.value;
  }

  @action
  init = (): void => {
    this.cityBuildingFloorData = [];
    this.equipList = [];
    this.capacityList = [];
    this.citySelected = StorageService.getItem('citySelected') || null;
    this.buildingSelected = StorageService.getItem('buildingSelected') || [];
    this.floorSelected = [];
    this.equipSelected = [];
    this.capacitySelected = null;
    this.windowSelected = windowOption[0];
    this.meetingList = [];
  };

  /**
   * 更新数据
   */
  @action.bound
  setData(data: any) {
    for (const key in data) {
      this[key] = data[key];
    }
  }

  /**
   * 获取城市、大厦及楼层数据
   */
  @action.bound
  async getCityBuildingFloorData(isFromRooms?: boolean) {
    this.cityBuildingFloorData = await getCityBuildingFloorData();
    // 从订会议室页面进入 写入缓存
    if (isFromRooms) {
      const selectedFromRooms = RoomsStorageService.getItem('meetingBuildingSelected') || [];
      if (selectedFromRooms && selectedFromRooms.length === 2) {
        try {
          const cityItemTemp = this.cityBuildingFloorData.find(
            item => item.cityId === +selectedFromRooms[0]
          );
          const cityItem = {
            value: cityItemTemp.cityId,
            label: cityItemTemp.cityName
          };
          const buildItemTemp = cityItemTemp.buildingAndFloorVoList.find(
            item => +item.building.id === +selectedFromRooms[1]
          );
          const buildItems = [
            {
              value: buildItemTemp.building.id,
              label: buildItemTemp.building.name
            }
          ];
          this.citySelected = cityItem;
          this.buildingSelected = buildItems;

          // StorageService.setItem('citySelected', cityItem);
          // StorageService.setItem('buildingSelected', buildItems);
        } catch (error) {
          console.error(error);
        }
      }
    } else if (!this.citySelected) {
      if (StorageService.getItem('citySelected')) {
        this.citySelected = StorageService.getItem('citySelected');
        this.buildingSelected = StorageService.getItem('buildingSelected') || [];
      }
    }
  }

  /**
   * 获取设备列表
   */
  @action.bound
  async getEquipList() {
    this.equipList = await getEquipList();
  }

  /**
   * 获取人员范围列表
   */
  @action.bound
  async getCapacityList() {
    this.capacityList = await getCapacityList();
    this.capacitySelected = {
      value: this.capacityList[0].capacityMax,
      label: this.capacityList[0].name
    };
  }

  /**
   * 获取会议室列表
   */
  @action.bound
  async getMeetingList(startTime, endTime, type, isTimeAvaliable) {
    if (!isTimeAvaliable || this.buildingSelected.length === 0) {
      this.meetingList = [];
    } else {
      const fetchId = ++this.requestIndex;
      const params = {
        cityId: this.citySelected?.value,
        buildings: this.buildingSelected.map(item => item.value),
        floorIds: this.floorSelected.map(item => item.value),
        equipIds: this.equipSelected.map(item => item.value),
        startTime,
        endTime
      };
      if (this.windowSelected.value !== 'all') {
        params.hasWindow = this.windowSelected.value;
      }
      if (this.capacityMin !== 0) {
        params.capacityMin = this.capacityMin;
      }
      if (this.capacityMax !== 0) {
        params.capacityMax = this.capacityMax;
      }

      const { matchList } = await getMeetingList(params);
      if (fetchId === this.requestIndex) {
        if (type === 'more') {
          this.meetingList = this.meetingList.concat(matchList);
        } else {
          this.meetingList = matchList;
        }
      }
    }
  }
}
