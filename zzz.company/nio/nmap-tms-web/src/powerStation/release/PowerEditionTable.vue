<template>
  <div id="PowerEditionTable" class="component" style="flex: 1;overflow: hidden;">
    <div id="detailStyle" class="tool">
      <div style="padding: 6px 0 10px 0;">
        <el-button type="primary" class="button_style" @click="pssRelease">创建版本</el-button>
        <el-button type="primary" class="button_style" @click="pssCopyRelease">复制版本</el-button>
      </div>
    </div>
    <!-- 主表格 -->
    <div id="PowerEditionTableContainer" class="table">
      <!-- 表格 -->
      <div class="table-container" v-loading="loading" element-loading-text="拼命加载中..."
        :element-loading-spinner="svg" element-loading-svg-view-box="-10, -10, 50, 50">
        <el-table ref="itemTable" :data="tableData.list" border :max-height="tableHeight"
          @selection-change="handleSelectionChange">
          <el-table-column type="selection" align="center">
          </el-table-column>
          <el-table-column fixed prop="releaseVersion" label="发布版本号" min-width="300" align="center" show-overflow-tooltip>
            <template #default="scope">
              <el-button @click="handleDetail(scope.row)" link type="primary">
                {{ scope.row.releaseVersion }}
              </el-button>
            </template>
          </el-table-column>
          <el-table-column 
            v-for="item in tableRuleColumn" 
            :key="item.prop" 
            :prop="item.prop" 
            :label="item.label"
            :min-width="item.width" 
            align="center">
            <template v-if="item.prop === 'descNameList'" #default="scope">
              <el-button v-if="scope.row.descNameList.length > 0" @click="handleDescName(scope.row)" link type="primary">
                查看
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- 分页组件 -->
      <div style="padding-top: 10px" class="pagination-container">
        <el-pagination background :total="tableData.total" :page-size="tableData.pageSize"
          :current-page.sync="tableData.currentPage" :page-sizes="[5, 10, 20, 50]" @current-change="handleCurrentChange"
          @size-change="handleSizeChange" layout="total, sizes, prev, pager, next, jumper"></el-pagination>
      </div>
    </div>
    <!-- 创建任务对话框 -->
    <el-dialog title="换电站发版" v-model="selectPssDialogVisible" show-close @close="closeSelectPss" width="1300px">
      <el-form ref="pssReleaseForm" :inline="true" :model="pssReleaseForm" :rules="pssReleaseRules" label-position="right"
        label-width="140px">
        <el-form-item label="产品名称：" prop="productIdentity">
          <el-input v-model.trim="pssReleaseForm.productIdentity" placeholder="请输入产品名称"
            style="width: 400px;margin-bottom: 20px"></el-input>
        </el-form-item>
        <el-form-item label="分支名称：" prop="branch">
          <el-input v-model.trim="pssReleaseForm.branch" placeholder="请输入换分支名称"
            style="width: 400px;margin-bottom: 20px"></el-input>
        </el-form-item>

        <el-form-item label="底图依赖：" prop="referenceProduct">
          <el-input v-model.trim="pssReleaseForm.referenceProduct" placeholder="请输入底图依赖"
            style="width: 400px;margin-bottom: 20px"></el-input>
        </el-form-item>
        <el-form-item label="是否是众包规格：" prop="isCs">
          <el-switch active-text="是" inactive-text="否" inline-prompt v-model="pssReleaseForm.isCs" placeholder="是否是众包规格"
            style="margin-bottom: 20px"></el-switch>
        </el-form-item>
        <el-form-item label="是否编译：" prop="isCompile">
          <el-switch active-text="是" inactive-text="否" inline-prompt v-model="pssReleaseForm.isCompile" placeholder="是否编译"
            style="margin-bottom: 20px"></el-switch>
        </el-form-item>
        <el-form-item label="版本说明：" prop="descName">
          <el-input v-model.trim="pssReleaseForm.descName" placeholder="请输入版本说明"
            style="width: 400px;margin-bottom: 20px"></el-input>
        </el-form-item>
        <el-form-item label="作者：" prop="owner">
          <el-input v-model.trim="pssReleaseForm.owner" placeholder="请输入作者名称"
            style="width: 400px;margin-bottom: 20px"></el-input>
        </el-form-item>
        <el-form-item label="点云规格：" prop="compileMeta">
          <el-input v-model.trim="pssReleaseForm.compileMeta" placeholder="请输入点云规格"
            style="width: 400px;margin-bottom: 20px"></el-input>
        </el-form-item>
        <el-form-item label="换电站：" prop="pssIdList">
          <div class="select_pss">
            <el-transfer filterable :filter-method="filterMethod" filter-placeholder="请输入换电站名称"
              :titles="['备选换电站', '已选换电站']" v-model="pssReleaseForm.pssIdList" :data="pssList">
            </el-transfer>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closeSelectPss">取消</el-button>
        <el-button type="primary" @click="releaseFun">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog title="停车场发版" v-model="parkingReleaseDialogVisible" show-close @close="close_parking_lot" width="1300px">
      <el-form ref="pklReleaseForm" :inline="true" :model="pklReleaseForm" :rules="pklReleaseRules" label-position="right"
        label-width="130px">
        <el-form-item label="产品名称：" prop="productIdentity">
          <el-input v-model.trim="pklReleaseForm.productIdentity" placeholder="请输入产品名称" style="width: 400px"></el-input>
        </el-form-item>
        <el-form-item label="分支名称：" prop="branch">
          <el-input v-model.trim="pklReleaseForm.branch" placeholder="请输入换分支名称" style="width: 400px"></el-input>
        </el-form-item>
        <el-form-item label="底图依赖：" prop="referenceProduct">
          <el-input v-model.trim="pklReleaseForm.referenceProduct" placeholder="请输入底图依赖" style="width: 400px"></el-input>
        </el-form-item>
        <el-form-item label="是否编译：" prop="isCompile">
          <el-switch active-text="是" inactive-text="否" inline-prompt v-model="pklReleaseForm.isCompile"
            placeholder="是否编译"></el-switch>
        </el-form-item>
        <el-form-item label="版本说明：" prop="descName">
          <el-input v-model.trim="pklReleaseForm.descName" placeholder="请输入版本说明" style="width: 400px"></el-input>
        </el-form-item>
        <el-form-item label="作者：" prop="owner">
          <el-input v-model.trim="pklReleaseForm.owner" placeholder="请输入作者名称" style="width: 400px"></el-input>
        </el-form-item>
        <el-form-item label="停车场：" prop="pnIdList">
          <div class="select_pss">
            <el-transfer filterable :filter-method="filterMethod" filter-placeholder="请输入停车场名称"
              :titles="['备选停车场', '已选停车场']" v-model="pklReleaseForm.pnIdList" :data="pklList">
            </el-transfer>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="close_parking_lot">取消</el-button>
        <el-button type="primary" @click="release_parking_lot">确定</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script>
