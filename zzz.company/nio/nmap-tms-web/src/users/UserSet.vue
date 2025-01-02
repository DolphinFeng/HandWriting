<template>
  <div id="UserSet" class="component">
    <!-- 搜索工具栏组件 -->
    <ToolBar
      :token="token"
      :form="form"
      :skillModelOptions="skillModelOptions"
      :levelOptions="levelOptions"
      :skillOptions="skillOptions"
      :supplierOptions="supplierOptions"
      :userStatusOptions="userStatusOptions"
      :userShow="userShow"
      :selectedRowKeys="selectedRowKeys"
      @changeChar="changeChar"
      @onSearch="onSearch"
      @resetForm="resetForm"
      @handleMulUpdate="handleMulUpdate"
      @handleAdd="handleAdd"
      @loadingPage="loadingPage"
    ></ToolBar>
    <!-- 主表格信息 -->
    <div id="table" class="table">
      <div id="tTableContainer" class="table-container">
        <el-table
          :data="tableData"
          :row-key="rowKey"
          :max-height="table_height"
          @selection-change="handleSelectionChange"
          border
        >
          <el-table-column type="selection" width="60" align="center" fixed="left"></el-table-column>
          <el-table-column label="用户编码" prop="id" width="110" align="center" show-overflow-tooltip></el-table-column>
          <el-table-column label="姓名" prop="realName" width="180" align="center" show-overflow-tooltip></el-table-column>
          <el-table-column label="角色" prop="roleNameStr" width="180" align="center" show-overflow-tooltip></el-table-column>
          <el-table-column label="账号" prop="userName" width="170" align="center" show-overflow-tooltip></el-table-column>
          <el-table-column label="水平" prop="level" width="90" align="center"></el-table-column>
          <el-table-column label="供应商" prop="supplier" width="190" align="center" show-overflow-tooltip></el-table-column>
          <el-table-column label="技能" prop="skillCodeName" width="350" align="center" show-overflow-tooltip></el-table-column>
          <el-table-column label="入职时间" prop="entryTime" width="160" align="center" show-overflow-tooltip></el-table-column>
          <el-table-column label="在职状态" prop="userStatus" width="110" align="center">
            <template #default="scope">
              <div v-if="scope.row.userStatus === 0" class="job">在职</div>
              <div v-if="scope.row.userStatus === 1" class="job job-leave">离职</div>
            </template>
          </el-table-column>
          <el-table-column label="邮箱" prop="email" width="200" align="center"></el-table-column>
          <el-table-column label="账号状态" prop="numberStatusName" width="110" align="center"></el-table-column>
          <el-table-column label="操作" fixed="right" prop="id" width="120" align="center">
            <template #default="scope">
              <el-button link type="primary" size="small" @click="handleUpdate(scope.row)" v-if="userShow.userSingleShow">修改</el-button>
              <el-button link type="success" size="small" @click="passwordReset(scope.row)" v-if="userShow.userResetShow">重置</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- 分页组件 -->
      <div style="padding-top: 10px" class="pagination-container">
        <el-pagination
          background
          :total="total"
          :page-size="pageSize"
          v-model="currentPage"
          :page-sizes=[5,10,20,50]
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
          layout="total,sizes,prev,pager,next,jumper"
        >
        </el-pagination>
      </div>
    </div>
    <!-- 用户新增对话框 -->
    <el-dialog
      title="用户新增"
      v-model="personasVisible"
      @close="()=>{this.personasVisible=false}"
      style="z-index: 10"
      width="600px">
      <div style="word-break: break-all;margin:10px 20px">
        <el-form :model="personasForm" ref="personasForm" :colon="false" label-position="right" label-width="100px" :rules="rules">
          <el-form-item prop="realName" label="用户姓名：" style="text-align: left" name="realName">
            <el-input v-model="personasForm.realName" @change="changeChar(3)" placeholder="请输入用户姓名" clearable style="width: 300px"></el-input>
          </el-form-item>
          <el-form-item prop="roleIds" label="角色：" name="roleIds">
            <el-select v-model="personasForm.roleIds" multiple placeholder="请选择角色" clearable style="width: 300px">
              <el-option
                v-for="item in skillModelOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item prop="userName" label="账号：" name="userName">
            <el-input v-model="personasForm.userName" @change="changeChar(4)" placeholder="请输入账号" clearable style="width: 300px"></el-input>
          </el-form-item>
          <el-form-item prop="supplier" label="供应商：" name="supplier">
            <el-select v-model="personasForm.supplier" placeholder="请选择供应商" clearable style="width: 300px">
              <el-option
                v-for="item in supplierOptions"
                :key="item.code"
                :label="item.name"
                :value="item.code">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item prop="skill_list" label="技能：" name="skill_list">
            <el-select v-model="personasForm.skill_list" multiple placeholder="请选择用户技能" clearable style="width: 300px">
              <el-option
                v-for="item in skillOptions"
                :key="item.code"
                :label="item.name"
                :value="item.code">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item prop="level" label="水平：" name="level">
            <el-select v-model="personasForm.level" placeholder="请选择用户水平" style="width: 300px" clearable>
              <el-option
                v-for="item in levelOptions"
                :key="item.code"
                :label="item.name"
                :value="item.code">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item prop="entryTime" label="入职时间：" name="entryTime">
            <el-date-picker
              v-model="personasForm.entryTime"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 300px"
              placeholder="请选择入职日期">
            </el-date-picker>
          </el-form-item>
          <el-form-item prop="email" label="邮箱：" name="email">
            <el-input v-model="personasForm.email" @change="changeChar(4)" placeholder="请输入邮箱" clearable style="width: 300px"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <template #footer class="dialog-footer">
        <el-button @click="personasVisible = false" center>取 消</el-button>
        <el-button type="primary" @click="addConfirm" :disabled="is_add_disabled">增 加</el-button>
      </template>
    </el-dialog>
    <!-- 修改用户信息对话框 -->
    <el-dialog
      title="修改用户信息"
      v-model="singleVisible"
      @close="()=>{this.singleVisible=false}"
      style="z-index: 10"
      width="760px">
      <div style="word-break: break-all;margin:10px 20px">
        <UserSingle
          :personasForm="personasForm"
          :rules="rules"
          :supplierOptions="supplierOptions"
          :levelOptions="levelOptions"
          :userStatusOptions="userStatusOptions"
          :skillModelOptions="skillModelOptions"
          :skillOptions="skillOptions"
          :numberStatusOptions="numberStatusOptions"
          :numberStatusDisabled="numberStatusDisabled"
          @changeChar="changeChar"
          @changeNumberStatus="changeNumberStatus"
        ></UserSingle>
      </div>
      <template #footer class="dialog-footer">
        <el-button @click="singleVisible = false" center>取 消</el-button>
        <el-button type="primary" @click="preSingle" :disabled="is_disabled">确 定</el-button>
      </template>
    </el-dialog>
    <!-- 多条用户信息修改对话框 -->
    <el-dialog
      title="多条用户信息修改"
      v-model="personasMulVisible"
      @close="()=>{this.personasMulVisible=false}"
      style="z-index: 10"
      width="600px"
    >
      <div style="word-break: break-all;margin:10px 20px">
        <el-form :model="multipleForm" ref="multipleForm" label-position="right" label-width="120px">
          <el-form-item label="用户编码：" name="idStr">
            <div style="width: 300px" class="input_dis">{{ multipleForm.idStr }}</div>
          </el-form-item>
          <el-form-item label="角色：" name="roleIds">
            <el-select v-model="multipleForm.roleIds" multiple placeholder="请选择角色" clearable style="width: 300px">
              <el-option
                v-for="item in skillModelOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="技能：" name="skill_mul_list">
            <el-select v-model="skill_mul_list" multiple placeholder="请选择用户技能" clearable style="width: 300px">
              <el-option
                v-for="item in skillOptions"
                :key="item.code"
                :label="item.name"
                :value="item.code">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="水平：" name="level">
            <el-select v-model="multipleForm.level" placeholder="请选择用户水平" style="width: 300px" clearable>
              <el-option
                v-for="item in levelOptions"
                :key="item.code"
                :label="item.name"
                :value="item.code">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="供应商：" name="supplier">
            <el-select v-model="multipleForm.supplier" placeholder="请选择供应商" clearable style="width: 300px">
              <el-option
                v-for="item in supplierOptions"
                :key="item.code"
                :label="item.name"
                :value="item.code">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="在职状态：" name="userStatus">
            <el-select v-model="multipleForm.userStatus" placeholder="请选择在职状态" style="width: 300px" clearable>
              <el-option
                v-for="item in userStatusOptions"
                :key="item.code"
                :label="item.name"
                :value="item.code">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <template #footer class="dialog-footer">
        <el-button @click="personasMulVisible = false" center>取 消</el-button>
        <el-button type="primary" @click="preMultiple" :disabled="is_mul_disabled">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
