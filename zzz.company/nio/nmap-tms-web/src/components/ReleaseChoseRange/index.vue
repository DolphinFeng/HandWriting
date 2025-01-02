<template>
  <!-- 任务管理发起任务：选择任务范围 -->
  <div id="ReleaseChoseRange">
    <div class="dialog-content" style="border-top: 1px solid #999">
      <el-tabs v-model="activeNames" type="card" tab-position="left" style="height: 100%"
               @tab-click="checkTabs">
        <el-tab-pane name="1" label="改善任务">
          <el-tabs v-model="perfectActiveNames" type="card" tab-position="left" style="height: 100%"
                   @tab-click="checkPerfectTabs" id="perfect">
            <el-tab-pane name="11" label="按图幅改善任务">
              <div class="label-wrap">
                <div>
                  <span>是否启动检查：</span>
                  <el-select v-model="check_choose" placeholder="请选择是否启动检查">
                    <el-option
                      v-for="item in tf_option"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </div>
                <div>
                  <span>检查是否占图：</span>
                  <el-select v-model="lock_choose" placeholder="请选择检查是否占图">
                    <el-option
                      v-for="item in tf_option"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </div>
                <div>
                  <span>产品类型：</span>
                  <el-select v-model="product_type" placeholder="请选择产品类型" @change="getVersion">
                    <el-option
                      v-for="(value,name) in product_type_options"
                      :key="value"
                      :label="name"
                      :value="value"
                    />
                  </el-select>
                </div>
                <div>
                  <span>产品库名：</span>
                  <el-select v-model="product_name" filterable placeholder="请选择产品库名" @change="getVersion">
                    <el-option
                      v-for="item in product_name_options"
                      :key="item"
                      :label="item"
                      :value="item"
                    />
                  </el-select>
                </div>
                <div>
                  <span>版本：</span>
                  <el-select v-model="product_version" filterable placeholder="请选择版本">
                    <el-option
                      v-for="item in product_version_options"
                      :key="item"
                      :label="item"
                      :value="item"
                    />
                  </el-select>
                </div>
                <div>
                  <span>导入图幅列表：</span>
                  <div style="display: inline-block;width:220px">
                    <el-upload
                      :on-success='handleSuccess'
                      :on-error="handleError"
                      :before-upload="uploadBefore"
                      accept=".csv"
                      :action="action"
                      :file-list="fileList"
                      multiple
                      :show-file-list="false"
                      :data="dataFile">
                      <el-button size="small" type="primary">点击上传</el-button>
                    </el-upload>
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-tab-pane>
        <el-tab-pane name="2" label="快修任务">
          <el-tabs v-model="quickActiveNames" type="card" tab-position="left" style="height: 100%"
                   @tab-click="checkQuickTabs" id="quick">
            <el-tab-pane name="21" label="按图幅快修任务">
              <div class="label-wrap">
                <div>
                  <span>图幅号：</span>
                  <el-input v-model="issue_name" @input="changeNum" placeholder="请输入图幅号" style="width: 220px"/>
                </div>
                <div>
                  <span>产品类型：</span>
                  <el-select v-model="product_type" placeholder="请选择产品类型" @change="getVersion">
                    <el-option
                      v-for="(value,name) in product_type_options"
                      :key="value"
                      :label="name"
                      :value="value"
                    />
                  </el-select>
                </div>
                <div>
                  <span>产品库名：</span>
                  <el-select v-model="product_name" filterable placeholder="请选择产品库名" @change="getVersion">
                    <el-option
                      v-for="item in product_name_options"
                      :key="item"
                      :label="item"
                      :value="item"
                    />
                  </el-select>
                </div>
                <div>
                  <span>版本：</span>
                  <el-select v-model="product_version" filterable placeholder="请选择版本">
                    <el-option
                      v-for="item in product_version_options"
                      :key="item"
                      :label="item"
                      :value="item"
                    />
                  </el-select>
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane name="22" label="按列表快修任务">
              <div class="label-wrap">
                <div>
                  <span>产品类型：</span>
                  <el-select v-model="product_type" placeholder="请选择产品类型" @change="getVersion">
                    <el-option
                      v-for="(value,name) in product_type_options"
                      :key="value"
                      :label="name"
                      :value="value"
                    />
                  </el-select>
                </div>
                <div>
                  <span>产品库名：</span>
                  <el-select v-model="product_name" filterable placeholder="请选择产品库名" @change="getVersion">
                    <el-option
                      v-for="item in product_name_options"
                      :key="item"
                      :label="item"
                      :value="item"
                    />
                  </el-select>
                </div>
                <div>
                  <span>版本：</span>
                  <el-select v-model="product_version" filterable placeholder="请选择版本">
                    <el-option
                      v-for="item in product_version_options"
                      :key="item"
                      :label="item"
                      :value="item"
                    />
                  </el-select>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-tab-pane>
        <el-tab-pane name="3" label="大版融合任务">
          <div class="label-wrap">
            <div>
              <span>任务名称：</span>
              <el-input v-model="task_name" placeholder="请输入名称，示例：21Q4-HD-China-备注"
                        @input="changeNum" style="width: 300px"/>
            </div>
            <div>
              <span>任务地址：</span>
              <el-input v-model="task_address" placeholder="请输入任务地址"
                        @input="changeNum" style="width:300px"/>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    <div class="dialog-footer" style="border-top: 1px solid #999; height: 80px">
      <el-button @click="closed">取消</el-button>
      <el-button type="primary" @click="nextStep">
        下一步
      </el-button>
    </div>
  </div>
