<template>
  <!-- 产品详情 -->
  <div id="ProductDetail" class="component" style="flex: 1;overflow: hidden;">
    <div id="detailStyle" class="tool">
      <el-form
        :model="detailForm"
        inline
        label-position="left"
        label-width="100px"
        id="formId"
        style="font-weight: 700"
      >
        <el-form-item label="产品：" name="productIdentity">
          <div style="width:200px;word-break: break-all;">{{detailForm.productIdentity}}</div>
        </el-form-item>
        <el-form-item label="产品名：" name="descName">
          <el-input v-model="detailForm.descName" placeholder="请输入产品名" clearable style="width:220px;word-break: break-all;"></el-input>
        </el-form-item>
        <el-form-item label="产品描述：" name="descInfo" style="margin-left: 90px;">
          <el-input v-model="detailForm.descInfo" placeholder="请输入产品描述" clearable style="width:240px;word-break: break-all;"></el-input>
        </el-form-item>
        <div></div>
        <el-form-item label="创建时间：" name="createTime">
          <div style="width:200px;word-break: break-all;padding: 1px 0 0 0;">{{detailForm.createTime}}</div>
        </el-form-item>
        <el-form-item label="更新时间：" name="updateTime">
          <div style="width:200px;word-break: break-all;">{{detailForm.updateTime}}
          </div>
        </el-form-item>
      </el-form>
      <div style="padding: 6px 0 10px 0;">
        <el-button :icon="Upload" type="primary" @click="handelSave" class="button_style">保存</el-button>
        <el-button :icon="RefreshLeft" theme="primary" @click="handelCancel" class="button_style">取消</el-button>
      </div>
      <el-row :gutter="20" justify="end" align="bottom">
        <el-col :span="16">
          <el-select
            v-model="searchInput"
            multiple
            placeholder="请选择分⽀类型"
            style="width: 340px;"
            clearable>
            <el-option
              v-for="item in branchOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
          <el-button :icon="Search" @click="DetailLoading"></el-button>
          <el-input
            v-model="searchName"
            placeholder="请输入分支名称"
            clearable
            @keyup.enter.native="branchFun"
            style="width:300px;margin-left: 80px;">
          </el-input>
          <el-button :icon="Search" @click="branchFun"></el-button>
        </el-col>
        <el-col :span="8">
          <div style="text-align: right;">
            <el-input
              v-model="partitionName"
              placeholder="请输入文件名称"
              clearable
              @keyup.enter.native="toDocInfo"
              @input="handlePartitionName"
              style="width:160px;margin-right: 10px;">
            </el-input>
            <el-button :disabled="partitionName === ''" :icon="Document" type="primary" @click="toDocInfo">文件详情</el-button>
          </div>
        </el-col>
      </el-row>
    </div>
    <div class="table">
      <div id="DetailTableContainer" class="table-container">
        <el-table
          :data="dataDetailChildren"
          border
          :max-height="tableHeightDetail">
          <el-table-column prop="detailNum" key="detailNum" label="序号" min-width="80" align="center"></el-table-column>
          <el-table-column prop="identityName" key="identityName" label="分支id" min-width="140" align="center"></el-table-column>
          <el-table-column prop="parentBranch" key="parentBranch" label="母分支" min-width="140" align="center"></el-table-column>
          <el-table-column prop="type" key="type" label="类型" min-width="150" align="center"></el-table-column>
          <el-table-column prop="createTime" key="createTime" label="创建时间" min-width="240" align="center"></el-table-column>
          <el-table-column prop="dataVersion" key="dataVersion" label="创建dataVersion" min-width="140" align="center"></el-table-column>
          <el-table-column
            fixed="right"
            label="操作"
            align="center"
            width="90">
            <template #default="scope">
              <el-button @click="handleSkip('branch',scope.row)" link type="primary" size="small">编辑分支</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div style="padding-top: 10px" class="pagination-container" v-show="paginationShow">
        <el-pagination
          background
          :total="totalDetail"
          :page-size.sync="pageSizeDetail"
          v-model="currentPageDetail"
          :page-sizes="[5,10,20,50]"
          @current-change="handleCurrentDetail"
          @size-change="handleSizeDetail"
          layout="total, sizes, prev, pager, next, jumper"
        ></el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
  // 引入js数据
  import {columnsDetailChildren, branchOptions} from "../../js/product_data.js";
  import {dateFormat} from "../../js/format_data.js";
  import axios from "axios";
  import {ElMessage} from "element-plus";
  import {Upload, RefreshLeft, Search, Document} from "@element-plus/icons-vue";

  const nioDataURL = window.api.nioDataURL;
  export default {
    name: "ProductDetail",
    // 接收父组件传来的参数
    props: {
      detailForm: Object,
      productId: String
    },
    data() {
      return {
        tableHeightDetail: 0,
        columnsDetailChildren: [
          ...columnsDetailChildren
        ],
        dataDetailChildren: [],
        totalDetail: 0,
        pageSizeDetail: 20,
        currentPageDetail: 1,
        offset: 0,
        searchInput: [],
        branchOptions: branchOptions,
        searchName: '',
        paginationShow: true,
        partitionName: ''
      }
    },
    setup() {
      return {
        Upload, RefreshLeft, Search, Document
      }
    },
    methods: {
      // 点击按钮，页面跳转
      handleSkip(val, row) {
        this.$emit('ProductShow', val)
        this.$emit('handleSkip', row)
      },
      // 更新产品库详情
      handelSave() {
        if (this.detailForm.descName && this.detailForm.descInfo) {
          let data = new FormData();
          data.append("productIdentity", this.detailForm.productIdentity);
          data.append("descName", this.detailForm.descName);
          data.append("descInfo", this.detailForm.descInfo);
          axios({
            url: nioDataURL + '/product/update',
            method: 'post',
            data: data
          }).then(response => {
            if (response.data.code === 200) {
              ElMessage.success({
                message: '更新成功',
                showClose: true,
              });
            } else {
              ElMessage.error({
                message: response.data.msg,
                showClose: true,
              });
            }
          }).catch(() => {
            ElMessage.error({
              message: '更新失败',
              showClose: true,
            });
          })
        } else {
          ElMessage.warning({
            message: '有数据为空',
            showClose: true,
          });
        }
      },
      //返回产品页
      handelCancel() {
        this.$parent.ProductShow("Product");
      },
      // 根据分支名称，获取表格信息
      branchFun() {
        let data = new FormData();
        data.append("productIdentity", this.detailForm.productIdentity);
        data.append("searchName", this.searchName);
        data.append("type", this.searchInput.join(','));
        axios({
          url: nioDataURL + '/product/branch/search',
          method: 'post',
          data: data
        }).then(response => {
          if (response.data.code === 200) {
            this.dataDetailChildren = response.data.data.versionBranchList;
            this.dataDetailChildren.map(item => {
              item.createTime = dateFormat(item.createTime);
            });
            for (let i in this.dataDetailChildren) {
              // 整理表格数据中的序号
              this.dataDetailChildren[i].detailNum = parseInt(i) + 1
            }
            this.paginationShow = false
          } else {
            ElMessage.error({
              message: response.data.msg,
              showClose: true,
            });
          }
        }).catch(() => {
          ElMessage.error({
            message: '没有获取到分支名称数据',
            showClose: true,
          });
        })
      },
      // 获取表格信息
      DetailLoading() {
        if (this.searchInput) {
          let data = new FormData();
          data.append("productIdentity", this.detailForm.productIdentity);
          data.append("type", this.searchInput);
          data.append("sortAttribute", 'createTime');
          data.append("sortDirection", 'desc');
          data.append("offset", this.offset);
          data.append("limit", this.pageSizeDetail);
          axios({
            url: nioDataURL + '/product/branch/list',
            method: 'post',
            data: data
          }).then(response => {
            if (response.data.code === 200) {
              this.totalDetail = response.data.data.totalCount;
              if (this.total === 0) {
                ElMessage.warning({
                  message: '没有符合查询条件的数据',
                  showClose: true,
                });
              }
              this.dataDetailChildren = response.data.data.versionBranchList;
              this.dataDetailChildren.map(item => {
                item.createTime = dateFormat(item.createTime);
              });
              for (let i in this.dataDetailChildren) {
                // 整理表格数据中的序号
                this.dataDetailChildren[i].detailNum = parseInt(i) + 1
              }
              this.paginationShow = true
            } else {
              ElMessage.error({
                message: response.data.msg,
                showClose: true,
              });
            }
          }).catch(() => {
            ElMessage.error({
              message: '没有获取到数据',
              showClose: true,
            });
          })
        } else {
          ElMessage.warning({
            message: '请输入要查询的分支类型',
            showClose: true,
          });
        }
      },
      // 分页组件
      handleSizeDetail(page_size) {
        this.pageSizeDetail = page_size;
        this.DetailLoading()
      },
      handleCurrentDetail(page) {
        this.currentPageDetail = page;
        this.offset = (page - 1) * this.pageSizeDetail;
        this.DetailLoading()
      },
      adaptiveTableDetailHeight() {
        this.tableHeightDetail = document.getElementById('DetailTableContainer') === null ? 0 : document.getElementById('DetailTableContainer').offsetHeight;
      },
      handlePartitionName(value) {
        this.$emit('handlePartitionName', value);
      },
      toDocInfo() {
        if (this.partitionName === '') {
          return;
        }
        this.$emit('ProductShow', 'document')
      }
    },
    mounted() {
      this.$nextTick(() => {
        this.adaptiveTableDetailHeight()
      })
      window.addEventListener('resize', this.adaptiveTableDetailHeight, false)
    },
    created() {
      // 默认全选调接口
      this.searchInput = ['PARTIAL_BRANCH', 'BRANCH', 'TAG']
      this.DetailLoading();
    }
  }
</script>

<style scoped>
  #formId :deep(.t-form__label) {
    padding-right: 4px !important;
    width: 100px !important;
  }
  .el-form-item{
    margin-bottom: 0;
  }
</style>
