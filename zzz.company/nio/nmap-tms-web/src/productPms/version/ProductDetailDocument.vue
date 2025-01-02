<template>
  <!-- 文件详情 -->
    <div id="ProductDetailDocument">
        <div id="dataDiv">
            <el-form id="commitDiv">
                <el-form-item style="height: 72px;font-weight: 700">
                    <div style="display: flex;align-items: center;width:80% !important;">
                        <div style="margin-right: 20px;">dataVersion：</div>
                        <el-scrollbar always style="flex: 1;" height="72px">
                            <el-steps :active="active">
                                <el-step @click.native="on_click_data_version"
                                         v-for="(item, index) in stepItems"
                                         :data-index="index"
                                         :data-dataversion="item.dataVersion"
                                         :data-msg="item.commitMsg"
                                         :data-createtime="item.createTime"
                                >
                                    <template #icon>
                                        <div class="step-item-icon"></div>
                                    </template>
                                    <template #title>
                                        <div class="step-item-title">{{ item.dataVersion }}</div>
                                    </template>
                                </el-step>
                            </el-steps>
                        </el-scrollbar>
                    </div>
                </el-form-item>
                <el-form-item label="">
                    <span>当前页码: </span>
                    <span style="width: 42px;white-space: nowrap">第{{ currentPageBranch / 10 + 1 }}页</span>
                    <el-button type="primary" :disabled="!(currentPageBranch > 0)" @click="branchTagIdLoading(1)"
                               class="button_style">上一页
                    </el-button>
                    <el-button type="primary" :disabled="!(currentPageBranch < totalBranch-10)"
                               @click="branchTagIdLoading(2)" class="button_style">下一页
                    </el-button>
                    <el-button :icon="FolderOpened" type="success" @click="createButton(1)" class="button_style">
                        创建分支
                    </el-button>
                    <el-button :icon="CollectionTag" type="success" @click="createButton(2)" id="tag"
                               :disabled="!dataVersionPress" class="button_style">创建tag
                    </el-button>
                    <el-button :icon="FolderAdd" type="success" @click="createButton(3)" class="button_style">
                        创建部分分支
                    </el-button>
                </el-form-item>
            </el-form>
            <!-- 分支信息 -->
            <el-descriptions :column="4" border direction="vertical" style="margin-top: 15px;margin-bottom: 15px;">
                <el-descriptions-item align="center" label-style="width:260px;"
                                      content-style="text-align:center;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;"
                                      label="产品库">
                    <div>{{ productId }}</div>
                </el-descriptions-item>
                <el-descriptions-item align="center" label-style="width:260px;text-align:center"
                                      content-style="overflow:hidden;white-space:nowrap;text-overflow:ellipsis;"
                                      :label="typeId==='TAG'?'TAG':'分支'">
                    <div>{{ branchTagId }}</div>
                </el-descriptions-item>
                <el-descriptions-item align="center" label-style="text-align:center"
                                      content-style="overflow:hidden;white-space:nowrap;text-overflow:ellipsis;"
                                      label="commitMsg">
                    <el-popover placement="top-start" trigger="hover">
                        <template #reference style="width: 100%;">{{ msg }}</template>
                        <div>{{ msg }}</div>
                    </el-popover>
                </el-descriptions-item>
                <el-descriptions-item align="center" label-style="text-align:center"
                                      content-style="overflow:hidden;white-space:nowrap;text-overflow:ellipsis;"
                                      label="createTime">
                    <div>{{ createTime }}</div>
                </el-descriptions-item>
            </el-descriptions>
            <!-- 文件操作 -->
            <div style="display: inline-block">
                <el-button :icon="Refresh" type="primary" @click="reload">刷新页面</el-button>
                <el-input v-model="searchInput" class="input-with-select" placeholder="请输入内容" @input="changeChar"
                          style="width: 300px;margin:0 20px" @keyup.enter="searchDownloadFun('search')">
                    <template #append>
                        <el-button slot="append" :icon="Search" @click="searchDownloadFun('search')"></el-button>
                    </template>
                </el-input>
                <el-button v-if="!dataVersionPress" @click="handleUpload(true)" class="button_style">数据提交
                </el-button>
                <el-button @click="" v-else disabled class="button_style">数据提交</el-button>
                <el-button @click="searchDownloadFun('download')">批量下载</el-button>
            </div>
        </div>
        <!-- 文件表格 -->
        <div id="DocumentTableContainer">
            <el-table :data="tableDocumentData" border :max-height="tableDHeight"
                      @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55" fixed="left"></el-table-column>
                <el-table-column
                        v-for="item in tableDocumentColumn"
                        :key="item.prop"
                        :prop="item.prop"
                        :label="item.label"
                        :min-width="item.width"
                        align="center">
                </el-table-column>
                <el-table-column key="url" prop="url" label="" width="1"
                                 :show-overflow-tooltip="true"></el-table-column>
                <el-table-column fixed="right" label="操作" align="center" width="110">
                    <template #default="scope">
                        <el-link type="primary" :href="scope.row.url">
                            <span class="copy-link">下载</span>
                        </el-link>
                        <!--            <el-button type="primary" link>-->
                        <!--              <a :href="scope.row.url">下载</a>-->
                        <!--            </el-button>-->
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <!-- 分页栏 -->
        <div style="padding-top: 10px" class="tPaginationContainer" v-if="pageShow">
            <el-pagination
                    background
                    :total="total"
                    :page-size="pageSize"
                    v-model="currentPage"
                    :page-sizes="[5,10,20,50,100]"
                    @current-change="handleCurrentDetail"
                    @size-change="handleSizeDetail"
                    layout="total,sizes,prev,pager,next,jumper"
            ></el-pagination>
        </div>
        <!-- 数据提交对话框 -->
        <el-dialog
                header="数据提交"
                v-model="dataVisible"
                @close="()=>{this.dataVisible=false}"
                width="500px">
            <div style="word-break: break-all;margin-left: 10px">
                <el-form :model="dataForm" label-position="right" label-width="120px">
                    <el-form-item label="文件：" style="font-weight: bold" name="type">
                        <div style="display: inline-block;width:220px">
                            <el-upload
                                    ref="upload"
                                    :action="action"
                                    :file-list="fileList"
                                    :auto-upload="false"
                                    :on-remove="handleRemove"
                                    :on-error="handleError"
                                    :on-change="handleChange"
                                    accept='zip|sq3'
                                    :limit="1"
                            >
                                <el-button slot="trigger" type="primary">选取文件</el-button>
                            </el-upload>
                        </div>
                    </el-form-item>
                    <el-form-item label="dataVersion：" name="dataVersion">
                        <el-input v-model="dataForm.dataVersion" @change="changeNum" placeholder="请输入数据版本"
                                  style="width: 300px" clearable></el-input>
                    </el-form-item>
                    <el-form-item label="提交信息：" name="remark">
                        <el-input v-model="dataForm.commitMsg" placeholder="请输入提交信息" style="width: 300px"
                                  clearable></el-input>
                    </el-form-item>
                </el-form>
            </div>
            <template #footer class="dialog-footer">
                <el-button @click="handleUpload(false)" center>取 消</el-button>
                <el-button type="primary" @click="uploadFun()">提 交</el-button>
            </template>
        </el-dialog>
        <!-- 对话框 -->
        <el-dialog
                :title="header"
                v-model="createVisible"
                @close="()=>{this.createVisible=false}"
                width="500px">
            <div style="word-break: break-all;margin-left: 10px">
                <el-form :model="createForm" label-position="right" label-width="110px">
                    <el-form-item label="分支名：" name="type" v-if="confirm!==2">
                        <el-input v-model="createForm.branchName" placeholder="请输入分支名称" style="width: 300px"
                                  clearable></el-input>
                    </el-form-item>
                    <el-form-item label="图幅列表：" name="mesh" v-if="confirm===3">
                        <el-input v-model="createForm.mesh" @input="changeCharNewBranch" placeholder="请输入图幅列表"
                                  style="width: 300px" clearable></el-input>
                    </el-form-item>
                    <el-form-item label="TAG：" name="TAG" v-if="confirm===2">
                        <el-input v-model="createForm.tag" placeholder="请输入TAG" style="width: 300px"
                                  clearable></el-input>
                    </el-form-item>
                    <el-form-item label="dataVersion：" name="dataVersion" v-if="confirm===2">
                        <el-input
                                v-model="createForm.dataVersion"
                                @change="changeNumNewBranch"
                                placeholder="请输入数据版本"
                                style="width: 300px"
                                disabled
                                clearable>
                        </el-input>
                    </el-form-item>
                </el-form>
            </div>
            <template #footer class="dialog-footer">
                <el-button @click="createVisible = false" center>取 消</el-button>
                <el-button type="primary" v-if="confirm===1" @click="createSetting()">提 交</el-button>
                <el-button type="primary" v-if="confirm===2" @click="createSetting()">提 交</el-button>
                <el-button type="primary" v-if="confirm===3" @click="createSetting()">提 交</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script>
