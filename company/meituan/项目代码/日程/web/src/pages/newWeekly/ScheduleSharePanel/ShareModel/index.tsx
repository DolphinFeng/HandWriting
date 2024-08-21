import { i18nClient } from '@sailor/i18n-web';
import React, { useCallback, useEffect, useState } from 'react';
import { inject } from 'mobx-react';
import { observer } from 'mobx-react-lite';
import {
  Button, Select, Loading, Tooltip
} from '@ss/mtd-react';
import classNames from 'classnames';
import { toJS } from 'mobx';
import { uniqueId } from 'lodash';
import { getAttanceAccount } from '@/services/apis';
import defaultImg from '@/asserts/images/default.png';
import { messageStore } from '@/store/global';
import styles from './index.less';

const popLayerConfig = {
  getContainer: (classname): HTMLElement => document.querySelector(classname)
};

/**
 * 日程共享设置弹窗
 */
const ShareModel = observer((props) => {
  const {
    stroes: {
      week: {
        initScheduleList,
        scheduleSharePanelStore: {
          getShareToOtherList,
          shareToOtherList,
          shareToMeList,
          deleteShareToMe,
          cancelShareToOther,
          shareOtherLoading,
          saveShareToOther,
          setData
        },
        scheduleSourcePanelStore: { scheduleSourceList, meetingId, scheduleId }
      },
      global: {
        currentUser: { empId }
      }
    }
  } = props;

  // 用户搜索
  const [userFilter, setUserFilter] = useState(false);
  // 用户搜索Loading
  const [loadingStatus, setLoadingStatus] = useState(false);
  // 用户搜索列表
  const [userList, setUserList] = useState([]);

  // 数据初始化
  useEffect(() => {
    getShareToOtherList();
    return () => {
      setData({ shareToOtherList: [] });
    };
  }, []);

  // 添加共享日程
  const handleAddShareToOther = useCallback(() => {
    shareToOtherList.push({
      id: uniqueId(),
      isEdit: true, // 是否编辑模式
      applicationIdList: scheduleSourceList.map(item => item.id) // 日程来源
    });
    setData({
      shareToOtherList
    });
  }, [shareToOtherList]);

  // 取消共享日程
  const handleCancelShareToOther = useCallback(
    (id) => {
      (async () => {
        try {
          await cancelShareToOther(id);
          setData({
            shareToOtherList: shareToOtherList.filter(item => item.id !== id)
          });
        } catch (err) {
          console.log('[cancelShareToOther failed]');
          // 被共享人已 接收/拒绝 共享, 则重新请求并更新列表
          await getShareToOtherList();
        }
      })();
    },
    [shareToOtherList]
  );

  // 删除共享日程 给别人
  const handleDeleteShareToOther = useCallback(
    (id) => {
      (async () => {
        await deleteShareToMe(id);
        setData({
          shareToOtherList: shareToOtherList.filter(item => item.id !== id)
        });
      })();
    },
    [shareToOtherList]
  );

  // 取消订阅, 删除共享日程 给自己
  const handleDeleteShareToMe = useCallback(
    (id) => {
      (async () => {
        await deleteShareToMe(id);
        setData({
          shareToMeList: shareToMeList.filter(item => item.id !== id)
        });
        initScheduleList();
      })();
    },
    [shareToMeList]
  );

  // 保存共享日程
  const handleSaveShareToOther = useCallback(async (id) => {
    const result = await saveShareToOther(id);
    if (result === 'noUser') {
      messageStore.error(i18nClient.t('share_model_please_chose_sharer', '请选择共享人'));
    } else if (result === 'noSource') {
      messageStore.error(i18nClient.t('share_model_please_chose_resources', '请选择日程来源'));
    }
  }, []);

  // 编辑共享日程
  const handleEditShareToOther = useCallback(
    (id) => {
      setData({
        shareToOtherList: shareToOtherList.map((item) => {
          if (item.id === id) {
            item.isEdit = true;
          }
          return item;
        })
      });
    },
    [shareToOtherList]
  );

  // 取消编辑状态
  const handleCancelEditShareToOther = useCallback(
    (id) => {
      const shareData = shareToOtherList.filter(item => item.id !== id);
      const shareToOtherItem = shareToOtherList.find(item => item.id === id);
      if (shareToOtherItem.applicationData) {
        shareToOtherItem.isEdit = false;
        shareData.push(shareToOtherItem);
      }
      setData({
        shareToOtherList: shareData
      });
    },
    [shareToOtherList]
  );

  // 改变人员
  const handleChangeUser = useCallback(
    (id, user) => {
      if (user?.value === `${empId}`) {
        messageStore.warning(i18nClient.t('share_model_cannot_add_self', '不能添加自己为共享人'));
        return;
      }
      setData({
        shareToOtherList: shareToOtherList.map((item) => {
          if (item.id === id) {
            item.shareUserId = user?.value || '';
            item.shareUserName = user?.originOption?.name;
            item.shareUserMis = user?.originOption?.mis;
            item.shareUserAvatar = user?.originOption?.avatar;
          }
          return item;
        })
      });
    },
    [shareToOtherList]
  );

  // 改变日程来源
  const handleChangeScheduleSource = useCallback(
    (id, value) => {
      setData({
        shareToOtherList: shareToOtherList.map((item) => {
          if (value.includes(scheduleId)) {
            !value.includes(meetingId) && value.push(meetingId);
          } else {
            const indx = value.indexOf(meetingId);
            indx >= 0 && value.splice(indx, 1);
          }
          if (item.id === id) {
            item.applicationIdList = value;
          }
          return item;
        })
      });
    },
    [shareToOtherList]
  );

  return (
    <div className={classNames(styles.container)}>
      <div className={classNames(styles.item, 'scheduleShareModel')}>
        <div className={styles.title}>
          <span>
            {i18nClient.t('share_model_i_shared', '我共享的')}
            <span className={styles.tag}>{i18nClient.t('share_model_please_three_sharers_most', '最多只允许设置3个共享人')}</span>
          </span>
          <Button
            disabled={!!(shareToOtherList && shareToOtherList.length >= 3)}
            onClick={handleAddShareToOther}
            icon="add"
          >
            {i18nClient.t('share_model_additional', '添加共享人')}
          </Button>
        </div>
        <div className={styles.list}>
          <div className={classNames(styles.header, styles.tr)}>
            <div className={classNames(styles.td, styles.name)}>{i18nClient.t('share_model_sharer', '共享人')}</div>
            <div className={classNames(styles.td, styles.scope)}>{i18nClient.t('share_model_calendar_resources', '日程来源')}</div>
            <div className={classNames(styles.td, styles.operation)}>{i18nClient.t('share_model_actions', '操作')}</div>
          </div>
          {shareToOtherList && shareToOtherList.length > 0 ? (
            <>
              {shareToOtherList.map((item) => {
                return (
                  <div className={styles.tr} key={item.id}>
                    <div className={classNames(styles.tdr, styles.name)}>
                      {item.isEdit && !item.applicationData ? (
                        <Select
                          value={item.shareUserId}
                          loading={loadingStatus}
                          loadingMessage={() => <Loading />}
                          notFoundMessage={
                            userFilter ? i18nClient.t('share_model_no_data', '无数据') : i18nClient.t('share_model_please_input_search', '请输入姓名或mis号查询')
                          }
                          placeholder={i18nClient.t('share_model_please_input_search', '请输入姓名或mis号查询')}
                          onFilter={async (filter) => {
                            if (!filter) {
                              setUserFilter(null);
                              setUserList([]);
                              return;
                            }
                            setLoadingStatus(true);
                            setUserList([]);
                            try {
                              const data = await getAttanceAccount({
                                filter
                              });
                              setUserList(data);
                            } finally {
                              setLoadingStatus(false);
                            }
                          }}
                          onChange={(value) => {
                            handleChangeUser(item.id, value);
                          }}
                          renderInputLabel={(option) => {
                            console.log(toJS(shareToOtherList), option);
                            const otherItem = shareToOtherList.find(
                              shareItem => +shareItem.shareUserId === +option.value
                            );

                            const value = option.originOption || {
                              name: otherItem?.shareUserName,
                              mis: otherItem?.shareUserMis,
                              avatar: otherItem?.shareUserAvatar
                            };
                            // return `${value?.name}/${value?.mis}`;
                            return (<div className={styles.userOption}>
                              <img
                                className={styles.img}
                                src={value.avatar || defaultImg}
                                alt={i18nClient.t('share_model_avatar', '头像')}
                              />
                              {value.name}
                            </div>);
                          }}
                        // popLayer={{
                        //   getContainer: () => popLayerConfig.getContainer('.scheduleShareModel'),
                        // }}
                        >
                          {userList.map((option, index) => (
                            <Select.Option
                              key={index}
                              value={option.empId}
                              originOption={option}
                            >
                              <div className={styles.userOption}>
                                <img
                                  className={styles.img}
                                  src={option.avatar || defaultImg}
                                  alt={i18nClient.t('share_model_avatar', '头像')}
                                />
                                {option.name}
                              </div>
                            </Select.Option>
                          ))}
                        </Select>
                      ) : (
                        <Tooltip
                          message={`${item.shareUserName}/${item.shareUserMis}`}
                          getContainer={() => popLayerConfig.getContainer('.scheduleShareModel')}
                          placement="topLeft"
                        >
                          <div className={styles.imgwrapper}>
                            <img
                              className={styles.img}
                              src={item.shareUserAvatar || defaultImg}
                              alt={i18nClient.t('share_model_avatar', '头像')}
                            />
                            <span>{item.shareUserName}</span>
                          </div>
                        </Tooltip>
                      )}
                    </div>
                    {/* 日程和会议合并 */}
                    <div className={classNames(styles.tdr, styles.scope)}>
                      {item.isEdit ? (
                        <Select
                          multiple
                          placeholder={i18nClient.t('share_model_please_chose_resources', '请选择日程来源')}
                          value={item.applicationIdList.filter(
                            applicationIdItem => applicationIdItem !== meetingId
                          )}
                          filterable={false}
                          onlyKeyValue
                          onChange={(value) => {
                            handleChangeScheduleSource(item.id, value);
                          }}
                        // popLayer={{
                        //   getContainer: () => popLayerConfig.getContainer('.scheduleShareModel'),
                        // }}
                        >
                          {scheduleSourceList
                            .filter(app => app.id !== meetingId)
                            .map(option => (
                              <Select.Option key={option.id} value={option.id}>
                                {option.appName}
                              </Select.Option>
                            ))}
                        </Select>
                      ) : (
                        <Tooltip
                          message={item.applicationData
                            .filter(app => app.id !== meetingId)
                            .map(app => app.appName)
                            .join('、')}
                          getContainer={() => popLayerConfig.getContainer('.scheduleShareModel')}
                        >
                          <div className={styles.scopespan}>
                            {item.applicationData
                              .filter(app => app.id !== meetingId)
                              .map(app => app.appName)
                              .join('、')}
                          </div>
                        </Tooltip>
                      )}
                    </div>
                    <div className={classNames(styles.tdr, styles.operation)}>
                      {item.isEdit ? (
                        <>
                          <Tooltip
                            message={i18nClient.t('share_model_save', '保存')}
                            getContainer={() => popLayerConfig.getContainer('.scheduleShareModel')}
                          >
                            <i
                              className={classNames(styles.icon, 'dxcalendar dx-calcheck-r')}
                              onClick={() => {
                                handleSaveShareToOther(item.id);
                              }}
                            />
                          </Tooltip>
                          <Tooltip
                            message={i18nClient.t('share_model_cancel', '取消')}
                            getContainer={() => popLayerConfig.getContainer('.scheduleShareModel')}
                          >
                            <i
                              className={classNames(styles.icon, 'dxcalendar dx-calclose-r')}
                              onClick={() => {
                                handleCancelEditShareToOther(item.id);
                              }}
                            />
                          </Tooltip>
                        </>
                      ) : (
                        <>
                          <Tooltip
                            message={i18nClient.t('share_model_edit', '编辑')}
                            getContainer={() => popLayerConfig.getContainer('.scheduleShareModel')}
                          >
                            <i
                              className={classNames(styles.icon, 'dxcalendar dx-caledit')}
                              onClick={() => {
                                handleEditShareToOther(item.id);
                              }}
                            />
                          </Tooltip>
                          {item.status === 1 ? (
                            <Tooltip
                              message={i18nClient.t('share_model_unshared', '撤销共享')}
                              getContainer={() => popLayerConfig.getContainer('.scheduleShareModel')}
                            >
                              <i
                                className={classNames(styles.icon, 'dxcalendar dx-caldelete-o-r')}
                                onClick={() => {
                                  handleDeleteShareToOther(item.id);
                                }}
                              />
                            </Tooltip>
                          ) : (
                            <Tooltip
                              message={i18nClient.t('share_model_withdrawal_invitation', '撤回邀请')}
                              getContainer={() => popLayerConfig.getContainer('.scheduleShareModel')}
                            >
                              <i
                                className={classNames(styles.icon, 'dxcalendar dx-caldelete-o-r')}
                                onClick={() => {
                                  handleCancelShareToOther(item.id);
                                }}
                              />
                            </Tooltip>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <div className={classNames(styles.tr, styles.nodata)}>
              {shareOtherLoading ? <Loading /> : i18nClient.t('share_model_no_data_now', '暂无数据')}
            </div>
          )}
        </div>
      </div>
      <div className={classNames(styles.item, 'scheduleNoticeModel')}>
        <div className={styles.title}>
          <span>{i18nClient.t('share_model_share_to_me', '共享给我的')}</span>
        </div>
        <div className={styles.list}>
          <div className={classNames(styles.header, styles.tr)}>
            <div className={classNames(styles.td, styles.name)}>{i18nClient.t('share_model_sharer', '共享人')}</div>
            <div className={classNames(styles.td, styles.scope)}>{i18nClient.t('share_model_calendar_resources', '日程来源')}</div>
            <div className={classNames(styles.td, styles.operation)}>{i18nClient.t('share_model_actions', '操作')}</div>
          </div>
          {shareToMeList && shareToMeList.length > 0 ? (
            <>
              {shareToMeList.map((item) => {
                return (
                  <div className={styles.tr} key={item.id}>
                    <div
                      className={classNames(styles.tdr, styles.name)}
                    >
                      <Tooltip
                        message={`${item.userName}/${item.userMis}`}
                        getContainer={() => popLayerConfig.getContainer('.scheduleNoticeModel')}
                        placement="topLeft"
                      >
                        <div className={styles.imgwrapper}>
                          <img
                            className={styles.img}
                            src={item.userAvatar || defaultImg}
                            alt={i18nClient.t('share_model_avatar', '头像')}
                          />
                          <span>{item.userName}</span>
                        </div>
                      </Tooltip>
                    </div>
                    {/* 日程和会议合并 */}
                    <div className={classNames(styles.tdr, styles.scope)}>
                      <Tooltip
                        message={item.applicationData
                          .filter(app => app.id !== meetingId)
                          .map(app => app.appName)
                          .join('、')}
                        getContainer={() => popLayerConfig.getContainer('.scheduleNoticeModel')}
                      >
                        <div className={styles.scopespan}>
                          {item.applicationData
                            .filter(app => app.id !== meetingId)
                            .map(app => app.appName)
                            .join('、')}
                        </div>
                      </Tooltip>
                    </div>
                    <div className={classNames(styles.tdr, styles.operation)}>
                      <Tooltip
                        message={i18nClient.t('share_model_unsubscribe', '取消订阅')}
                        getContainer={() => popLayerConfig.getContainer('.scheduleNoticeModel')}
                      >
                        <i
                          className={classNames(styles.icon, 'dxcalendar dx-caldelete-o-r')}
                          onClick={() => {
                            handleDeleteShareToMe(item.id);
                          }}
                        />
                      </Tooltip>
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <div className={classNames(styles.tr, styles.nodata)}>{i18nClient.t('share_model_no_data_now', '暂无数据')}</div>
          )}
        </div>
      </div>
    </div>
  );
});

export default inject(stroes => ({
  stroes
}))(ShareModel);
