<template>
  <div id="PublishPageComponent" class="component">
    <!-- 面包屑：展示任务管理 -->
    <el-breadcrumb class="breadcrumb" :separator-icon="ArrowRight">
      <el-breadcrumb-item>
        <div class="breadcrumbItem">发布管理</div>
      </el-breadcrumb-item>
      <el-breadcrumb-item @click="backPublishPage">
        <div
          @click="changeBreadcrumb(1)"
          :class="{ 'active-breadcrumb-item': $store.state.activeBreadcrumbIndex === 1 }"
          class="breadcrumbItem"
        >
          发布版本管理
        </div>
      </el-breadcrumb-item>
      <el-breadcrumb-item v-if="breadcrumbPublishShow">
        <div
          @click="changeBreadcrumb(2)"
          :class="{ 'active-breadcrumb-item': $store.state.activeBreadcrumbIndex === 2 }"
          class="breadcrumbItem"
        >
          任务详情
        </div>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 搜索工具栏组件 -->
    <PublishPageTool
      :publishForm="publishForm"
      :publishShow="publishShow"
      :releaseTemplateOptions="releaseTemplateOptions"
      :releaseStatusOptions="releaseStatusOptions"
      v-if="!breadcrumbPublishShow"
      @createButton="createButton"
      @onSearch="onSearch"
      @reSet="reSet"
      @cancelBtn="cancelBtn"
    ></PublishPageTool>

    <!-- 主表格信息组件 -->
    <PublishTable
      v-if="!breadcrumbPublishShow"
      :tableData="tableData"
      :total="total"
      :loading="loading"
      :releaseTemplateOptions="releaseTemplateOptions"
      :releaseStatusOptions="releaseStatusOptions"
      @handleSizeChange="handleSizeChange"
      @handleCurrentChange="handleCurrentChange"
      @handleDetail="handleDetail"
      @handleSelectionChange="handleSelectionChange"
    ></PublishTable>

    <!-- 详情表单组件" -->
    <PublishDetail v-if="breadcrumbPublishShow"  :rowDetail="rowDetail"></PublishDetail>

    <el-dialog
      title="创建版本"
      v-model="createVisible"
      show-close
      :style="{ width: maxWidth + 'px' }"
      @close="closeCreate"
    >
      <div class="flex-container">
        <el-form
          :label-width="labelWidth + 'px'"
          :rules="createPageRules"
          label-position="right"
          class="left"
          ref="createFromContent"
        >
          <el-form-item label="版本名称" prop="descName">
            <el-input style="width: 200px" v-model.trim="createFromContent.descName"></el-input>
          </el-form-item>
          <el-form-item label="版本类型" prop="createReleaseTemplate">
            <el-select
              style="width: 200px"
              placeholder="任务类型"
              clearable
              v-model.trim="createFromContent.createReleaseTemplate"
              @change="changeCreateForm(createFromContent.createReleaseTemplate)"
            >
              <el-option
                v-for="item in publishTypeCreateOptions"
                :key="item.code"
                :label="item.name"
                :value="item.code"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="是否通知编译" prop="isCompile" v-if="this.createFormType !== 'cs_release'">
            <el-select style="width: 200px" v-model.trim="createFromContent.isCompile">
              <el-option value="是">是</el-option>
              <el-option value="否">否</el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="跳过环节" prop="skipStages" v-if="this.createFormType && this.createFormType !== 'cs_cross_merge_release'">
            <el-select multiple style="width: 200px" clearable v-model="createFromContent.skipStages">
              <el-option v-for="item in typeOptions" :key="item.code" :label="item.name" :value="item.code">
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="产品库" prop="productIdentity" v-if="this.createFormType == 'cs_p2p_release' || this.createFormType === 'cs_release'">
            <el-input v-model="createFromContent.productIdentity"></el-input>
          </el-form-item>

          <el-form-item label="分支" prop="branchName" v-if="this.createFormType == 'cs_p2p_release'">
            <el-input v-model="createFromContent.branchName"></el-input>
          </el-form-item>

          <el-form-item label="关联底图NDS版本" prop="referenceNdsVersion" v-if="this.createFormType == 'cs_p2p_release'">
            <el-input v-model="createFromContent.referenceNdsVersion"></el-input>
          </el-form-item>
        </el-form>

        <div class="right" v-if="this.createFormType !== 'cs_release' && this.createFormType !== 'cs_cross_merge_release' && this.createFormType !== 'cs_p2p_release' && this.createFormType">
          <div class="titleitem">
            <span>前继版本</span>
          </div>
          <el-table :data="versionData">
            <el-table-column type="index" :index="indexMethod" width="80" />
            <el-table-column prop="parentReleaseVersion" label="前继版本号" width="150">
              <template #default="scope">
                <el-input v-model="scope.row.parentReleaseVersion" :disabled="suggestDisable"></el-input>
              </template>
            </el-table-column>
            <el-table-column prop="inheritanceTemplate" label="前继类型" width="150">
              <template #default="scope">
                <el-input v-model="scope.row.inheritanceTemplate" :disabled="suggestDisable"></el-input>
              </template>
            </el-table-column>
            <el-table-column label="数据获取阶段" width="150" prop="inheritanceStage">
              <template #default="scope">
                <el-input disabled v-model="scope.row.inheritanceStage"></el-input>
              </template>
            </el-table-column>
            <el-table-column label="数据获取值" width="150" prop="inheritanceParam">
              <template #default="scope">
                <el-input disabled v-model="scope.row.inheritanceParam"></el-input>
              </template>
            </el-table-column>
          </el-table>
          <div style="margin: 5px">
            <el-button type="primary" @click="handleAddVersionDataLine"
              ><el-icon><Plus /></el-icon>
            </el-button>
            <el-button type="danger" @click="handleRemoveVersionDataLine"
              ><el-icon><Minus /></el-icon
            ></el-button>
            <el-button type="success" @click="baseVesionDialogVisible = true">推荐版本</el-button>
          </div>
        </div>

        <!-- 融合发版的创建板块 -->
        <div class="right" v-if="this.createFormType === 'cs_cross_merge_release' && this.createFormType">
          <el-form v-model="createCrossForm" label-width="100px" ref="createFromContent">
            <!-- <div class="createCrossFormTitle">
              <el-form-item label="任务名称：" required>
                <el-input v-model.trim="createFromContent.descName" placeholder="请输入任务名称" clearable></el-input>
              </el-form-item>
              <el-form-item label="任务备注：">
                <el-input placeholder="请输入任务备注" clearable disabled></el-input>
              </el-form-item>
            </div>

            <div class="createCrossFormTwoItems">
              <el-form-item label="任务类型：" class="createCrossFormSelf">
                <el-input placeholder="请输入任务类型" clearable disabled></el-input>
              </el-form-item>
              <el-form-item label="优先级：" class="createCrossFormSelf">
                <el-input placeholder="请输入优先级" clearable disabled></el-input>
              </el-form-item>
            </div> -->
            <div class="createCrossFormTwoItems">
              <el-form-item label="产品库名称：" class="createCrossFormSelf">
                <el-input v-model.trim="createFromContent.productIdentityName" placeholder="请输入产品库名称" clearable></el-input>
              </el-form-item>
              <el-form-item label="产品库分支：" class="createCrossFormSelf">
                <el-input v-model.trim="createFromContent.branch" placeholder="请输入产品库分支" clearable></el-input>
              </el-form-item>
            </div>
            <div class="createCrossFormTwoItems">
              <!-- <el-form-item label="变化源批次：" class="createCrossFormSelf">
                <el-input placeholder="请输入变化源批次" clearable disabled></el-input>
              </el-form-item> -->
              <el-form-item label="融合版本：" class="createCrossFormSelf">
                <el-select v-model="createFromContent.mergeTaskType" placeholder="请选择融合版本" filterable>
                  <el-option v-for="item in mergeTaskTypeOptions" :key="item.value" :label="item.name" :value="item.value"></el-option>
                </el-select>
              </el-form-item>
            <!-- </div>
            <div class="createCrossFormTwoItems">
              <el-form-item label="数据规格：" class="createCrossFormSelf">
                <el-input placeholder="请输入数据规格" clearable disabled></el-input>
              </el-form-item> -->
              <el-form-item label="调度方式：" class="createCrossFormSelf">
                <el-select v-model="createFromContent.scheduleType" placeholder="请选择调度方式" filterable>
                  <el-option v-for="item in scheduleTypeOptions" :key="item.value" :label="item.name" :value="item.value"></el-option>
                </el-select>
              </el-form-item>
            </div>
            <!-- <div class="createCrossFormTwoItems">
              <el-form-item label="推理版本：" class="createCrossFormSelf">
                <el-input placeholder="请输入推理版本" clearable disabled></el-input>
              </el-form-item>
              <el-form-item label="结果是否同步至PG：" class="createCrossFormSelf">
                <el-input placeholder="请输入结果是否同步至PG" clearable disabled></el-input>
              </el-form-item>
            </div>
            <div class="createCrossFormTwoItems">
              <el-form-item label="变化源ID文件COS路径：" class="createCrossFormSelf">
                <el-input placeholder="请输入变化源ID文件COS路径" clearable disabled></el-input>
              </el-form-item>
              <el-form-item label="图幅号：" class="createCrossFormSelf">
                <el-input placeholder="请输入图幅号" clearable disabled></el-input>
              </el-form-item>
            </div>
            <div class="createCrossFormTwoItems">
              <el-form-item label="路口生产平台任务ID：" class="createCrossFormSelf">
                <el-input placeholder="请输入路口生产平台任务ID" clearable disabled></el-input>
              </el-form-item>
              <el-form-item label="路口遴选结果COS路径：" class="createCrossFormSelf">
                <el-input placeholder="请输入路口遴选结果COS路径" clearable disabled></el-input>
              </el-form-item>
            </div> -->
            <div class="createCrossFormTwoItems">
              <el-form-item label="差分基础产品库：" class="createCrossFormSelf">
                <el-input v-model.trim="createFromContent.baseProductName" placeholder="请输入差分基础产品库" clearable></el-input>
              </el-form-item>
              <el-form-item label="差分基础分支：" class="createCrossFormSelf">
                <el-input v-model.trim="createFromContent.baseProductBranch" placeholder="请输入差分基础分支" clearable></el-input>
              </el-form-item>
            </div>
            <div class="createCrossFormTwoItems">
              <el-form-item label="变化源分片COS路径：" class="createCrossFormSelf">
                <el-input v-model.trim="createFromContent.diffIdCosFilePath" placeholder="请输入变化源分片COS路径" clearable></el-input>
              </el-form-item>
              <!-- <el-form-item label="是否执行冗余删除：" class="createCrossFormSelf">
                <el-input placeholder="请输入是否执行冗余删除" clearable disabled></el-input>
              </el-form-item>
            </div>
            <div class="createCrossFormTwoItems"> -->
              <el-form-item label="路口城市：" class="createCrossFormSelf">
                <el-select v-model="createFromContent.adcode" placeholder="请选择路口城市" clearable multiple filterable>
                  <el-option v-for="item in cityOptions" :key="item.provinceCode + item.code" :label="item.name" :value="item.provinceCode + item.code"></el-option>
                </el-select>
              </el-form-item>
              <!-- <el-form-item label="项目ID：" class="createCrossFormSelf">
                <el-input placeholder="请输入项目ID" clearable disabled></el-input>
              </el-form-item> -->
            </div>
          </el-form>
        </div>
      </div>

      <template #footer>
        <el-button @click="closeCreate" center>取 消</el-button>
        <el-button type="primary" @click="createVersion(ruleForm)">创建</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="baseVesionDialogVisible" width="30%">
      <el-form :label-width="150" label-position="right" class="left" ref="baseVesionForm">
        <el-form-item
          label="大版发布版本"
          prop="baseLineVersion"
          :rules="[{ required: true, message: '必填项', trigger: 'blur' }]"
        >
          <el-input style="width: 200px" v-model.trim="baseVesionForm.baseLineVersion"></el-input>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="baseVesionDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="suggestVersin()"> 确定 </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