// 引入js数据
import {tableDocumentColumn} from "../../js/product_data.js";
import {dateFormat} from "../../js/format_data.js";
import {Search, Refresh, FolderOpened, CollectionTag, FolderAdd} from "@element-plus/icons-vue";
import axios from "axios";
import {ElMessage} from "element-plus";

const nioDataURL = window.api.nioDataURL;

export default {
    name: "ProductDetailDocument",
    // 接收父组件传来的参数
    props: {
        productId: String,
        branchTagId: String,
        typeId: String,
    },
    data() {
        // let cookieValue = '';
        // const environment = process.env.NODE_ENV;

        // if (environment === 'development') {
        // cookieValue = 'userName=map_product_platform_update;userToken=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoibWFwX3Byb2R1Y3RfcGxhdGZvcm1fdXBkYXRlIiwiZXhwIjo0ODgzNjg3MTk2fQ.ymF91zzuBaSSKz4xaYtVItDr1L_YFdsNUX8MwFpqPgY';
        // } else if (environment === 'stg') {
        // cookieValue = 'userName=map_product_platform_update;userToken=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoibWFwX3Byb2R1Y3RfcGxhdGZvcm1fdXBkYXRlIiwiZXhwIjo0ODgzNjg3NDc5fQ.jGbLcDa5RVRVLCZedNlof9zmuqWbbnYPmaSxLC8B_zs';
        // } else if (environment === 'production') {
        // cookieValue = 'userName=map_product_platform_update;userToken=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoibWFwX3Byb2R1Y3RfcGxhdGZvcm1fdXBkYXRlIiwiZXhwIjo0ODgzNjg3MzAxfQ.RUl7OFZmX94ZVjSLD-89UPFkFA1AiEPIq5JearLiWjs';
        // }
        // console.log('environment：', environment);

        const COOKIE_MAP = {
            'nmap-tms-web.idc-uat.nioint.com': 'userName=map_product_platform_update;userToken=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoibWFwX3Byb2R1Y3RfcGxhdGZvcm1fdXBkYXRlIiwiZXhwIjo0ODgzNjg3MTk2fQ.ymF91zzuBaSSKz4xaYtVItDr1L_YFdsNUX8MwFpqPgY',
            'nmap-tms-web-stg.nioint.com': 'userName=map_product_platform_update;userToken=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoibWFwX3Byb2R1Y3RfcGxhdGZvcm1fdXBkYXRlIiwiZXhwIjo0ODgzNjg3NDc5fQ.jGbLcDa5RVRVLCZedNlof9zmuqWbbnYPmaSxLC8B_zs',
            'nmap-tms-web.idc-prod.nioint.com': 'userName=map_product_platform_update;userToken=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoibWFwX3Byb2R1Y3RfcGxhdGZvcm1fdXBkYXRlIiwiZXhwIjo0ODgzNjg3MzAxfQ.RUl7OFZmX94ZVjSLD-89UPFkFA1AiEPIq5JearLiWjs',
            'nmap-tms-web.nioint.com': 'userName=map_product_platform_update;userToken=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoibWFwX3Byb2R1Y3RfcGxhdGZvcm1fdXBkYXRlIiwiZXhwIjo0ODg0MDI3NjkwfQ.5ygi2-0MiWXY0nHm9GcGY5Seo2UabkxJxyqU9aI6TYQ',
        };

        let cookieValue = 'userName=map_product_platform_update;userToken=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoibWFwX3Byb2R1Y3RfcGxhdGZvcm1fdXBkYXRlIiwiZXhwIjo0ODgzNjg3MTk2fQ.ymF91zzuBaSSKz4xaYtVItDr1L_YFdsNUX8MwFpqPgY';
        cookieValue = COOKIE_MAP[window.location.hostname];
        console.log('window.location.hostname:', window.location.hostname);
        console.log('cookieValue:', cookieValue);

        return {
            header: '创建分支',
            createVisible: false,
            createForm: {
                branchName: '',
                mesh: '',
                tag: '',
                dataVersion: ''
            },
            confirm: 1,
            currentPageBranch: 0,
            totalBranch: 0,
            msg: '',
            createTime: '',
            dataVersion: 0,
            dataVersionPress: false,
            stepItems: [],
            dataVisible: false,
            dataForm: {
                dataVersion: '',
                commitMsg: '',
            },
            searchInput: '',
            tableDocumentData: [],
            tableDHeight: 0,
            tableDocumentColumn: tableDocumentColumn,
            multipleSelection: [],
            // 表格页码
            total: 20,
            pageSize: 10,
            // 表格当前页码
            currentPage: 1,
            offset: 0,
            partitionNames: '',
            pageShow: true,
            action: nioDataURL + '/data/commit',
            fileList: [],
            url: '',
            active: -1,
            cookieValue,
        }
    },
    setup() {
        return {
            Search, Refresh, FolderOpened, CollectionTag, FolderAdd,
        }
    },
    methods: {
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
                    urlData.append("dataVersion", parseInt(this.dataVersion));
                    if (this.createForm.branchName !== '') {
                        this.createFun(urlData);
                    } else {
                        ElMessage.warning({
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
                        ElMessage.warning({
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
                    urlData.append("dataVersion", this.dataVersion);
                    if (meshListAll.length !== 0) {
                        this.createFun(urlData);
                    } else {
                        ElMessage.warning({
                            message: '图幅数据为空',
                            showClose: true,
                        });
                    }
                }
            } else {
                // 未选择DataVersion，按照最新的DataVersion
                // 创建分支
                if (this.confirm === 1) {
                    if (this.typeId === 'TAG') {
                        this.url = '/product/branch/create-with-tag';
                        urlData.append("productIdentity", this.productId);
                        urlData.append("branchName", this.createForm.branchName);
                        urlData.append("tagName", this.branchTagId);
                    } else {
                        this.url = '/branch/create';
                        urlData.append("productIdentity", this.productId);
                        urlData.append("branchName", this.createForm.branchName);
                        urlData.append("parentBranchName", this.branchTagId);
                    }
                    if (this.createForm.branchName !== '') {
                        this.createFun(urlData)
                    } else {
                        ElMessage.warning({
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
                        ElMessage.warning({
                            message: '图幅数据为空',
                            showClose: true,
                        });
                    }
                }
            }
            this.createVisible = false;
        },
        createFun(urlData) {
            axios({
                url: nioDataURL + this.url,
                method: 'post',
                data: urlData,
                headers: {
                            'Authorization': this.cookieValue,
                        }
            }).then(response => {
                if (response.data.code === 200) {
                    ElMessage.success({
                        message: this.header + '成功',
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
                    message: this.header + '失败',
                    showClose: true,
                });
            })
        },
        createButton(val) {
            this.createVisible = true;
            if (val === 1) {
                this.header = '创建分支';
                this.confirm = 1;
            } else if (val === 2) {
                this.header = '创建tag';
                this.createForm.dataVersion = this.dataVersion;
                this.confirm = 2;
            } else {
                this.header = '创建部分分支';
                this.confirm = 3;
            }
        },

        //选中一个版本
        on_click_data_version(ev) {
            let dataset = ev.currentTarget.dataset;
            if (dataset !== null) {
                this.active = parseInt(dataset.index);
                this.msg = dataset.msg;
                this.createTime = dateFormat(dataset['createtime']);
                this.dataVersion = dataset['dataversion'];
                this.dataVersionPress = true;
                if (this.typeId !== 'TAG') {
                    this.tableDocumentData = [];
                }
            }
        },

        reload() {
            this.pageShow = true;
            this.msg = '';
            this.createTime = '';
            this.dataVersion = 0;
            this.dataVersionPress = false;
            this.active = -1;
            this.branchTagIdLoading();
            this.preLoading();
        },
        // 输入控制
        changeChar(value) {
            // 输入匹配，输入限制
            this.searchInput = value.replace(/，/ig, ',').replace(/[\s]*[,][\s]*[,]{1,}([\s]+|[,]+)*/, ',').replace(/[^\w,]/g, '');
        },
        // 输入控制
        changeCharNewBranch() {
            // 输入匹配，输入限制
            this.createForm.mesh = this.createForm.mesh.replace(/，/ig, ',').replace(/[\s]*[,][\s]*[,]{1,}([\s]+|[,]+)*/, ',');
        },
        //数字检查函数
        changeNum() {
            // 数字
            this.dataForm.dataVersion = this.dataForm.dataVersion.replace(/[^\d]/g, '');
        },
        changeNumNewBranch() {
            // 输入匹配，输入限制
            this.createForm.mesh = this.createForm.mesh.replace(/，/ig, ',').replace(/[\s]*[,][\s]*[,]{1,}([\s]+|[,]+)*/, ',');
        },
        // 移除文件
        handleRemove(file, fileList) {
            this.fileList = fileList
        },
        // 提交失败
        handleError() {
            ElMessage.error({
                message: '提交失败',
                showClose: true,
            });
        },
        handleChange(fileList) {
            this.fileList.push(fileList)
        },
        handleUpload(val) {
            this.dataVisible = val
            this.fileList = []
            this.dataForm.dataVersion = ''
            this.dataForm.commitMsg = ''
        },
        uploadFun() {
            let commitData = new FormData();
            commitData.append('file', this.fileList[0].raw);
            commitData.append('emptyPartitions', this.searchInput);
            commitData.append('productIdentity', this.productId);
            commitData.append('branch', this.branchTagId);
            commitData.append('layerIdentity', 'features');
            commitData.append('dataVersion', this.dataForm.dataVersion);
            commitData.append('commitMsg', this.dataForm.commitMsg);
            if (this.dataForm.dataVersion && this.dataForm.commitMsg && this.fileList.length > 0) {
                // axios.defaults.withCredentials=false
                axios({
                    url: nioDataURL + '/data/commit',
                    method: 'post',
                    data: commitData,
                    headers: {
                            'Authorization': this.cookieValue,
                        }
                }).then(response => {
                    if (response.data.code === 200) {
                        ElMessage.success({
                            message: '数据提交成功',
                            showClose: true,
                        });
                        // 更新dataVersion和表格数据
                        this.branchTagIdLoading();
                        this.preLoading();
                    } else {
                        ElMessage.error({
                            message: response.data.msg,
                            showClose: true,
                        });
                    }
                    this.fileList = []
                }).catch(() => {
                    ElMessage.error({
                        message: '数据提交失败',
                        showClose: true,
                    });
                });
                this.dataVisible = false;
            } else {
                ElMessage.warning({
                    message: '有数据为空',
                    showClose: true,
                });
            }
        },
        // 查询、批量下载
        searchDownloadFun(val) {
            this.pageShow = false
            this.partitionNames = ''
            // 数据整理
            let commitData = new FormData()
            commitData.append('productIdentity', this.productId)
            commitData.append('layers', 'features')
            commitData.append('dataVersion', this.dataVersion)
            if (this.typeId === 'TAG') {
                commitData.append('tag', this.branchTagId)
            } else {
                commitData.append('branch', this.branchTagId)
            }
            // 接口3读取历史数据
            if (val === 'search') {
                if (this.searchInput) {
                    // 以输入框输入的数据为结果
                    this.partitionNames = this.searchInput[this.searchInput.length - 1] !== ',' ? this.searchInput.split(',') : this.searchInput.slice(0, -1).split(',')
                    commitData.append('partitionNames', this.partitionNames);
                    let url = nioDataURL + (this.typeId === 'TAG' ? '/data/read/v2' : '/data/read-with-version/v2');
                    axios({
                        url: url,
                        method: 'post',
                        data: commitData
                    }).then(response => {
                        if (response.data.code === 200) {
                            this.tableDocumentData = response.data.data.partitions;
                            for (let v of this.tableDocumentData) {
                                v.size = (v.size / 1e6).toFixed(3)
                            }
                        } else {
                            ElMessage.error({
                                message: response.data.msg,
                                showClose: true,
                            });
                        }
                    }).catch(() => {
                        ElMessage.error({
                            message: '没有获取到表格数据',
                            showClose: true,
                        });
                    });
                } else {
                    ElMessage.warning({
                        message: '输入框数据为空',
                        showClose: true,
                    });
                }
            } else {
                // 以表格中的选中的信息为结果
                this.partitionNames = this.multipleSelection.join(',')
                commitData.append('partitionNames', this.partitionNames)
                // 批量下载
                axios({
                    url: nioDataURL + '/data/batch-download',
                    method: 'post',
                    data: commitData,
                    responseType: 'blob',
                }).then(response => {
                    let blob = new Blob([response.data], {type: 'application/zip'});
                    // zip的命名
                    const fileName = this.productId + '_' + this.branchTagId + '_' + this.dataVersion + '.zip';
                    let downloadElement = document.createElement('a');
                    let href = window.URL.createObjectURL(blob); //创建下载的链接
                    downloadElement.href = href;
                    downloadElement.download = fileName; //下载后文件名
                    document.body.appendChild(downloadElement);
                    downloadElement.click(); //点击下载
                    document.body.removeChild(downloadElement); //下载完成移除元素
                    window.URL.revokeObjectURL(href); //释放blob
                }).catch(() => {
                    ElMessage.error({
                        message: '没有获取到表格数据',
                        showClose: true,
                    });
                })
            }
        },
        // 多选方法
        handleSelectionChange(val) {
            this.multipleSelection = [];
            for (let v of val) {
                this.multipleSelection.push(v.partitionName);
            }
        },
        // 默认调用
        preLoading() {
            let commitData = new FormData()
            commitData.append("productIdentity", this.productId);
            commitData.append("limit", this.pageSize);
            commitData.append("offset", this.offset);
            if (this.typeId === 'TAG') {
                commitData.append("tag", this.branchTagId);
            } else {
                commitData.append("branch", this.branchTagId);
            }
            if (this.dataVersionPress === false) {
                axios({
                    url: nioDataURL + '/data/get-partition/v2',
                    method: 'post',
                    data: commitData
                }).then(response => {
                    if (response.data.code === 200) {
                        this.total = response.data.data.totalCount;
                        if (this.total === 0) {
                            ElMessage.warning({
                                message: '没有文件相关数据',
                                showClose: false,
                            });
                            return;
                        }
                        this.partitionNames = [];
                        for (let v of response.data.data.partitionsByLayer[0].partitions) {
                            this.partitionNames.push(v.partitionName);
                        }
                        //  获取到partitionNames后，调用下一个接口
                        this.documentLoading();
                    }
                }).catch(() => {
                    ElMessage.error({
                        message: '没有获取到文件表格数据',
                        showClose: true,
                    });
                })
            }
        },
        documentLoading() {
            let commitData = new FormData();
            commitData.append("productIdentity", this.productId);
            commitData.append("layers", 'features');
            commitData.append("partitionNames", this.partitionNames);
            if (this.typeId !== 'TAG') {
                commitData.append("dataVersion", this.dataVersion);
            }
            if (this.typeId === 'TAG') {
                commitData.append("tag", this.branchTagId);
            } else {
                commitData.append("branch", this.branchTagId);
            }
            let url = nioDataURL + (this.typeId === 'TAG' ? '/data/read/v2' : '/data/read-with-version/v2');
            axios({
                url: url,
                method: 'post',
                data: commitData
            }).then(response => {
                if (response.data.code === 200) {
                    this.tableDocumentData = response.data.data.partitions;
                    for (let v of this.tableDocumentData) {
                        v.size = (v.size / 1e6).toFixed(3)
                    }
                } else {
                    ElMessage.error({
                        message: response.data.msg,
                        showClose: true,
                    });
                }
            }).catch(() => {
                ElMessage.error({
                    message: '没有获取到表格数据',
                    showClose: true,
                });
            })
        },
        // 分页组件
        handleSizeDetail(page_size) {
            this.pageSize = page_size;
            this.preLoading();
        },
        handleCurrentDetail(page) {
            this.currentPage = page;
            this.offset = (page - 1) * this.pageSize;
            this.preLoading();
        },
        // dataVersion数据获取
        branchTagIdLoading(val) {
            if (val === 1) {
                this.currentPageBranch -= 10;
            } else if (val === 2) {
                this.currentPageBranch += 10;
            }
            let data = new FormData();
            data.append("productIdentity", this.productId);
            data.append("branchName", this.branchTagId);
            data.append("offset", this.currentPageBranch);
            data.append("limit", 10);
            if (this.currentPageBranch > -1) {
                axios({
                    url: nioDataURL + '/product/data-version/list',
                    method: 'post',
                    data: data
                }).then(response => {
                    if (response.data.code === 200) {
                        this.active = -1;
                        this.totalBranch = response.data.data.totalCount;
                        if (this.totalBranch === 0) {
                            ElMessage.warning({
                                message: '没有dataVersion数据',
                                showClose: false,
                            });
                            return;
                        }
                        if (this.currentPageBranch === 0) {
                            // 获取最新的dataVersion
                            this.dataVersion = response.data.data.dataVersions[0].dataVersion;
                        }
                        this.stepItems = response.data.data.dataVersions;
                        for (let v of this.stepItems) {
                            v.dataVersion = v.dataVersion.toString();
                        }
                    } else {
                        ElMessage.error({
                            message: response.data.msg,
                            showClose: true,
                        });
                    }
                }).catch(() => {
                    ElMessage.error({
                        message: '没有获取到dataVersion数据',
                        showClose: true,
                    });
                });
            }
        },
        adaptiveTableDContainerHeight() {
            this.tableDHeight = document.getElementById('DocumentTableContainer') === null ? 0 : document.getElementById('DocumentTableContainer').offsetHeight
        }
    },
    mounted() {
        this.$nextTick(() => {
            this.adaptiveTableDContainerHeight()
        })
        window.addEventListener('resize', this.adaptiveTableDContainerHeight, false)
    },
    created() {
        this.pageShow = true
        this.branchTagIdLoading()
        this.preLoading()
    }
}
</script>

<style scoped>
.popover-content {
    text-align: center;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

:deep(.el-descriptions__table) {
    /*display: flex;*/
    table-layout: fixed;
}

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

#ProductDetailDocument {
    margin: 5px 20px 10px 20px;
    height: calc(100% - 40px);
    font-size: 14px;
    display: flex;
    flex-flow: column nowrap;
    justify-content: flex-start;
}

#dataDiv {
    /*position: absolute;*/
    width: calc(100% - 40px) !important;
}

#t-steps-div {
    overflow-x: scroll;
    margin: 0 60px 0 0;
}

#commitDiv {
    /*display: inline-block;*/
    margin: 10px 5px 0 0;
}

.button_style {
    margin-left: 10px;
}

#DocumentTableContainer {
    margin-top: 5px;
    flex: 1;
    overflow: hidden;
}

.tPaginationContainer {
    width: calc(100% - 40px) !important;
    height: 44px;
}

</style>
