<template>
  <!-- 分支详情 -->
  <div id="ProductDetailBranch">
    <div id="dataDiv">
      <el-form id="commitDiv">
        <el-form-item label="dataVersion：">
          <div style="display: inline-block;width:80% !important;">
            <t-steps theme="dot" readonly :onChange="onCurChanged" id="t-steps-div">
              <t-step-item
                v-for="item in stepItems"
                :key="item.dataVersion"
                :title="item.dataVersion"
                status="finish"
                class="t-step-item"
              ></t-step-item>
            </t-steps>
          </div>
        </el-form-item>
        <el-form-item label="">
          <span>当前页码: </span>
          <span>第{{ currentPageBranch / 10 + 1 }}页</span>
          <el-button type="primary" size="medium" v-if="currentPageBranch>0" @click="branchTagIdLoading(1)" class="button_style">上一页</el-button>
          <el-button type="primary" size="medium" v-else disabled class="button_style">上一页</el-button>
          <el-button type="primary" size="medium" v-if="currentPageBranch<totalBranch-10" @click="branchTagIdLoading(2)" class="button_style">下一页</el-button>
          <el-button type="primary" size="medium" v-else disabled class="button_style">下一页</el-button>
        </el-form-item>
        <div class="commitMsg" v-if="!!msg">
          <div id="msg">{{ msg }}</div>
          <div id="createTime">{{ createTime }}</div>
        </div>
      </el-form>
      <div style="display: inline-block">
        <span>产品库:</span>
        <span>{{ productId }}</span>
        <span v-if="typeId==='TAG'">TAG:</span>
        <span v-else>分支:</span>
        <span>{{ branchTagId }}</span>
        <el-button type="primary" size="medium" @click="createButton(1)" class="button_style">创建分支</el-button>
        <el-button type="primary" size="medium" @click="createButton(2)" id="tag" v-if="dataVersionPress" class="button_style">创建tag</el-button>
        <el-button type="primary" size="medium" @click="createButton(2)" id="tag" v-else disabled class="button_style">创建tag</el-button>
        <el-button type="primary" size="medium" @click="createButton(3)" class="button_style">创建部分分支</el-button>
      </div>
    </div>
    <!-- 对话框 -->
    <el-dialog
      :title="header"
      :visible="createVisible"
      @close="()=>{this.createVisible=false}"
      width="500px">
      <div style="word-break: break-all;margin-left: 10px">
        <el-form :data="createForm" :colon="false">
          <el-form-item label="分支名：" name="type" v-if="confirm!==2">
            <el-input v-model="createForm.branchName" placeholder="请输入分支名称" style="width: 300px"
                      clearable></el-input>
          </el-form-item>
          <el-form-item label="图幅列表：" name="mesh" v-if="confirm===3">
            <el-input v-model="createForm.mesh" @input="changeChar" placeholder="请输入图幅列表" style="width: 300px"
                      clearable></el-input>
          </el-form-item>
          <el-form-item label="TAG：" name="TAG" v-if="confirm===2">
            <el-input v-model="createForm.tag" placeholder="请输入TAG" style="width: 300px" clearable></el-input>
          </el-form-item>
          <el-form-item label="dataVersion：" name="dataVersion" v-if="confirm===2">
            <el-input
              v-model="createForm.dataVersion"
              @change="changeNum"
              placeholder="请输入数据版本"
              style="width: 300px"
              disabled
              clearable>
            </el-input>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="createVisible = false" center>取 消</el-button>
        <el-button type="primary" v-if="confirm===1" @click="createSetting()">提 交</el-button>
        <el-button type="primary" v-if="confirm===2" @click="createSetting()">提 交</el-button>
        <el-button type="primary" v-if="confirm===3" @click="createSetting()">提 交</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>


import {dateFormat} from "../../js/format_data.js";

const nioDataURL = window.api.nioDataURL;

