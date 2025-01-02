<template>
  <!-- 产品详情 -->
  <div id="PowerEditionDetail" class="component" style="flex: 1;overflow: hidden;">
    <div id="detailStyle" class="tool">
      <el-form
        :model="powerEditionDetailForm"
        inline
        label-position="left"
        label-width="200px"
        id="formId"
        style="font-weight: 700; margin-top: 20px;"
      >
        <el-form-item label="产品库名称：" name="productIdentity">
          <div >{{powerEditionDetailForm.productIdentity}}</div>
        </el-form-item>
        
        <el-form-item label="发版时间：" name="createTime">
          <div >{{powerEditionDetailForm.releaseTime}}</div>
        </el-form-item>

        <el-form-item label="发版tag：" name="releaseTag">
          <div >{{powerEditionDetailForm.productTag}}</div>
        </el-form-item>

      </el-form>
    </div>
    <div class="table">
      <div id="DetailTableContainer" class="table-container">
        <el-table
          :data="powerEditionDetailData"
          border
          :max-height="tableHeightDetail">
          <el-table-column
            fixed
            prop="releaseVersion"
            label="发布版本号"
            min-width="200"
            align="center"
            show-overflow-tooltip
          >
          </el-table-column>
          <el-table-column prop="powerSwapStationNameCn" key="powerSwapStationNameCn" label="换电站名称" min-width="300" align="center">
            <template #default="scope">
              <el-button @click="handleEditionDetail('powerEditionDetailPerPS', scope.row)" link type="primary">{{scope.row.powerSwapStationNameCn}}</el-button>
            </template>
          </el-table-column>
          <el-table-column prop="mesh" key="mesh" label="图幅号" min-width="140" align="center"></el-table-column>

          <el-table-column prop="businessId" key="businessId" label="换电站id" min-width="140" align="center"></el-table-column>
          <el-table-column prop="materialTrajectoryId" key="materialTrajectoryId" label="点云轨迹ID" min-width="140" align="center"></el-table-column>
          <el-table-column prop="materialVersionId" key="materialVersionId" label="点云规格版本号" min-width="140" align="center"></el-table-column>
          <el-table-column prop="materialId" key="materialId" label="点云版本ID" min-width="140" align="center"></el-table-column>
          <el-table-column prop="rotationMatrix" key="rotationMatrix" label="点云矩阵" min-width="140" align="center">
            <template #default="{row}">
              <el-link :underline="false" type="primary" style="font-size: 13px;font-weight: normal" @click="showParamInfo(row.rotationMatrix)">查看</el-link>
            </template>
          </el-table-column>
          <el-table-column prop="locationGeofence" key="locationGeofence" label="点云围栏" min-width="140" align="center">
            <template #default="{row}">
              <el-link :underline="false" type="primary" style="font-size: 13px;font-weight: normal" @click="showParamInfo(row.locationGeofence)">查看</el-link>
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
    <JsonView
        :data="jsonData"
        title="显示参数"
        v-model:visible="jsonVisible"
    ></JsonView>
  </div>
</template>

