<template>
    <div class="inspection-template-container">
        <div class="title-wrapper">
            <span>质检模板配置</span>
            <mtd-button
                v-lxay
                @click="handleAddCustomTemplate"
                class="add-template-btn"
                icon="iconfont mtdicon-add"
                type="primary">添加质检模板</mtd-button>
        </div>
        <mtd-table v-loading="tableLoading" :data="templateList">
            <div slot="empty">
                <i class="iconfont icon-hulk-zanwushuju" />
                <p class="no-data">暂无数据</p>
            </div>
            <pm-table-column-link
                label="模板名称"
                prop="name"
                min-width="40%"
                show-overflow-tooltip
                :pm-to="toPage" />
            <mtd-table-column
                prop="desc"
                label="模板说明"
                show-overflow-tooltip>
                <template slot-scope="scope">
                    <span>{{ scope.row.desc || '-' }}</span>
                </template>
            </mtd-table-column>
            <pm-table-column-member
                min-width="25%"
                label="创建人"
                pm-avatar-key="avatarUrl"
                pm-mis-key="name"
                pm-name-key="displayName"
                prop="createdBy" />
            <pm-table-column-member
                min-width="25%"
                label="最后修改人"
                pm-avatar-key="avatarUrl"
                pm-mis-key="name"
                pm-name-key="displayName"
                prop="updatedBy" />
            <pm-table-column-date
                label="最后修改时间"
                prop="updatedAt"
                min-width="25%"
                show-overflow-tooltip
                pm-formatter="YYYY-MM-DD HH:mm:ss" />
            <pm-table-column-operation
                label="操作"
                min-width="30%"
                prop="operations"
                pm-type="text"
                :pm-operations="operations"
                :pm-disable-method="disableMethod" />
        </mtd-table>
        <div v-if="total > Math.min(...pageSizes)" class="pagination-container">
            <mtd-pagination
                :total="total"
                size="small"
                show-size-changer
                show-total
                :current-page.sync="currentPage"
                :page-size.sync="limit"
                @change="handleChange" />
        </div>
    </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import * as api from '@/api';
import { PaginationMixin } from '@/utils/mixin';
import { DEFAULT_AVATAR } from '@/config/map.conf';
/**
 * 质检模板列表
 *
 */
@Component({})
export default class InspectionTemplate extends PaginationMixin {
    templateList: CommonTypes.mapObject = [];
    tableLoading: Boolean = true;
    $mtd: any;
    userAvatar: string = DEFAULT_AVATAR;

    created () {
        this.getInspectTemplateList();
    }
    async getInspectTemplateList () {
        this.tableLoading = true;
        try {
            const res = await api.inspectApi.getInspectTemplateList(this.currentPage, this.limit, {
                objectId: this.spaceId
            });
            const { code, data } = res;
            if (code === 200) {
                this.templateList = (data.items || []).map(item => {
                    item.createdBy.displayName = item.createdBy.displayName || item.createdBy.name;
                    item.updatedBy.displayName = item.updatedBy.displayName || item.updatedBy.name;
                    return item;
                });
                this.total = data.tn;
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
        this.getInspectTemplateList();
    }
    // 复制模板
    async handleCopyTemplate (id: number, version: number) {
        const res = await api.inspectApi.copyInspectTemplate(id, version);
        const { code } = res;
        if (code === 200) {
            this.$mtd.message.success('模板复制成功');
            this.getInspectTemplateList();
        }
    }
    // 跳转模板编辑页
    handleEditTemplate (id: number, version: number) {
        this.$router.push({
            name: 'quality-inspection-template',
            query: {
                spaceId: this.spaceId.toString(),
                formId: id.toString(),
                version: version.toString()
            }
        }).catch(e => e);
    }
    // 删除模板
    handleDeleteTemplate (id: number, version: number) {
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
                    await api.inspectApi.deleteInspectTemplate({
                        templateId: id,
                        templateVersion: version
                    });
                    this.$mtd.message({
                        message: '删除成功',
                        type: 'success'
                    });
                    await this.getInspectTemplateList();
                } catch (e) {
                    console.log(e);
                }
            }
        }).catch(e => e);
    }
    // 跳转模板添加页
    handleAddCustomTemplate () {
        this.$router.push({
            name: 'quality-inspection-template',
            query: {
                spaceId: `${this.spaceId}`
            }
        }).catch(e => e);
    }
    disableMethod (action: string, { row }: any) {
        return action === 'delete' && !row.deletable;
    }
    toPage ({ row }: any) {
        this.handleEditTemplate(row.id, row.version);
    }
    get operations () {
        return [{
            label: '复制',
            action: 'copy',
            click: (action: string, scope: any) => {
                this.handleCopyTemplate(scope.row.id, scope.row.version);
            }
        }, {
            label: '编辑',
            action: 'edit',
            click: (action: string, scope: any) => {
                this.handleEditTemplate(scope.row.id, scope.row.version);
            }
        }, {
            label: '删除',
            action: 'delete',
            click: (action: string, scope: any) => {
                this.handleDeleteTemplate(scope.row.id, scope.row.version);
            },
            tip: '当前无法删除，因为有未完成质检任务使用了该模版。'
        }];
    }
    get spaceId () {
        return parseInt(this.$route.params.id, 10);
    }
}
</script>

<style lang="postcss">
.inspection-template-container {
    .title-wrapper {
        display: flex;
        padding: 16px 0;
        text-align: left;
        font-weight: 600;
        font-family: PingFangSC-Semibold;
        font-size: 16px;
        justify-content: space-between;
        align-items: center;
        .add-template-btn {
            float: right;
            font-weight: 500;
            font-family: PingFangSC-Medium;
            font-size: 14px;
        }
    }
    .mtd-table {
        .mtd-btn {
            font-size: 14px;
        }
    }
    .pagination-container {
        padding: 12px 0;
        margin: 0;
    }
}
</style>
