<template>
  <el-form
      style="margin-left: 30px;"
      :disabled="disabled"
      ref="formRef"
      :model="formData.form"
      inline
      label-position="right"
      label-width="150px"
      :rules="formData.rules"
      scroll-to-error
  >
    <slot name="field"></slot>
    <template v-for="item in formData.list">
      <!-- 文件上传组件需要换行 -->
      <div v-if="['file-upload', 'image-upload', 'url', 'textarea', 'radio'].includes(item.type)"></div>
      <!-- 文本框 -->
      <el-form-item :prop="item.prop" :label="item.label + '：'" v-if="item.type === 'text'">
        <el-input v-model="formData.form[item.prop]" :placeholder="'请输入' + item.label" style="width: 200px"></el-input>
      </el-form-item>
      <!-- 多行文本框 -->
      <el-form-item :prop="item.prop" :label="item.label + '：'" v-else-if="item.type === 'textarea'">
        <el-input type="textarea" :rows="3" v-model="formData.form[item.prop]" :placeholder="'请输入' + item.label" style="width: 582px;"></el-input>
      </el-form-item>
      <!-- 日期 -->
      <el-form-item :prop="item.prop" :label="item.label + '：'" v-else-if="item.type === 'date'">
        <el-date-picker
            v-model="formData.form[item.prop]"
            type="date"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            placeholder="请选择日期"
            style="width: 200px">
        </el-date-picker>
      </el-form-item>
      <!-- 日期 + 时间 -->
      <el-form-item :prop="item.prop" :label="item.label + '：'" v-else-if="item.type === 'datetime'">
        <el-date-picker
            v-model="formData.form[item.prop]"
            type="datetime"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择时间"
            style="width: 200px;">
        </el-date-picker>
      </el-form-item>
      <!-- 单选按钮组 -->
      <el-form-item :prop="item.prop" :label="item.label + '：'" v-else-if="item.type === 'radio'">
        <el-radio-group v-model="formData.form[item.prop]">
          <el-radio v-for="item2 in item.source" :label="item2.value">{{item2.name}}</el-radio>
        </el-radio-group>
      </el-form-item>
      <!-- 单选下拉框 -->
      <el-form-item :prop="item.prop" :label="item.label + '：'" v-else-if="item.type === 'select'">
        <el-select
            v-model="formData.form[item.prop]"
            :placeholder="'请选择' + item.label"
            style="width: 200px"
        >
          <el-option
              v-for="item2 in item.source"
              :label="item2.name"
              :key="item2.value"
              :value="item2.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <!-- 多选下拉框 -->
      <el-form-item :prop="item.prop" :label="item.label + '：'" v-else-if="item.type === 'multi-select'">
        <el-select
            v-model="formData.form[item.prop]"
            :placeholder="'请选择' + item.label"
            multiple
            collapse-tags
            collapse-tags-tooltip
            style="width: 200px"
        >
          <el-option
              v-for="item2 in item.source"
              :label="item2.name"
              :key="item2.value"
              :value="item2.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <!-- 动态单选下拉框 -->
      <el-form-item :prop="item.prop" :label="item.label + '：'" v-else-if="item.type === 'dynamic-select'">
        <el-select
            v-model="formData.form[item.prop]"
            :placeholder="'请选择' + item.label"
            style="width: 200px"
            remote
            filterable
            loading-text="查询中"
            no-match-text="没有匹配的结果"
            no-data-text="没有匹配的结果"
            :remote-method="remoteQueryHandler(item)"
        >
          <el-option
              v-for="item2 in item.source"
              :label="item2.name"
              :key="item2.value"
              :value="item2.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <!-- 动态多选下拉框 -->
      <el-form-item :prop="item.prop" :label="item.label + '：'" v-else-if="item.type === 'dynamic-multi-select'">
        <el-select
            v-model="formData.form[item.prop]"
            :placeholder="'请选择' + item.label"
            style="width: 200px"
            remote
            multiple
            filterable
            collapse-tags
            collapse-tags-tooltip
            loading-text="查询中"
            no-match-text="没有匹配的结果"
            no-data-text="没有匹配的结果"
            :remote-method="remoteQueryHandler(item)"
        >
          <el-option
              v-for="item2 in item.source"
              :label="item2.name"
              :key="item2.value"
              :value="item2.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <!-- 文件上传 -->
      <el-form-item :prop="item.prop" :label="item.label + '：'" v-else-if="item.type === 'file-upload'">
        <el-upload
            v-model:file-list="formData.files[item.prop]"
            multiple
            :auto-upload="false"
        >
          <el-button type="primary">点击上传</el-button>
        </el-upload>
      </el-form-item>
      <!-- 图片上传 -->
      <el-form-item :prop="item.prop" :label="item.label + '：'" v-else-if="item.type === 'image-upload'">
        <el-upload
            v-model:file-list="formData.files[item.prop]"
            multiple
            list-type="picture-card"
            :auto-upload="false"
            :on-preview="previewHandler"
            :on-change="imgChangeHandler"
        >
          <el-icon><Plus></Plus></el-icon>
          <template #tip>
            <div>支持jpg、png格式，不应超过10MB</div>
          </template>
        </el-upload>
      </el-form-item>
      <!-- URL -->
      <el-form-item :prop="item.prop" :label="item.label + '：'" v-else-if="item.type === 'url'">
        <el-input v-model="item.value" :placeholder="'请输入' + item.label" style="width: 582px">
          <template #prepend>
            <el-select v-model="item.prepend" style="width: 90px;">
              <el-option
                  v-for="item2 in item.source"
                  :label="item2.name"
                  :key="item2.value"
                  :value="item2.value"
              ></el-option>
            </el-select>
          </template>
        </el-input>
      </el-form-item>
      <!-- 文件上传组件需要换行 -->
      <div v-if="['file-upload', 'image-upload', 'url', 'textarea', 'radio'].includes(item.type)"></div>
    </template>
    <!-- 图片预览 -->
    <el-image-viewer
        v-if="dialogImgVisible"
        :url-list="[dialogImgUrl]"
        @close="dialogImgVisible = false"
        hide-on-click-modal
        teleported
    ></el-image-viewer>
  </el-form>
