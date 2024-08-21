import { i18nClient } from '@sailor/i18n-web';

import React, {
  useState, useEffect, useCallback, useRef
} from 'react';
import {
  Button, Modal, Input, message, Icon, Popover
} from '@ss/mtd-react';
import { observer } from 'mobx-react-lite';
import styles from './index.less';
import {
  CALENDAR_ROLE_TYPE,
  EPERM_TYPE
} from '@/common/interface/IcalendarInfo';
import DlgTitle from './DlgTitle';
import { MENU_TABS } from './const';
import MenuTabItem from './MenuTabItem';
import {
  deleteCalendar,
  getCalendarInfoApi,
  createCalendar,
  updateCalendarAdmin,
  updateCalendarReader
} from '@/services/calendarInfo';
import PermissionSettingDlg from './PermissionSettingDlg';
import DeleteDlg from './DeleteDlg';
import classnames from 'classnames';
import UserList from './UserList';
import { inject } from 'mobx-react';
import GlobalStore from '@/store/global';
import ColorSelector from './ColorSelector';
import { IPublicCalendar } from '../store';
import { colorNumToStr, colorStrToNum } from '@/utils/color';
import { cloneDeep, isEqual } from 'lodash';
import { getCalMainColors } from '@/services/apis';
import WeekStore from '../../store/week';
import { defaultImg } from './PermissionSettingDlg/PermissionSelectClass';

interface ISettingDlg {
  onClose: () => void;
  currentCalendar: IPublicCalendar | undefined;
  global: GlobalStore;
  week: WeekStore;
}
enum DLGTYPE {
  CREATE = 'create',
  ADMIN_EDIT = 'admin_edit',
  SUBSCRIBE_EDIT = 'subscribe_edit'
}
const getInitCal = (currentCalendar) => {
  return {
    calSummary: currentCalendar ? currentCalendar.appName : '',
    calColor: currentCalendar ? currentCalendar.calendarColor : '#00B460',
    calDescription: currentCalendar ? currentCalendar.description : '',
    calSubscribes: []
  };
};