</template>

<script>
  const nioMapUrl = window.api.apiNioMapURL;
  if (nioMapUrl === null || nioMapUrl === undefined) {
    console.log("获取nioMapUrl失败" + nioMapUrl)
  }

  const nioUrl = window.api.apiNioURL;
  if (nioUrl === null || nioUrl === undefined) {
    console.log("获取nioUrl失败" + nioUrl)
  }

  const nioquickFixURL = window.api.apiquickFixURL;
  if (nioquickFixURL === null || nioquickFixURL === undefined) {
    console.log("获取nioquickFixURL失败" + nioquickFixURL)
  }

  export default {
    name: 'ReleaseChoseRange',
    // 接收父组件传来的参数
    props: {
      startRelaseParams: Object,
    },
    data() {
      return {
        // 导入图幅列表的url
        action: nioUrl + '/task/v1/chooseValidTailIds',
        // 用于判断逻辑
        showIndex: 11,
        tabIndex: 1,
        activeNames: '1',
        perfectIndex: 11,
        perfectActiveNames: '11',
        quickIndex: 21,
        quickActiveNames: '21',
        // 所填写的字段绑定的字段
        check_choose: '',
        lock_choose: '',
        product_type: '',
        product_name: '',
        product_version: '',
        issue_name: '',
        choose: '',
        task_name: '',
        task_address: '',
        // select选项数据源
        tf_option: [
          {value: 1, label: '是',},
          {value: 2, label: '否',},
        ],
        product_type_options: {},
        product_name_options: [],
        product_version_options: [],
        choose_options: [
          {value: 2, label: '剔除后创建'},
          {value: 3, label: '等待完成后创建'}
        ],
        // 导入文件列表
        fileList: [],
        // 导入文件所需的额外数据
        dataFile: {
          productType: '',
        },
        // 正确的图幅列表
        validTailIds: [],
        // error的图幅列表
        errorTailIds: []
      }
    },
    methods: {
      //图幅号输入检查函数
      changeNum() {
        this.issue_name = this.issue_name.replace(/，/ig, ',').replace(/[\s]*[,][\s]*[,]{1,}([\s]+|[,]+)*/, ',').replace(/[^\d,]/g, '');
      },
      //导入成功
      handleSuccess(response, file, fileList) {
        if (response.code === 0) {
          this.validTailIds = response.data.validTailIds
          this.errorTailIds = response.data.errorTailIds
          this.$message({
            type: 'success',
            message: '文件' + fileList[fileList.length - 1].name + '导入成功',
            showClose: true,
          });
        } else {
          this.$message({
            type: 'error',
            message: '文件' + fileList[fileList.length - 1].name + '导入失败，' + response.msg,
            showClose: true,
          });
        }
      },
      //导入失败
      handleError() {
        this.$message({
          type: 'error',
          message: '导入失败',
          showClose: true,
        });
      },
      //导入之前判断
      uploadBefore(file) {
        this.dataFile.productType = this.product_type
        if (file.name.split('.')[1] === 'csv') {
          return true;
        } else {
          this.$message({
            type: 'error',
            message: '导入文件格式错误，请导入csv文件',
            showClose: true,
          });
          return false
        }
      },
      // 任务选项卡切换函数
      checkTabs(tab) {
        switch (tab.$options.propsData.label) {
          case '改善任务':
            // 默认（当前只有一项），按图幅改善任务:11
            this.tabIndex = 11;
            this.showIndex = 11;
            break;
          case '快修任务':
            this.tabIndex = 21;
            this.showIndex = 21;
            break;
          case '大版融合任务':
            this.tabIndex = 3;
            this.showIndex = 3;
        }
        this.initData();
      },
      // 改善任务的选项卡切换函数
      checkPerfectTabs(tab) {
        // 默认，按图幅改善任务:11
        this.perfectIndex = 11;
        this.showIndex = 11;
      },
      // 快修任务的选项卡切换函数
      checkQuickTabs(tab) {
        switch (tab.$options.propsData.label) {
          case '按图幅快修任务':
            this.quickIndex = 21;
            this.showIndex = 21;
            break;
          case '按列表快修任务':
            this.quickIndex = 22;
            this.showIndex = 22;
        }
        this.initData();
      },
      initData() {
        this.check_choose = '';
        this.lock_choose = '';
        this.product_type = '';
        this.product_name = '';
        this.product_version = '';
        this.issue_name = '';
        this.choose = '';
        this.task_name = '';
        this.task_address = '';
      },
      // 下一步按钮方法
      nextStep() {
        const options = {
          // 用于判断逻辑
          showIndex: this.showIndex,
          tabIndex: this.tabIndex,
          perfectIndex: this.perfectIndex,
          quickIndex: this.quickIndex,
          check_choose: this.check_choose,
          lock_choose: this.lock_choose,
          product_type: this.product_type,
          product_name: this.product_name,
          product_version: this.product_version,
          issue_name: this.issue_name,
          choose: this.choose,
          task_name: this.task_name,
          task_address: this.task_address,
          product_version_options: this.product_version_options,
          // 正确的图幅列表
          validTailIds: this.validTailIds,
          // error的图幅列表
          errorTailIds: this.errorTailIds
        };
        // 按图幅改善时：设置product_type
        if (this.tabIndex === 1 || this.showIndex === 11) {
          localStorage.setItem('srcState', this.product_type)
        }
        this.$emit('nextStep', options);
      },
      // 取消按钮方法
      closed() {
        this.$emit('closed');
      },
      // 获取所需select选项的数据源
      getData() {
        // 获取产品类型
        this.$axios({
          url: nioquickFixURL + '/nio/task/quickfix/product_type',
          method: 'post',
          data: {}
        }).then(response => {
          if (response.data.code === 0) {
            this.product_type_options = response.data.data
          }
        }).catch(() => {
          this.$message({
            type: 'error',
            message: '获取产品类型数据集失败',
            showClose: true,
          });
        });
        // 获取产品库名
        this.$axios({
          url: nioquickFixURL + '/nio/task/quickfix/product_name',
          method: 'post',
          data: {}
        }).then(response => {
          if (response.data.code === 0) {
            this.product_name_options = response.data.data
          }
        }).catch(() => {
          this.$message({
            type: 'error',
            message: '获取产品库名数据集失败',
            showClose: true,
          });
        });
      },
      getVersion() {
        if (this.product_type && this.product_name) {
          // 根据产品类型和产品库名获取版本
          this.$axios({
            url: nioquickFixURL + '/nio/task/quickfix/product_version',
            method: 'post',
            data: {
              'product_type': this.product_type,
              'product_name': this.product_name
            }
          }).then(response => {
            if (response.data.code === 0) {
              // 重新获取版本数据源，把原来的版本值请空
              this.product_version = ''
              this.product_version_options = response.data.data
            }
          }).catch(() => {
            this.$message({
              type: 'error',
              message: '获取版本数据集失败',
              showClose: true,
            });
          });
        }
      }
    },
    computed: {},
    watch: {},
    mounted() {
      //获取数据源
      this.getData()
      // 缓存显示页面值
      this.check_choose = this.startRelaseParams.check_choose || '';
      this.lock_choose = this.startRelaseParams.lock_choose || '';
      this.product_type = this.startRelaseParams.product_type || '';
      this.product_name = this.startRelaseParams.product_name || '';
      this.product_version = this.startRelaseParams.product_version || '';
      this.issue_name = this.startRelaseParams.issue_name || '';
      this.choose = this.startRelaseParams.choose || '';
      this.task_name = this.startRelaseParams.task_name || '';
      this.task_address = this.startRelaseParams.task_address || '';
      this.dataFile.productType = this.startRelaseParams.product_type || '';
      this.product_version_options = this.startRelaseParams.product_version_options || [];
      // 上次active
      if (this.startRelaseParams.tabIndex) {
        this.activeNames = this.startRelaseParams.tabIndex.toString() || '1';
      }
      if (this.startRelaseParams.perfectIndex) {
        this.perfectActiveNames = this.startRelaseParams.perfectIndex.toString() || '11';
      }
      if (this.startRelaseParams.quickIndex) {
        this.quickActiveNames = this.startRelaseParams.quickIndex.toString() || '21';
      }
      // 不是undefined再赋值
      this.showIndex = this.startRelaseParams.showIndex === undefined ? 11 : this.startRelaseParams.showIndex;
    },
  };