</template>

<script setup>
import {computed, nextTick, reactive, ref, watch} from "vue";
import axios from "axios";
import {ElMessage} from "element-plus";
import {Plus} from "@element-plus/icons-vue";
import {isNullObject} from "@/utils/index.js";

const props = defineProps({
  //给动态表单的初始值
  initForm: {
    type: Object,
    default: {},
  },
  disabled: {
    type: Boolean,
    default: false,
  }
});
const emit = defineEmits(['update:value']);

watch(() => props.value, (newVal) => {
  if (!newVal) {
    clearForm();
  }
});

const privateKey = computed({
  get() {
    return Symbol()
  },
  set(value) {}
})

const nioStorageServiceURL = window.api.nioStorageServiceURL;
const formData = reactive({
  //存放元信息
  list: [
    // {type: '', prop: '', label: '', source: ''},
  ],
  //存放key-value
  form: {},
  //校验规则
  rules: {},
  //存放文件列表,key-uploadList
  files: {},
});
const formRef = ref(null);
const dialogImgVisible = ref(false); //显示图片对话框
const dialogImgUrl = ref(''); //图片来源

const jsonParseTarget = ['radio', 'select', 'multi-select'];
const dynamicParseTarget = ['dynamic-select', 'dynamic-multi-select'];
const multiParseTarget = ['multi-select', 'dynamic-multi-select'];
const fileParseTarget = ['file-upload', 'image-upload'];
const urlParseTarget = ['url'];
const imgType = ['image/jpeg', 'image/png', 'image/jpg'];

