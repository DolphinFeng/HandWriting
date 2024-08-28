import { inject, observer } from 'mobx-react';
// import '@ss/mtd-react/lib/style/index.css';
import React, { Component } from 'react';
import { Modal, message } from '@ss/mtd-react';
import JimuEditor from '@jimu/form-editor';
// import { setters } from '@jimu/setters';
import { MessageType } from '@jimu/types';
import { withRouter } from 'onejs/router';
import ajax from '@/services/ajax';
import {
  removeProperties,
  findNodesByPropertyCodes,
  findAllChildrenByInstanceKey,
  findConditonsByPropertyCodes
} from '@/utils/form';

import {
  isPropertiesUsedInMessageSetting,
  removeMessageSettingFields
} from '@/utils/moreSetting';

import {
  isOptionUsedInNodes,
  removeOptionFromConditionNodes,
  hasFormComponent
} from '@/utils/flow';
import { NODETYPE, includeComponents } from '../flow/const';
// import QRCode from 'qrcodejs2';
// import Render from 'jimu-render';
// import WebComponents from 'jimu-web-components';
// import Render from "../../render/src";
// import { JMComponents } from "../../components";

// 消息处理的弹窗的文案类型
const INFO_TYPE = {
  DRAG_IN_TABLE: 'DRAG_IN_TABLE',
  DELETE: 'DELETE',
  REQUIRED_CHANGE: 'REQUIRED_CHANGE'
};

@inject(({ approval }) => ({
  setGetFormFn: approval.setGetFormFn,
  setOptionsFn: approval.setOptionsFn,
  form: approval.form,
  approval,
  approvalMoreSetting: approval.approvalMoreSetting,
  process: approval.process,
  conditionComponentList: approval.conditionComponentList,
  getForm: approval.getForm,
  dataSource: approval.dataSource
}))
@observer
@withRouter
export default class FormApp extends Component {
  constructor(props) {
    super(props);

    this.state = {
      appCode: 'proplaSample',
      pdCode: 'jimuform',
      istat: 'NORMAL',
      tenantId: '1',
      schema: '',
      data: '',
      test: '111'
    };

    this.editorRef = React.createRef();
  }

  async fetchData() {
    const { appCode, pdCode } = this.props.history.location.query;
    const { tenantId } = this.state;
    const resData = await ajax.get(
      `/service/form/schema/${tenantId}/${appCode}/${pdCode}/workable`
    );

    if (resData?.schema) {
      await this.editorRef.current.importSchema(resData?.schema);
    }
  }

  handleInstanceKeyRemove = (propertyCodes, condition, infoType) => {
    const { process, approvalMoreSetting } = this.props;
    const {
      isUsedInCondition,
      isUsedInTask,
      isUsedInTaskApproval,
      isUsedInTaskCC,
      isUsedInMessageSetting
    } = condition;

    const message = [];
    // 这个条件不是指高级设置 - 条件
    isUsedInCondition && message.push('条件中');
    isUsedInTask && message.push('③流程设计中');
    isUsedInMessageSetting && message.push('通知设置中');

    const people = [];
    isUsedInTaskApproval && people.push('审批人');
    isUsedInTaskCC && people.push('抄送人');

    const infoTextType = {
      [INFO_TYPE.DRAG_IN_TABLE]: {
        title: '确定移动此控件进入子表单吗？',
        msg: (
          <p>
            控件历史数据将一并被删除且无法恢复，如需历史数据请先下载备份。
            <br />
            移动进入子表单则对应设置将同时删除，确认移动吗？
          </p>
        )
      },
      [INFO_TYPE.DELETE]: {
        title: '确定删除此控件吗？',
        msg: (() => {
          const quoteMsg = message.join('、');
          // 没有引用，不显示引用提醒文字
          return (
            <p>
              控件历史数据将一并被删除且无法恢复，如需历史数据请先下载备份。
              <br />{' '}
              {quoteMsg
                ? `该控件在${quoteMsg}被使用，控件删除后则对应条件将一并被清空。`
                : ''}
            </p>
          );
        })()
      },
      [INFO_TYPE.REQUIRED_CHANGE]: {
        title: '确定改为非必填吗？',
        msg: '此控件在分支条件中被使用，改为非必填后则对应条件将一并被清空。'
      }
    };

    const infoTextDes =
      infoTextType[infoType] || infoTextType[INFO_TYPE.DELETE];
    const titleText = infoTextDes.title;
    const text = infoTextDes.msg;

    return new Promise((resolve) => {
      Modal.warning({
        // title: `该控件在${message.join('、')}被使用，${text}`,
        title: titleText,
        message: text,
        okText: '确认',
        okBtnProps: { type: 'danger' },
        cancelText: '取消',
        onOk: () => {
          if (isUsedInCondition || isUsedInMessageSetting || isUsedInTask) {
            if (isUsedInCondition || isUsedInTask) {
              removeProperties(propertyCodes, process);
            }
            if (isUsedInMessageSetting) {
              removeMessageSettingFields(
                propertyCodes,
                approvalMoreSetting.messageSetting
              );
            }
          }
          resolve(true);
        },
        onCancel: () => {
          resolve(false);
        }
      });
    });
  };

