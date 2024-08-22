<template>
    <div class="trigger-container">

        <div class="title-wrapper">
            <span>触发器列表</span>
            <mtd-button
                @click="handleAddTrigger"
                class="add-trigger-btn"
                icon="iconfont icon-template-add-"
                type="primary"
                :disabled="!permission">添加触发器</mtd-button>
        </div>
        <mtd-table
            v-loading="tableLoading"
            row-key="number"
            :row-class="rowClass"
            :data="triggerList">
            <div slot="empty">
                <i class="iconfont icon-hulk-zanwushuju" />
                <p class="no-data">暂无数据</p>
            </div>
            <mtd-table-column
                prop="sequence"
                width="60px"
                label="序号" />
            <mtd-table-column
                min-width="15%"
                label="顺序">
                <template slot-scope="scope">
                    <span class="table-button" @click="triggerSortAction({rgId: rgId, method: 'UP', eim: scope.row.id})">上移</span>
                    <span class="table-button" @click="triggerSortAction({rgId: rgId, method: 'DOWN', eim: scope.row.id})">下移</span>
                    <span class="table-button" @click="triggerSortAction({rgId: rgId, method: 'TOP', eim: scope.row.id})">置顶</span>
                </template>
            </mtd-table-column>
            <mtd-table-column
                prop="name"
                label="触发器名称"
                min-width="25%">
                <template slot-scope="scope">
                    {{ scope.row.name }}
                    <mtd-tag
                        v-if="!scope.row.valid"
                        theme="red">已失效</mtd-tag>
                </template>
            </mtd-table-column>
            <mtd-table-column
                prop="active"
                label="是否启用"
                min-width="10%">
                <template slot-scope="scope">
                    <mtd-tooltip
                        content="因服务目录/组织人员变动，该触发器失效，可选择重新编辑/删除 触发器"
                        size="small"
                        :disabled="scope.row.valid"
                        placement="bottom">
                        <mtd-switch
                            @change="triggerActiveSwitch(scope.row)"
                            v-model="scope.row.active"
                            :disabled="!scope.row.valid"
                            size="small" />
                    </mtd-tooltip>
                </template>
            </mtd-table-column>
            <mtd-table-column
                min-width="20%"
                label="创建者">
                <template slot-scope="scope">
                    <span>{{ `${createDisplayNames[scope.row.createdBy] && createDisplayNames[scope.row.createdBy]['displayName'] || scope.row.createdBy}(${scope.row.createdBy})` }}</span>
                </template>
            </mtd-table-column>
            <mtd-table-column
                min-width="15%"
                label="添加时间">
                <template slot-scope="scope">
                    <span>{{ scope.row.createdAt | formatTime }}</span>
                </template>
            </mtd-table-column>
            <mtd-table-column
                min-width="15%"
                label="操作">
                <template slot-scope="scope">
                    <span class="table-button" @click="handleEditTrigger(scope.row.id)">编辑</span>
                    <span class="table-button" @click="handleCopyTrigger(scope.row.id)">复制</span>
                    <span class="table-button" @click="handleDeleteTrigger(scope.row)">删除</span>
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
import { Component } from 'vue-property-decorator';
import * as api from '@/api';
import { PaginationMixin } from '@/utils/mixin';
import { State } from 'vuex-class';
/**
 * 触发器编辑页
 *
 * @author liyuyao
 * @date 03/28/2019
 */
@Component
export default class RgTrigger extends PaginationMixin {
    @State(state => state.cti.permission.rg_trigger)
    permission: boolean;

    triggerList: any = [];

    tableLoading: Boolean = true;
    $mtd: any;

    triggerId: number = 0;
    hoverContent: string = '';
    createDisplayNames: any = {};

