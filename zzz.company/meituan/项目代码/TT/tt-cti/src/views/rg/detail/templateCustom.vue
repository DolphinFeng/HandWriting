<template>
    <div class="template-container">
        <mtd-button
            @click="handleGoToSettingPage"
            class="setting-template-btn">
            设置
        </mtd-button>
        <mtd-button
            v-lxay
            @click="handleAddCustomTemplate"
            class="add-template-btn"
            icon="iconfont icon-template-add-"
            lxay-act="moduleClick"
            lxay-bid="b_onecloud_5xdse0lm_mc"
            type="primary"
            :disabled="!permission">添加新模板</mtd-button>
        <h1 class="form-link">自定义表单访问链接：{{ formlink }}
            <span
                style="cursor: pointer;"
                v-clipboard="onCopy"
                @success="handleCopySuccess"><i class="iconfont icon-Copy-" /></span>
        </h1>
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
                    <mtd-tooltip
                        theme="dark"
                        content="复制链接"
                        placement="top">
                        <span
                            :class="['table-button', {'unable': !permission}]"
                            v-clipboard="handleCopyLink(scope.row)"
                            @success="handleCopySuccess"><i class="iconfont icon-link-o" /></span>
                    </mtd-tooltip>
                    <mtd-tooltip
                        theme="dark"
                        content="复制模板"
                        placement="top">
                        <span :class="['table-button', {'unable': !permission}]" @click="handleCopyTemplate(scope.row)"><i class="iconfont icon-Copy-" /></span>
                    </mtd-tooltip>
                    <mtd-dropdown trigger="hover">
                        <mtd-icon-button
                            type="secondary"
                            icon="mtdicon mtdicon-ellipsis" />
                        <mtd-dropdown-menu slot="dropdown">
                            <mtd-dropdown-menu-item @click="handleEditTemplate(scope.row.id)"><i class="iconfont icon-edit-" /> 编辑</mtd-dropdown-menu-item>
                            <mtd-dropdown-menu-item @click="handleDeleteTemplate(scope.row.id)"><i class="iconfont icon-shanchu-" /> 删除</mtd-dropdown-menu-item>
                            <mtd-dropdown-menu-item @click="customFormDownloadMode(scope.row)"><i class="iconfont icon-file-export" /> 导出模板数据</mtd-dropdown-menu-item>
                            <mtd-dropdown-menu-item @click="handleSetPermission(scope.row)"><i class="mtdicon mtdicon-setting" /> 设置模版权限</mtd-dropdown-menu-item>
                        </mtd-dropdown-menu>
                    </mtd-dropdown>
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
        <template-permission-dialog
            :id="currentTemplate.id"
            :orgs="currentTemplate.permissionOrgs"
            v-if="templatePermissionVisible"
            @success="getRgCustomTemplate"
            @close="templatePermissionVisible = false" />
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import * as api from '@/api';
import { PaginationMixin } from '@/utils/mixin';
import { State } from 'vuex-class';

import TemplatePermissionDialog from './components/template-permission-dialog.vue';

import VueClipboards from 'vue-clipboards';

import axios from 'axios';
Vue.use(VueClipboards);

/**
 * rg模板列表
 *
 * @author xiaokunyu
 * @date 03/28/2019
 */
@Component({
    components: {
        TemplatePermissionDialog
    }
})
export default class RgTemplate extends PaginationMixin {
    @State(state => state.cti.permission.rg_template)
    permission: boolean;

    @State(state => state.cti.env)
    env: string;

    templateList: any = [];
    templatePermissionVisible: boolean = false;
    currentTemplate: any = 0;

    rgId: number = 0;
    tableLoading: Boolean = true;
    $mtd: any;

    templateId: number = 0;
    hoverContent: string = '';
    formlink: string = '';

    mounted () {
        this.rgId = parseInt(this.$route.query.rgId as string, 10); ;
        this.getRgCustomTemplate();
        this.formlink = `${this.getBaseURL}/ticket/helpdesk/${this.rgId}`;
    }

    get getBaseURL () {
        return this.env === 'prod' ? 'https://tt.sankuai.com' : 'http://tt.cloud.test.sankuai.com';
    }

    async getRgCustomTemplate () {
        this.tableLoading = true;
        try {
            const res = await api.rgApi.getRgCustomTemplate({
                cn: this.currentPage,
                sn: this.limit,
                rgId: this.rgId
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
                    this.getRgCustomTemplate();
                }
                this.templateList = data.items;
            }
        } catch (e) {
            this.templateList = [];
            console.log(e);
        }
        this.tableLoading = false;
    }
    handleGoToSettingPage () {
        this.$router.push({
            name: 'rg_template_announcement',
            query: {
                ...this.$route.query
            }
        }).catch(e => e);
    }
    handleChange (current: number, size: number) {
        this.limit = size;
        this.currentPage = current;
        this.getRgCustomTemplate();
    }
    // 复制rg模板
    async handleCopyTemplate (row: any) {
        const data = await this.getCustomFormDetail(row.id);
        await api.rgApi.addRgCustomTemplate({
            name: data.name + '-副本',
            instruction: data.instruction + `${data.name}的副本`,
            // permissionOrgs: data.permissionOrgs,
            customFieldContents: data.customFieldContents,
            rgId: this.rgId,
            type: '定制表单'
        });
        this.$mtd.message.success('模板复制成功');
        this.getRgCustomTemplate();
    }
    handleCopyLink (row) {
        // todo
        return row.copyLink;
    }
    onCopy () {
        return this.formlink;
    }
    handleCopySuccess () {
        this.$mtd.message.success('复制成功');
    }
    // 获取模板content
    async getCustomFormDetail (id) {
        const res = await api.rgApi.getCustomFormDetail(id, true);
        const { data } = res;
        return data;
    }
    // 编辑rg模板
    handleEditTemplate (id: number) {
        this.$router.push({
            name: 'custom-form',
            query: {
                rgId: `${this.rgId}`,
                formId: `${id}`
            }
        }).catch(e => e);
    }
    // 删除rg模板
    handleDeleteTemplate (id: number) {
        this.$mtd.confirm({
            title: '你是否确认删除该模板？',
            width: '433px',
            showCancelButton: true,
            type: 'warning',
            okButtonText: '删除',
            okButtonProps: {
                type: 'danger'
            },
            onOk: async () => {
                try {
                    await api.rgApi.deleteRgCustomTemplate(id);
                    this.$mtd.message({
                        message: '删除成功',
                        type: 'success'
                    });
                    await this.getRgCustomTemplate();
                } catch (e) {
                    console.log(e);
                }
            }
        }).catch(e => e);
    }
    async customFormDownloadMode (row) {
        const res = await api.ticketApi.customFormDownloadMode({
            customFormId: row.id
        });
        const { code, data } = res;
        if (code === 200) {
            if (data.sync) {
                this.handleExportTemplate(row);
            } else {
                this.$mtd.message.success(data.message);
            }
        }
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
        }).catch((e) => {
            console.log(e);
        });
    }
    handleAddCustomTemplate () {
        this.$router.push({
            name: 'custom-form',
            query: {
                rgId: `${this.rgId}`
            }
        }).catch(e => e);
    }
    handleSetPermission (row) {
        this.currentTemplate = row;
        this.templatePermissionVisible = true;
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
.template-container {
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
.template-tooltip-content {
    max-height: 200px;
    overflow: auto;
}
.form-link {
    background: #F2F2F2;
    margin-bottom: 8px;
    padding: 0 8px;
}
</style>
