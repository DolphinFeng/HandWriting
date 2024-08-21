<template>
    <div class="rg-catalog-container">
        <mtd-table v-loading="tableLoading" :data="catalogList">
            <div slot="empty">
                <i class="iconfont icon-hulk-zanwushuju" />
                <p class="no-data">暂无数据</p>
            </div>
            <mtd-table-column
                min-width="25%"
                label="一级目录/二级目录/三级目录">
                <template slot-scope="scope">
                    {{ `${scope.row.categoryName}/${scope.row.typeName}/${scope.row.itemName}` }}
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
import { pick, cloneDeep } from 'lodash';
import { State } from 'vuex-class';

/**
 * 绑定目录列表
 *
 * @author liyuyao
 * @date 07/03/2020
 */
@Component
export default class RgUser extends PaginationMixin {
    @State(state => state.cti.permission.rg_catalog)
    permission: boolean;

    catalogList: CommonTypes.RgUserItem[] = [];
    rgId: number = 0;
    tableLoading: Boolean = false;
    $mtd: any;

    created () {
        this.rgId = parseInt(this.$route.query.rgId as string, 10);
        this.getCtiByRgUnfold();
        // this.getCategoryTreeByRg(this.rgId);
    }
    handleChange (current: number, size: number) {
        this.limit = size;
        this.currentPage = current;
        this.getCtiByRgUnfold();
    }
    async getCtiByRgUnfold () {
        try {
            const res = await api.rgApi.getCtiByRgUnfold({
                cn: this.currentPage,
                sn: this.limit,
                rgId: this.rgId
            });
            const { code, data } = res;
            if (code === 200) {
                this.total = data.tn;
                if (this.total > 0 && !data.items.length) {
                    this.currentPage -= 1;
                    if (this.currentPage <= 0) {
                        this.currentPage = 1;
                    }
                    this.getCtiByRgUnfold();
                }
                this.catalogList = res.data.items;
            }
        } catch (e) {
            console.log(e);
        }
    }
    // 树转平铺列表，暂时废弃
    async getCategoryTreeByRg (rgId: number) {
        try {
            const res = await api.ctiApi.getCategoryTreeByRg(rgId);
            const { code } = res;
            if (code === 200) {
                // this.catalogList = res.data.items;
                this.flatNodes(res.data.items, {});
            }
        } catch (e) {
            console.log(e);
        }
    }
    flatNodes (nodes, fromObj) {
        nodes.forEach(node => {
            const keys = Object.keys(node).filter(item => item !== 'children');
            const obj = pick(node, keys);
            const resObj = Object.assign(fromObj, obj);
            if (node.children) {
                this.flatNodes(node.children, resObj);
            } else {
                this.catalogList.push(cloneDeep(resObj));
            }
        });
    }
}
</script>

<style lang="postcss">
.rg-catalog-container {
    margin-top: 8px;
    .mtd-table-row:hover {
        .mtd-input-suffix-inner {
            line-height: 16px;
            display: block;
        }
    }
}
</style>
