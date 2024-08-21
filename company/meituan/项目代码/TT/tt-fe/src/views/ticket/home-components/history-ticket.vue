<template>
    <div
        class="history-ticket-item">
        <div class="history-ticket-title">
            <i class="iconfont icon-prefix" /> {{ title }}
        </div>
        <div
            class="hover-button"
            @click.self="goToDetail">
            <mtd-button
                size="small"
                @click="goToDetail">{{ $getText('history_ticket_view_btn', '查看') }}</mtd-button>
            <mtd-button
                type="primary"
                size="small"
                @click="goToCreate">{{ $getText('history_ticket_create_btn', '再次发起') }}</mtd-button>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { Getter } from 'vuex-class';

/**
 * 系统首页-历史发起
 *
 * @author liyuyao
 * @date 11/03/2020
 */
@Component
export default class HistoryTicket extends Vue {
    @Getter spaceDomain;

    @Prop({ default: '' })
    title: string;

    @Prop({ default: 0 })
    id: number;

    @Prop({ default: () => {
        return {};
    } })
    cti: CommonTypes.mapObject;

    goToDetail () {
        this.$router.push({
            name: 'tt_detail',
            params: {
                space: this.spaceDomain
            },
            query: {
                id: this.id
            }
        }).catch(e => e);
    }
    goToCreate () {
        this.$router.push({
            name: 'tt_create',
            params: {
                space: this.spaceDomain
            },
            query: {
                cid: this.cti.categoryId,
                tid: this.cti.typeId,
                iid: this.cti.itemId
            }
        }).catch(e => e);
    }
}
</script>

<style lang="scss" scoped>
.history-ticket-item {
    width: 100%;
    height: 38px;
    padding: 8px 4px;
    border-radius: 4px;
    cursor: pointer;
    &:hover {
        background: #f5f5f5;
        .hover-button {
            opacity: 1;
            .mtd-button {
                display: block;
            }
        }
    }
    .hover-button {
        opacity: 0;
        .mtd-button {
            display: none;
        }
    }
}
.history-ticket-title {
    font-family: PingFangSC-Regular;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.84);
    line-height: 22px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    i {
        vertical-align: middle;
    }
}
.hover-button {
    position: relative;
    z-index: 1;
    top: -31px;
    width: 100%;
    height: 38px;
    padding: 8px 0;
    text-align: right;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0), #f4f4f4 90%);
    background: -moz-linear-gradient(90deg, rgba(255, 255, 255, 0), #f4f4f4 90%);
    background: -webkit-linear-gradient(90deg, rgba(255, 255, 255, 0), #f4f4f4 90%);
    background: -o-linear-gradient(90deg, rgba(255, 255, 255, 0), #f4f4f4 90%);
    border-radius: 4px;
}
</style>