// 引入js数据
import {
  multipleForm,
  personasForm,
  levelOptions,
  supplierOptions,
  numberStatusOptions
} from "../js/user_data";
// 引入需要的组件
import ToolBar from "./ToolBar.vue";
import UserSingle from "./UserSingle.vue";
import axios from "axios";
import {ElMessage} from "element-plus";

const nioUrl = window.api.apiNioURL;
if (nioUrl === null || nioUrl === undefined) {
  console.log("获取niourl失败" + nioUrl)
}

let timer, lastTime;
let now = +new Date();
export default {
  name: "UserSet",
  // 组件注册
  components: {
    ToolBar,
    UserSingle,
  },
  data() {
    return {
      token: '',
      rowKey: 'id',
      selectedRowKeys: [],
      // 表格数据
      tableData: [],
      table_height: 0,
      // 设置表单的填写规则
      rules: {
        realName: [
          {required: true, message: '姓名必填', trigger: 'change'},
        ],
        userName: [
          {required: true, message: '账号必填', trigger: 'change'},
        ],
        roleIds: [
          {required: true, message: '角色必选', trigger: 'change'},
        ],
        supplier: [
          {required: true, message: '供应商必填', trigger: 'change'},
        ],
        level: [
          {required: true, message: '水平必填', trigger: 'change'},
        ],
        skill_list: [
          {required: true, message: '技能必选', trigger: 'change'},
        ],
        entryTime: [
          {required: true, message: '入职时间必填', trigger: 'change'},
        ],
        email: [
          {required: true, message: '邮箱、必填', trigger: 'change'},
        ],
      },
      form: {
        page: '',
        rows: '',
        roleIds: [],
        userName: '',
        realName: '',
        skillCode: '',
        userStatus: '',
        supplier: '',
        level: '',
        entryTimeBegin: '',
        entryTimeEnd: '',
        email:''
      },
      personasForm: personasForm,
      multipleForm: multipleForm,
      levelOptions: levelOptions,
      supplierOptions: supplierOptions,
      skillModelOptions: [],
      skillOptions: [],
      userStatusOptions: [],
      numberStatusOptions: numberStatusOptions,
      personasVisible: false,
      singleVisible: false,
      personasMulVisible: false,
      numberStatusDisabled: false,
      skill_mul_list: [],
      userShow: {
        userSearchShow: false,
        userMultipleShow: false,
        userSingleShow: false,
        userAddShow: false,
        userUploadShow: false,
        exportShow: false,
        userResetShow: false,
      },
      // 表格当前页码
      currentPage: 1,
      // 每次表格展示多少条信息
      pageSize: 20,
      // 表格总条数
      total: 0,
      is_add_disabled: false,
      is_disabled: false,
      is_mul_disabled: false,
    }
  },
  methods: {
    //表格多选
    handleSelectionChange(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys;
    },
    //特殊字符检查
    changeChar(val) {
      switch (val) {
        case 1:
          //中文英文数字
          this.form.realName = this.form.realName.replace(/[^\a-zA-Z0-9_\u4E00-\u9FA5]/g, '');
          break;
        case 2:
          this.form.userName = this.form.userName.replace(/[^\a-zA-Z0-9_]/g, '');
          break;
        case 3:
          //英文数字
          this.personasForm.realName = this.personasForm.realName.replace(/[^\a-zA-Z0-9\u4E00-\u9FA5]/g, '');
          break;
        case 4:
          this.personasForm.userName = this.personasForm.userName.replace(/[^\a-zA-Z0-9_]/g, '');
        case 5:
          this.personasForm.email = this.personasForm.email.replace(/^\s+|\s+$/g,"").toLowerCase();
      }
    },
    // userStatus值控制numberStatus的值
    changeNumberStatus() {
      this.numberStatusDisabled = this.personasForm.userStatus === 1
      this.personasForm.numberStatus = this.personasForm.userStatus === 1 ? 1 : 0
    },
    //增加
    handleAdd() {
      this.is_add_disabled = false;
      this.personasVisible = true;
      this.personasForm = {
        id: '',
        realName: '',
        roleIds: [],
        skillCode: '',
        level: '',
        userStatus: 1,
        numberStatus: 0,
        supplier: '',
        userName: '',
        entryTime: '',
        skill_list: [],
        email:''
      };
    },
    addConfirm() {
      //数据处理
      this.personasForm.skillCode = 0;
      for (let i in this.personasForm.skill_list) {
        if (this.personasForm.skill_list.hasOwnProperty(i)) {
          this.personasForm.skillCode = this.personasForm.skillCode + Math.pow(2, this.personasForm.skill_list[i])
        }
      }
      //  判断必填项
      if (this.personasForm.realName !== '' && this.personasForm.userName !== '' && this.personasForm.roleIds.length !== 0
          && this.personasForm.skillCode !== '' && this.personasForm.entryTime !== '' && this.personasForm.supplier !== ''
          && this.personasForm.level !== '' && this.personasForm.email !== '') {
        this.is_add_disabled = true;
        axios({
          url: nioUrl + '/user/v1/add',
          method: 'post',
          data: this.personasForm,
          headers: {'Authorization': this.token},
        }).then(response => {
          if (response.data.code === 0) {
            ElMessage.success({
              message: '增加成功',
              showClose: true,
            });
            this.personasVisible = false;
            this.loadingPage()
          } else {
            this.is_add_disabled = false;
            ElMessage.error({
              message: response.data.msg,
              showClose: true,
            });
          }
        }).catch(() => {
          this.is_add_disabled = false;
          ElMessage.error({
            message: '增加失败',
            showClose: true,
          });
        });
      } else {
        ElMessage.warning({
          message: '有必填项未填',
          showClose: true,
        });
      }
    },
    //修改
    handleUpdate(row) {
      this.is_disabled = false;
      this.numberStatusDisabled = row.userStatus === 1
      this.personasForm = {
        id: '',
        realName: '',
        roleIds: [],
        skillCode: '',
        level: '',
        userStatus: '',
        numberStatus: '',
        supplier: '',
        userName: '',
        entryTime: '',
        skill_list: [],
        email:''
      };
      for (let i in row.roleList) {
        this.personasForm.roleIds.push(row.roleList[i].id)
      }
      this.singleVisible = true;
      let skillCode = parseInt(row.skillCode).toString(2);
      skillCode = skillCode.split('').reverse();
      for (let i in skillCode) {
        if (skillCode[i] === '1') {
          this.personasForm.skill_list.push(parseInt(i))
        }
      }
      for (let i in row) {
        if (row.hasOwnProperty(i)) {
          for (let j in this.personasForm) {
            if (i === j) {
              this.personasForm[j] = row[i]
            }
          }
        }
      }
    },
    preSingle() {
      if (this.personasForm.realName !== '' && this.personasForm.roleIds.length !== 0) {
        this.updateConfirm()
      } else {
        ElMessage.warning({
          message: '有必填项未填',
          showClose: true,
        });
      }
    },
    updateConfirm() {
      if (this.personasForm.skill_list.length !== 0) {
        this.personasForm.skillCode = 0;
        for (let i in this.personasForm.skill_list) {
          if (this.personasForm.skill_list.hasOwnProperty(i)) {
            this.personasForm.skillCode = this.personasForm.skillCode + Math.pow(2, this.personasForm.skill_list[i])
          }
        }
      } else {
        this.personasForm.skillCode = null;
      }
      //  判断必填项
      this.is_disabled = true;
      axios({
        url: nioUrl + '/user/v1/update',
        method: 'post',
        data: {
          ids: [this.personasForm.id],
          realName: this.personasForm.realName,
          roleIds: this.personasForm.roleIds,
          skillCode: this.personasForm.skillCode,
          level: this.personasForm.level,
          userStatus: this.personasForm.userStatus,
          numberStatus: this.personasForm.numberStatus,
          supplier: this.personasForm.supplier,
          email: this.personasForm.email
        },
        headers: {'Authorization': this.token},
      }).then(response => {
        if (response.data.code === 0) {
          ElMessage.success({
            message: '修改成功',
            showClose: true,
          });
          this.singleVisible = false;
          this.loadingPage()
        } else {
          this.is_disabled = false;
          ElMessage.error({
            message: response.data.msg,
            showClose: true,
          });
        }
      }).catch(() => {
        this.is_disabled = false;
        ElMessage.error({
          message: '修改失败',
          showClose: true,
        });
      });
    },
    //重置密码
    passwordReset(row) {
      axios({
        url: nioUrl + '/user/v1/resetPassword',
        method: 'post',
        data: {'userId': row.id},
        headers: {'Authorization': this.token},
      }).then(response => {
        if (response.data.code === 0) {
          ElMessage.success({
            message: '该用户重置密码成功',
            showClose: true,
          });
          this.loadingPage()
        } else {
          ElMessage.error({
            message: response.data.msg,
            showClose: true,
          });
        }
      }).catch(() => {
        ElMessage.error({
          message: '该用户重置密码失败',
          showClose: true,
        });
      });
    },
    handleMulUpdate() {
      //未选择用户时不触发多条修改
      if (this.selectedRowKeys.length === 0) {
        ElMessage.info({
          message: '未选择用户',
          showClose: true,
        });
        return;
      }
      this.is_mul_disabled = false;
      this.skill_mul_list = [];
      this.personasMulVisible = true;
      this.multipleForm = {
        idStr: '',
        roleIds: [],
        skillCode: '',
        level: '',
        userStatus: '',
        numberStatus: '',
        supplier: '',
      };
      const idList = [];
      this.selectedRowKeys.forEach(item => {
        idList.push(item.id);
      });
      this.multipleForm.idStr = idList.join(',');
    },
    preMultiple() {
      if (this.selectedRowKeys.length !== 0) {
        if (this.multipleForm.roleIds.length === 0 && this.multipleForm.level === '' && this.multipleForm.supplier === '' && this.multipleForm.userStatus === '' && this.skill_mul_list.length === 0) {
          ElMessage.warning({
            message: '选填项不能全为空',
            showClose: true,
          });
        } else {
          this.MulUpdateComfirm();
        }
      } else {
        this.multipleVisible = true;
        ElMessage.warning({
          message: '用户编码列表为空',
          showClose: true,
        });
      }
    },
    MulUpdateComfirm() {
      this.personasMulVisible = false;
      if (this.skill_mul_list.length !== 0) {
        this.multipleForm.skillCode = 0;
        for (let i in this.skill_mul_list) {
          if (this.skill_mul_list.hasOwnProperty(i)) {
            this.multipleForm.skillCode = this.multipleForm.skillCode + Math.pow(2, this.skill_mul_list[i])
          }
        }
      } else {
        this.multipleForm.skillCode = null;
      }
      this.is_mul_disabled = true;
      axios({
        url: nioUrl + '/user/v1/update',
        method: 'post',
        data: {
          ids: this.selectedRowKeys.map(item => {
            return item.id;
          }),
          realName: '',
          roleIds: this.multipleForm.roleIds,
          skillCode: this.multipleForm.skillCode,
          level: this.multipleForm.level,
          userStatus: this.multipleForm.userStatus,
          numberStatus: this.multipleForm.numberStatus,
          supplier: this.multipleForm.supplier,
        },
        headers: {'Authorization': this.token},
      }).then(response => {
        if (response.data.code === 0) {
          ElMessage.success({
            message: this.multipleForm.idStr + '修改成功',
            showClose: true,
          });
          this.is_mul_disabled = true;
          this.loadingPage()
        } else {
          this.is_mul_disabled = false;
          ElMessage.error({
            message: response.data.msg,
            showClose: true,
          });
        }
      }).catch(() => {
        this.is_mul_disabled = false;
        ElMessage.error({
          message: '修改失败',
          showClose: true,
        });
      });
    },
    onSearch(dateVal, skill) {
      this.selectedRowKeys = [];
      dateVal = dateVal === null ? '' : dateVal;
      if (dateVal.length !== 0) {
        this.form.entryTimeBegin = dateVal[0]
        this.form.entryTimeEnd = dateVal[1]
      } else {
        this.form.entryTimeBegin = ''
        this.form.entryTimeEnd = ''
      }
      this.currentPage = 1;
      this.loadingPage(skill)
    },
    // 重置功能
    resetForm() {
      this.form = {
        realName: '',
        roleIds: [],
        userName: '',
        skillCode: '',
        userStatus: '',
        supplier: '',
        level: '',
        entryTimeBegin: '',
        entryTimeEnd: '',
        email:''
      };
    },
    // 表格size改变时触发函数
    handleSizeChange(page_size) {
      this.pageSize = page_size;
      this.loadingPage()
    },
    // 表格当前页码改变时触发函数
    handleCurrentChange(page) {
      this.currentPage = page;
      this.loadingPage()
    },
    loadingPage(skill) {
      skill = skill || [];
      this.form.page = this.currentPage - 1;
      this.form.rows = this.pageSize;
      if (skill.length !== 0) {
        this.form.skillCode = 0;
        for (let i in skill) {
          if (skill.hasOwnProperty(i)) {
            this.form.skillCode = this.form.skillCode + Math.pow(2, skill[i])
          }
        }
      } else {
        this.form.skillCode = ''
      }
      axios({
        url: nioUrl + '/user/v1/query',
        method: 'post',
        data: this.form,
        headers: {'Authorization': this.token},
      }).then(response => {
        if (response.data.code === 0) {
          this.tableData = response.data.data.list;
          for (let i in this.tableData) {
            // 字段的值整理成文字显示
            if (this.tableData.hasOwnProperty(i)) {
              for (let j in this.numberStatusOptions) {
                if (this.tableData[i].numberStatus === this.numberStatusOptions[j].code) {
                  this.tableData[i].numberStatusName = this.numberStatusOptions[j].name
                }
              }
            }
          }
          this.total = response.data.data.total;
          if (this.total === 0) {
            ElMessage.warning({
              message: '没有符合查询条件的数据',
              showClose: true,
            });
          }
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
      });
    },
    // 获取所需select选项的数据源
    getData() {
      //在职状态数据集
      axios({
        url: nioUrl + '/config/v1/dict',
        method: 'post',
        data: {"code": 10}
      }).then(response => {
        if (response.data.code === 0) {
          this.userStatusOptions = response.data.data
        } else {
          ElMessage.error({
            message: '在职状态获取失败',
            showClose: true,
          });
        }
      }).catch(() => {
        ElMessage.error({
          message: '在职状态获取失败',
          showClose: true,
        });
      });
      //角色数据集
      axios({
        url: nioUrl + '/user/v1/queryAllRole',
        method: 'post',
        data: {"roleName": ''},
        headers: {'Authorization': this.token},
      }).then(response => {
        if (response.data.code === 0) {
          this.skillModelOptions = response.data.data
        } else {
          ElMessage.error({
            message: '角色获取失败',
            showClose: true,
          });
        }
      }).catch(() => {
        ElMessage.error({
          message: '角色获取失败',
          showClose: true,
        });
      });
      //技能数据集
      axios({
        url: nioUrl + '/config/v1/dict',
        method: 'post',
        data: {"code": 12}
      }).then(response => {
        if (response.data.code === 0) {
          this.skillOptions = response.data.data
        } else {
          ElMessage.error({
            message: '技能获取失败',
            showClose: true,
          });
        }
      }).catch(() => {
        ElMessage.error({
          message: '技能获取失败',
          showClose: true,
        });
      });
    },
    // 设置表格的最大高度
    adaptiveTableHeight() {
      this.table_height = document.getElementById('tTableContainer') === null ? 0 : document.getElementById('tTableContainer').offsetHeight;
    },
    reLoad() {
      this.promission = localStorage.getItem('promission');
      setTimeout(() => {
        this.isShow()
      }, 5)
    },
    isShow() {
      this.userShow = {
        userSearchShow: false,
        userMultipleShow: false,
        userSingleShow: false,
        userAddShow: false,
        userUploadShow: false,
        exportShow: false,
        userResetShow: false,
      }
      // 判断是否显示按钮
      if (this.promission.length !== 0) {
        if (this.promission.indexOf(21) !== -1) {
          this.userShow.userSearchShow = true
        }
        if (this.promission.indexOf(22) !== -1) {
          this.userShow.userMultipleShow = true
        }
        if (this.promission.indexOf(23) !== -1) {
          this.userShow.userSingleShow = true
        }
        if (this.promission.indexOf(24) !== -1) {
          this.userShow.userAddShow = true
        }
        if (this.promission.indexOf(25) !== -1) {
          this.userShow.userUploadShow = true
        }
        if (this.promission.indexOf(26) !== -1) {
          this.userShow.userResetShow = true
        }
        if (this.promission.indexOf(46) !== -1) {
          this.userShow.exportShow = true
        }
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.adaptiveTableHeight()
    })
    window.addEventListener('resize', this.adaptiveTableHeight, false)
    this.token = localStorage.getItem('token');
    if (this.token && this.token.length !== 0) {
      setTimeout(() => {
        this.loadingPage()
        this.getData()
        this.reLoad()
      }, 5);
    } else {
      console.error('Token is missing or invalid');
    }
  }
}
</script>

<style scoped>
.t-form-item {
  padding-right: 114px !important;
}

.t-form__label {
  padding-right: 2px !important;
  margin-right: 2px;
}

.t-form__item {
  margin-bottom: 1px;
}

.job{
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
}
.job::before{
  content: "";
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 4px;
  background-color: #00FF38;
}
.job-leave::before{
  background-color: red!important;
}

#tTableContainer :deep(.t-table-pagination) {
  display: none;
}

.el-form-item {
  margin-bottom: 16px;
}

</style>
