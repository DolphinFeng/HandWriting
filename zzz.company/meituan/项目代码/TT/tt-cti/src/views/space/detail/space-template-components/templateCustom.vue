<template>
    <div class="space-custom-template-container">
        <mtd-table v-loading="tableLoading" :data="templateList">
            <div slot="empty">
                <i class="iconfont icon-hulk-zanwushuju" />
                <p class="no-data">暂无数据</p>
            </div>
            <mtd-table-column
                prop="name"
                label="模板名称"
                min-width="25%">
                <template slot-scope="scope">
                    <!-- FIXME: 找不到 rgId -->
                    <router-link
                        :to="{
                            name: 'custom-form',
                            query: {
                                rgId: rgId,
                                formId: scope.row.id
                            }
                        }"
                        :disabled="!permission">{{ scope.row.name }}</router-link></template>
            </mtd-table-column>
            <mtd-table-column
                prop="instruction"
                label="模板说明"
                min-width="20%"
                show-overflow-tooltip />
            <mtd-table-column
                prop="permissionOrgs"
                label="模板访问权限"
                min-width="20%"
                show-overflow-tooltip>
                <template slot-scope="scope">
                    <span> {{ formatOrgs(scope.row.permissionOrgs || []) || '无限制' }}</span>
                </template>
            </mtd-table-column>
            <mtd-table-column
                min-width="10%"
                label="创建人">
                <template slot-scope="scope">
                    <span>{{ `${scope.row.displayName}/${scope.row.createdBy}` }}</span>
                </template>
            </mtd-table-column>
            <mtd-table-column
                min-width="10%"
                label="添加时间">
                <template slot-scope="scope">
                    <span>{{ scope.row.createdAt | formatTime }}</span>
                </template>
            </mtd-table-column>
            <mtd-table-column
                min-width="10%"
                label="操作">
                <template slot-scope="scope">
                    <span
                        :class="['table-button', {'unable': !permission}]"
                        v-clipboard="handleCopyLink(scope.row)"
                        @success="handleCopySuccess">复制链接</span>
                    <span :class="['table-button', {'unable': !permission}]" @click="handleExportTemplate(scope.row)">导出模板数据</span>
                </template>
            </mtd-table-column>
        </mtd-table>
        <div v-if="total > Math.min(...pageSizes)" class="pagination-container">
            <mtd-pagination
                :total="total"
                show-size-changer
                show-total
                :current-page.sync="currentPage"
                :page-size.sync="limit"
                @change="handleChange" />
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import * as api from '@/api';
import { PaginationMixin } from '@/utils/mixin';
import { State } from 'vuex-class';

import VueClipboards from 'vue-clipboards';

import axios from 'axios';
Vue.use(VueClipboards);

/**
 * rg模板列表
 *
 * @author xiaokunyu
 * @date 03/28/2019
 */
@Component
export default class SpaceTemplateCustom extends PaginationMixin {
    @State(state => state.cti.permission.rg_template)
    permission: boolean;

    templateList: any = [];
    templatePermissionVisible: boolean = false;
    currentTemplate: number = 0;

    spaceId: number = 0;
    tableLoading: Boolean = true;
    $mtd: any;

    templateId: number = 0;
    hoverContent: string = '';

    mounted () {
        this.spaceId = parseInt(this.$route.params.id as string, 10);
        this.getSpaceTemplate();
    }
    async getSpaceTemplate () {
        this.tableLoading = true;
        try {
            const res = await api.spaceApi.getSpaceTemplate({
                cn: this.currentPage,
                sn: this.limit,
                spaceId: this.spaceId,
                type: 'CUSTOM'
            });
            const { code, data } = res;
            if (code === 200) {
                this.templateList = data.items;
                this.total = data.tn;
                if (this.total > 0 && !data.items.length) {
                    this.currentPage -= 1;
                    if (this.currentPage <= 0) {
                        this.currentPage = 1;
                    }
                    this.getSpaceTemplate();
                }
                this.templateList = data.items;
            }
        } catch (e) {
            this.templateList = [];
            console.log(e);
        }
        this.tableLoading = false;
    }
    handleChange (current: number, size: number) {
        this.limit = size;
        this.currentPage = current;
        this.getSpaceTemplate();
    }
    handleCopyLink (row) {
        // todo
        return row.copyLink;
    }
    handleCopySuccess () {
        this.$mtd.message.success('复制成功');
    }
    handleExportTemplate (row) {
        axios({
            url: '/api/tt/1.0/file/download/by/custom/form',
            method: 'GET',
            responseType: 'blob',
            params: {
                customFormId: row.id
            }
        }).then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `模板“${row.name}”数据下载.xlsx`);
            document.body.appendChild(link);
            link.click();
        }).catch(e => e);
    }
    formatOrgs (permissionOrgs) {
        const orgs = permissionOrgs.map(item => {
            return item.orgPath;
        });
        return orgs.join('、');
    }
}
</script>

<style lang="postcss" scoped>
.space-custom-template-container {
    position: relative;
    margin-top: 8px;
    .add-template-btn {
        position: absolute;
        top: -50px;
        right: 0;
        z-index: 999;
    }
    .setting-template-btn {
        position: absolute;
        top: -50px;
        right: 120px;
        z-index: 999;
    }
    .total-tip {
        color: #FF8800;
        cursor: pointer;
    }
    .table-button {
        color: #939DB2;
        cursor: pointer;
        &.unable {
            color: #D3D8E4;
            cursor: not-allowed;
            &:hover {
                color: #D3D8E4;
            }
        }
        &:hover {
            color: #FF8800;
        }
        &.export-button {
            margin-left: 10px;
            padding-left: 10px;
            border-left: 1px solid rgba(0, 0, 0, 0.12);
        }
    }
}
</style>
