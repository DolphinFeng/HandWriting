<!-- 停车场管理 -> 停车场发版 -->
<template>
  <div style="height: 36px;">
    <!-- 面包屑：展示产品的产品详情 -->
    <el-breadcrumb class="breadcrumb" :separator-icon="ArrowRight">
      <el-breadcrumb-item>
        <div class="breadcrumbItem">停车场管理</div>
      </el-breadcrumb-item>
      <el-breadcrumb-item>
        <div class="breadcrumbItem active-breadcrumb-item">停车场发版</div>
      </el-breadcrumb-item>
    </el-breadcrumb>

    <div style="height: 36px;">
    </div>

    <el-button type="success" :icon="FolderAdd" @click="parking_lot_release">创建版本</el-button>
    <el-button type="success" :icon="FolderAdd" @click="parking_lot_release_new">创建版本(新平台)</el-button>

    <el-dialog title="停车场发版" v-model="parkingReleaseDialogVisible" show-close @close="close_parking_lot" width="1300px">
      <el-form ref="pklReleaseForm" :inline="true" :model="pklReleaseForm" :rules="pklReleaseRules"
        label-position="right" label-width="130px">
        <el-form-item label="产品名称：" prop="productIdentity">
          <el-input v-model.trim="pklReleaseForm.productIdentity" placeholder="请输入产品名称" style="width: 400px"></el-input>
        </el-form-item>
        <el-form-item label="分支名称：" prop="branch">
          <el-input v-model.trim="pklReleaseForm.branch" placeholder="请输入换分支名称" style="width: 400px"></el-input>
        </el-form-item>
        <el-form-item label="底图依赖：" prop="referenceProduct">
          <el-input v-model.trim="pklReleaseForm.referenceProduct" placeholder="请输入底图依赖"
            style="width: 400px"></el-input>
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
              <template #left-footer>
                <el-upload ref="upload-sql" action='' accept=".txt" :auto-upload="false" :on-change="changeFile"
                  :http-request="uploadHandler">
                  <el-button class="transfer-footer" type="primary">上传批量发版列表</el-button>
                </el-upload>

              </template>
            </el-transfer>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="close_parking_lot">取消</el-button>
        <el-button type="primary" @click="release_parking_lot">确定</el-button>
      </template>

      <el-dialog v-model="dialogVisible" title="提示" width="25%" :before-close="handleClose">

        <span style="font-size: large;">{{ message }}</span>
        <div :style="{ 'height': height + 'px', 'overflow-y': 'auto' }">
          <ul>
            <li v-for="(dl, key) of defaultlist">{{ key + 1 }}.{{ dl }}</li>
          </ul>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button type="primary" @click="dialogVisible = false">
              关闭
            </el-button>
          </span>
        </template>

      </el-dialog>
    </el-dialog>

    <el-dialog title="PSP/PN发版(新平台)" v-model="parkingReleaseDialogVisibleNew" show-close @close="close_parking_lot_new"
      width="1300px">
      <el-form ref="pklReleaseFormNew" :inline="true" :model="pklReleaseFormNew" :rules="pklReleaseRulesNew"
        label-position="right" label-width="130px">
        <el-form-item label="产线：" prop="productLine">
          <el-select v-model="pklReleaseFormNew.productLine" placeholder="请选择" style="width: 400px">
            <el-option v-for="item in productLineOption" :key="item.name" :label="item.name" :value="item.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="融合任务号：" prop="taskId">
          <el-input v-model.trim="pklReleaseFormNew.taskId" placeholder="请输入融合任务号" style="width: 400px"></el-input>
        </el-form-item>
        <el-form-item label="产品名称：" prop="productIdentity">
          <el-input v-model.trim="pklReleaseFormNew.productIdentity" placeholder="请输入产品名称"
            style="width: 400px"></el-input>
        </el-form-item>
        <el-form-item label="分支名称：" prop="branch">
          <el-input v-model.trim="pklReleaseFormNew.branch" placeholder="请输入换分支名称" style="width: 400px"></el-input>
        </el-form-item>
        <el-form-item label="底图依赖：" prop="referenceProduct">
          <el-input v-model.trim="pklReleaseFormNew.referenceProduct" placeholder="请输入底图依赖"
            style="width: 400px"></el-input>
        </el-form-item>
        <el-form-item label="是否编译：" prop="isCompile">
          <el-switch active-text="是" inactive-text="否" inline-prompt v-model="pklReleaseFormNew.isCompile"
            placeholder="是否编译"></el-switch>
        </el-form-item>
        <el-form-item label="版本说明：" prop="descName">
          <el-input v-model.trim="pklReleaseFormNew.descName" placeholder="请输入版本说明" style="width: 400px"></el-input>
        </el-form-item>
        <el-form-item label="作者：" prop="owner">
          <el-input v-model.trim="pklReleaseFormNew.owner" placeholder="请输入作者名称" style="width: 400px"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="close_parking_lot_new">取消</el-button>
        <el-button type="primary" @click="release_parking_lot_new" :loading="pklReleaseFormNew.loading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { Search, Refresh, FolderOpened, FolderAdd, ArrowRight } from "@element-plus/icons-vue";