  handleMessageEvents = (info) => {
    const { messageType } = info;
    switch (messageType) {
      // 以下 OptionChange、RequiredChange、ComponentRemove、ContainerChange 都类似的条件删除逻辑
      case MessageType.OptionChange:
        return this.optionPropertyChange(info);
      case MessageType.RequiredChange:
        return this.requiredPropertyChange(info);
      case MessageType.ComponentRemove:
        return this.removeComponentFn(info, INFO_TYPE.DELETE);
      case MessageType.ContainerChange:
        return this.handleContainerChange(info);
      case MessageType.OptionDataSourceChange:
        return this.handleOptionDataSourceChange(info);
      default:
        return null;
    }
  };

  // 检查选项数据源是否在级联或者流程条件中配置
  handleOptionDataSourceChange = async (info) => {
    const { instance } = info;
    if (!instance.instanceKey) {
      return true;
    }

    const msg = [];

    const { process } = this.props;
    const formInfo = this.props.getForm({ isValidation: true });
    const formControlledFields = formInfo.conditionFields;

    const usedNodesInProcess = findNodesByPropertyCodes(
      [instance.instanceKey],
      process
    );

    const usedInFormControlledFields = findConditonsByPropertyCodes(
      instance.instanceKey,
      formControlledFields
    );

    // 在流程中被使用
    const isUsedInNode = usedNodesInProcess && usedNodesInProcess.length !== 0;
    // 在级联中被使用
    const isUsedInCondition =
      usedInFormControlledFields && usedInFormControlledFields.length !== 0;

    isUsedInNode && msg.push('流程条件中');
    isUsedInCondition && msg.push('高级设置的显示条件中');

    if (isUsedInNode || isUsedInCondition) {
      message.error({
        message: `该控件在${msg.join('、')}被使用，请先删除条件`
      });

      return false;
    }

    return true;
  };

  // 拖拽导致父子关系变化（拖进拖出容器）
  handleContainerChange = (info) => {
    const { targetParentKey } = info;
    if (targetParentKey?.indexOf('table_') > -1) {
      return this.removeComponentFn(info, INFO_TYPE.DRAG_IN_TABLE);
    }
    return true;
  };

  // 必填属性更改
  requiredPropertyChange = async (info) => {
    const { instance, value } = info;
    if (!instance.instanceKey) {
      return true;
    }

    // 开启必填不用管
    if (value) {
      return true;
    }

    const { process } = this.props;

    // 判断是否在流程中使用（条件和任务）
    const usedNodesInProcess = findNodesByPropertyCodes(
      [instance.instanceKey],
      process
    );

    // 组件没有被使用,组件的属性更不可能被引用, 可以安全移除
    if (!usedNodesInProcess || usedNodesInProcess.length === 0) {
      return true;
    }

    const condition = this.isUsedInNode(
      [instance.instanceKey],
      usedNodesInProcess
    );
    condition.isUsedInMessageSetting = false;

    return this.handleInstanceKeyRemove(
      [instance.instanceKey],
      condition,
      INFO_TYPE.REQUIRED_CHANGE
    );
  };

  // 选项属性更改
  optionPropertyChange = async (info) => {
    const { instance, value } = info;
    if (!instance.instanceKey) {
      return true;
    }

    const { process } = this.props;

    const usedNodesInProcess = findNodesByPropertyCodes(
      [instance.instanceKey],
      process
    );

    // 组件没有被使用,组件的属性更不可能被引用, 可以安全移除
    if (!usedNodesInProcess || usedNodesInProcess.length === 0) {
      return true;
    }

    // eslint-disable-next-line no-case-declarations
    const optionKey = value?.value;

    if (!optionKey) {
      // eslint-disable-next-line no-console
      console.error('OptionKey 为空，请检查代码');
    }

    // eslint-disable-next-line no-case-declarations
    const isUsed = isOptionUsedInNodes(optionKey, usedNodesInProcess);

    // 条件没有被使用，可以安全移除
    if (!isUsed) {
      return true;
    }

    return new Promise((resolve) => {
      Modal.warning({
        title:
          '该属性被流程中的条件使用，删除则对应的条件将同时删除，是否确认删除?',
        okText: '确认',
        okBtnProps: { type: 'danger' },
        cancelText: '取消',
        onOk: () => {
          removeOptionFromConditionNodes(optionKey, usedNodesInProcess);
          resolve(true);
        },
        onCancel: () => {
          resolve(false);
        }
      });
    });
  };

