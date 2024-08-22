<template>
    <div class="space-detail-rg-container">
        <div class="button-wrapper">
            <mtd-button
                @click="handleAddRg"
                class="add-rg-btn"
                icon="mtdicon mtdicon-add"
                type="primary">新建服务组</mtd-button>
            <mtd-button
                @click="handleBindRg"
                class="bind-rg-btn"
                v-if="userInfo.sysAdmin">绑定已有服务组</mtd-button>
        </div>
        <mtd-table v-loading="tableLoading" :data="spaceRgs">
            <div slot="empty">
                <i class="iconfont icon-hulk-zanwushuju" />
                <p class="no-data">暂无数据</p>
            </div>
            <mtd-table-column
                min-width="25%"
                label="RG名称"
                prop="name">
                <template slot-scope="scope">
                    <span class="table-link" @click="handleDetail(scope.row.id)">{{ scope.row.name }}</span>
                </template>
            </mtd-table-column>
            <mtd-table-column
                min-width="25%"
                label="负责人">
                <template slot-scope="scope">
                    <span>{{ scope.row.ownerDisplayName }}/{{ scope.row.ownerName }}</span>
                </template>
            </mtd-table-column>
            <mtd-table-column
                min-width="20%"
                label="创建时间">
                <template slot-scope="scope">
                    <span>{{ scope.row.createdAt | formatTime }}</span>
                </template>
            </mtd-table-column>
            <mtd-table-column
                min-width="5%"
                label="操作">
                <template slot-scope="scope">
                    <mtd-button
                        type="text-primary"
                        class="table-link"
                        size="small"
                        :disabled="!permission"
                        @click="handleRemoveRg(scope.row)">移除</mtd-button>
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
        <add-rg
            :visible.sync="addSpaceRgVisible"
            :is-space="true"
            @success="addRgSuccess" />
        <bind-space-rg-dialog
            :visible.sync="bindSpaceRgVisible"
            @success="getSpaceRg" />
    </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import * as api from '@/api';
import { PaginationMixin } from '@/utils/mixin';
import { State } from 'vuex-class';
import AddRg from '@/views/rg/detail/components/add-rg.vue';
import BindSpaceRgDialog from '../components/bind-space-rg.vue';

/**
 * 空间rg管理
 *
 * @author liyuyao
 * @date 08/10/2020
 */
@Component({
    components: {
        AddRg,
        BindSpaceRgDialog
    }
})
export default class SpaceDetailRg extends PaginationMixin {
    @State(state => state.cti.userInfo)
    userInfo: CommonTypes.UserInfoItem;

    permission: boolean = true;

    spaceRgs: CommonTypes.RgUserItem[] = [];
    addSpaceRgVisible: Boolean = false;
    bindSpaceRgVisible: Boolean = false;

    tableLoading: Boolean = true;
    rgInfo: any = {};
    $mtd: any;

    get spaceId () {
        return parseInt(this.$route.params.id, 10);
    }

    mounted () {
        this.getSpaceRg();
    }
    async getSpaceRg () {
        this.tableLoading = true;
        // this.spaceRgs = [{
        //     createdAt: 1548920391152,
        //     description: '',
        //     icon: 'http://s3plus.sankuai.com/v1/mss_a709a4d0339645d09bc2383bbc220c85/chenliang18/tt_200_200.png',
        //     id: 1,
        //     name: 'MIAM',
        //     owner: 'chengsiyu'
        // }];
        try {
            const res = await api.spaceApi.getSpaceRg({
                spaceId: this.spaceId,
                cn: this.currentPage,
                sn: this.limit
            });
            const { code, data } = res;
            if (code === 200) {
                this.spaceRgs = data.items;
                this.total = data.tn;
                if (this.total > 0 && !data.items.length) {
                    this.currentPage -= 1;
                    if (this.currentPage <= 0) {
                        this.currentPage = 1;
                    }
                    this.getSpaceRg();
                }
            }
            this.spaceRgs = res.data.items;
            this.total = res.data.tn;
        } catch (e) {
            this.spaceRgs = [];
            console.log(e);
        }
        this.tableLoading = false;
    }
    addRgSuccess () {
        this.getSpaceRg();
    }
    async bindSpaceRg (id: number) {
        try {
            const res = await api.spaceApi.bindSpaceRg({
                spaceId: this.spaceId,
                rgId: id
            });
            const { code } = res;
            if (code === 200) this.getSpaceRg();
        } catch (e) {
            console.log(e);
        }
    }
    handleChange (current: number, size: number) {
        this.limit = size;
        this.currentPage = current;
        this.getSpaceRg();
    }
    // 删除rg成员
    handleRemoveRg (row) {
        const _this = this;
        this.$mtd.confirm({
            title: `你是否确认移除服务组：${row.name}？`,
            width: '433px',
            showCancelButton: true,
            type: 'warning',
            okButtonText: '删除',
            okButtonProps: {
                type: 'danger'
            },
            onOk: async () => {
                try {
                    const res = await api.spaceApi.removeSpaceRg(row.id);
                    const { code, data } = res;
                    if (code === 200) {
                        this.$mtd.message({
                            message: '移除成功',
                            type: 'success'
                        });
                        await _this.getSpaceRg();
                    } else {
                        this.cannotRemoveConfirm(data);
                    }
                } catch (e) {
                    console.log(e);
                }
            }
        }).catch(e => e);
    }
    cannotRemoveConfirm (data) {
        this.$mtd.confirm({
            title: `${data.message}`,
            width: '433px',
            showCancelButton: false,
            type: 'info',
            okButtonText: '确定'
        }).catch(e => e);
    }
    handleAddRg () {
        this.addSpaceRgVisible = true;
    }
    handleBindRg () {
        this.bindSpaceRgVisible = true;
    }
    // 设置成员组织架构信息
    setDept (bg: string, bu: string, org: string) {
        let dept: string = '';
        if (bg) {
            dept += `${bg}/`;
        }
        if (bu) {
            dept += `${bu}/`;
        }
        if (org) {
            dept += `${org}`;
        }
        return dept;
    }
    // 进入空间详情
    handleDetail (id: number) {
        this.$router.push({
            name: 'rg_catalog',
            query: {
                rgId: `${id}`
            }
        }).catch(e => e);
    }
}
</script>

<style lang="postcss" scope>
.space-detail-rg-container {
    .button-wrapper {
        padding: 12px 0;
        text-align: right;
    }
    .mtd-table {
        .mtd-btn {
            font-size: 14px;
        }
    }
}
</style>
