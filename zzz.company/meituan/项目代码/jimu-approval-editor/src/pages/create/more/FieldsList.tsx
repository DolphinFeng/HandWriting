import React, { Component } from 'react';
import { Button, Select } from '@ss/mtd-react';
import classNames from 'classnames';
import SortableList, { SortableItemType } from './SortableList';
import { IComponent } from '@/utils/form.type';
import { ISetting } from './MessageSetting.type';
import Styles from './index.less';

const { Option } = Select;

const MAX_COUNT = 3;
interface IState {
  addItem: SortableItemType;
}

interface IProps {
  setting: ISetting;
  onChange: Function;
  componentList: IComponent[];
}

export default class MessageSetting extends Component<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      addItem: {} as SortableItemType
    };
  }

  handleSortChange = (items) => {
    const { setting, onChange } = this.props;

    setting.fields = items;
    onChange({
      ...setting
    });
  };

  handleAdd = () => {
    const { setting, onChange } = this.props;
    if (setting.isEdit) {
      setting.validateMessage = '请先保存所选的控件信息';
      onChange(setting);
      return;
    }

    setting.isEdit = true;
    onChange(setting);
  };

  handleFieldCancel = () => {
    const { setting, onChange } = this.props;

    setting.isEdit = false;
    setting.validateMessage = null;
    onChange(setting);
  };

  handleFieldChange = (val) => {
    if (!val) {
      this.setState({
        addItem: {} as SortableItemType
      });
      return;
    }

    this.setState({
      addItem: {
        id: val.value,
        name: val.label
      }
    });
  };

  handleFieldSave = () => {
    const { setting, onChange } = this.props;

    if (typeof this.state.addItem?.id === 'undefined') {
      setting.validateMessage = '请选择组件信息';
      onChange(setting);
      return;
    }

    const newFields = setting.fields.slice();
    newFields.push(this.state.addItem);
    setting.fields = newFields;

    this.setState({
      addItem: {} as SortableItemType
    });

    setting.isEdit = false;
    setting.validateMessage = null;

    onChange(setting);
  };

  renderFields = () => {
    const { setting, componentList } = this.props;

    return componentList?.map((component: IComponent, index) => {
      // 已经选中的不可选

      if (
        setting.fields.some((item) => {
          return item.id === component.id;
        })
      ) {
        return null;
      }

      return (
        <Option key={`${index}`} value={component.id}>
          {component.label ? component.label : component.id}
        </Option>
      );
    });
  };

  render() {
    const { setting } = this.props;
    const { isEdit, validateMessage } = setting;

    const actionClass = classNames(Styles['add-item-action'], {
      [`${Styles['no-margin-top']}`]: setting.fields.length === 0 && !isEdit
    });

    const addItemClass = classNames(Styles['add-item'], {
      [`${Styles['no-border-top']}`]: setting.fields.length > 0
    });

    return (
      <div>
        <SortableList
          list={setting.fields}
          onSortChange={this.handleSortChange}
        ></SortableList>
        {/* 编辑区域 */}
        {isEdit && (
          <div className={addItemClass}>
            <Select
              className={Styles['add-item-content']}
              onChange={this.handleFieldChange}
            >
              {this.renderFields()}
            </Select>
            <Button
              type='primary'
              className={Styles['list-item-ok']}
              onClick={this.handleFieldSave}
            >
              确定
            </Button>
            <Button onClick={this.handleFieldCancel}>取消</Button>
          </div>
        )}
        {/* 添加区域 */}
        {validateMessage ? (
          <div className={Styles['validate-msg']}>{validateMessage}</div>
        ) : null}
        {setting.fields.length < MAX_COUNT ? (
          <Button
            className={actionClass}
            type='normal'
            onClick={this.handleAdd}
          >
            + 添加表单字段
          </Button>
        ) : null}
      </div>
    );
  }
}
