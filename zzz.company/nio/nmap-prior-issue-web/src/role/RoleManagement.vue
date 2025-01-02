<template>
  <div id="RoleManagement">
    <!-- 搜索工具栏 -->
    <div id="tool">
      <el-form inline :model="form" ref="form" @submit.prevent="onSearch">
        <el-form-item label="角色名称:" name="roleName">
          <el-select
            v-model="form.roleName"
            placeholder="请选择角色名称"
            style="width: 220px"
            filterable
            clearable
            size="small"
          >
            <el-option
              v-for="item in name_options"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="" style="" name="button">
          <el-button :icon="Search" type="primary" class="button_style" native-type="submit" v-if="roleShow.roleSearchShow">查询</el-button>
          <el-button :icon="Refresh" class="button_style" @click="form.roleName=''" v-if="roleShow.roleSearchShow">重置</el-button>
          <el-button :icon="FolderAdd" type="success" style="" @click="handleAdd('add')" v-if="roleShow.roleAddShow">新建</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!-- 主表格信息 -->
    <div id="table" :style="tableContainerHeight">
      <div id="tTableContainer">
        <el-table :data="tableData" :max-height="table_height" border>
          <template v-for="item in columns">
            <el-table-column :label="item.label" align="center" :prop="item.prop" :width="item.width"></el-table-column>
          </template>
          <el-table-column label="操作" prop="" align="center" width="240">
            <template #default="scope">
              <el-button type="primary" link size="small" @click="handlePermission(scope.row)" v-if="roleShow.roleSetingShow">权限设置</el-button>
              <el-button type="success" link size="small" @click="handleAdd('edit',scope.row)" v-if="roleShow.roleUpdateShow">编辑</el-button>
              <el-button type="danger" link size="small" @click="handleDelete(scope.row)" v-if="roleShow.roleDeleteShow">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- 分页组件 -->
      <div style="padding-top: 10px" class="tPaginationContainer">
        <el-pagination
          background
          :total="total"
          :page-size="pageSize"
          v-model="currentPage"
          :page-sizes=[5,10,20,50,100]
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
          layout="total,sizes,prev,pager,next,jumper"
        >
        </el-pagination>
      </div>
    </div>
    <!-- 对话框 -->
    <el-dialog
      :title="header"
      v-model="addVisible"
      @close="()=>{this.addVisible=false}"
      width="350px">
      <div style="word-break: break-all;">
        <el-form :model="roleForm" ref="roleForm" label-position="right" inline label-width="100px">
          <el-form-item label="角色名称:" name="name" style="margin: 0">
            <el-input v-model="roleForm.roleName" @change="changeChar" placeholder="请输入角色名称"
                     clearable style="max-width: 260px"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <template #footer class="dialog-footer">
        <el-button @click="addVisible = false">取 消</el-button>
        <el-button type="primary" @click="addFun" v-if="isAdd">确 定</el-button>
        <el-button type="primary" @click="editFun" v-else>确 定</el-button>
      </template>
    </el-dialog>
    <!-- 权限设置对话框 -->
    <el-dialog
      title="权限设置"
      v-model="permissionVisible"
      @close="()=>{this.permissionVisible=false}"
      width="500px"
      id="top_dialog"
    >
      <div style="height: 292px;overflow: auto;" id="permission_div">
        <el-tree
          :data="permissionOptions"
          show-checkbox
          node-key="id"
          default-expand-all
          @check-change="handleCheckChange"

          activable
          :expand-on-click-node="false"
          :active-multiple="false"
          :value.sync="checked"
          :value-mode="valueMode"
        />
      </div>
      <template #footer class="dialog-footer">
        <el-button @click="permissionVisible = false">取 消</el-button>
        <el-button type="primary" @click="permissionSetting">确 定</el-button>
      </template>
    </el-dialog>
    <!-- 提示对话框 -->
    <el-dialog
      title="提示"
      v-model="deleteVisible"
      @close="()=>{this.deleteVisible=false}"
      width="400px">
      <div style="word-break: break-all;margin-bottom: 15px">
        <span>确认删除角色"{{role_str}}"吗？</span>
      </div>
      <template #footer class="dialog-footer">
        <el-button @click="deleteVisible = false">取 消</el-button>
        <el-button type="primary" @click="deleteFun">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
  // 引入js数据
  import {role_table} from "../js/user_data";
  import {Search, Refresh, FolderAdd} from "@element-plus/icons-vue";
  import axios from "axios";
  import {ElMessage} from "element-plus";
  import DOMAIN_MAP_TMS from "../api/index"

  let Domain = DOMAIN_MAP_TMS[window.location.hostname];
