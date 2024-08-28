import { inject } from 'mobx-react';
import React, { Component } from 'react';
import JimuEditor from '@jimu/form-editor';
import { IBaseInfo, IDevelopInfo } from '@service/store/approvalTripartite';
import './index.less';

interface IProps {
  curStep: number;
  initApprovalData: Function;
  developInfo: IBaseInfo;
  baseInfo: IDevelopInfo;
  form: string;
  formRef: React.RefObject<any>;
  setRef: Function;
  isActive: boolean;
  setGetFormFn: Function;
}

interface IState {}

const includeComponents = [
  'Input',
  'TextArea',
  'Number',
  'Money',
  // 'Select',
  // 'SelectDD',
  'Captions',
  'Card',
  'Date',
  'DateRange',
  'Image',
  'File',
  // 'People',
  // 'MultiplePeople',
  // 'Department',
  'JimuRoot',
  // 'ColumnsGrid',
  // 'Column',
  // 'View',
  'Table'
];

@inject(({ approvalTripartite }) => {
  return {
    setGetFormFn: approvalTripartite.setGetFormFn,
    form: approvalTripartite.form,
    setRef: approvalTripartite.setRef
  };
})
export default class FormApp extends Component<IProps, IState> {
  formRef: React.RefObject<any>;

  constructor(props) {
    super(props);

    this.formRef = React.createRef();
  }

  componentDidMount() {
    this.props.setRef(this.formRef);
  }

  render() {
    const { form, isActive, setGetFormFn } = this.props;
    return (
      <div
        className={`tripartite-form-info ${isActive ? 'active' : ''}`}
        style={{
          height: '100%'
        }}
      >
        <JimuEditor
          defaultSchemaValue={form || ''}
          getSchema={(getSchemaFn) => {
            setGetFormFn(getSchemaFn);
          }}
          ref={this.formRef}
          pluginsConfig={{
            rightTab: [], // 右侧工具栏tab配置
            leftToolIsEmbed: true, // 左侧工具栏是否内嵌到页面里面
            leftDefaultTool: 'dragMenu', // 默认选择左侧的工具栏名称
            showLeftToolNav: false // 左侧导航栏是否隐藏
          }}
          overrideBuiltInSetting={[
            {
              field: 'placeholder',
              hidden: true
            },
            {
              field: 'validation',
              hidden: true
            },
            {
              field: 'visibility',
              hidden: true
            }
          ]}
          disableBuiltInPlugin={[
            'main-tool-tree',
            'var-panel',
            'drag-menu-bt-var',
            // 'crumbs',
            'DragMenuBtFn',
            'preview',
            'save',
            'import-page-plugin',
            'mainToolAdvancedConfig'
          ]}
          includeComponents={includeComponents}
          // disableBuiltInComponents={[
          //   'Select',
          //   'SelectDD',
          //   'People',
          //   'Department',
          //   'ColumnsGrid',
          //   'Column'
          // ]}
        ></JimuEditor>
      </div>
    );
  }
}
