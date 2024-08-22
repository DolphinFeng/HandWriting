<template>
    <div class="rg-history-container">
        <mtd-table v-loading="tableLoading" :data="historyList">
            <div slot="empty">
                <i class="iconfont icon-hulk-zanwushuju" />
                <p class="no-data">暂无数据</p>
            </div>
            <mtd-table-column
                width="100px"
                label="日志编号"
                prop="id" />
            <mtd-table-column
                width="240px"
                label="操作人">
                <template slot-scope="scope">
                    <span>{{ `${scope.row.displayName}/${scope.row.author}` }}</span>
                </template>
            </mtd-table-column>
            <mtd-table-column
                width="100px"
                label="操作项"
                prop="sourceType">
                <template slot="header">
                    <mtd-dropdown>
                        <mtd-button type="text" style="padding: 0;">
                            操作项
                            <i class="mtdicon mtdicon-down" />
                        </mtd-button>
                        <mtd-dropdown-menu slot="dropdown">
                            <mtd-dropdown-menu-item
                                v-for="type in sourceTypes"
                                :key="type.value"
                                @click="sourceTypeFilter(type.value)">{{ type.text }}
                            </mtd-dropdown-menu-item>
                        </mtd-dropdown-menu>
                    </mtd-dropdown>
                </template>
            </mtd-table-column>
            <mtd-table-column
                min-width="30%"
                label="操作内容"
                prop="message" />
            <mtd-table-column
                width="260px"
                label="操作时间">
                <template slot-scope="scope">
                    <span>{{ scope.row.actTime | formatTime }}</span>
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
import { SourceTypes } from '@/config/map.conf';

/**
 * rg操作记录
 *
 * @author liyuyao
 * @date 11/07/2019
 */
@Component
export default class RgHistory extends PaginationMixin {
    historyList: CommonTypes.RgHistoryItem[] = [];
    rgId: number = 0;
    tableLoading: Boolean = true;

    sourceTypes: CommonTypes.mapObject[] = SourceTypes;

    $mtd: any;
    created () {
        this.rgId = parseInt(this.$route.query.rgId as string, 10); ;
        this.getRgHistory();
    }
    async getRgHistory (sourceType?) {
        this.tableLoading = true;
        try {
            const res = await api.rgApi.getRgHistory({
                cn: this.currentPage,
                sn: this.limit,
                rgId: this.rgId,
                sourceType: sourceType || ''
            });
            const { code, data } = res;
            if (code === 200) {
                this.historyList = data.items;
                this.total = data.tn;
                if (this.total > 0 && !data.items.length) {
                    this.currentPage -= 1;
                    if (this.currentPage <= 0) {
                        this.currentPage = 1;
                    }
                    this.getRgHistory();
                }
            }
            this.total = res.data.tn;
        } catch (e) {
            this.historyList = [];
            console.log(e);
        }
        this.tableLoading = false;
    }
    sourceTypeFilter (sourceType) {
        this.getRgHistory(sourceType);
    }
    handleChange (current: number, size: number) {
        this.limit = size;
        this.currentPage = current;
        this.getRgHistory();
    }
}
</script>

<style lang="postcss">
.rg-history-container {
    position: relative;
    margin-top: 8px;
    .add-user-btn {
        position: absolute;
        top: -49px;
        right: 0;
        z-index: 999;
    }
    .isAdmin {
        position: relative;
        padding-left: 12px;
        &::before {
            position: absolute;
            content: '';
            width: 8px;
            height: 8px;
            background: #FF8800;
            border-radius: 50%;
            left: 0;
            top: 6px;
        }
        .origin-change-role {
            width: 62px;
        }
    }
    .table-link {
        padding: 0;
        min-width: 0;
        height: 14px;
        &:hover {
            background: none;
        }
    }
    .origin-change-role {
        width: 75px;
        .mtd-input-wrapper.mtd-input-suffix .mtd-input {
            border: none;
            padding: 0 16px 0 0;
            background: none;
        }
        .mtd-input-wrapper {
            height: 16px;
        }
        .mtd-input-suffix-inner {
            width: 16px;
            display: none;
        }
        &.mtd-select-disabled .mtd-input-disabled {
            cursor: auto !important;
            input {
                cursor: auto !important;
            }
        }
    }
    .mtd-table-row:hover {
        .mtd-input-suffix-inner {
            line-height: 16px;
            display: block;
        }
    }
}
</style>
