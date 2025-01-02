<template>
    <div id="ProductComponent" class="component">
        <!-- 面包屑：展示产品的产品详情 -->
        <el-breadcrumb class="breadcrumb" :separator-icon="ArrowRight">
            <el-breadcrumb-item>
                <div class="breadcrumbItem">数据管理平台</div>
            </el-breadcrumb-item>
            <el-breadcrumb-item>
                <div class="breadcrumbItem" @click="ProductShow('Product')"
                    :class="{'active-breadcrumb-item': $store.state.activeBreadcrumbIndex === 1}">产品管理
                </div>
            </el-breadcrumb-item>
            <el-breadcrumb-item v-if="['detail', 'branch', 'document'].includes(breadcrumbProductShow)">
                <div class="breadcrumbItem" @click="ProductShow('detail')"
                    :class="{'active-breadcrumb-item': $store.state.activeBreadcrumbIndex === 2}">产品详情
                </div>
            </el-breadcrumb-item>
            <el-breadcrumb-item v-if="breadcrumbProductShow === 'branch'">
                <div class="breadcrumbItem" @click="ProductShow('branch')"
                    :class="{'active-breadcrumb-item': $store.state.activeBreadcrumbIndex === 3}">编辑分支
                </div>
            </el-breadcrumb-item>
            <el-breadcrumb-item v-if="breadcrumbProductShow === 'document'">
                <div class="breadcrumbItem" @click="ProductShow('document')"
                    :class="{'active-breadcrumb-item': $store.state.activeBreadcrumbIndex === 4}">文件详情
                </div>
            </el-breadcrumb-item>
        </el-breadcrumb>
        <ProductSearch
            :search-form="searchForm"
            :show-search-form="showSearchForm"
            @searchHandler="searchHandler"
            @resetHandler="resetHandler"
        >
        </ProductSearch>
        <!-- 主表格信息组件 -->
        <ProductTable
            v-if="breadcrumbProductShow==='Product'"
            :tableData="tableData"
            @handleDetail="handleDetail"
            @handleSizeChange="handleSizeChange"
            @handleCurrentChange="handleCurrentChange"
        ></ProductTable>
        <!--产品详情-->
        <ProductDetail
            v-if="breadcrumbProductShow==='detail'"
            :detailForm="detailForm"
            :productId="productId"
            @ProductShow="ProductShow"
            @handleSkip="handleSkip"
            @handlePartitionName="handlePartitionName"
        ></ProductDetail>
        <!-- 编辑分支 -->
        <ProductDetailDocument
            v-if="breadcrumbProductShow==='branch'"
            :productId="productId"
            :branchTagId="branchTagId"
            :typeId="typeId"
        ></ProductDetailDocument>
        <!-- 文件详情 -->
        <DocumentDetail
            v-if="breadcrumbProductShow==='document'"
            :productIdentity="productId"
            :partitionName="partitionName"
            @ProductShow="ProductShow"
        ></DocumentDetail>
    </div>
</template>

<script>
// 引入需要的组件
import ProductTable from "./ProductTable.vue";
import ProductDetail from "./ProductDetail.vue";
import BranchDetail from "./ProductDetailBranch.vue";
import ProductDetailDocument from "./ProductDetailDocument.vue";
import DocumentDetail from "./DocumentDetail.vue";
import {ArrowRight, Refresh} from "@element-plus/icons-vue";
// 引入js数据
import {detailForm} from "@/js/product_data.js";
import {dateFormat} from "@/js/format_data.js";
import {ElMessage} from "element-plus";
import axios from "axios";
import store from "../../store/index.js";
import {reactive, ref} from "vue";
import ProductSearch from "@/productPms/version/ProductSearch.vue";

const nioDataURL = window.api.nioDataURL;