import axios from "axios";

const nioPowerSwapURL = window.api.nioPowerSwapURL;
const nioReleaseURL = window.api.nioReleaseURL;

export default {
  name: "ParkingLotRelease",
  data() {
    return {
      parkingReleaseDialogVisible: false,
      parkingReleaseDialogVisibleNew: false,
      pklReleaseForm: {
        productIdentity: '',
        branch: '',
        referenceProduct: '',
        isCompile: false,
        descName: '',
        owner: '',
        pnIdList: []
      },
      productLineOption: [
        { name: 'PSP' },
        { name: 'PN' }
      ],
      pklReleaseFormNew: {
        loading: false,
        productLine: '',
        taskId: '',
        productIdentity: '',
        branch: '',
        referenceProduct: '',
        isCompile: false,
        descName: '',
        owner: '',
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
      pklReleaseRulesNew: {
        productLine: [
          { required: true, message: '产线名称必选', trigger: 'change' },
        ],
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
      },
      pklList: [],
      dialogVisible: false,
      message: '',
      defaultlist: [],
      height: 0
    }
  },
  setup() {
    return {
      Search, Refresh, FolderOpened, FolderAdd, ArrowRight
    }
  },

  methods: {
    changeFile(file, fileList) {
      console.log(fileList);
      if (file.status === 'ready') {
        // 已上传文件列表如果存在 2 条记录，移除第一条，实现替换效果
        if (fileList.length === 2) {
          fileList.shift()
        }
        // 手动开始上传
        this.$refs['upload-sql'].submit()
      }
    },
    uploadHandler(params) {
      return setTimeout(() => {
        this.readText(params, 'GB2312')
      }, 100)
    },

    async readText(params, format) {
      // UTF-8,GBK,GB2312Fz
      const readFile = new FileReader()
      readFile.readAsText(params.file, format)
      readFile.onload = (e) => {
        const fileContent = e.target.result;
        var array = fileContent.split("\n");
        var arr = []
        array.map((item) => {
          item = item + '',
            arr.push(item.split("\r").join(""))
        })
        this.getdata(arr);
      }/*  */

      // this.dialogVisible = true;
    },
    getdata(array) {
      this.pklReleaseForm.pnIdList = [];
      var arrayLength = array.length;
      var pkllistArray = JSON.parse(JSON.stringify(this.pklList))
      var pnIdListArray = [];

      pkllistArray.forEach((item) => {
        array.forEach((element) => {
          if (item.mapId == element && item.disabled == false) {
            this.pklReleaseForm.pnIdList.push(item.key)
            pnIdListArray.push(element)
          }
        })
      })

      console.log(pnIdListArray);
      this.defaultlist = []
      array.forEach((item) => {
        if (!pnIdListArray.includes(item)) {
          this.defaultlist.push(item)
        }
      })

      this.dialogVisible = true;

      if (arrayLength == this.pklReleaseForm.pnIdList.length) {
        this.message = `上传成功，成功匹配${arrayLength} 个场站`
      } else {
        var defaultlength = arrayLength - this.pklReleaseForm.pnIdList.length;
        console.log(defaultlength);
        this.message = `上传失败，成功匹配${this.pklReleaseForm.pnIdList.length}个场站，失败${defaultlength}个场站`
        this.height = 300
      }
    },
    handleClose() {
      ElMessageBox.confirm('确定关闭吗?')
        .then(() => {
          this.dialogVisible = false;
        })
        .catch(() => {

        })
    },

    getdefaultlist() {
      console.log(this.defaultlist)


    },


    parking_lot_release() {
      this.parkingReleaseDialogVisible = true;

      this.$nextTick(() => {
        this.$refs.pklReleaseForm.clearValidate();
      });

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
              disabled: pkl.releaseStatus !== 'RELEASED',
              mapId: pkl.mapId,
            });
          });
        } else {
          this.pklList = [];
        }
      }).catch((err) => {
        ElMessage.error({
          message: err,
          showClose: true,
        });
      })
    },

    parking_lot_release_new() {
      this.parkingReleaseDialogVisibleNew = true;

      this.$nextTick(() => {
        this.$refs.pklReleaseFormNew.clearValidate();
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

    close_parking_lot_new() {

      this.parkingReleaseDialogVisibleNew = false;
      this.$nextTick(() => {
        this.pklReleaseFormNew = {
          productLine: '',
          taskId: '',
          productIdentity: '',
          branch: '',
          referenceProduct: '',
          isCompile: false,
          descName: '',
          owner: '',
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

    release_parking_lot_new() {

      this.$refs.pklReleaseFormNew.validate(valid => {
        if (valid) {
          if (this.pklReleaseFormNew.productLine == 'PSP') {

            this.pklReleaseFormNew.loading = true;
            let commitData = new FormData();
            commitData.append("productIdentity", this.pklReleaseFormNew.productIdentity);
            commitData.append("descName", this.pklReleaseFormNew.descName);
            commitData.append("branch", this.pklReleaseFormNew.branch);
            commitData.append("owner", this.pklReleaseFormNew.owner);
            commitData.append("referenceProduct", this.pklReleaseFormNew.referenceProduct);
            commitData.append("isCompile", this.pklReleaseFormNew.isCompile);
            commitData.append("isCs", true);
            commitData.append("isLight", true);
            //commitData.append("mergeTaskId", this.pklReleaseFormNew.taskId);
            axios({
              url: nioReleaseURL + '/park-release-version/create',
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
            }).finally(()=>{
              this.pklReleaseFormNew.loading = false;
              }
            )
          }
          else if (this.pklReleaseFormNew.productLine == 'PN') {
            this.pklReleaseFormNew.loading = true;
            let commitData = new FormData();
            commitData.append("productIdentity", this.pklReleaseFormNew.productIdentity);
            commitData.append("descName", this.pklReleaseFormNew.descName);
            commitData.append("branch", this.pklReleaseFormNew.branch);
            commitData.append("owner", this.pklReleaseFormNew.owner);
            commitData.append("referenceProduct", this.pklReleaseFormNew.referenceProduct);
            commitData.append("isCompile", this.pklReleaseFormNew.isCompile);
            commitData.append("mergeTaskId", this.pklReleaseFormNew.taskId);
            commitData.append("isLight", true);
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
            }).finally(()=>{
              this.pklReleaseFormNew.loading = false;
              }
            );
          }
        }
      });
    },

    filterMethod(query, item) {
      return item.keyword.indexOf(query) > -1;
    },
  },
  mounted() {
  }

}
</script>

<style scoped>
.select_pss>>>.el-transfer-panel {
  width: 400px;
}

.transfer-footer {
  /* margin-left: 15px; */
  margin: 3px 15px;
  padding: 10px;
}
</style>