if (Domain === undefined) {
  Domain = 'http://nmap-tms-rbac.idc-uat.nioint.com';
}

  export default {
    name: "RoleManagement",
    data() {
      return {
        token: '',
        tableContainerHeight: {
          height: '100%'
        },
        form: {
          roleName: ''
        },
        columns: role_table,
        rowKey: 'id',
        name_options: [],
        // 表格数据
        tableData: [],
        table_height: 0,
        header: '请输入角色名称',
        addVisible: false,
        isAdd: true,
        roleForm: {
          roleName: '',
          roleId: ''
        },
        permissionVisible: false,
        deleteVisible: false,
        role_str: '',
        roleId: '',
        // 表格当前页码
        currentPage: 1,
        // 每次表格展示多少条信息
        pageSize: 20,
        // 表格总条数
        total: 0,
        value: ['菜单名称', '2'],
        // 权限设置数据源
        permissionOptions: [],
        // 勾选的值
        checked: [],
        valueMode: 'onlyLeaf',
        roleShow: {
          roleSearchShow: false,
          roleUpdateShow: false,
          roleAddShow: false,
          roleSetingShow: false,
          roleDeleteShow: false,
        }
      }
    },
    setup() {
      return {
        Search, Refresh, FolderAdd
      }
    },
    methods: {
      handleCheckChange(data, checked, indeterminate) {
        console.log(data, checked, indeterminate);
        if (checked) {
          console.log(data.label);
        }
      },
      // 输入控制
      changeChar() {
        //中文、英文、下划线
        this.form.roleName = this.form.roleName.replace(/[^\a-zA-Z_\u4E00-\u9FA5]/g, '');
        this.roleForm.roleName = this.roleForm.roleName.replace(/[^\a-zA-Z_\u4E00-\u9FA5]/g, '');
      },
      // 筛选查询功能
      onSearch() {
        this.currentPage = 1;
        for (let i in this.name_options) {
          if (this.form.roleName === this.name_options[i].id) {
            this.form.roleName = this.name_options[i].name
          }
        }
        this.loadingPage()
      },
      // 新建、编辑按钮
      handleAdd(value, row) {
        this.addVisible = true;
        this.roleForm.roleName = '';
        if (value === 'add') {
          this.isAdd = true;
          this.header = '请输入角色名称';
        } else {
          this.isAdd = false;
          this.header = '请输入新的角色名称';
          // 编辑功能:给roleId赋值
          this.roleForm.roleId = row.id;
          this.roleForm.roleName = row.name;
        }
      },
      // 新建方法
      addFun() {
        // 调接口，新建角色
        axios({
          url: Domain + '/user/v1/addRole',
          method: 'post',
          data: {'roleName': this.roleForm.roleName},
          headers: {'Authorization': this.token},
        }).then(response => {
          if (response.data.code === 0) {
            ElMessage.success({
              message: '角色' + this.roleForm.roleName + '新增成功',
              showClose: true,
            });
            this.addVisible = false
            // 重新获取角色名称数据源
            this.getRoleData()
            this.loadingPage()
          } else {
            ElMessage.error({
              message: response.data.msg,
              showClose: true,
            });
          }
        }).catch(() => {
          ElMessage.error({
            message: '新增失败',
            showClose: true,
          });
        });
      },
      // 权限按钮
      handlePermission(row) {
        this.permissionVisible = true;
        this.roleId = row.id;
        this.checked = [];
        axios({
          url: Domain + '/permi/v1/queryPermsByRoleId',
          method: 'post',
          data: {
            "roleId": this.roleId,
          },
          headers: {'Authorization': this.token},
        }).then(response => {
          if (response.data.code === 0) {
            for (let i in response.data.data) {
              // 主菜单默认不显示，用子菜单显示并隐性控制主菜单是否显示
              if (response.data.data[i] !== null && [12, 13, 14, 15, 16, 43, 52, 56, 66, 69].indexOf(response.data.data[i].id) === -1) {
                this.checked.push(response.data.data[i].id.toString());
              }
            }
          } else {
            ElMessage.error({
              message: response.data.msg,
              showClose: true,
            });
          }
        }).catch(() => {
          ElMessage.error({
            message: '获取当前角色的权限失败',
            showClose: true,
          });
        });
      },
      // 权限设置
      permissionSetting() {
        // 所有选项
        let all_value = []
        // 获取真实选中的每一项
        for (let i = 0; i < this.checked.length; i++) {
          all_value.push(parseInt(this.checked[i]))
          for (let j in this.permissionOptions) {
            // children不为空才进行循环
            if (this.permissionOptions[j].children.length !== 0) {
              for (let k in this.permissionOptions[j].children) {
                if (this.permissionOptions[j].children[k].value === this.checked[i]) {
                  // 把父节点push进去
                  all_value.push(parseInt(this.permissionOptions[j].value))
                }
                //三级目录
                if (this.permissionOptions[j].children[k].children.length !== 0) {
                  for (let p in this.permissionOptions[j].children[k].children) {
                    if (this.permissionOptions[j].children[k].children[p].value === this.checked[i]) {
                      // 把父节点push进去
                      all_value.push(parseInt(this.permissionOptions[j].children[k].value))
                    }
                  }
                }
              }
            }
          }
        }
        // 数据去重
        let set1 = new Set(all_value);
        // 转化为数组
        let permIds = [...set1]
        // 调接口，编辑角色
        axios({
          url: Domain + '/user/v1/updatePermissions',
          method: 'post',
          data: {
            "roleId": this.roleId,
            "permIds": permIds
          },
          headers: {'Authorization': this.token},
        }).then(response => {
          if (response.data.code === 0) {
            ElMessage.success({
              message: '权限设置成功',
              showClose: true,
            });
            this.permissionVisible = false
            this.loadingPage()
          } else {
            ElMessage.error({
              message: response.data.msg,
              showClose: true,
            });
          }
        }).catch(() => {
          ElMessage.error({
            message: '权限设置失败',
            showClose: true,
          });
        });
      },
      // 编辑方法
      editFun() {
        // 调接口，编辑角色
        axios({
          url: Domain + '/user/v1/modifyRole',
          method: 'post',
          data: this.roleForm,
          headers: {'Authorization': this.token},
        }).then(response => {
          if (response.data.code === 0) {
            ElMessage.success({
              message: '角色' + this.roleForm.roleName + '修改成功',
              showClose: true,
            });
            this.addVisible = false
            this.loadingPage()
          } else {
            ElMessage.error({
              message: response.data.msg,
              showClose: true,
            });
          }
        }).catch(() => {
          ElMessage.error({
            message: '角色修改失败',
            showClose: true,
          });
        });
      },
      handleDelete(row) {
        this.role_str = row.name;
        this.roleId = row.id;
        this.deleteVisible = true
      },
      // 删除
      deleteFun() {
        // 调接口，删除角色
        axios({
          url: Domain + '/user/v1/deleteRole',
          method: 'post',
          data: {'roleId': this.roleId},
          headers: {'Authorization': this.token},
        }).then(response => {
          if (response.data.code === 0) {
            ElMessage.success({
              message: '角色' + this.role_str + '删除成功',
              showClose: true,
            });
            this.deleteVisible = false
            this.loadingPage()
          } else {
            ElMessage.error({
              message: response.data.msg,
              showClose: true,
            });
          }
        }).catch(() => {
          ElMessage.error({
            message: '角色删除失败',
            showClose: true,
          });
        });
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
      // 获取表格信息功能
      loadingPage() {
        axios({
          url: Domain + '/user/v1/queryPageRole',
          method: 'post',
          data: {
            "rows": this.pageSize,  //每页多少条
            "page": this.currentPage,  //第几页
            "roleName": this.form.roleName
          },
          headers: {'Authorization': this.token},
        }).then(response => {
          if (response.data.code === 0) {
            this.tableData = response.data.data.list;
            console.log(this.tableData);
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
            message: '没有获取到角色数据',
            showClose: true,
          });
        });
      },
      getRoleData() {
        // 获取所有角色数据集
        axios({
          url: Domain + '/user/v1/queryAllRole',
          method: 'post',
          data: {},
          headers: {'Authorization': this.token},
        }).then(response => {
          if (response.data.code === 0) {
            this.name_options = response.data.data
          } else {
            ElMessage.error({
              message: '获取角色数据集失败',
              showClose: true,
            });
          }
        }).catch(() => {
          ElMessage.error({
            message: '获取角色数据集失败',
            showClose: true,
          });
        });
      },
      getPermData() {
        // 获取所有菜单权限数据集
        axios({
          url: Domain + '/permi/v1/queryAllPerm',
          method: 'post',
          data: {},
          headers: {'Authorization': this.token},
        }).then(response => {
          if (response.data.code === 0) {
            this.permissionOptions = response.data.data
          } else {
            ElMessage.error({
              message: '获取菜单权限数据集失败',
              showClose: true,
            });
          }
        }).catch(() => {
          ElMessage.error({
            message: '获取菜单权限数据集失败',
            showClose: true,
          });
        });
      },
      // 设置表格的最大高度
      adaptiveTableHeight() {
        this.table_height = document.getElementById('tTableContainer') === null ? 0 : document.getElementById('tTableContainer').offsetHeight;
      },
      reLoad() {
        this.promission = sessionStorage.getItem('promission');
        setTimeout(() => {
          this.isShow()
        }, 5)
      },
      isShow() {
        this.roleShow = {
          roleSearchShow: false,
          roleUpdateShow: false,
          roleAddShow: false,
          roleSetingShow: false,
          roleDeleteShow: false,
        }
        // 判断是否按钮
        if (this.promission.length !== 0) {
          if (this.promission.indexOf(28) !== -1) {
            this.roleShow.roleSearchShow = true
          }
          if (this.promission.indexOf(29) !== -1) {
            this.roleShow.roleUpdateShow = true
          }
          if (this.promission.indexOf(30) !== -1) {
            this.roleShow.roleAddShow = true
          }
          if (this.promission.indexOf(31) !== -1) {
            this.roleShow.roleSetingShow = true
          }
          if (this.promission.indexOf(32) !== -1) {
            this.roleShow.roleDeleteShow = true
          }
        }
      },
      setHeight() {
        if (document.getElementById('permission_div') !== null) {
          if (document.getElementById('app').offsetHeight > 700) {
            document.getElementById('permission_div').style.height = '450px'
          } else {
            document.getElementById('permission_div').style.height = '292px'
          }
        }
      }
    },
    mounted() {
      this.tableContainerHeight.height = `calc(100% - ${document.getElementById('tool').offsetHeight + 32}px)`
      this.$nextTick(() => {
        this.adaptiveTableHeight()
      })
      window.addEventListener('resize', this.adaptiveTableHeight, false)
      this.setHeight()
      window.addEventListener('resize', this.setHeight, false)
    },
    created() {
      // 页面加载时调用函数
      this.token = sessionStorage.getItem('token');
      if (this.token.length !== 0) {
        setTimeout(() => {
          this.loadingPage();
          this.getRoleData();
          this.getPermData();
          this.reLoad()
        }, 5);
      }
    }
  }
</script>

<style scoped>
  #tool {
    padding: 5px 0 5px 20px;
    text-align: left;
    color: black;
    font-size: 15px;
  }

  .button_style {
    /*margin-right: 6px;*/
  }

  #top_dialog :deep(.t-dialog--top) {
    top: 10%;
  }

  .t-dialog__body {
    color: rgba(0, 0, 0, 0.9) !important;
    padding: 4px 0 0 0 !important;
  }

  #table {
    position: relative;
    margin: 0 20px 10px 20px;
    text-align: left;
  }

  #tTableContainer {
    position: absolute;
    top: 0;
    bottom: 57px;
    width: 100%;
    height: calc(100% - 57px);
  }

  #tTableContainer :deep(.t-table-pagination) {
    display: none;
  }

  .tPaginationContainer {
    position: absolute;
    width: 100%;
    bottom: 15px;
    padding-top: 10px;
    height: 42px;
  }
  .el-form-item{
    margin-bottom: 0;
  }

</style>