    mounted () {
        this.currentPage = +this.$route.query.cn || 1;
        this.getTriggerList();
    }
    async getTriggerList () {
        this.tableLoading = true;
        try {
            const res = await api.ruleApi.getTriggerList({
                cn: this.currentPage,
                sn: this.limit,
                scene: 'RG',
                sceneId: this.rgId
            });
            const { code, data } = res;
            if (code === 200) {
                this.triggerList = data.items;
                this.total = data.tn;
                if (this.total > 0 && !data.items.length) {
                    this.currentPage -= 1;
                    if (this.currentPage <= 0) {
                        this.currentPage = 1;
                    }
                    this.getTriggerList();
                }
                this.triggerList = data.items;
                const createUserList = this.triggerList.map((trigger) => {
                    return trigger.createdBy;
                });
                this.searchDisplayNameList(createUserList);
            }
        } catch (e) {
            this.triggerList = [];
            console.log(e);
        }
        this.tableLoading = false;
    }
    async searchDisplayNameList (userArr) {
        if (!userArr.length) {
            return;
        }
        const unionArr = Array.from(new Set(userArr));
        const res = await api.ctiApi.searchDisplayNameList(unionArr);
        const { code, data } = res;
        if (code === 200) {
            this.createDisplayNames = data;
        }
    }
    handleChange (current: number, size: number) {
        this.limit = size;
        this.currentPage = current;
        this.$router.push({
            name: 'rg_trigger',
            query: {
                rgId: `${this.rgId}`,
                cn: `${current}`
            }
        }).catch(e => e);
        this.getTriggerList();
    }
    // 启用触发器
    async triggerActiveSwitch (row: any) {
        try {
            const res = await api.ruleApi.triggerSwitch(row.id, row.active);
            const { code } = res;
            if (code === 200) {
                this.$mtd.message({
                    message: row.active ? '触发器开启成功' : '触发器关闭成功',
                    type: 'success'
                });
            }
        } catch (e) {
            console.log(e);
        }
    }
    // 复制触发器
    async handleCopyTrigger (triggerId: number) {
        try {
            const res = await api.ruleApi.copyTrigger(triggerId);
            const { code } = res;
            if (code === 200) {
                this.$mtd.message.success('触发器复制成功');
                this.getTriggerList();
            }
        } catch (e) {
            console.log(e);
        }
    }
    // 触发器排序
    async triggerSortAction (param: CommonTypes.triggerSort) {
        const res = await api.ruleApi.triggerSort(param);
        const { code } = res;
        if (code === 200) {
            this.$mtd.message.success('操作成功');
            this.getTriggerList();
        }
    }
    // 添加触发器
    handleAddTrigger () {
        this.$router.push({
            name: 'trigger-edit',
            query: {
                rgId: `${this.rgId}`
            }
        });
    }
    // 编辑触发器
    handleEditTrigger (id: number) {
        this.$router.push({
            name: 'trigger-edit',
            query: {
                id: `${id}`,
                rgId: `${this.rgId}`,
                cn: `${this.currentPage}`
            }
        }).catch(e => e);
    }
    // 删除触发器
    handleDeleteTrigger (row) {
        if (row.active) {
            this.unableDelete();
            return;
        }
        this.$mtd.confirm({
            title: '你是否确认删除该触发器？',
            width: '433px',
            showCancelButton: true,
            type: 'warning',
            okButtonText: '删除',
            okButtonProps: {
                type: 'danger'
            },
            onOk: async () => {
                try {
                    await api.ruleApi.deleteTrigger(row.id);
                    this.$mtd.message({
                        message: '删除成功',
                        type: 'success'
                    });
                    await this.getTriggerList();
                } catch (e) {
                    console.log(e);
                }
            }
        }).catch(e => e);
    }
    // 不允许删除模板提示
    unableDelete () {
        this.$mtd.confirm({
            title: '请先停用触发器，再尝试删除',
            type: 'warning',
            width: '433px',
            okButtonText: '知道了'
        }).catch(e => e);
    }
    rowClass (scope) {
        const row = scope.row;
        if (!row.valid) {
            return 'highlight-row';
        }
        return '';
    }
    get rgId () {
        return parseInt(this.$route.query.rgId as string, 10);
    }
}
</script>

<style lang="postcss" scoped>
.trigger-container {
    position: relative;
    margin-top: 8px;
    .title-wrapper {
        padding: 12px 0;
        text-align: left;
        font-weight: 600;
        font-size: 16px;
        line-height: 32px;
        .mtd-btn {
            float: right;
        }
    }
    .total-tip {
        color: #FF8800;
        cursor: pointer;
    }
    .table-button {
        color: #FF8800;
        cursor: pointer;
        margin-right: 10px;
    }
    /deep/.mtd-table {
        tbody {
            tr {
                &.highlight-row {
                    background: #FFF6F5;
                }
            }
            .mtd-tooltip-rel {
                display: flex;
            }
            .mtd-tag {
                margin-right: 4px;
            }
        }
    }
}
.trigger-tooltip-content {
    max-height: 200px;
    overflow: auto;
}
</style>
