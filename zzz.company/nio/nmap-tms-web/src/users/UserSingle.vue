<template>
  <div>
    <el-form
      :model="personasForm"
      ref="personasForm"
      label-position="right"
      inline
      :rules="rules"
      scrollToFirstError="smooth"
    >
      <el-form-item label="用户编码：" style="margin-left: 11px" name="id">
        <div style="width: 200px" class="input_dis">{{personasForm.id}}</div>
      </el-form-item>
      <el-form-item label="供应商：" style="margin-left: 23px" name="supplier">
        <el-select v-model="personasForm.supplier" placeholder="请选择供应商" clearable style="width: 200px">
          <el-option
            v-for="item in supplierOptions"
            :key="item.code"
            :label="item.name"
            :value="item.code">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item prop="realName" label="用户姓名：" name="realName">
        <el-input v-model="personasForm.realName" @change="changeChar(3)" placeholder="请输入用户姓名" clearable style="width: 200px"></el-input>
      </el-form-item>
      <el-form-item prop="level" label="水平：" style="margin-left: 27px" name="level">
        <el-select v-model="personasForm.level" placeholder="请选择用户水平" style="width: 200px" clearable>
          <el-option
            v-for="item in levelOptions"
            :key="item.code"
            :label="item.name"
            :value="item.code">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item prop="userName" label="账号：" style="margin-left: 28px" name="userName">
        <div style="width: 200px" class="input_dis">{{personasForm.userName}}</div>
      </el-form-item>
      <el-form-item label="在职状态：" style="margin-left: 10px" name="userStatus">
        <el-select v-model="personasForm.userStatus" placeholder="请选择在职状态" clearable style="width: 200px" @change="changeNumberStatus">
          <el-option
            v-for="item in userStatusOptions"
            :key="item.code"
            :label="item.name"
            :value="item.code">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item prop="roleIds" label="角色：" style="margin-left: 28px" name="roleIds">
        <el-select v-model="personasForm.roleIds" multiple placeholder="请选择角色" clearable style="width: 200px" collapse-tags>
          <el-option
            v-for="item in skillModelOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item prop="entryTime" label="入职时间：" name="entryTime">
        <div style="width: 200px" class="input_dis">{{personasForm.entryTime}}</div>
      </el-form-item>
      <el-form-item prop="skill_list" label="技能：" style="margin-left: 28px" name="skill_list">
        <el-select v-model="personasForm.skill_list" multiple placeholder="请选择用户技能" clearable style="width: 200px" collapse-tags>
          <el-option
            v-for="item in skillOptions"
            :key="item.code"
            :label="item.name"
            :value="item.code">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="账号状态：" style="margin-left: 10px" name="numberStatus">
        <el-select v-model="personasForm.numberStatus" placeholder="请选择账号状态" clearable style="width: 200px" v-if="numberStatusDisabled" disabled>
          <el-option
            v-for="item in numberStatusOptions"
            :key="item.code"
            :label="item.name"
            :value="item.code">
          </el-option>
        </el-select>
        <el-select v-model="personasForm.numberStatus" placeholder="请选择账号状态" clearable style="width: 200px" v-else>
          <el-option
            v-for="item in numberStatusOptions"
            :key="item.code"
            :label="item.name"
            :value="item.code">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item prop="email" label="邮箱：" style="margin-left: 28px" name="email">
        <el-input v-model="personasForm.email" @change="changeChar(5)" placeholder="请输入邮箱" clearable style="width: 200px"></el-input>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  export default {
    name: "UserSingle",
    // 接收父组件传来的参数
    props: {
      personasForm: Object,
      rules: Object,
      supplierOptions: Array,
      levelOptions: Array,
      userStatusOptions: Array,
      skillModelOptions: Array,
      skillOptions: Array,
      numberStatusOptions: Array,
      numberStatusDisabled: Boolean,
    },
    data() {
      return {}
    },
    methods: {
      changeChar(val) {
        this.$emit('changeChar', val)
      },
      changeNumberStatus() {
        this.$emit('changeNumberStatus')
      },
    }
  }
</script>

<style scoped>

</style>
