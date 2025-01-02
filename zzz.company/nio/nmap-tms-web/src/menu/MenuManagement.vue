<template>
  <div id="MenuManagement" class="component">
    <!-- 搜索工具栏 -->
    <div id="tool">
      <el-button :icon="Plus" type="success" @click="handleAdd('father')" v-if="menuShow.menuAddShow">
        新增主菜单
      </el-button>
    </div>
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
          <el-table-column label="权限编码" align="center" prop="code" width="130" show-overflow-tooltip></el-table-column>
          <el-table-column label="权限ID" align="center" prop="id" width="160" show-overflow-tooltip></el-table-column>
          <el-table-column label="菜单名称" align="center" prop="menuName" show-overflow-tooltip></el-table-column>
          <el-table-column label="菜单类型" align="center" prop="typeName"></el-table-column>
          <el-table-column label="创建人" align="center" prop="createBy" show-overflow-tooltip></el-table-column>
          <el-table-column label="操作" align="center" width="180" fixed="right">
            <template #default="scope">
              <el-button link type="primary" size="small" @click="handleEdit(scope.row)" v-if="menuShow.menuUpdateShow">编辑</el-button>
              <el-button link type="success" size="small" @click="handleAdd('child',scope.row)" v-if="menuShow.menuAddChildrenShow">新建子菜单</el-button>
              <el-button link type="danger" size="small" @click="handleDelete(scope.row)" v-if="menuShow.menuDeleteShow">删除</el-button>
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
      width="450px">
      <div style="word-break: break-all;">
        <el-form :model="menuForm" ref="menuForm" label-position="right" label-width="120px" inline :rules="rules" scrollToFirstError="smooth">
          <el-form-item label="权限编码" name="permissionCode">
            <el-input v-model="menuForm.permissionCode" @change="changeChar" placeholder="请输入权限编码" clearable style="max-width: 260px"></el-input>
          </el-form-item>
          <el-form-item label="菜单名称" name="menuName">
            <el-input v-model="menuForm.menuName" @change="changeChar" placeholder="请输入菜单名称" clearable style="max-width: 260px"></el-input>
          </el-form-item>
          <el-form-item label="菜单类型" name="menuType">
            <el-select v-model="menuForm.menuType" placeholder="请选择菜单类型" clearable style="max-width: 260px">
              <el-option
                v-for="item in typeOptions"
                :key="item.code"
                :label="item.name"
                :value="item.code">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <template #footer class="dialog-footer">
        <el-button @click="addVisible = false">取 消</el-button>
        <el-button type="primary" @click="addFun" v-if="is_father">确 定</el-button>
        <el-button type="primary" @click="addChildFun" v-else>确 定</el-button>
      </template>
    </el-dialog>
    <!-- 编辑菜单对话框 -->
    <el-dialog
      title="编辑菜单"
      v-model="editVisible"
      @close="()=>{this.editVisible=false}"
      width="450px">
      <div style="word-break: break-all;">
        <el-form :model="editForm" ref="editForm" label-position="right" label-width="120px" inline>
          <el-form-item label="菜单名称" name="menuName">
            <el-input v-model="editForm.menuName" @change="changeChar" placeholder="请输入菜单名称" clearable style="max-width: 260px"></el-input>
          </el-form-item>
          <el-form-item label="菜单类型" name="type">
            <el-select v-model="editForm.menuType" placeholder="请选择菜单类型" clearable style="max-width: 260px">
              <el-option
                v-for="item in typeOptions"
                :key="item.code"
                :label="item.name"
                :value="item.code">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <template #footer class="dialog-footer">
        <el-button @click="editVisible = false">取 消</el-button>
        <el-button type="primary" @click="editFun">确 定</el-button>
      </template>
    </el-dialog>
    <!-- 提示对话框 -->
    <el-dialog
      title="提示"
      v-model="deleteVisible"
      @close="()=>{this.deleteVisible=false}"
      width="480px">
      <div style="word-break: break-all;;margin-bottom: 15px">
        <span>确认删除菜单"{{menuName}}"吗?</span>
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
  import {menu_table, typeOptions} from "../js/user_data";
  import {Plus} from "@element-plus/icons-vue";
  import axios from "axios";
  import {ElMessage} from "element-plus";

  const nioUrl = window.api.apiNioURL;
  if (nioUrl === null || nioUrl === undefined) {
    console.log("获取nioUrl失败" + nioUrl)
  }

  export default {
    name: "MenuManagement",
    data() {
      return {
        token: '',
        columns: menu_table,
        // 表格数据
        tableData: [],
        // 搜索表单
        menuForm: {
          permissionCode: '',
          menuName: '',
          menuType: '',
          parentId: '',
        },
        // 设置表单的填写规则
        rules: {
          permissionCode: [
            {required: true, message: '权限编码必填', trigger: 'change'},
          ],
          menuName: [
            {required: true, message: '菜单名称必填', trigger: 'change'},
          ],
          menuType: [
            {required: true, message: '菜单类型必填', trigger: 'change'},
          ],
        },
        // 编辑菜单
        editForm: {
          permissionCode: '',
          menuName: '',
          menuType: '',
          parentId: '',
          // 菜单id
          menuId: ''
        },
        menuId: '',
        menuName: '',
        selectedRowKeys: [],
        rowKey: 'id',
        table_height: 0,
        // 菜单类型数据
        typeOptions: typeOptions,
        addVisible: false,
        header: '新增主菜单',
        editVisible: false,
        deleteVisible: false,
        // innerVisible: false,
        is_father: true,
        // 权限控制
        menuShow: {
          menuAddShow: false,
          menuAddChildrenShow: false,
          menuUpdateShow: false,
          menuDeleteShow: false,
        },
        // 表格当前页码
        currentPage: 1,
        // 每次表格展示多少条信息
        pageSize: 20,
        // 表格总条数
        total: 0,
      }
    },
    setup() {
      return {
        Plus,
      }
    },
    methods: {
      // 表格多选
      handleSelectionChange(selectedRowKeys) {
        this.selectedRowKeys = selectedRowKeys;
      },
      // 新增主菜单按钮
      handleAdd(value, row) {
        this.menuForm = {
          permissionCode: '',
          menuName: '',
          menuType: '',
          parentId: '',
        }
        if (value === 'father') {
          this.header = '新增主菜单'
          this.is_father = true
        } else if (value === 'child') {
          this.header = '新增子菜单'
          this.is_father = false
          this.menuForm.parentId = row.id
        }
        this.addVisible = true;
      },
      // 添加前校验
      preAdd() {
        if (this.menuForm.permissionCode === '' || this.menuForm.menuName === '' || this.menuForm.menuType === '') {
          ElMessage.warning({
            message: '权限编码、菜单名称、菜单类型均为必填项',
            showClose: true,
          });
        } else {
          return true
        }
      },
      // 新增主菜单方法
      addFun() {
        if (this.preAdd() === true) {
          // 主菜单没有父id，默认为0
          this.menuForm.parentId = 0
          // 调接口
          axios({
            url: nioUrl + '/permi/v1/addPerm',
            method: 'post',
            data: this.menuForm,
            headers: {'Authorization': this.token},
          }).then(response => {
            if (response.data.code === 0) {
              ElMessage.success({
                message: '主菜单增加成功',
                showClose: true,
              });
              this.addVisible = false;
              this.loadingPage()
            } else {
              ElMessage.error({
                message: response.data.msg,
                showClose: true,
              });
            }
          }).catch(() => {
            ElMessage.error({
              message: '主菜单增加失败',
              showClose: true,
            });
          });
        }
      },
      // 新增子菜单方法
      addChildFun() {
        if (this.preAdd() === true) {
          // 调接口
          axios({
            url: nioUrl + '/permi/v1/addPerm',
            method: 'post',
            data: this.menuForm,
            headers: {'Authorization': this.token},
          }).then(response => {
            if (response.data.code === 0) {
              ElMessage.success({
                message: '子菜单增加成功',
                showClose: true,
              });
              this.addVisible = false;
              this.loadingPage()
            } else {
              ElMessage.error({
                message: response.data.msg,
                showClose: true,
              });
            }
          }).catch(() => {
            ElMessage.error({
              message: '子菜单增加失败',
              showClose: true,
            });
          });
        }
      },
      // 编辑菜单
      handleEdit(row) {
        this.editVisible = true
        for (let j in this.editForm) {
          for (let i in row) {
            if (i === j) {
              this.editForm[j] = row[i]
            }
          }
        }
        this.editForm.menuId = row.id;
        this.editForm.menuType = row.type;
        this.editForm.permissionCode = row.code;
      },
      // 编辑前校验
      preEdit() {
        if (this.editForm.menuName === '' && this.editForm.menuType === '') {
          ElMessage.warning({
            message: '菜单名称、菜单类型不能全为空',
            showClose: true,
          });
        } else {
          return true
        }
      },
      // 编辑菜单方法
      editFun() {
        if (this.preEdit() === true) {
          // 调接口
          axios({
            url: nioUrl + '/permi/v1/updatePerm',
            method: 'post',
            data: this.editForm,
            headers: {'Authorization': this.token},
          }).then(response => {
            if (response.data.code === 0) {
              ElMessage.success({
                message: '菜单编辑成功',
                showClose: true,
              });
              this.editVisible = false;
              // this.innerVisible = false;
              this.loadingPage()
            } else {
              ElMessage.error({
                message: response.data.msg,
                showClose: true,
              });
            }
          }).catch(() => {
            ElMessage.error({
              message: '菜单编辑失败',
              showClose: true,
            });
          });
        }
      },
      // 删除菜单按钮
      handleDelete(row) {
        this.deleteVisible = true;
        this.menuId = row.id;
        this.menuName = row.menuName;
      },
      // 删除菜单函数
      deleteFun() {
        axios({
          url: nioUrl + '/permi/v1/deletePerm',
          method: 'post',
          data: {"menuId": this.menuId},
          headers: {'Authorization': this.token},
        }).then(response => {
          if (response.data.code === 0) {
            ElMessage.success({
              message: '菜单删除成功',
              showClose: true,
            });
            this.deleteVisible = false;
            this.loadingPage()
          } else {
            ElMessage.error({
              message: response.data.msg,
              showClose: true,
            });
          }
        }).catch(() => {
          ElMessage.error({
            message: '菜单删除失败',
            showClose: true,
          });
        });
      },
      // 输入控制
      changeChar() {
        //英文、数字、下划线
        this.menuForm.permissionCode = this.menuForm.permissionCode.replace(/[^\a-zA-Z0-9_]/g, '');
        //中文、英文、数字
        this.menuForm.menuName = this.menuForm.menuName.replace(/[^\a-zA-Z0-9\u4E00-\u9FA5]/g, '');
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
          url: nioUrl + '/permi/v1/queryPagePerm',
          method: 'post',
          data: {
            "rows": this.pageSize,  //每页多少条
            "page": this.currentPage  //第几页
          },
          headers: {'Authorization': this.token},
        }).then(response => {
          if (response.data.code === 0) {
            this.tableData = response.data.data.list;
            // 字段的值整理成文字显示
            for (let i in this.tableData) {
              for (let j in this.typeOptions) {
                if (this.tableData[i].type === this.typeOptions[j].code) {
                  this.tableData[i].typeName = this.typeOptions[j].name
                }
              }
            }
            this.total = response.data.data.total;
            if (this.total === 0) {
              ElMessage.warning({
                message: '没有获取到菜单数据',
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
            message: '没有获取到菜单数据',
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
        this.menuShow = {
          menuAddShow: false,
          menuAddChildrenShow: false,
          menuUpdateShow: false,
          menuDeleteShow: false,
        }
        // 判断是否显示按钮
        if (this.promission.length !== 0) {
          if (this.promission.indexOf(33) !== -1) {
            this.menuShow.menuAddShow = true
          }
          if (this.promission.indexOf(34) !== -1) {
            this.menuShow.menuAddChildrenShow = true
          }
          if (this.promission.indexOf(35) !== -1) {
            this.menuShow.menuUpdateShow = true
          }
          if (this.promission.indexOf(36) !== -1) {
            this.menuShow.menuDeleteShow = true
          }
        }
      }
    },
    mounted() {
      // tool高度+补位值=浏览器量出高度
      this.$nextTick(() => {
        this.adaptiveTableHeight()
      })
      window.addEventListener('resize', this.adaptiveTableHeight, false)
    },
    created() {
      this.token = localStorage.getItem('token');
      if (this.token && this.token.length !== 0) {
        setTimeout(() => {
          this.loadingPage();
          this.reLoad()
        }, 5);
      } else {
        console.error('Token is missing or invalid');
        // 可以选择重定向到登录页面或显示错误信息
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
    height: 46px;
  }

  #tTableContainer :deep(.t-table-pagination) {
    display: none;
  }
</style>