</script>

<style scoped>
  .dialog-footer {
    border-top: 1px solid rgb(153, 153, 153);
    height: 60px;
    position: absolute;
    width: 100%;
    bottom: 0;
    background: #fff;
    z-index: 999;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .el-select {
    width: 220px;
  }

  #ReleaseChoseRange {
    height: 100%;
  }

  #ReleaseChoseRange :deep(.el-tabs__nav) {
    height: 100%;
  }

  /*二级目录的位置*/
  #quick :deep(.el-tabs__nav),
  #perfect :deep(.el-tabs__nav) {
    height: 100%;
    margin-left: 125px;
    background-color: #ffffff;
  }

  #ReleaseChoseRange :deep(.el-tabs__header) {
    position: absolute;
    height: calc(100% - 81px);
    top: 1px;
  }

  /*整个高度*/
  #quick :deep(.el-tabs__header),
  #perfect :deep(.el-tabs__header) {
    position: absolute;
    height: 100%;
    top: 1px;
  }

  #ReleaseChoseRange :deep(.el-tabs__header) div {
    overflow: visible;
  }

  #ReleaseChoseRange :deep(.el-tabs__item) {
    border: none;
    background: #fff;
    border-radius: 5px;
  }

  #ReleaseChoseRange :deep(.el-tabs__item.is-active::after) {
    content: '';
    width: 20px;
    height: 20px;
    background-color: #0369fa;
    position: absolute;
    left: 112px;
    transform: rotate(45deg);
  }

  #quick :deep(.el-tabs__item.is-active::after),
  #perfect :deep(.el-tabs__item.is-active::after) {
    content: '';
    width: 20px;
    height: 20px;
    background-color: #0599fa;
    position: absolute;
    left: 125px;
    transform: rotate(45deg);
  }

  #ReleaseChoseRange :deep(.el-tabs__item.is-active) {
    background: #0369fa;
    color: #fff;
  }

  #quick :deep(.el-tabs__item.is-active),
  #perfect :deep(.el-tabs__item.is-active) {
    background: #0599fa;
    color: #fff;
  }

  #ReleaseChoseRange :deep(.el-tabs__nav > div) {
    display: flex;
    height: 33.3%;
    align-items: center;
    text-align: center;
    justify-content: center;
  }

  #quick :deep(.el-tabs__nav > div) ,
  #perfect :deep(.el-tabs__nav > div) {
    display: flex;
    height: 25%;
    left: 1px;
    align-items: center;
    text-align: center;
    justify-content: center;
  }

  #ReleaseChoseRange :deep(.el-tabs--left) ,
  #ReleaseChoseRange :deep(.el-tabs--right) {
    overflow: visible;
  }

  #ReleaseChoseRange :deep(.el-el-input__suffix:hover) {
    cursor: pointer;
  }

  #ReleaseChoseRange :deep(.el-tabs__content) {
    height: 100%;
  }

  #ReleaseChoseRange :deep(.city-list-wrapper) {
    top: -80px;
    left: 38px;
    z-index: 999;
  }

  #ReleaseChoseRange :deep(.city-list-wrapper .city-list-by-prov-container .prov-list .left a) {
    pointer-events: none;
    color: #999;
  }

  #ReleaseChoseRange :deep(.city-list-wrapper .city-list-by-prov-container .prov-list.default a) {
    pointer-events: none;
    color: #999;
  }

  #ReleaseChoseRange :deep(.city-list-wrapper .blue-color:hover) {
    cursor: pointer;
  }

  #ReleaseChoseRange :deep(.el-tab-pane) {
    height: 100%;
  }

  #ReleaseChoseRange :deep(.el-textarea__inner) {
    min-height: 150px !important;
    height: 150px !important;
  }

  .label-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    overflow: auto;
  }

  .label-wrap::-webkit-scrollbar {
    width: 0;
  }

  .label-wrap > div span {
    display: inline-block;
    width: 120px;
    text-align: right;
  }

  .label-wrap > div {
    margin-top: 50px;
  }

  .dialog-content {
    height: calc(100% - 80px);
  }

  .batch-tips {
    width: calc(100% - 300px);
    margin: 20px auto 0 180px;
    display: flex;
    justify-content: center;
    padding-left: 20px;
    font-weight: 600;
    font-size: 12px;
    color: #999;
  }
</style>