export default {
    name: "ProductComponent",
    // 组件注册
    components: {
        ProductSearch,
        ProductTable,
        ProductDetail,
        BranchDetail,
        ProductDetailDocument,
        DocumentDetail
    },
    data() {
        return {
            breadcrumbProductShow: 'Product',
            productId: '',
            branchTagId: '',
            // 存储是分支还是tag
            typeId: '',
            detailForm: {
                ...detailForm
            },
            partitionName: ''
        }
    },
    setup() {
        const tableData = reactive({
            list: [],
            pageSize: 20,
            total: 0,
            currentPage: 1,
        });
        // 不带搜索的查询
        const loadingPage = function () {
            let data = new FormData();
            data.append("offset", (tableData.currentPage - 1) * tableData.pageSize);
            data.append("limit", tableData.pageSize);
            axios({
                url: nioDataURL + '/product/list',
                method: 'post',
                data: data
            }).then(response => {
                if (response.data.code === 200) {
                    tableData.total = response.data.data.totalCount;
                    if (tableData.total === 0) {
                        ElMessage.warning({
                            message: '没有数据',
                            showClose: true,
                        });
                        return;
                    }
                    response.data.data.productList.map(item => {
                        item.createTime = dateFormat(item.createTime);
                        item.updateTime = dateFormat(item.updateTime);
                        return item;
                    });
                    tableData.list = response.data.data.productList;
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
        };
        //带搜索的查询
        const loadingSearchPage = function () {
            let form = new FormData();
            form.append('productIdentity', searchForm.productIdentity);
            axios({
                url: nioDataURL + '/product/search',
                method: 'post',
                data: form,
            }).then(res => {
                if (res.data.code === 200) {
                    let data = res.data.data;
                    tableData.currentPage = 1;
                    tableData.total = data.totalCount;
                    tableData.list = data.productList;
                } else {
                    throw new Error(res.data.msg);
                }
            }).catch(err => {
                ElMessage.warning({
                    message: '查询失败：' + err.message,
                    showClose: false,
                    grouping: true,
                });
            });
        };
        //搜索内容
        const searchForm = reactive({
            productIdentity: '',
        });
        //查询事件
        const searchHandler = function () {
            if (searchForm.productIdentity.trim() === '') {
                loadingPage();
            } else {
                loadingSearchPage();
            }
        };
        const resetHandler = function () {
            searchForm.productIdentity = '';
        };
        const showSearchForm = ref(true);
        return {
            ArrowRight, Refresh, searchForm, showSearchForm, tableData, loadingPage,
            searchHandler, resetHandler,
        }
    },
    methods: {
        // 面包屑显示节点
        ProductShow(val) {
            this.breadcrumbProductShow = val;
            if (val === 'Product') {
                this.searchHandler();
                this.showSearchForm = true;
                store.commit('breadChange', 1);
            } else if (val === 'detail') {
                store.commit('breadChange', 2);
            } else if (val === 'branch') {
                store.commit('breadChange', 3);
            } else {
                store.commit('breadChange', 4);
            }
        },
        handleSkip(row) {
            this.branchTagId = row.identityName;
            this.typeId = row.type;
        },
        handleDetail(row) {
            store.commit('breadChange', 2);
            this.showSearchForm = false;
            this.productId = row.productIdentity
            for (let i in this.detailForm) {
                for (let j in row) {
                    if (i === j) {
                        this.detailForm[i] = row[j]
                    }
                }
            }
            this.breadcrumbProductShow = 'detail'
        },
        handlePartitionName(value) {
            this.partitionName = value;
        },

        // 表格size改变时触发函数
        handleSizeChange(pageSize) {
            this.tableData.pageSize = pageSize;
            this.tableData.currentPage = 1;
            this.loadingPage();
        },
        // 表格当前页码改变时触发函数
        handleCurrentChange(curPage) {
            this.tableData.currentPage = curPage;
            this.loadingPage();
        },
    },
    mounted() {
        // 页面加载时调用函数
        this.loadingPage();
    }
}
</script>
<style scoped>
:deep(.el-form-item) {
    margin-bottom: 0;
}
</style>
