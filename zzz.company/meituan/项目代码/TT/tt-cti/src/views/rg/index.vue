<template>
    <div v-loading="tableLoading" class="rg-container">
        <div v-if="rgList && rgList.length">
            <div class="rg-header">
                <h1 class="title-text">我的RG</h1>
                <span class="tip-content">
                    RG是提供服务的小组，需要先建立RG再进行服务目录的绑定，每个服务组可以管理组内成员和值班人员。如需新建RG请<a :href="aboutUrl" target="_blank">发TT</a>联系我们
                </span>
                <!-- <mtd-button @click="handleAddRg" class="add-rg-btn" icon="mtdicon mtdicon-add" type='primary'>添加RG</mtd-button> -->
            </div>
            <mtd-table :data="rgList">
                <mtd-table-column
                    min-width="35%"
                    label="RG名称">
                    <template slot-scope="scope">
                        <span class="table-link" @click="handleDetail(scope.row.id)">{{ scope.row.name }}</span>
                    </template>
                </mtd-table-column>
                <mtd-table-column
                    min-width="30%"
                    label="负责人">
                    <template slot-scope="scope">
                        <span>{{ scope.row.ownerDisplayName }} ({{ scope.row.ownerName }}) <span class="quit-tag" v-if="!scope.row.userActive">离职</span></span>
                    </template>
                </mtd-table-column>
                <mtd-table-column
                    min-width="30%"
                    label="创建时间">
                    <template slot-scope="scope">
                        <span>{{ scope.row.createdAt | formatTime }}</span>
                    </template>
                </mtd-table-column>
                <mtd-table-column
                    min-width="5%"
                    label="操作">
                    <template slot-scope="scope">
                        <span class="table-link" @click="handleDeleteRg(scope.row.id)">移除</span>
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
        <div v-else-if="!firstLoading" class="rg-empty-container">
            <div class="rg-empty-content">
                <img
                    class="rg-empty-img"
                    src="@/assets/img/empty-rg.png"
                    alt="暂无rg">
                <p class="rg-empty-text">你暂时还没有加入任何RG</p>
                <!-- <mtd-button @click="handleAddRg" class="add-rg-btn" icon="mtdicon mtdicon-add" type='primary'>添加RG</mtd-button> -->
            </div>
        </div>
        <add-rg :visible.sync="addRgVisible" @success="getRgList" />
    </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import * as api from '@/api';
import { State } from 'vuex-class';
import { PaginationMixin } from '@/utils/mixin';
import AddRg from './detail/components/add-rg.vue';
/**
 * rg列表
 *
 * @author xiaokunyu
 * @date 01/11/2019
 */
@Component({
    components: {
        AddRg
    }
})
export default class RgList extends PaginationMixin {
    @State(state => state.cti.env)
    env: string;

    rgList: CommonTypes.RgItem[] = [];
    addRgVisible: Boolean = false;
    tableLoading: Boolean = true;
    firstLoading: Boolean = true;
    $mtd: any;
    async created () {
        await this.getRgList();
        this.firstLoading = false;
    }
    async getRgList () {
        this.tableLoading = true;
        try {
            const res = await api.rgApi.getMyRg({
                cn: this.currentPage,
                sn: this.limit
            });
            const { code, data } = res;
            if (code === 200) {
                this.rgList = data.items;
                this.total = data.tn;
                if (this.total > 0 && !data.items.length) {
                    this.currentPage -= 1;
                    if (this.currentPage <= 0) {
                        this.currentPage = 1;
                    }
                    this.getRgList();
                }
            }
        } catch (e) {
            this.rgList = [];
            console.log(e);
        }
        this.tableLoading = false;
    }
    handleChange (current: number, size: number) {
        this.limit = size;
        this.currentPage = current;
        this.getRgList();
    }
    // 进入rg详情
    handleDetail (id: number) {
        this.$router.push({
            name: 'rg_catalog',
            query: {
                rgId: `${id}`
            }
        }).catch(e => e);
    }
    // 移除rg
    handleDeleteRg (id: number) {
        const _this = this;
        this.$mtd.confirm({
            title: '你是否确认移除该 RG？',
            width: '433px',
            showCancelButton: true,
            type: 'warning',
            okButtonText: '移除',
            okButtonProps: {
                type: 'danger'
            },
            onOk: async () => {
                try {
                    await api.rgApi.deleteRg(id);
                    this.$mtd.message({
                        message: '移除成功',
                        type: 'success'
                    });
                    await _this.getRgList();
                } catch (e) {
                    console.log(e);
                }
            }
        }).catch(e => e);
    }
    handleAddRg () {
        this.addRgVisible = true;
    }
    get aboutUrl () {
        const url = this.env === 'prod' ? '//tt.sankuai.com/ticket/create?cid=112&tid=2190&iid=9397' : '//tt.cloud.test.sankuai.com/ticket/create?cid=2&tid=3&iid=15';
        return url;
    }
}
</script>

<style lang="postcss" scoped>
.rg-container {
    height: 100%;
    margin: 0 20px;
    .rg-empty-container {
        position: relative;
        height: 100%;
        .rg-empty-content {
            position: absolute;
            top: 50%;
            left: 50%;
            margin: -102px 0 0 -118px;
            text-align: center;
            .rg-empty-text {
                margin-bottom: 25px;
                font-size: 14px;
                color: #333333;
            }
            .rg-empty-img {
                width: 50%;
            }
        }
    }
    .rg-header {
        padding: 18px 0 18px;
        .title-text {
            display: inline-block;
            font-family: PingFangSC-Semibold;
            font-size: 20px;
            color: #464646;
        }
        .tip-content {
            color: #6F6F6F;
            font-size: 14px;
        }
        .add-rg-btn {
            float: right;
        }
    }
    .quit-tag {
        color: #999999;
        font-size: 12px;
    }
}
</style>