// 引入js数据
import { tableRuleColumn } from "../../js/power_release_data.js";
import { Search, Refresh, FolderOpened, FolderAdd, ArrowRight } from "@element-plus/icons-vue";
import { svg } from "@/js/loading_data.js";
import axios from "axios";
import { ElMessage } from "element-plus";

const nioPowerSwapURL = window.api.nioPowerSwapURL;
const nioReleaseURL = window.api.nioReleaseURL;

export default {
  name: "PowerEditionTable",
  // 接收父组件传来的参数
  props: {
    powerEditionDetailForm: Object,
    tableData: Object,
  },
  data() {
    return {
      //表格的最大高度
      tableHeight: 0,
      tableRuleColumn: tableRuleColumn,
      svg: svg,
      loading: false, //调用详情加载中
      selectPssDialogVisible: false,
      pssReleaseForm: {
        productIdentity: '',
        branch: '',
        referenceProduct: '',
        isCs: false,
        isCompile: false,
        descName: '',
        owner: '',
        compileMeta: '',
        pssIdList: []
      },
      pssReleaseRules: {
        productIdentity: [
          { required: true, message: '产品名称必填', trigger: 'change' },
        ],
        branch: [
          { required: true, message: '分支名称必填', trigger: 'change' },
        ],
        referenceProduct: [
          { required: true, message: '底图依赖必填', trigger: 'change' },
        ],
        isCs: [
          { required: true, message: '是否是众包规格必填', trigger: 'change' },
        ],
        isCompile: [
          { required: true, message: '是否编译必填', trigger: 'change' },
        ],
        descName: [
          { required: true, message: '版本说明必填', trigger: 'change' },
        ],
        owner: [
          { required: true, message: '作者名称必填', trigger: 'change' },
        ],
        compileMeta: [
          { required: true, message: '点云规格必填', trigger: 'change' },
        ],
        pssIdList: [
          { type: 'array', required: true, message: '至少选择一个换电站', trigger: 'change' },
        ],
      },
      pssList: [],

      parkingReleaseDialogVisible: false,
      pklReleaseForm: {
        productIdentity: '',
        branch: '',
        referenceProduct: '',
        isCompile: false,
        descName: '',
        owner: '',
        pnIdList: []
      },
      pklReleaseRules: {
        productIdentity: [
          { required: true, message: '产品名称必填', trigger: 'change' },
        ],
        branch: [
          { required: true, message: '分支名称必填', trigger: 'change' },
        ],
        referenceProduct: [
          { required: true, message: '底图依赖必填', trigger: 'change' },
        ],
        isCompile: [
          { required: true, message: '是否编译必填', trigger: 'change' },
        ],
        descName: [
          { required: true, message: '版本说明必填', trigger: 'change' },
        ],
        owner: [
          { required: true, message: '作者名称必填', trigger: 'change' },
        ],
        pnIdList: [
          { type: 'array', required: true, message: '至少选择一个停车场', trigger: 'change' },
        ],
      },
      pklList: []
    }
  },
  methods: {
    // 表格当前页码改变时触发函数
    handleCurrentChange(page) {
      this.$emit('handleCurrentChange', page);
    },
    // 表格size改变时触发函数
    handleSizeChange(pageSize) {
      this.$emit('handleSizeChange', pageSize);
    },
    handleDetail(row) {
      this.$emit('handleDetail', row);
    },
    handleDescName(row) {
      this.$emit('handleDescName', row);
    },
    // 设置表格的最大高度
    adaptiveTableHeight() {
      this.tableHeight = document.getElementById('PowerEditionTableContainer') === null ? 0 : document.getElementById('PowerEditionTableContainer').offsetHeight;
    },

    createPowerEdition() {
      this.$emit('createPowerEdition');
    },

    copyPowerEdition() {
      this.$emit('copyPowerEdition');
    },

    recreatePowerEdition() {
      this.$emit('recreatePowerEdition');
    },
    filterMethod(query, item) {
      return item.keyword.indexOf(query) > -1;
    },

    handleSelectionChange(val) {
      // 若存在一条数据 再次点击 该函数会执行三次 若没有数据选中，执行一次
      // 第一次 选中状态 val中有两条数据 => 走if
      // 第二次 清空数据 val为空  => 不走if
      // 第三次 将最后一条数据设置为选中状态 val有一条数据 =>不走if
      this.selectedRows = val;

      if (val.length === 1) {
        this.selectProtocolId = val[0].releaseVersion;
      }

      if (val.length > 1) {
        this.$refs.itemTable.clearSelection();
        this.$refs.itemTable.toggleRowSelection(val.pop());
      }
    },

    pssCopyRelease() {
      //获取发布参数
      axios({
        url: nioReleaseURL + '/release-version/params',
        method: 'get',
        params: {
          releaseVersion: this.selectProtocolId,
        }
      }).then(res => {
        if (res.data.code === 200) {
          this.ruleCodes = res.data.data.params;
          this.ruleVisible = true;

          //如果未定义，则说明是停车场发版
          if (res.data.data.params.pssIds === undefined) {
            this.pklReleaseForm.productIdentity = res.data.data.params.productIdentity;
            this.pklReleaseForm.branch = res.data.data.params.branch;
            this.pklReleaseForm.referenceProduct = res.data.data.params.referenceProduct;
            this.pklReleaseForm.isCompile = res.data.data.params.isCompile;
            this.pklReleaseForm.descName = res.data.data.params.descName;
            this.pklReleaseForm.owner = res.data.data.params.owner;

            console.log("pnids: ", res.data.data.params.pnIds);

            let pnIdList = res.data.data.params.pnIds.split(',');
            for (let i = 0; i < pnIdList.length; i++) {
              this.pklReleaseForm.pnIdList.push(parseInt(pnIdList[i]));
            }

            this.parkingReleaseDialogVisible = true;

            //this.$nextTick(() => {
            //  this.$refs.pklReleaseForm.clearValidate();
            //});

            this.pklList = [];
            axios({
              url: nioPowerSwapURL + '/nio/parking/list',
              method: 'post',
              data: {
                pageNum: 0,
                pageSize: 10000,
              },
              headers: {
                'content-type': 'application/json'
              }
            }).then(res => {
              if (res.data.code === 0) {
                res.data.data.forEach((pkl, index) => {
                  this.pklList.push({
                    label: pkl.parkingNameCn,
                    key: pkl.parkingId,
                    keyword: pkl.parkingNameCn + "|" + pkl.parkingNameEn,
                    disabled: pkl.releaseStatus !== 'RELEASED'
                  });
                });
                console.log(this.pklList)
              } else {
                this.pklList = [];
              }
            }).catch((err) => {
              ElMessage.error({
                message: err,
                showClose: true,
              });
            })
          }
          else {
            this.pssReleaseForm.productIdentity = res.data.data.params.productIdentity;
            this.pssReleaseForm.branch = res.data.data.params.branch;
            this.pssReleaseForm.referenceProduct = res.data.data.params.referenceProduct;
            this.pssReleaseForm.isCompile = res.data.data.params.isCompile;
            this.pssReleaseForm.isCs = res.data.data.params.isCs;
            this.pssReleaseForm.descName = res.data.data.params.descName;
            this.pssReleaseForm.owner = res.data.data.params.owner;
            this.pssReleaseForm.compileMeta = res.data.data.params.compileMeta;
            let pppids = res.data.data.params.pssIds.split(',');
            for (let i = 0; i < pppids.length; i++) {
              this.pssReleaseForm.pssIdList.push(parseInt(pppids[i]));
            }

            //调起发版对话框
            this.selectPssDialogVisible = true;
            this.$nextTick(() => {
              this.$refs.pssReleaseForm.clearValidate();
            });
            this.pssList = [];
            axios({
              url: window.api.nioPowerSwapURL + '/nio/power-swap-station/list',
              method: 'post',
              data: {
                pageNum: 1,
                pageSize: 1000000,
              },
              headers: {
                'content-type': 'application/json'
              }
            }).then(res => {

              if (res.data.code === 0 && res.data.data !== null) {
                res.data.data.forEach((pss, index) => {
                  this.pssList.push({
                    label: pss.powerSwapStationNameCn,
                    key: pss.powerSwapStationId,
                    keyword: pss.powerSwapStationNameCn + "|" + pss.powerSwapStationNameEn,
                    disabled: pss.releaseStatus !== 'RELEASED'
                  });
                });
                console.log(this.pssList)
              } else {
                this.pssList = [];
              }

            }).catch((err) => {
              ElMessage.error({
                message: err,
                showClose: true,
              });
            })
          }
        } else {
          throw new Error(res.data.msg);
        }
      }).catch(err => {
        ElMessage.error({
          message: err.message,
        });
      });
    },

    //选择换电站按钮
    pssRelease() {
      this.selectPssDialogVisible = true;
      this.$nextTick(() => {
        this.$refs.pssReleaseForm.clearValidate();
      });
      this.pssList = [];
      axios({
        url: window.api.nioPowerSwapURL + '/nio/power-swap-station/list',
        method: 'post',
        data: {
          pageNum: 1,
          pageSize: 1000000,
        },
        headers: {
          'content-type': 'application/json'
        }
      }).then(res => {
        if (res.data.code === 0 && res.data.data !== null) {
          res.data.data.forEach((pss, index) => {
            this.pssList.push({
              label: pss.powerSwapStationNameCn,
              key: pss.powerSwapStationId,
              keyword: pss.powerSwapStationNameCn + "|" + pss.powerSwapStationNameEn,
              disabled: pss.releaseStatus !== 'RELEASED'
            });
          });
          console.log(this.pssList)
        } else {
          this.pssList = [];
        }
      }).catch((err) => {
        ElMessage.error({
          message: err,
          showClose: true,
        });
      })
    },

    releaseFun() {
      this.$refs.pssReleaseForm.validate(valid => {
        if (valid) {
          let commitData = new FormData();
          commitData.append("productIdentity", this.pssReleaseForm.productIdentity);
          commitData.append("descName", this.pssReleaseForm.descName);
          commitData.append("branch", this.pssReleaseForm.branch);
          commitData.append("owner", this.pssReleaseForm.owner);
          commitData.append("referenceProduct", this.pssReleaseForm.referenceProduct);
          commitData.append("isCs", this.pssReleaseForm.isCs);
          commitData.append("isCompile", this.pssReleaseForm.isCompile);
          commitData.append("pssIds", this.pssReleaseForm.pssIdList.join(","));
          commitData.append("compileMeta", this.pssReleaseForm.compileMeta);
          axios({
            url: nioReleaseURL + '/park-release-version/create',
            method: 'post',
            data: commitData,
          }).then(response => {
            if (response.data.code === 200) {
              ElMessage.success({
                message: '创建服务区发布记录成功',
                showClose: true,
              });
              this.selectPssDialogVisible = false;
            } else {
              ElMessage.error({
                message: response.data.msg,
                showClose: true,
              });
            }
          }).catch(() => {
            ElMessage.error({
              message: '创建服务区发布记录失败',
              showClose: true,
            });
          });
        }
      });
    },

    //关闭创建dialog
    closeSelectPss() {
      this.selectPssDialogVisible = false;
      this.$nextTick(() => {
        this.pssReleaseForm = {
          productIdentity: '',
          branch: '',
          referenceProduct: '',
          isCs: false,
          isCompile: false,
          descName: '',
          owner: '',
          pssIdList: []
        };
      });
    },

    //关闭创建dialog
    close_parking_lot() {
      this.parkingReleaseDialogVisible = false;
      this.$nextTick(() => {
        this.pklReleaseForm = {
          productIdentity: '',
          branch: '',
          referenceProduct: '',
          isCompile: false,
          descName: '',
          owner: '',
          pnIdList: []
        };
      });
    },

    release_parking_lot() {
      this.$refs.pklReleaseForm.validate(valid => {
        if (valid) {
          let commitData = new FormData();
          commitData.append("productIdentity", this.pklReleaseForm.productIdentity);
          commitData.append("descName", this.pklReleaseForm.descName);
          commitData.append("branch", this.pklReleaseForm.branch);
          commitData.append("owner", this.pklReleaseForm.owner);
          commitData.append("referenceProduct", this.pklReleaseForm.referenceProduct);
          commitData.append("isCompile", this.pklReleaseForm.isCompile);
          commitData.append("pnIds", this.pklReleaseForm.pnIdList.join(","));
          axios({
            url: nioReleaseURL + '/pn-release-version/create',
            method: 'post',
            data: commitData,
          }).then(response => {
            if (response.data.code === 200) {
              ElMessage.success({
                message: '创建停车场发布记录成功',
                showClose: true,
              });
              this.parkingReleaseDialogVisible = false;
            } else {
              ElMessage.error({
                message: response.data.msg,
                showClose: true,
              });
            }
          }).catch(() => {
            ElMessage.error({
              message: '创建停车场发布记录失败',
              showClose: true,
            });
          });
        }
      });
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.adaptiveTableHeight();
    });
    window.addEventListener('resize', this.adaptiveTableHeight, false);
  },
  setup() {
    return {
      Search, Refresh, FolderOpened, FolderAdd, ArrowRight
    }
  },
  created() {

  }
}
</script>

<style scoped>
.table{
  overflow: hidden;
}
.button_style {
  margin: 5px 6px 0 0;
  background-color: rgb(132, 193, 71);
}

.el-form-item {
  margin-bottom: 10px;
  margin-right: 20px;
}

.select_pss>>>.el-transfer-panel {
  width: 400px;
}
</style>