//获取表单验证策略
const regularStrategy = {
  max: (rule) => ({max: rule.value, trigger: 'blur'}),
  min: (rule) => ({min: rule.value, trigger: 'blur'}),
  url: (rule) => ({validator: regularValidate, message: rule.message, trigger: 'blur', regular: /(^$|^\s*https?:\/\/.*$)/}),
  long: (rule) => ({validator: regularValidate, message: rule.message, trigger: 'blur', regular: /(^$|^[+-]?\d+$)/}),
  float: (rule) => ({validator: regularValidate, message: rule.message, trigger: 'blur', regular: /(^$|^[+-]?(\d*\.\d+([eE]?[+-]?\d+)?|\d+[eE][+-]?\d+)$)/}),
  length: (rule) => ({validator: regularValidate, message: rule.message, trigger: 'blur', regular: new RegExp(`^.{0,${rule.value}}$`)}),
  required: (rule) => ({required: true, message: rule.message, trigger: 'blur'}),
  coordinate: (rule) => ({validator: regularValidate, message: rule.message, trigger: 'blur', regular: /^\s*(\d+\.?\d*)[\s,，:：]+(\d+\.?\d*)\s*$/}),
};
//图片上传验证策略
const imgStrategy = {
  sizeValidator({size}) {
    if (size / 1024 / 1024 >= 10) {
      return new Error('单张图片尺寸应小于10MB');
    }
  },
  mimeValidator({type}) {
    if (!imgType.includes(type)) {
      return new Error('仅支持jpg、png格式');
    }
  }
};

const regMap = {
  urlExec: /^(http:\/\/|https:\/\/)(.*)$/,
  fieldKeyReg: /#\{(\w*)}/,
  inputReg: /\$\{input}/,
};

function validate(callback) {
  formRef.value.validate(callback);
}

function previewHandler(uploadFile) {
  dialogImgUrl.value = uploadFile.url;
  dialogImgVisible.value = true;
}

function imgChangeHandler(uploadFile, uploadFiles) {
  for (let key in imgStrategy) {
    let error = imgStrategy[key](uploadFile.raw);
    if (error instanceof Error) {
      ElMessage.warning({
        message: error.message,
        showClose: false,
        grouping: true,
      });
      uploadFiles.pop();
      return;
    }
  }
}