  // 删除控件关联的流程、消息通知设置
  removeComponentFn = async (info, infoType) => {
    const { instance } = info;
    const { instanceKey, childs } = instance;

    if (/column(?!sgrid)/.test(instanceKey)) return true;

    const { process, approval, approvalMoreSetting } = this.props;

    const form = approval.getForm() || {};

    let propertyCodes = [instanceKey];

    // 当有 childs 时，需要遍历取值
    if (childs && childs.length && childs.length > 0) {
      propertyCodes = findAllChildrenByInstanceKey(form, instanceKey);
    }

    // 控件在画布里是否用到
    const usedNodesInProcess = findNodesByPropertyCodes(propertyCodes, process);
    // 控件在通知设置里使用
    const isUsedInMessageSetting = isPropertiesUsedInMessageSetting(
      propertyCodes,
      approvalMoreSetting.messageSetting
    );

    const condition = this.isUsedInNode(propertyCodes, usedNodesInProcess);
    condition.isUsedInMessageSetting = isUsedInMessageSetting;

    return this.handleInstanceKeyRemove(propertyCodes, condition, infoType);
  };

  isUsedInNode = (propertyCodes, usedNodesInProcess) => {
    const isUsedInCondition = usedNodesInProcess?.some((node) => {
      return node.type === NODETYPE.Condition;
    });

    const isUsedInTask = usedNodesInProcess?.some((node) => {
      return node.type === NODETYPE.Task;
    });

    const isUsedInTaskApproval = usedNodesInProcess?.some((node) => {
      if (
        node.type !== NODETYPE.Task ||
        !node.option ||
        !node.option.approvalGroup
      ) {
        return false;
      }
      return hasFormComponent(node.option.approvalGroup, propertyCodes);
    });

    const isUsedInTaskCC = usedNodesInProcess?.some((node) => {
      if (
        node.type !== NODETYPE.Task ||
        !node.option ||
        !node.option.ccGroups
      ) {
        return false;
      }
      const { ccGroups } = node.option;
      return ccGroups.some((ccGroup) => {
        return hasFormComponent(ccGroup, propertyCodes);
      });
    });

    return {
      isUsedInCondition,
      isUsedInTask,
      isUsedInTaskApproval,
      isUsedInTaskCC
    };
  };

  findDataSourceInstanceKey = (id) => {
    if (!id) return null;
    const instances = this.editorRef.current?.stores?.ViewportStore?.instances;

    for (const [key, instance] of instances) {
      // console.log('----instance', instance);
      const dataSource = instance?.data?.props?.dataSource;
      if (dataSource?.id === id) {
        return key;
      }
    }
    return null;
  };

  mergeConditions = (targetConditions, source) => {
    // console.log('-----targetConditions', { targetConditions, source });
    if (source.data && source.data.length !== 0) {
      // 查找这个组件的data是否之前存储过，有的话需要合并data
      const index = targetConditions.findIndex((condition) => {
        return condition.propertyCode === source.propertyCode;
      });
      if (index === -1) {
        targetConditions.push({
          propertyCode: source.propertyCode,
          data: source.data
        });
      } else {
        // 合并data，对于相同的选项只需要保留一个
        source.data.forEach((sOption) => {
          const i = targetConditions[index].data.findIndex((tOption) => {
            return tOption.dataId === sOption.dataId;
          });
          if (i === -1) {
            targetConditions[index].data.push(sOption);
          }
        });
      }
    }
  };