const SettingDlg: React.FC<ISettingDlg> = observer((props: ISettingDlg) => {
  const {
    onClose,
    currentCalendar,
    global: { currentUser },
    week: {
      scheduleSharePanelStore: { meInfo }
    }
  } = props;
  const [calendarInfo, setCalendarInfo] = useState(() => getInitCal(currentCalendar));
  const [activeTab, setActiveTab] = useState(EPERM_TYPE.ALL);

  const [permissionDlg, setPermissionDlg] = useState(false); // 新增权限弹窗
  const [deleteDlg, setDeleteDlg] = useState(false); // 删除dlg
  const [colorsVisible, setcolorsVisible] = useState(false);
  const [mainColors, setMainColors] = useState([]);
  const { CREATE, ADMIN_EDIT, SUBSCRIBE_EDIT } = DLGTYPE;
  const {
    calSummary, calColor, calDescription, calSubscribes
  } = calendarInfo;
  const calendarId = currentCalendar ? currentCalendar.calendarId : -1;
  const [dlgType, setDlgType] = useState(() => {
    if (currentCalendar) {
      return currentCalendar.role === 'READER' ? SUBSCRIBE_EDIT : ADMIN_EDIT;
    }
    return CREATE;
  });
  const originCalData = useRef({
    calSummary: '',
    calColor: '#00B460',
    calDescription: '',
    calSubscribes: []
  });
  const [calCreator, setCalCreator] = useState(
    dlgType === CREATE
      ? {
        role: CALENDAR_ROLE_TYPE.ADMIN,
        permissionType: 'USER_ID',
        permissionName: currentUser.name,
        userMis: currentUser.mis,
        permissionValue: currentUser.empId,
        userAvatar: meInfo.avatar || defaultImg
      }
      : null
  );

  useEffect(() => {
    if (dlgType !== DLGTYPE.CREATE) {
      init(calendarId);
    }
    getlMainColors();
  }, []);

  const getlMainColors = async () => {
    const colors = await getCalMainColors();
    // const colors = ['#F50000', '#FF5E00', '#FF9D00', '#00B460', '#00B4B4', '#3888FF', '#166FF7', '#7D1AFF', '#FE1985', '#B56B1A'];
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const mainColors = colors.map(color => colorNumToStr(color));
    setMainColors(mainColors);
  };

  const init = async (id) => {
    const {
      // 后端接口有问题，subscribeAclExtensionDTOS有时候返回为[]
      summary,
      description,
      color = 0,
      subscribeAclExtensionDTOS = [],
      ownerId,
      accessControlDTO
    } = await getCalendarInfoApi(id);
    const { role } = accessControlDTO;
    setDlgType(role === 'READER' ? SUBSCRIBE_EDIT : ADMIN_EDIT);
    const creatorIndex = subscribeAclExtensionDTOS.findIndex((item) => {
      return item.permissionValue === ownerId;
    });
    // 设置订阅者（包括创建者和管理员）
    setCalCreator(
      creatorIndex > -1 ? subscribeAclExtensionDTOS[creatorIndex] : null
    );
    creatorIndex > -1 && subscribeAclExtensionDTOS.splice(creatorIndex, 1);
    setCalendarInfo({
      ...calendarInfo,
      calSummary: summary,
      calColor: colorNumToStr(color),
      calDescription: description,
      calSubscribes: subscribeAclExtensionDTOS
    });
    originCalData.current = {
      calSummary,
      calColor,
      calDescription,
      calSubscribes: cloneDeep(subscribeAclExtensionDTOS)
    };
  };

  // 取消二次确认
  const handleClose = () => {
    if (!isEqual(originCalData.current, calendarInfo)) {
      // 判断是否有日历信息变化
      Modal.warning({
        style: { width: 400 },
        title: `${
          dlgType !== CREATE
            ? i18nClient.t(
              'setting_dailog_edit_not_save',
              '本次编辑还未保存，确定退出吗？'
            )
            : i18nClient.t(
              'setting_dailog_sure_out_of_calendar',
              '确定退出创建公共日历吗'
            )
        }`,
        message: `${
          dlgType !== CREATE
            ? ''
            : i18nClient.t(
              'setting_dailog_public_calendar_not_save',
              '取消后公共日历将不会被保存'
            )
        }`,
        okText: i18nClient.t('setting_dailog_exit', '退出'),
        okBtnProps: {
          type: 'danger',
          className: classnames(styles.btn)
        },
        cancelBtnProps: {
          className: classnames(styles.btn, styles.maskCancel)
        },
        maskClosable: false,
        cancelText: i18nClient.t('setting_dailog_cancel', '取消'),
        onOk: () => onClose && onClose()
      });
    } else {
      onClose && onClose();
    }
  };
  // 处理创建/编辑日历
  const handleConfirm = async () => {
    let subscribeAcls = null;
    if (dlgType !== SUBSCRIBE_EDIT) {
      subscribeAcls = tidySubscribes();
      if (!subscribeAcls) return;
    }
    switch (dlgType) {
      case CREATE: // 创建者创建日历
        await createCalendar({
          summary: calSummary,
          description: calDescription,
          color: colorStrToNum(calColor),
          subscribeAcls
        });
        break;
      case ADMIN_EDIT: // 管理者编辑日历
        await updateCalendarAdmin(calendarId, {
          summary: calSummary,
          description: calDescription,
          color: colorStrToNum(calColor),
          subscribeAcls
        });
        break;
      case SUBSCRIBE_EDIT: // 订阅者编辑日历
        await updateCalendarReader(calendarId, {
          color: colorStrToNum(calColor)
        });
        break;
      default:
        break;
    }
    onClose();
  };

  // 处理删除日历
  const handleDelete = async () => {
    await deleteCalendar(calendarId);
    setPermissionDlg(false);
    onClose();
  };

  const tidySubscribes = () => {
    const resCalSubscribes = calSubscribes.filter(item => item);
    const admin = resCalSubscribes.filter(
      item => item && item.role === CALENDAR_ROLE_TYPE.ADMIN
    );
    if (admin.length > 10) {
      message.error({
        message: i18nClient.t(
          'setting_dailog_supports_setting_up',
          '最多支持设置10名管理员'
        )
      });
      return;
    }
    // 把创建者拼接回去，避免删除
    resCalSubscribes.push(calCreator);
    const subscribeAcls = resCalSubscribes
      .filter(item => item)
      .map((item) => {
        return {
          permissionValue: item.permissionValue,
          role: item.role,
          permissionType: item.permissionType
        };
      });
    // eslint-disable-next-line consistent-return
    return subscribeAcls;
  };

  const handleOpenAddDlg = () => {
    setPermissionDlg(true);
  };

  const closePermissionDlg = () => {
    setPermissionDlg(false);
  };

  const getCount = useCallback(
    (type: EPERM_TYPE) => {
      const array = calSubscribes.filter((item) => {
        if (type === EPERM_TYPE.ALL) {
          return true;
        }
        return item.permissionType === type;
      });
      if (
        (type === EPERM_TYPE.ALL || type === EPERM_TYPE.USER_ID)
        && calCreator
      ) {
        return array.length + 1;
      }
      return array.length;
    },
    [calSubscribes]
  );
  // 处理角色权限变化
  const handleRoleChange = (role, user) => {
    const changedUserIndex = calSubscribes.findIndex((item) => {
      return item.permissionValue === user.permissionValue;
    });
    const temp = [...calSubscribes];
    if (!role) {
      // 删除权限
      temp.splice(changedUserIndex, 1);
    } else {
      // 变更权限
      user.role = role;
      temp.splice(changedUserIndex, 1, user);
    }
    setCalendarInfo({
      ...calendarInfo,
      calSubscribes: temp
    });
  };
  // 增加用户
  const handleAddUser = (list, type: EPERM_TYPE, role: CALENDAR_ROLE_TYPE) => {
    const addValue = list.map((item) => {
      return {
        permissionValue: item.value,
        permissionType: type,
        mis: item.originOption.mis,
        permissionName: item.originOption.permissionName,
        name: item.originOption.permissionName,
        role,
        userAvatar: item.originOption.avatar
      };
    });
    const ss = calSubscribes.concat(addValue);
    setCalendarInfo({
      ...calendarInfo,
      calSubscribes: ss
    });
    setPermissionDlg(false);
  };

  const getEmptyNode = () => {
    let emptyMessage = i18nClient.t(
      'setting_dailog_no_person_permission',
      '暂无个人权限'
    );
    switch (activeTab) {
      case EPERM_TYPE.ORG_ID:
        emptyMessage = i18nClient.t(
          'setting_dailog_no_department_permission',
          '暂无部门权限'
        );
        break;
      default:
        break;
    }
    return emptyMessage;
  };
  const handleSwitchColors = () => {
    setcolorsVisible(!colorsVisible);
  };
  // 改变日历颜色
  const handleChangeColor = (color) => {
    setCalendarInfo({ ...calendarInfo, calColor: color });
    handleSwitchColors();
  };
  return (
    <Modal
      className={classnames(styles.settingDlg, 'setting')}
      closable={false}
      title={
        <DlgTitle
          onClose={handleClose}
          title={
            dlgType === CREATE
              ? i18nClient.t('setting_dailog_create_calendar', '创建日历')
              : i18nClient.t('setting_dailog_set_calendar', '日历设置')
          }
        />
      }
    >
      <Modal.Body className={styles.body}>
        <div className={styles.titleLabel}>
          {i18nClient.t('setting_dailog_calendar_info', '日历信息')}
        </div>

        <div className={styles.infoArea}>
          <div className={styles.calendarName}>
            <label className={styles.inputLabel}>
              {i18nClient.t('setting_dailog_name', '名称')}
            </label>
            <Input
              maxLength={20}
              className={styles.input}
              placeholder={i18nClient.t(
                'setting_dailog_please_input_name',
                '请输入名称，20字以内'
              )}
              disabled={dlgType === SUBSCRIBE_EDIT}
              value={calSummary}
              onChange={(e) => {
                setCalendarInfo({
                  ...calendarInfo,
                  calSummary: e.target.value
                });
              }}
            />
          </div>

          <div className={classnames(styles.calendarDescription)}>
            <label className={styles.inputLabel}>
              {i18nClient.t('setting_dailog_description', '描述')}
            </label>
            <Input.TextArea
              maxLength={200}
              className={styles.input}
              placeholder={i18nClient.t(
                'setting_dailog_please_add_description',
                '请添加日历描述'
              )}
              disabled={dlgType === SUBSCRIBE_EDIT}
              value={calDescription}
              onChange={(e) => {
                setCalendarInfo({
                  ...calendarInfo,
                  calDescription: e.target.value
                });
              }}
            />
          </div>

          <div className={styles.calendarColor}>
            <label className={styles.inputLabel}>
              {i18nClient.t('setting_dailog_color', '颜色')}
            </label>
            <Popover
              placement="bottomRight"
              autoDestory
              trigger="click"
              className="colorPop"
              visible={colorsVisible}
              align={{
                points: ['tr', 'br'],
                offset: [0, 4]
              }}
              onDocumentClick={() => setcolorsVisible(false)}
              content={
                <ColorSelector
                  selectedColor={calColor}
                  changeColor={(color) => {
                    handleChangeColor(color);
                  }}
                  mainColors={mainColors}
                />
              }
            >
              <div className={styles.colorWrap} onClick={handleSwitchColors}>
                <span
                  className={styles.colorBox}
                  style={{ backgroundColor: calColor }}
                ></span>
                <span className={styles.colorDown}>
                  <Icon
                    className={styles.downIcon}
                    type="down"
                    style={{ transform: colorsVisible && 'rotate(180deg)' }}
                  ></Icon>
                </span>
              </div>
            </Popover>
          </div>
        </div>
        {dlgType !== SUBSCRIBE_EDIT && (
          <div>
            <div className={styles.titleLabel}>
              {i18nClient.t('setting_dailog_calendar_role', '日历权限')}
            </div>
            <div className={styles.permission}>
              <div className={styles.addButton} onClick={handleOpenAddDlg}>
                <label className={styles.placeholder}>
                  {i18nClient.t(
                    'setting_dailog_please_input_department_people_mis',
                    '请输入部门、个人、mis号查找'
                  )}
                </label>
                <div className={styles.fakeAdd}>
                  <Icon className={styles.addIcon} type="add" />
                  <label className={styles.addLabel}>
                    {i18nClient.t('setting_dailog_add_role', '新增权限')}
                  </label>
                </div>
              </div>

              <div className={styles.permissionTab}>
                <label className={styles.label}>
                  {i18nClient.t('setting_dailog_now_role', '当前权限')}:
                </label>
                <div className={styles.tabItem}>
                  {MENU_TABS.map((item, index) => {
                    return (
                      <MenuTabItem
                        onClick={() => {
                          setActiveTab(item.key);
                        }}
                        name={item.label}
                        split={index !== MENU_TABS.length - 1}
                        count={getCount(item.key)}
                        active={item.key === activeTab}
                      />
                    );
                  })}
                </div>
              </div>
              <UserList
                handleChange={handleRoleChange}
                creator={
                  [EPERM_TYPE.ALL, EPERM_TYPE.USER_ID].indexOf(activeTab) > -1
                    ? calCreator
                    : null
                }
                emptyNode={getEmptyNode()}
                permissionUsers={calSubscribes.filter((item) => {
                  if (activeTab === EPERM_TYPE.ALL) {
                    return true;
                  }
                  return item.permissionType === activeTab;
                })}
              />
            </div>
          </div>
        )}

        {permissionDlg && (
          <PermissionSettingDlg
            initUser={[...calSubscribes, calCreator]}
            onClose={closePermissionDlg}
            onAddUser={handleAddUser}
          />
        )}
        {dlgType === ADMIN_EDIT && (
          <div>
            <div className={styles.titleLabel}>
              {i18nClient.t('setting_dailog_delete_calendar', '删除日历')}
            </div>
            <div className={styles.delete}>
              <div className={styles.deleteLeft}>
                <label className={styles.label}>{calSummary}</label>
              </div>
              <div
                className={styles.deleteRight}
                onClick={() => setDeleteDlg(true)}
              >
                <div className={styles.split}></div>
                <Icon className={styles.icon} type="delete-o" />
                <label className={styles.label}>
                  {i18nClient.t('setting_dailog_delete_calendar', '删除日历')}
                </label>
              </div>
              {deleteDlg && (
                <DeleteDlg
                  onDelete={handleDelete}
                  onCancel={() => setDeleteDlg(false)}
                />
              )}
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button
          className={classnames(styles.btn, styles.cancel)}
          onClick={handleClose}
        >
          {i18nClient.t('setting_dailog_cancel', '取消')}
        </Button>
        <Button
          className={classnames(styles.btn)}
          disabled={calSummary.length < 1}
          type="primary"
          onClick={handleConfirm}
        >
          {dlgType === CREATE
            ? i18nClient.t('setting_dailog_create', '创建')
            : i18nClient.t('setting_dailog_save', '保存')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
});

export default inject(({ global, week }) => ({
  global,
  week
}))(SettingDlg);