function loadingForm(url) {
  axios.get(url).then(res => {
    if (res.data.code === 200) {
      clearForm();
      //nextTick为了避免Element Plus表单切换会触发校验的bug
      nextTick(() => {
        let data = res.data.data['fieldList'];
        //可能需要为表单赋初始值
        if (!isNullObject(props.initForm)) {
          formData.form = {...props.initForm};
        }
        data.forEach((formItem, idx) => {
          if (isNullObject(props.initForm)) {
            formData.form[formItem.key] = formItem.defaultValue;
          }
          formData.list[idx] = {type: formItem.type, prop: formItem.key, label: formItem.label, source: formItem.source};
          //0.对于带初始值的form，需要处理form里多选下拉框的value
          if (!isNullObject(props.initForm) && multiParseTarget.includes(formItem.type) && formData.form[formItem.key]) {
            formData.form[formItem.key] = formData.form[formItem.key].split(',');
          }
          //1.对于单选、下拉框，需要设置options
          if (jsonParseTarget.includes(formItem.type)) {
            formData.list[idx].source = JSON.parse(formItem.source);
          }
          //2.对于远程搜索下拉框，需要设置url、method和option
          if (dynamicParseTarget.includes(formItem.type)) {
            //暂时需要兼容这种异常不符合逻辑的写法，将该类数据抛弃
            if (formItem.source === '') {
              formData.list[idx].type = '';
              return;
            }
            let method = formItem.source.split('@');
            formData.list[idx].method = method[0];
            formData.list[idx].url = method[1];
            formData.list[idx].source = [];
          }
          //3.对于文件需要为其赋值数组
          if (fileParseTarget.includes(formItem.type)) {
            if (!isNullObject(props.initForm) && props.initForm[formItem.key] !== '') {
              formData.files[formItem.key] = props.initForm[formItem.key].split(',').map(item => {
                return {
                  name: item,
                  url: `${nioStorageServiceURL}/storage-service/file/download/${item}`,
                };
              });
            } else {
              formData.files[formItem.key] = [];
            }
          }
          //4.对于url需要配置前缀
          if (urlParseTarget.includes(formItem.type)) {
            formData.list[idx].source = [{name: 'http://', value: 'http://'}, {name: 'https://', value: 'https://'}];
            let prepend = 'http://', value = '';
            //对于带初始值的，需要提取其前缀和内容
            if (!isNullObject(props.initForm)) {
              let result = regMap.urlExec.exec(props.initForm[formItem.key]);
              if (result !== null) {
                prepend = result[1];
                value = result[2];
              }
            }
            formData.list[idx].prepend = prepend;
            formData.list[idx].value = value;
            formData.form[formItem.key] = computed(() => {
              return formData.list[idx].value === '' ? '' : (formData.list[idx].prepend + formData.list[idx].value);
            });
          }
          //解析校验规则
          if (formItem.constraint) {
            formData.rules[formItem.key] = JSON.parse(formItem.constraint).map(item2 => {
              if (item2.type in regularStrategy) {
                return regularStrategy[item2.type](item2);
              }
              return {};
            });
          }
        });
      });
    } else {
      throw new Error(res.data.msg);
    }
  }).catch(err => {
    ElMessage.warning({
      message: err.message,
      showClose: false,
      grouping: true,
    });
  });
}
//上传文件,并将结果保存到form中
function uploadFiles() {
  const ajaxList = [], keys = [], files = formData.files, uploadedFile = {};
  for (let key in files) {
    //没有文件则跳过上传
    if (files[key].length === 0) {
      formData.form[key] = '';
      continue;
    }
    keys.push(key);
    uploadedFile[key] = [];
    const formDataList = new FormData();
    for (let i = 0; i < files[key].length; i++) {
      let file = files[key][i];
      //只上传本地文件，远程拉下来的不用重复上传,只做数据库保存
      if (file.status === 'ready') {
        formDataList.append('files', file.raw);
      } else {
        uploadedFile[key].push(file.name);
      }
    }
    //formData有内容就需要上传，否则认为没有新增文件
    if (formDataList.getAll('files').length > 0) {
      ajaxList.push(axios.post(nioStorageServiceURL + '/storage-service/file/upload', formDataList, {
        headers: {
          'content-type': 'multipart/form-data',
        }
      }));
    } else {
      ajaxList.push(Promise.resolve({data: {code: 200, data: []}}));
    }
  }
  return Promise.all(ajaxList).then(res => {
    for (let i = 0; i < res.length; i++) {
      if (res[i].data.code !== 200) {
        throw new Error(res[i].data.msg);
      }
      formData.form[keys[i]] = uploadedFile[keys[i]].concat(res[i].data.data).join(',');
    }
    return Promise.resolve();
  });
}

//表单规则校验
function regularValidate(rule, value, callback) {
  if (!rule.regular.test(value)) {
    callback(rule.message);
  } else {
    callback();
  }
}

function remoteQuery(formItem, query) {
  let url = formItem.url;
  let fieldKey = regMap.fieldKeyReg.exec(url);
  if (fieldKey !== null) {
    url = url.replace(regMap.fieldKeyReg, formData.form[fieldKey[1]]);
  }
  axios({
    method: formItem.method,
    url: url.replace(regMap.inputReg, query),
  }).then(res => {
    let data = res.data.data;
    if (Array.isArray(data)) {
      formItem.source = res.data.data;
    } else {
      throw new Error(res.data.msg);
    }
  }).catch(err => {
    ElMessage.error({
      message: '查询失败:' + err.message,
      grouping: true,
      showClose: false
    });
  });
}

function focusHandler(formItem) {
  remoteQuery(formItem, '');
}

//远程搜索
function remoteQueryHandler(item) {
  return function (query) {
    remoteQuery(item, query);
  }
}

//清空
function clearForm() {
  Object.assign(formData, {
    list: [],
    rules: {},
    files: {},
    form: {},
  });
  dialogImgVisible.value = false;
  dialogImgUrl.value = '';
}

//改变动态表单来源
function changeURL(newURL) {
  if (!newURL || !newURL.split('=')[1]) {
    clearForm();
  } else {
    loadingForm(newURL);
  }
}

//暴露接口
defineExpose({
  changeURL,
  validate,
  uploadFiles,
  clearForm,
  get form() {
    return formData.form;
  },
});
</script>

<style scoped>
:deep(.el-form-item__label) {
  font-weight: 700;
}
</style>