  editorDidMount = () => {
    const setInstanceInfo = this.editorRef?.current?.stores?.ViewportAction
      ?.setInstanceInfo;
    if (!setInstanceInfo) return;

    // console.log('------dataSource', this.props.dataSource);
    this.props.dataSource &&
      this.props.dataSource.forEach((source) => {
        const dataSource = {
          // 校验默认值
          settingValidation: true,
          debugValidation: true,
          ...source
        };
        const instanceKey = this.findDataSourceInstanceKey(dataSource.id);
        if (instanceKey) {
          // 将dataSource配置放到实例上
          setInstanceInfo(instanceKey, 'data.dataSource', dataSource);
          // const currentInstance = this.editorRef.current?.stores?.ViewportStore?.instances?.get(
          //   instanceKey
          // );
          // 重新校验
          // this.editorRef.current?.stores?.actions?.ViewportAction?.validationComponentInfo?.(
          //   currentInstance
          // );
        }
      });

    const { formControlledFields = [] } = this.props.approval;
    const displayConditions = [];
    // console.log('------formControlledFields', JSON.stringify(formControlledFields) );

    formControlledFields.forEach((controlledField) => {
      const { conditions = [] } = controlledField?.conditionSetModel;
      const newCondition = { code: controlledField.code, conditions: [] };
      // console.log('-----editorDidMount conditions', conditions)
      conditions.forEach((item) => {
        if (item.conditions && item.conditions.length > 0) {
          item.conditions.forEach((newItem) => {
            this.mergeConditions(newCondition.conditions, newItem);
          });
        } else {
          this.mergeConditions(newCondition.conditions, item);
        }
      });
      displayConditions.push(newCondition);
    });

    // console.log('------editorDidMount displayConditions', displayConditions);

    // 将级联条件挂在实例上
    displayConditions
      .filter((item) => item.conditions.length > 0)
      .forEach((item) => {
        setInstanceInfo(item.code, 'data.conditions', item.conditions);
      });
  };

  render() {
    const { setGetFormFn, form, setOptionsFn, hide } = this.props;

    return (
      // <div style={{ width: '100%', height: 'calc(100vh - 50px)' }}>
      <JimuEditor
        ref={this.editorRef}
        customRender={(node) => {
          if (hide) {
            return null;
          }
          return node;
        }}
        // onSave={this.save}
        getSchema={(getSchema) => {
          setGetFormFn(getSchema);
        }}
        getOptionsById={(getOptions) => {
          setOptionsFn(getOptions);
        }}
        editorDidMount={this.editorDidMount}
        defaultSchemaValue={form || ''} // 配置默认schema
        pluginsConfig={{
          rightTab: [], // 右侧工具栏tab配置
          leftToolIsEmbed: true, // 左侧工具栏是否内嵌到页面里面
          leftDefaultTool: 'dragMenu', // 默认选择左侧的工具栏名称
          showLeftToolNav: true // 左侧导航栏是否隐藏
        }}
        disableBuiltInPlugin={[
          'main-tool-tree',
          'var-panel',
          'drag-menu-bt-fn',
          'drag-menu-bt-var',
          // 'crumbs',
          'DragMenuBtFn',
          'preview',
          'save',
          'import-page-plugin'
        ]}
        // disableBuiltInComponents={[
        //   'ChatGroup',
        //   'AssociatedRecord',
        //   'AssociatedQuery',
        //   'AssociatedDataSource'
        // ]}
        // setters={[
        //   {
        //     key: 'String', // 用于替换原有string setter，原有string setter plugin 废弃
        //     component: setters.BasicTextSetter
        //   },
        //   {
        //     key: 'BasicTextSetter', // 两个名字都允许用
        //     component: setters.BasicTextSetter
        //   },
        //   {
        //     key: 'BasicNumberSetter',
        //     component: setters.BasicNumberSetter
        //   },
        //   {
        //     key: 'BasicDateSetter',
        //     component: setters.BasicDateSetter
        //   },
        //   {
        //     key: 'BasicSelectSetter',
        //     component: setters.BasicSelectSetter
        //   },
        //   {
        //     key: 'DefaultValueUriSetter',
        //     component: setters.DefaultValueURISetter
        //   },
        //   {
        //     key: 'BatchEditSetter',
        //     component: setters.BatchEditSetter
        //   },
        //   {
        //     key: 'GridSetter',
        //     component: setters.GridSetter
        //   },
        //   {
        //     key: 'SelectOptionsSetter',
        //     component: setters.SelectOptionsSetter
        //   }
        // ]}
        // 设计器统一消息处理事件
        handleMessageEvents={this.handleMessageEvents}
        includeComponents={includeComponents}
        // plugins={[MyPlugin, JMTypeBoolean, DragMenuBtVar, DbMenu]}
        // componentClasses={[...BasicComponents, ...JMComponents]}
        // componentClasses={[...JMComponents]}
        // disableBuiltInPlugin={['main-tool-editor-event-trigger']}
        // plugins={[MyPlugin, JMTypeBoolean, DragMenuBtVar, DbMenu]}
      />
      // </div>
    );
  }
}