<script>
  // 引入js数据
  import {Upload, RefreshLeft, Search} from "@element-plus/icons-vue";
  import axios from "axios";
  import JsonView from "@/jsonView/JsonView.vue";

  const nioReleaseURL = window.api.nioReleaseURL;
  const nioPowerSwapURL = window.api.nioPowerSwapURL;

  export default {
    name: "PowerEditionDetail",
    components: {JsonView},
    // 接收父组件传来的参数
    props: {
      powerEditionDetailForm: Object,
      productId: String,
      releaseVersion: String
    },
    data() {
      return {
        tableHeightDetail: 0,
        powerEditionDetailData: [],
        totalDetail: 0,
        pageSizeDetail: 20,
        currentPageDetail: 1,
        offset: 0,
        searchInput: [],
        searchName: '',
        paginationShow: true,
        jsonData: '',
        jsonVisible: false,
      }
    },
    setup() {
      return {
        Upload, RefreshLeft, Search,
      }
    },
    methods: {
      // 点击按钮，页面跳转
      handleEditionDetail(val, row) {
        this.$emit('PowerReleaseShow', val)
        this.$emit('handleSkip', row)
      },
      // 更新产品库详情

      loatData() {

        axios({
          url: nioReleaseURL + '/stations/releases/query',
          method: 'post',
          data: {
            stationIds: [],
            releaseStatus: [],
            releaseVersions: [this.releaseVersion]
          }
        }).then(response => {
          if (response.data.code === 200) {
            if(response.data.msg !== 'success'){
              ElMessage.warning({
                message: '没有数据',
                showClose: true,
              });
              return;
            }

            let pcList = [];
            for(let i = 0; i < response.data.data.stationRelease.length; i ++){
              for(let j = 0; j < response.data.data.stationRelease[i].pointCloudDtoList.length; j ++){
                pcList.push(response.data.data.stationRelease[i].pointCloudDtoList[j]);
              }
            }

            axios({
                url: nioPowerSwapURL + '/nio/material/batch/queryVersionInfo',
                method: 'post',
                data: pcList,
                headers: {
                  'content-type': 'application/json'
                }
            }).then(response2 => {

              if(response2.data.msg === 'SUCCESS'){
                let pcMap = new Map();
                let businessIdMap = new Map();
                for(let i = 0; i < response2.data.data.length; i ++){
                  pcMap.set(JSON.stringify(pcList[i]), response2.data.data[i]);
                  businessIdMap.set(pcList[i].businessId, response2.data.data[i]);
                }
                
                let stationRelease = response.data.data.stationRelease;
                for(let i = 0; i < stationRelease.length; i ++){
                  let stationReferences = stationRelease[i].stationReferences;
                  let pointCloudDtoList = stationRelease[i].pointCloudDtoList;

                  for(let j = 0; j < pointCloudDtoList.length; j ++){
                    let str = JSON.stringify(pointCloudDtoList[j]);
                    let pcInfo = businessIdMap.get(pointCloudDtoList[j].businessId);

                    this.powerEditionDetailData.push({
                      releaseVersion: this.releaseVersion, 
                      powerSwapStationNameCn: pcMap.get(str).businessCn,
                      mesh: 0, 
                      materialTrajectoryId: pcInfo.materialTrajectoryId,
                      materialVersionId: pcInfo.materialVersionId,
                      businessId: pcInfo.businessId,
                      materialId: pcInfo.materialId,
                      rotationMatrix: pcInfo.rotationMatrix,
                      locationGeofence: pcInfo.locationGeofence,
                    });
                  }
                }
              }
            })
            
          } else {
            ElMessage.error({
              message: response.data.msg,
              showClose: true,
            });
          }
        }).catch((err) => {
          ElMessage.error({
            message: '没有获取到数据' + err.message,
            showClose: true,
          });
        });
      },

      // 分页组件
      handleSizeDetail(page_size) {
        this.pageSizeDetail = page_size;
      },
      handleCurrentDetail(page) {
        this.currentPageDetail = page;
        this.offset = (page - 1) * this.pageSizeDetail;
      },
      adaptiveTableDetailHeight() {
        this.tableHeightDetail = document.getElementById('DetailTableContainer') === null ? 0 : document.getElementById('DetailTableContainer').offsetHeight;
      },
      showParamInfo(data) {
        this.jsonData = data;
        this.jsonVisible = true;
      },
    },
    mounted() {
      this.loatData();
      this.$nextTick(() => {
        this.adaptiveTableDetailHeight()
      })
      window.addEventListener('resize', this.adaptiveTableDetailHeight, false)
    },
    created() {

    }
  }
</script>

<style scoped>
  #formId :deep(.t-form__label) {
    padding-right: 4px !important;
    width: 100px !important;
  }
</style>
