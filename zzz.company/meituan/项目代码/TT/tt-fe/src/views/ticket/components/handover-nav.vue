<template>
    <div class="handover-nav-wrapper">
        <div class="nav-title">{{ $getText('handover_nav_total_count', {count: totalCount}) }}</div>
        <div class="nav-list-wrapper">
            <div
                class="nav-item"
                :class="{'active-nav-item': item.username === activeMis}"
                v-for="item in misList"
                @click="changeEmit(item)"
                :key="item.username">
                <span class="item-name">{{ item.displayName + $getText('handover_nav_handover', '的交接') }}</span>
                <mtd-tag
                    class="item-tag"
                    size="small"
                    :theme="item.handoverCompleted ? 'gray' : 'red'">
                    {{ item.handoverCompleted ? $getText('handover_nav_handover_completed', '已交接') : $getText('handover_nav_handover_pending', '待交接') }}
                </mtd-tag>
                <div class="item-time">{{ $getText('handover_nav_last_day', '离职时间：') + item.lastDay }}</div>
            </div>
        </div>
        <div class="footer-pagination">
            <mtd-pagination
                :total="total"
                simple
                size="small"
                :current-page.sync="current"
                :page-size.sync="limit"
                @change="handleChange" />
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Getter } from 'vuex-class';

@Component({
    components: {}
})
export default class HandoverNav extends Vue {
    @Getter misX;
    @Prop({ default: [] }) misList: any[];
    @Prop() currentPage: number;
    @Prop() limit: number;
    @Prop() total: number;
    @Prop() activeMis: string;

    totalCount: number = 0;
    current: number = 0;
    @Watch('total', { immediate: true })
    @Watch('currentPage', { immediate: true })
    getTotal () {
        this.totalCount = this.total;
        this.current = this.currentPage;
    }
    handleChange (current: number, size: number) {
        this.$emit('update', current, size);
    }
    changeEmit (item: any) {
        this.$emit('change', item.username, item.displayName, item.handoverCompleted);
    }
}
</script>
<style lang="scss">
.handover-nav-wrapper {
    flex: 0 0 186px;
    display: flex;
    flex-direction: column;
    margin-right: 8px;
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: 4px;
    position: relative;
    .nav-title {
        flex: 0 0 18px;
        font-weight: 500;
        font-family: PingFangSC-Medium;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.36);
        line-height: 18px;
        margin: 16px 0 8px 20px;
    }
    .nav-list-wrapper {
        padding: 0 8px 0 12px;
        margin-right: 4px;
        height: 100%;
        flex: 1 1 auto;
        overflow: auto;
        .active-nav-item {
            background: #f5f5f5;
            border-radius: 4px;
        }
        .nav-item {
            // height: 70px;
            padding: 12px 8px;
            position: relative;
            cursor: pointer;
            .item-name {
                font-weight: 500;
                font-family: PingFangSC-Medium;
                font-size: 14px;
                color: rgba(0, 0, 0, 0.84);
                line-height: 22px;
                display: inline-block;
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;
                width: 95px;
            }
            .mtd-tag-small.item-tag {
                padding: 0;
                width: 38px;
                position: absolute;
                right: 8px;
                top: 16px;
                .mtd-tag-content {
                    font-size: 10px;
                    -webkit-transform: scale(0.84);
                }
            }
            .item-time {
                font-weight: 400;
                font-family: PingFangSC-Regular;
                font-size: 12px;
                color: rgba(0, 0, 0, 0.6);
                line-height: 20px;
                // position: absolute;
                // bottom: 12px;
            }
        }
    }
    .footer-pagination {
        height: 49px;
        width: 100%;
        flex: 0 0 49px;
        // position: absolute;
        // bottom: 0;
        border-top: 1px solid rgba(0, 0, 0, 0.06);
        .mtd-pagination {
            margin-top: 13px;
            text-align: center;
            .mtd-pager-item {
                margin-left: 0;
            }
            .mtd-pager-simple-item {
                margin-left: 2px;
                font-size: 12px;
            }
            .mtd-pager-simple-item-span {
                padding: 1px;
            }
            .mtd-pager-simple-input {
                margin-left: 2px;
                margin-right: 0;
            }
            .mtd-pager-next {
                margin-left: 4px;
            }
        }
    }
}
</style>