// 引入需要的组件
import PublishPageTool from './PublishPageTool.vue';
import PublishTable from './PublishTable.vue';
import PublishDetail from './PublishDetail.vue';
import ProjectPageDetail from '../projectPage/ProjectPageDetail.vue';
import store from '../../store/index.js';
import { mapActions, mapGetters } from 'vuex';

import axios from 'axios';
import { ElMessage } from 'element-plus';
import { ArrowRight } from '@element-plus/icons-vue';
import { createForm, publishForm, version, releaseStatusOptions, releaseTemplateOptions } from '../../js/publish_data';
import { Cities } from '@/case/case-data';

const nioReleaseURL = window.api.nioReleaseURL;
const nioProjectService = window.api.nioProjectService;
if (nioReleaseURL === null || nioReleaseURL === undefined) {
  console.log('获取nioReleaseURL失败' + nioReleaseURL);
}
if (nioProjectService === null || nioProjectService === undefined) {
  console.log('获取nioProjectService失败' + nioProjectService);
}

export default {
  name: 'PublishPageComponent',
  // 组件注册
  components: {
    PublishPageTool,
    PublishTable,
    PublishDetail,
    ProjectPageDetail,
  },
  data() {
    return {
      versionData: version,

      //面包屑
      breadcrumbPublishShow: false,
      //点击项目编号转跳项目历史
      projectDetailShow: false,
      publishForm: {
        ...publishForm,
      },
      // 表格数据
      tableData: [],
      publishShow: [],
      createFromContent: { ...createForm },
      createVisible: false,
      publishTypeCreateOptions: [
        {
          name: '大版发布',
          code: 'cs_release',
        },
        {
          name: '快修快发',
          code: 'hotfix_release',
        },
        {
          name: '点到点发布',
          code: 'cs_p2p_release',
        },
        {
          name: '裸版发布',
          code: 'cs_release_road_test',
        },
        {
          name: '融合发版',
          code: 'cs_cross_merge_release',
        },
        // {
        //   name:'补融快修发布',
        //   code:'5'
        // }
      ],
      typeOptions: [
        // { name: '抠图', code: 'split_pb' },
        { name: 'NOP+白名单放行', code: 'nopPlusVerify' },
      ],
      createPageRules: {
        descName: [{ required: true, message: '版本名称必填', trigger: 'blur' }],
        createReleaseTemplate: [{ required: true, message: '版本类型必填', trigger: 'blur' }],
        isCompile: [{ required: true, message: '是否通知编译必填', trigger: 'blur' }],
        branchName: [{ required: true, message: '分支必填', trigger: 'blur' }],
        productIdentity: [{ required: true, message: '产品库必填', trigger: 'blur' }],
      },
      createFormType: '',
      //创建版本时的根据不同的type 展示不同的宽度
      maxWidth: 500,
      labelWidth: 150,

      loading: false,
      total: 0,
      currentPage: 0,
      pageSize: 20,
      selection: [],
      hierarchyData: {},
      baseVesionDialogVisible: false,
      baseVesionForm: {
        baseLineVersion: '',
      },
      suggestDisable: false,
      suggestListData: [],
      releaseTemplateOptions: releaseTemplateOptions,
      releaseStatusOptions: releaseStatusOptions,
      cityOptions: Cities,
      mergeTaskTypeOptions: [
        {name:"测试",value:"cs_hd_merge_test"},
        {name:"对比测试",value:"cs_hd_merge_test_evaluation"},
        {name:"对比测试-2",value:"cs_hd_merge_test_evaluation_2"},
        {name:"对比测试-3",value:"cs_hd_merge_test_evaluation_3"},
        {name:"对比测试-4",value:"cs_hd_merge_test_evaluation_4"},
        {name:"对比测试-5",value:"cs_hd_merge_test_evaluation_5"},
        {name:"对比测试-6",value:"cs_hd_merge_test_evaluation_6"},
        {name:"对比测试-7",value:"cs_hd_merge_test_evaluation_7"},
        {name:"增量更新",value:"cs_hd_urban_merge_hotfix"}
      ],
      scheduleTypeOptions: [
        {name:"非聚合",value:"importDiffSourceDrafterTask"},
        {name:"非聚合(SD)",value:"importDiffSourceDrafterWithSDTask"},
        {name:"按作用域聚合",value:"importDiffSourceDrafterTaskGroupByMesh"},
        {name:"按作用域聚合(SD)",value:"importDiffSourceDrafterWithSDGroupByMesh"}
      ]
    };
  },
  setup() {
    const changeBreadcrumb = (index) => {
      store.commit('breadChange', index);
    };
    const indexMethod = (index) => {
      return '第' + (index + 1) + '组';
    };

    return {
      ArrowRight,
      changeBreadcrumb,
      indexMethod,
    };
  },
  methods: {
    suggestVersin() {
      axios({
        url: nioReleaseURL + '/suggest-parent/query',
        method: 'post',
        data: {
          baseLine: this.baseVesionForm.baseLineVersion,
          releaseTemplate: this.createFromContent.createReleaseTemplate,
        },
      })
        .then((response) => {
          if (response.data.code === 200) {
            let suggestList = response.data.data.suggestList;
            this.suggestListData = response.data.data.suggestList;
            suggestList.forEach((suggest, index) => {
              let data = suggest;
              let stage = [];
              let params = [];
              data.inheritanceDetailList.forEach((item) => {
                stage.push(item.inheritanceStage);
                params.push(item.inheritanceParamName + ':' + item.inheritanceParam);
              });

              this.versionData[index].inheritanceStage = stage.join(',');
              this.versionData[index].inheritanceParam = params.join(',');
              this.versionData[index].parentReleaseVersion = suggest.parentReleaseVersion;
              this.versionData[index].inheritanceTemplate = suggest.inheritanceTemplate;
            });
            this.suggestDisable = true;
            this.baseVesionDialogVisible = false;
            this.baseVesionForm.baseLineVersion = '';
          } else {
            ElMessage.error({
              message: response.data.msg,
              showClose: false,
              grouping: true,
            });
          }
        })
        .catch((e) => {
          console.log(e);
          ElMessage.error({
            message: '没有获取到数据',
            showClose: false,
            grouping: true,
          });
        });
    },

    // 添加前校验
    preAdd() {
      if (this.createFromContent.descName === '' || this.createFromContent.createReleaseTemplate === '') {
        ElMessage.warning({
          message: '请填写表单',
          showClose: true,
        });
      }

      if (
          (this.createFormType === 'cs_p2p_release') &&
      (  this.createFromContent.productIdentity === '' ||
        this.createFromContent.branchName === '')
      ) {
        ElMessage.warning({
          message: '产品库、分支必填',
          showClose: true,
        });
      }

      if (this.createFormType === 'cs_p2p_release' && this.createFromContent.referenceNdsVersion === '') {
        ElMessage.warning({
          message: '关联底图版本为必填项',
          showClose: true,
        });
      }
      else {
        return true;
      }
    },
    //创建版本
    createVersion() {
      if(this.createFromContent.createReleaseTemplate !== 'cs_cross_merge_release') {
        let parentReleaseListData = [];
        if (this.suggestDisable === true) {
          parentReleaseListData = this.suggestListData;
        } else {
          parentReleaseListData = this.versionData;
        }

        if (this.preAdd() == true) {
          axios({
            url: nioReleaseURL + '/inheritance-release/create',
            method: 'post',
            data: {
              releaseTemplate: this.createFromContent.createReleaseTemplate,
              releaseParams: {
                // parentReleaseVersion: this.createFromContent.preReleaseVersion,
                descName: this.createFromContent.descName,
                skipStages: this.createFromContent.skipStages.join(','),
                productIdentity: this.createFromContent.productIdentity,
                branchName: this.createFromContent.branchName,
                // baseReleaseVersion: this.createFromContent.baseReleaseVersion,
                // baseNdsReleaseVersion: this.createFromContent.baseNdsReleaseVersion,
                isCompile: this.createFromContent.isCompile == '是' ? true : false,
                owner: localStorage.getItem('realName'),
                referenceNdsVersion: this.createFromContent.referenceNdsVersion
              },
              parentReleaseList: parentReleaseListData,
            },
          })
            .then((response) => {
              if (response.data.code === 200) {
                ElMessage.success({
                  message: '创建成功',
                  showClose: false,
                  grouping: true,
                });
                this.closeCreate();
                this.loadingPage();
              } else {
                ElMessage.error({
                  message: response.data.msg,
                  showClose: false,
                  grouping: true,
                });
              }
            })
            .catch(() => {
              ElMessage.error({
                message: '创建失败',
                showClose: false,
                grouping: true,
              });
            });
        }
      } else { //融合发版创建
        axios({
          url: nioReleaseURL + '/inheritance-release/create',
          method: 'post',
          data: {
            releaseTemplate: this.createFromContent.createReleaseTemplate,
            releaseParams: {
              // parentReleaseVersion: this.createFromContent.preReleaseVersion,
              adcode: this.createFromContent.adcode.join(','),
              scheduleType: this.createFromContent.scheduleType,
              mergeTaskType: this.createFromContent.mergeTaskType,
              diffIdCosFilePath: this.createFromContent.diffIdCosFilePath,
              descName: this.createFromContent.descName,
              productIdentity: this.createFromContent.productIdentityName,
              branch: this.createFromContent.branch,
              baseProductName: this.createFromContent.baseProductName,
              baseProductBranch: this.createFromContent.baseProductBranch,
              isCompile: this.createFromContent.isCompile == '是' ? true : false,
              owner: localStorage.getItem('realName')
            },
            parentReleaseList: [],
          },
        })
          .then((response) => {
            if (response.data.code === 200) {
              ElMessage.success({
                message: '创建成功',
                showClose: false,
                grouping: true,
              });
              this.closeCreate();
              this.loadingPage();
            } else {
              ElMessage.error({
                message: response.data.msg,
                showClose: false,
                grouping: true,
              });
            }
          })
          .catch(() => {
            ElMessage.error({
              message: '创建失败',
              showClose: false,
              grouping: true,
            });
          });
      }
    },

    //增加版本行
    handleAddVersionDataLine() {
      if (this.versionData == undefined) {
        this.versionData = new Array();
      }
      let obj = {};

      this.versionData.push(obj);
    },
    //  删除版本行
    handleRemoveVersionDataLine() {
      this.versionData.pop();
    },

    //选中的方法
    handleSelectionChange(val) {
      this.selection = val;
    },
    //取消
    cancelBtn() {
      if (this.selection.length > 1 || this.selection.length == 0) {
        ElMessage.warning({
          message: '请选择一条数据',
          showClose: false,
          grouping: true,
        });
      } else {
        axios({
          url: nioReleaseURL + '/release-version/cancel',
          method: 'post',
          data: {
            releaseVersion: this.selection[0].releaseVersion,
          },
        })
          .then((response) => {
            if (response.data.code === 200) {
              ElMessage.success({
                message: '取消成功',
                showClose: false,
                grouping: true,
              });
              this.loadingPage();
            }
          })
          .catch(() => {
            ElMessage.success({
              message: '取消失败',
              showClose: false,
              grouping: true,
            });
          });
      }
    },
    //重置按钮
    reSet() {
      this.publishForm = { ...publishForm };
      this.loadingPage();
    },

    //查询按钮
    onSearch() {
      this.currentPage = 0;
      this.loadingPage();
    },

    // 表格size改变时触发函数
    handleSizeChange(page_size) {
      this.pageSize = page_size;
      this.loadingPage();
    },

    // 表格当前页码改变时触发函数
    handleCurrentChange(page) {
      this.currentPage = (page - 1) * this.pageSize;
      this.loadingPage();
    },

    //获取数据
    loadingPage() {
      let newPublishForm = {};
      for (const key in this.publishForm) {
        if (
          this.publishForm.hasOwnProperty(key) &&
          this.publishForm[key] !== null &&
          this.publishForm[key] !== undefined &&
          this.publishForm[key] !== ''
        ) {
          newPublishForm[key] = this.publishForm[key];
        }
      }
      this.loading = true;
      axios({
        url: nioReleaseURL + '/release-version/query',
        method: 'post',
        data: {
          ...newPublishForm,
          offset: this.currentPage,
          limit: this.pageSize,
        },
      })
        .then((response) => {
          if (response.data.code === 200) {
            this.total = response.data.data.totalCount;
            if (this.total === 0) {
              ElMessage.warning({
                message: '没有符合查询条件的数据',
                showClose: false,
                grouping: true,
              });
            }
            this.tableData = response.data.data.releaseList;
            // for(let j = 0; j <= this.tableData.length; j++){
            //   if(this.tableData[j].releaseTemplate === 'cs_release'){
            //     this.tableData[j].releaseTemplate === '大版发布'
            //   }
            // }

            for (let i in this.tableData) {
              if (this.tableData.hasOwnProperty(i)) {
                // 整理表格数据中的序号
                this.tableData[i].number = parseInt(i) + 1;
                if (this.tableData[i].createTs) {
                  this.tableData[i].createTs = this.getDate(this.tableData[i].createTs);
                }
                if (this.tableData[i].completeTs) {
                  this.tableData[i].completeTs = this.getDate(this.tableData[i].completeTs);
                }
              }
            }
            let idList = [];
            this.tableData.forEach((item) => {
              idList.push(item.projectId);
              if(item.releaseTemplate === 'hotfix_release'){item.releaseTemplate = '快修快发'}
              else if(item.releaseTemplate === 'cs_release'){item.releaseTemplate = '大版发布'}
              else if(item.releaseTemplate === 'cs_release_road_test'){item.releaseTemplate = '路测发布'}
              else if(item.releaseTemplate === 'cs_release_legacy'){item.releaseTemplate = '大版发布（老平台）'}
              else if(item.releaseTemplate === 'cs_psp_release'){item.releaseTemplate = '换电站发布（老平台）'}
              else if(item.releaseTemplate === 'cs_pn_release'){item.releaseTemplate = '停车场发布（老平台）'}
              else if(item.releaseTemplate === 'cs_pn_merge_release'){item.releaseTemplate = '停车场发布'}
              else if(item.releaseTemplate === 'cs_psp_merge_release'){item.releaseTemplate = '换电站发布'}
              else if(item.releaseTemplate === 'cs_cross_merge_release'){item.releaseTemplate = '融合发版'}
              else if(item.releaseTemplate === 'cs_p2p_release'){item.releaseTemplate = '点到点发布'}

              if(item.releaseStatus === 'SUCCESS'){item.releaseStatus = '成功'}
              else if(item.releaseStatus === 'IN_PROGRESS'){item.releaseStatus = '进行中'}
              else if(item.releaseStatus === 'CHECK_FAILED'){item.releaseStatus = '检查不通过'}
              else if(item.releaseStatus === 'COMPILE_FAILED'){item.releaseStatus = '编译失败'}
              else if(item.releaseStatus === 'FAILED'){item.releaseStatus = '执行失败'}
              else if(item.releaseStatus === 'CANCELLED'){item.releaseStatus = '取消'}

              if(item.productCompileStatus === 'SUCCESS'){item.productCompileStatus = '成功'}
              else if(item.productCompileStatus === 'NOT_COMPILED'){item.productCompileStatus = '未完成'}
              else if(item.productCompileStatus === 'FAILED'){item.productCompileStatus = '失败'}
            });
            this.loadingIdStage(idList);
          } else {
            ElMessage.error({
              message: response.data.msg,
              showClose: false,
              grouping: true,
            });
          }
        })
        .catch(() => {
          ElMessage.error({
            message: '没有获取到数据',
            showClose: false,
            grouping: true,
          });
        })
        .finally(() => {
          this.loading = false;
        });
    },

    //获取项目阶段
    loadingIdStage(idList) {
      this.loading = true;
      axios({
        url: nioProjectService + '/project/query',
        method: 'post',
        data: {
          idList: idList,
          pageNo: 1,
          pageSize: 10000,
        },
      })
        .then((response) => {
          if (response.data.code === 200) {
            let currentStateData = response.data.data.result;

            currentStateData.forEach((item, index) => {
            
              let stateResult = this.tableData.find((table) => table.projectId == item.id); 
              if(stateResult){
                stateResult['current'] = item.current;
              }
            });

            // console.log(this.tableData)
          } else {
            ElMessage.error({
              message: response.data.msg,
              showClose: false,
              grouping: true,
            });
          }
        })
        .catch(() => {
          ElMessage.error({
            message: '没有获取到项目阶段',
            showClose: false,
            grouping: true,
          });
        })
        .finally(() => {
          this.loading = false;
        });
    },

    //转换时间方法 时间戳 转 YYYY-MM-DD
    getDate(time) {
      if (!time) return '';
      const date = new Date(time);
      const Y = date.getFullYear();
      const M = `${date.getMonth() + 1}`.padStart(2, '0');
      const D = `${date.getDate()}`.padStart(2, '0');
      const h = `${date.getHours()}`.padStart(2, '0');
      const m = `${date.getMinutes()}`.padStart(2, '0');
      const s = `${date.getSeconds()}`.padStart(2, '0');
      return `${Y}-${M}-${D} ${h}:${m}:${s}`;
    },

    //创建版本
    createButton() {
      this.createVisible = true;
    },
    // 关闭创建任务dialog
    closeCreate() {
      // 重置
      this.createVisible = false;
      this.createFromContent = { ...createForm };
      this.versionData = [];
      this.createFormType = '';
      this.maxWidth = 500;
      this.suggestDisable = false;
    },

    //不同版本类型
    changeCreateForm(type) {
      console.log(this.createFormType);
      this.createFormType = type;
      if (this.createFormType === 'cs_release'||this.createFormType === 'cs_p2p_release') {
        this.maxWidth = 500;
      } else if (this.createFormType === 'hotfix_release' || this.createFormType === 'cs_release_road_test' ) {
        this.maxWidth = 1200;
        if (this.versionData.length == 0) {
          this.handleAddVersionDataLine();
        }
      } else if (this.createFormType === 'cs_cross_merge_release') {
        this.maxWidth = 1200;
      } else {
        this.maxWidth = 500;
      }
    },

    //返回任务管理
    backPublishPage() {
      this.breadcrumbPublishShow = false;
      // this.formProperty = [];
      this.$router.push({ name: 'PublishPage' });
    },

    ...mapActions(['setRowDetail']),
    // 详情按钮
    handleDetail(row) {
      this.setRowDetail(row);
      this.rowDetail = row;
      console.log('row.baseLineVersion:', row.baseLineVersion);
      let baseLineVersion = row.releaseVersion;
      this.breadcrumbPublishShow = true;
      this.$router.push({ name: 'PublishDetail', query: { baseLineVersion } });

      // this.openDetail(baseLineVersion);
    },

    // handleCopy(row) {
    //   console.log(row)
      
    //   this.createFromContent.createReleaseTemplate = 'cs_cross_merge_release'
    //   this.createFormType = 'cs_cross_merge_release'
    //   this.changeCreateForm('cs_cross_merge_release')

    //   this.createFromContent.descName = row.releaseVersion

    //   this.createVisible = true;
    // }
   
  },
  computed: {
    ...mapGetters(['getRowDetailByVersion'])
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      if (to.query.baseLineVersion) {
        vm.breadcrumbPublishShow = true;
        const version = to.query.baseLineVersion;
        vm.rowDetail = vm.getRowDetailByVersion(version);
      }
    });
  },
  beforeRouteUpdate(to, from, next) {
    if (to.query.baseLineVersion) {
      this.breadcrumbPublishShow = true;
      const version = to.query.baseLineVersion;
      this.rowDetail = this.getRowDetailByVersion(version);
    } else {
      this.breadcrumbPublishShow = false;
    }
    next();
  },
  mounted() {
    this.loadingPage();
  },
};
</script>
<style>
.flex-container {
  display: flex;
  width: 100px;
}
.left {
  flex-basis: 100px;
}

.right {
  flex: 1;
  margin: 0 30px;
}
.titleitem {
  font-size: 18px;
}
.createCrossFormTitle {
  width: 700px;
  margin: 20px 0;
}
.createCrossFormTwoItems{
  display: flex;
  justify-content: space-between;
  gap: 10px;
  width: 700px;
  margin-bottom: 10px
}
.createCrossFormSelf{
  flex: 1;
}
</style>