export default {
  name: "ProductDetailBranch",
  // 接收父组件传来的参数
  props: {
    productId: String,
    branchTagId: String,
    typeId: String,
  },
  data() {
    return {
      msg: '',
      createTime: '',
      header: '创建分支',
      createVisible: false,
      createForm: {
        branchName: '',
        mesh: '',
        tag: '',
        dataVersion: ''
      },
      confirm: 1,
      stepItems: [],
      currentPageBranch: 0,
      totalBranch: 0,
      dataVersionValue: '',
      dataVersionPress: false,
      url: '',
    }
  },
  methods: {
    // 样式显示
    onCurChanged(cur, pre, context) {
      this.current = cur;
      let divs = document.getElementsByClassName('t-step-item');
      for (let i = 0, length = divs.length; i < length; i++) {
        let btn = divs[i];
        // 初始化
        btn.children[0].children[1].children[0].style.color = 'rgba(0,0,0,0.9)';
        // 回调函数，在之后的某个时刻才会调用；不是for循环的时候就随着循环执行
        btn.onclick = () => {
          divs[i].children[0].children[1].children[0].style.color = 'red';
          // tag按钮是否显示
          this.dataVersionPress = false;
          for (let v of this.stepItems) {
            if (divs[i].children[0].children[1].children[0].innerHTML === v.dataVersion) {
              this.msg = v.commitMsg;
              this.createTime = dateFormat(v.createTime);
              this.dataVersionValue = v.dataVersion;
              this.dataVersionPress = true;
            }
          }
        }
      }
    },
    // 输入控制
    changeChar() {
      // 输入匹配，输入限制
      this.createForm.mesh = this.createForm.mesh.replace(/，/ig, ',').replace(/[\s]*[,][\s]*[,]{1,}([\s]+|[,]+)*/, ',');
    },
    //数字检查函数
    changeNum() {
      // 数字
      this.createForm.dataVersion = this.createForm.dataVersion.replace(/[^\d]/g, '');
    },
    createButton(val) {
      this.createVisible = true;
      if (val === 1) {
        this.header = '创建分支';
        this.confirm = 1;
      } else if (val === 2) {
        this.createForm.dataVersion = this.dataVersionValue;
        this.header = '创建tag';
        this.confirm = 2;
      } else {
        this.header = '创建部分分支';
        this.confirm = 3;
      }
    },
    createSetting() {
      let urlData = new FormData();
      // 选择了DataVersion
      if (this.dataVersionPress) {
        // 创建分支
        if (this.confirm === 1) {
          this.url = '/product/branch/create-with-version';
          urlData.append("productIdentity", this.productId);
          urlData.append("branchName", this.createForm.branchName);
          urlData.append("parentBranchName", this.branchTagId);
          urlData.append("dataVersion", parseInt(this.dataVersionValue));
          if (this.createForm.branchName !== '') {
            this.createFun(urlData);
          } else {
            this.$message({
              type: 'warning',
              message: '分支名为空',
              showClose: true,
            });
          }
          // 创建tag
        } else if (this.confirm === 2) {
          this.url = '/product/tag/create-with-version';
          urlData.append("productIdentity", this.productId);
          urlData.append("branchName", this.branchTagId);
          urlData.append("tagName", this.createForm.tag);
          urlData.append("dataVersion", parseInt(this.createForm.dataVersion));
          if (this.createForm.tag !== '') {
            this.createFun(urlData)
          } else {
            this.$message({
              type: 'warning',
              message: 'tag为空',
              showClose: true,
            });
          }
        } else if (this.confirm === 3) {
          this.url = '/product/partial-branch/create-with-version';
          let meshList = []
          if (this.createForm.mesh[this.createForm.mesh.length - 1] === ',') {
            meshList = this.createForm.mesh.length > 0 ? this.createForm.mesh.slice(0, -1).split(',') : []
          } else {
            meshList = this.createForm.mesh.length > 0 ? this.createForm.mesh.split(',') : []
          }
          let meshListAll = [];
          for (let v of meshList) {
            meshListAll.push(
              {"layerIdentity": "features", "partitionName": v}
            )
          }
          urlData.append("productIdentity", this.productId);
          urlData.append("branchName", this.createForm.branchName);
          urlData.append("parentBranchName", this.branchTagId);
          urlData.append("partitionList", JSON.stringify(meshListAll));
          urlData.append("dataVersion", this.dataVersionValue);
          if (meshListAll.length !== 0) {
            this.createFun(urlData);
          } else {
            this.$message({
              type: 'warning',
              message: '图幅数据为空',
              showClose: true,
            });
          }
        }
      } else {
        // 未选择DataVersion，按照最新的DataVersion
        // 创建分支
        if (this.confirm === 1) {
          this.url = '/branch/create'
          urlData.append("productIdentity", this.productId);
          urlData.append("branchName", this.createForm.branchName);
          urlData.append("parentBranchName", this.branchTagId);
          if (this.createForm.branchName !== '') {
            this.createFun(urlData)
          } else {
            this.$message({
              type: 'warning',
              message: '分支名为空',
              showClose: true,
            });
          }
        } else if (this.confirm === 3) {
          this.url = '/product/branch/create-with-partitions';
          let meshList = [];
          if (this.createForm.mesh[this.createForm.mesh.length - 1] === ',') {
            meshList = this.createForm.mesh.length > 0 ? this.createForm.mesh.slice(0, -1).split(',') : [];
          } else {
            meshList = this.createForm.mesh.length > 0 ? this.createForm.mesh.split(',') : [];
          }
          let meshListAll = [];
          for (let v of meshList) {
            meshListAll.push({"layerIdentity": "features", "partitionName": v});
          }
          urlData.append("productIdentity", this.productId);
          urlData.append("branchName", this.createForm.branchName);
          urlData.append("parentBranchName", this.branchTagId);
          urlData.append("partitionList", JSON.stringify(meshListAll));
          if (meshListAll.length !== 0) {
            this.createFun(urlData)
          } else {
            this.$message({
              type: 'warning',
              message: '图幅数据为空',
              showClose: true,
            });
          }
        }
      }
      this.createVisible = false;
    },
    createFun(urlData) {
      this.$axios({
        url: nioDataURL + this.url,
        method: 'post',
        data: urlData
      }).then(response => {
        if (response.data.code === 200) {
          this.$message({
            type: 'success',
            message: this.header + '成功',
            showClose: true,
          });
        } else {
          this.$message({
            type: 'error',
            message: response.data.msg,
            showClose: true,
          });
        }
      }).catch(() => {
        this.$message({
          type: 'error',
          message: this.header + '失败',
          showClose: true,
        });
      })
    },
    branchTagIdLoading(val) {
      if (val === 1) {
        this.currentPageBranch -= 10
      } else if (val === 2) {
        this.currentPageBranch += 10
      }
      let data = new FormData();
      data.append("productIdentity", this.productId);
      data.append("branchName", this.branchTagId);
      data.append("offset", this.currentPageBranch);
      data.append("limit", 10);
      if (this.currentPageBranch > -1) {
        this.$axios({
          url: nioDataURL + '/product/data-version/list',
          method: 'post',
          data: data
        }).then(response => {
          if (response.data.code === 200) {
            this.totalBranch = response.data.data.totalCount
            if (this.totalBranch === 0) {
              this.$message({
                type: 'warning',
                message: '没有dataVersion数据',
                showClose: true,
              });
            }
            if (this.currentPageBranch === 0) {
              // 获取最新的dataVersionValue
              this.dataVersionValue = response.data.data.dataVersions[0].dataVersion
            }
            this.stepItems = response.data.data.dataVersions
            for (let v of this.stepItems) {
              v.dataVersion = v.dataVersion.toString()
            }
          } else {
            this.$message({
              type: 'error',
              message: response.data.msg,
              showClose: true,
            });
          }
        }).catch(() => {
          this.$message({
            type: 'error',
            message: '没有获取到dataVersion数据',
            showClose: true,
          });
        })
      }
    },
  },
  created() {
    this.branchTagIdLoading()
  }
}
</script>

<style scoped>
.commitMsg {
  display: flex;
  margin: 20px 0;
}

.commitMsg > div::before {
  color: #606266;
  font-size: 14px;
  font-weight: 700;
  margin-right: 8px;
}

#msg::before {
  content: "commitMsg：";
}

#createTime {
  margin-left: 35px;
}

#createTime::before {
  content: "createTime：";
}

#ProductDetailBranch {
  margin: 5px 20px 10px 20px;
  height: calc(100% - 40px);
  font-size: 14px;
}

#dataDiv {
  position: absolute;
  width: calc(100% - 40px) !important;
  height: auto;
}


#t-steps-div {
  overflow-x: scroll;
  margin: 0 60px 0 0;
}

#commitDiv {
  margin: 10px 5px 0 0;
}

.button_style {
  margin-left: 10px;
}

/*三角形*/
.leftCaret, .rightCaret {
  display: inline-block;
  position: relative;
  height: 0;
  width: 0;
  border-top: 20px solid transparent;
  border-bottom: 20px solid transparent;
  margin: 50px 20px 20px 20px;
}

.leftCaret {
  border-right: 20px solid red;
}

.rightCaret {
  border-left: 20px solid red;
  position: fixed;
  right: 10px
}

</style>
