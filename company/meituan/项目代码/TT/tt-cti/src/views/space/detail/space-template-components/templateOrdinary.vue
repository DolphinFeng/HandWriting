<template>
    <div class="space-ordinary-template-container">
        <mtd-button
            v-lxay
            @click="addTemplateVisible = true"
            class="add-template-btn"
            icon="iconfont icon-template-add-"
            lxay-act="moduleClick"
            lxay-bid="b_onecloud_5xdse0lm_mc"
            type="primary"
            :disabled="!permission">添加新模板</mtd-button>
        <mtd-table v-loading="tableLoading" :data="templateList">
            <div slot="empty">
                <i class="iconfont icon-hulk-zanwushuju" />
                <p class="no-data">暂无数据</p>
            </div>
            <mtd-table-column
                prop="name"
                label="模板名称"
                min-width="25%" />
            <mtd-table-column
                min-width="20%"
                label="绑定目录">
                <template slot-scope="scope">
                    <span>{{ scope.row.bindCTI ? '已绑定' : '未绑定' }}</span>
                    <mtd-tooltip theme="light" placement="top">
                        <div
                            slot="content"
                            v-html="hoverContent"
                            class="template-tooltip-content" />
                        <span
                            v-if="scope.row.bindCTI"
                            class="total-tip"
                            @mouseenter="handleCatalogDetail(scope.row.id, scope.row.bindCTI)">共 {{ scope.row.bindCTI }} 个</span>
                    </mtd-tooltip>
                </template>
            </mtd-table-column>
            <mtd-table-column
                min-width="10%"
                label="创建者">
                <template slot-scope="scope">
                    <span>{{ `${scope.row.displayName}（${scope.row.mis}）` }}</span>
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
                min-width="5%"
                label="操作">
                <template slot-scope="scope">
                    <mtd-tooltip
                        theme="dark"
                        content="复制"
                        placement="top">
                        <span :class="['table-button', {'unable': !scope.row.crud.copy}]" @click="handleCopyTemplate(scope.row)"><i class="iconfont icon-Copy-" /></span>
                    </mtd-tooltip>
                    <mtd-tooltip
                        theme="dark"
                        content="编辑"
                        placement="top">
                        <span :class="['table-button', {'unable': !scope.row.crud.update}]" @click="handleEditTemplate(scope.row.id, scope.row.crud.update)"><i class="iconfont icon-edit-" /></span>
                    </mtd-tooltip>
                    <mtd-tooltip
                        theme="dark"
                        content="删除"
                        placement="top">
                        <span :class="['table-button', {'unable': !scope.row.crud.delete}]" @click="handleDeleteTemplate(scope.row.id, scope.row.bindCTI, scope.row.crud.delete)"><i class="iconfont icon-shanchu-" /></span>
                    </mtd-tooltip>
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
        <add-space-template
            v-if="addTemplateVisible"
            @close="addTemplateVisible = false"
            @success="getSpaceTemplate" />
        <add-space-template
            v-if="editTemplateVisible"
            :is-edit="true"
            :template-id="templateId"
            @close="editTemplateVisible = false"
            @success="getSpaceTemplate" />
    </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import * as api from '@/api';
import { PaginationMixin } from '@/utils/mixin';
import { State } from 'vuex-class';
import AddSpaceTemplate from './templateSettings/add-space-template.vue';
/**
 * rg模板列表
 *
 * @author xiaokunyu
 * @date 03/28/2019
 */
@Component({
    components: {
        AddSpaceTemplate
    }
})
export default class RgTemplate extends PaginationMixin {
    @State(state => state.cti.permission.rg_template)
    permission: boolean;

    templateList: any = [];
    addTemplateVisible: Boolean = false;
    editTemplateVisible: Boolean = false;

    spaceId: number = 0;
    tableLoading: Boolean = true;
    $mtd: any;

    templateId: number = 0;
    hoverContent: string = '';
    mounted () {
        this.spaceId = parseInt(this.$route.params.id, 10);
        this.getSpaceTemplate();
    }
    async getSpaceTemplate () {
        this.tableLoading = true;
        try {
            const res = await api.spaceApi.getSpaceTemplate({
                cn: this.currentPage,
                sn: this.limit,
                spaceId: this.spaceId,
                type: 'NORMAL'
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
    async handleCatalogDetail (id: number, bindCTI: number) {
        if (bindCTI === 0) {

        } else {
            this.hoverContent = await this.getCatalogByTemplate(id);
        }
    }
    // 通过模板id获取绑定目录
    async getCatalogByTemplate (id: number) {
        try {
            const res = await api.rgApi.getCatalogByTemplate(id, 'NORMAL');
            const { code, data } = res;
            if (code === 200) {
                const displayList = data.items.map((catalog) => {
                    let display = `${catalog.categoryName}／${catalog.typeName}`;
                    if (catalog.itemName) {
                        display += `／${catalog.itemName}`;
                    }
                    return display;
                });
                return displayList.join('</br>');
            }
        } catch (e) {
            console.log(e);
        }
    }
    // 复制rg模板
    async handleCopyTemplate (row: any) {
        const content = await this.getTemplateDetail(row.id);
        if (!row.crud.copy) return;
        try {
            await api.rgApi.addRgTemplate({
                name: row.name + '-副本',
                content: content,
                rgId: row.rgId
            });
            this.$mtd.message.success('模板复制成功');
            this.getSpaceTemplate();
        } catch (e) {
            console.log(e);
        }
    }
    // 获取模板content
    async getTemplateDetail (templateId) {
        try {
            const res = await api.rgApi.getTemplateById(templateId);
            const { code, data } = res;
            if (code === 200) {
                return data.content;
            }
        } catch (e) {
            console.log(e);
        }
    }
    // 编辑rg模板
    handleEditTemplate (id: number, control: Boolean) {
        if (!control) {
            return;
        }
        this.templateId = id;
        this.editTemplateVisible = true;
    }
    // 删除rg模板
    handleDeleteTemplate (id: number, bindCTI: Boolean, control: Boolean) {
        if (!control) {
            return;
        }
        if (bindCTI) {
            this.unableDelete();
            return;
        }
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
                    await api.rgApi.deleteRgTemplate(id);
                    this.$mtd.message({
                        message: '删除成功',
                        type: 'success'
                    });
                    await this.getSpaceTemplate();
                } catch (e) {
                    console.log(e);
                }
            }
        }).catch(e => e);
    }
    // 不允许删除模板提示
    unableDelete () {
        this.$mtd.confirm({
            title: '目前已经绑定了目录，暂时无法删除',
            type: 'warning',
            width: '433px',
            okButtonText: '知道了'
        }).catch(e => e);
    }
}
</script>

<style lang="postcss" scoped>
.space-ordinary-template-container {
    position: relative;
    margin-top: 8px;
    .add-template-btn {
        position: absolute;
        top: -50px;
        right: 0;
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
    }
}
.template-tooltip-content {
    max-height: 200px;
    overflow: auto;
}
</style>
