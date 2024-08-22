<template>
    <div v-loading="tableLoading" class="space-container">
        <div v-if="spaceList && spaceList.length">
            <div class="space-header">
                <h1 class="title-text">空间管理</h1>
                <mtd-button
                    v-if="userInfo.sysAdmin"
                    @click="handleAddSpace"
                    class="add-space-btn"
                    icon="mtdicon mtdicon-add"
                    type="primary">新建空间</mtd-button>
            </div>
            <mtd-table :data="spaceList">
                <mtd-table-column
                    min-width="35%"
                    label="名称">
                    <template slot-scope="scope">
                        <span class="table-link" @click="handleDetail(scope.row.id)">{{ scope.row.name }}</span>
                    </template>
                </mtd-table-column>
                <mtd-table-column
                    min-width="30%"
                    label="维护部门"
                    prop="orgPath">
                    <template slot-scope="scope">
                        <span>{{ formatOrg(scope.row.orgPath) }}</span>
                    </template>
                </mtd-table-column>
                <mtd-table-column
                    min-width="30%"
                    label="创建人"
                    prop="createdBy" />
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
                        <span class="table-link" @click="handleEditSpace(scope.row)">编辑</span>
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
                    @change="handleChange"
                    size="small" />
            </div>
        </div>
        <div v-else-if="!firstLoading" class="space-empty-container">
            <div class="space-empty-content">
                <img
                    class="space-empty-img"
                    src="@/assets/img/empty-rg.png"
                    alt="暂无空间">
                <p class="space-empty-text">你暂时还没有加入任何空间</p>
            </div>
        </div>
        <add-space-dialog
            :visible.sync="addSpaceVisible"
            @success="getMySpace"
            :is-edit="editSpace"
            :space-info="spaceInfo" />
    </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import * as api from '@/api';
import { PaginationMixin } from '@/utils/mixin';
import AddSpaceDialog from './components/add-space-dialog.vue';
/**
 * 空间列表
 *
 * @author liyuyao
 * @date 01/11/2019
 */
@Component({
    components: {
        AddSpaceDialog
    }
})
export default class SpaceList extends PaginationMixin {
    @State(state => state.cti.userInfo)
    userInfo: CommonTypes.UserInfoItem;

    spaceList: CommonTypes.SpaceItem[] = [];
    addSpaceVisible: Boolean = false;
    editSpace: Boolean = false;
    spaceInfo: CommonTypes.SpaceItem = null;

    tableLoading: Boolean = true;
    firstLoading: Boolean = true;
    $mtd: any;
    async created () {
        await this.getMySpace();
        this.firstLoading = false;
    }
    async getMySpace () {
        this.tableLoading = true;
        // this.spaceList = [{
        //     'createdAt': 1596460586251,
        //     'accessLink': '123.tt.sankuai.com',
        //     'accessLinkPrefix': '123',
        //     'createdBy': 'xujie11',
        //     'org': '基础技术研发',
        //     'formListLink': '123.tt.sankuai.com/custom/form/list',
        //     'name': '测试tt空间32',
        //     'id': 3
        // }];
        try {
            const res = await api.spaceApi.getMySpace({
                cn: this.currentPage,
                sn: this.limit
            });
            const { code, data } = res;
            if (code === 200) {
                this.spaceList = data.items;
                this.total = data.tn;
                if (this.total > 0 && !data.items.length) {
                    this.currentPage -= 1;
                    if (this.currentPage <= 0) {
                        this.currentPage = 1;
                    }
                    this.getMySpace();
                }
            }
        } catch (e) {
            this.spaceList = [];
            console.log(e);
        }
        this.tableLoading = false;
    }
    handleChange (current: number, size: number) {
        this.limit = size;
        this.currentPage = current;
        this.getMySpace();
    }
    // 进入空间详情
    handleDetail (id: number) {
        this.$router.push({
            name: 'space_admin',
            params: {
                id: `${id}`
            }
        }).catch(e => e);
    }
    // 编辑空间基本信息
    handleEditSpace (row) {
        this.spaceInfo = row;
        this.editSpace = true;
        this.addSpaceVisible = true;
    }
    handleAddSpace () {
        this.editSpace = false;
        this.addSpaceVisible = true;
    }
    formatOrg (org) {
        const orgArr = org && org.split('-') || [];
        if (orgArr[0] === 'IPH') {
            orgArr.shift();
        }
        return orgArr.join('/');
    }
}
</script>

<style lang="postcss" scoped>
.space-container {
    height: 100%;
    margin: 0 20px;
    .space-empty-container {
        position: relative;
        height: 100%;
        .space-empty-content {
            position: absolute;
            top: 50%;
            left: 50%;
            margin: -102px 0 0 -118px;
            text-align: center;
            .space-empty-text {
                margin-bottom: 25px;
                font-size: 14px;
                color: #333333;
            }
            .space-empty-img {
                width: 50%;
            }
        }
    }
    .space-header {
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
        .add-space-btn {
            float: right;
        }
    }
    .quit-tag {
        color: #999999;
        font-size: 12px;
    }
}
</style>
