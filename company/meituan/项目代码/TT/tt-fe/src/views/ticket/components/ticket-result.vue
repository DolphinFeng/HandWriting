<template>
    <div class="ticket-result-container" v-viewer="{ movable: true }">
        <h4>{{ $getText('ticket_info_result_header', '处理结果') }}</h4>
        <mtd-form :label-width="language === 'en' ? 120 : 82">
            <mtd-form-item
                :label="`${$getText('ticket_info_result_solution', '解决方案')}：`"
                v-if="info.resolution">
                <div class="item-wrapper">
                    <div v-html="MarkHyperLink(info.resolution)" class="content" />
                    <i 
                        class="mtdicon-edit-o mtdicon" 
                        @click="handleModal('resolve')"
                        v-if="itemPermission('resolution').visible" />
                </div>
            </mtd-form-item>
            <mtd-form-item
                :label="`${$getText('ticket_info_result_close_reason', '关闭原因')}：`"
                :placeholder="$getText('selector_default_placeholder', '请输入')"
                v-if="info.closedReason">
                <div class="item-wrapper">
                    <div v-html="MarkHyperLink(info.closedReason)" class="content" />
                    <i
                        class="mtdicon-edit-o mtdicon"
                        @click="handleModal('close')"
                        v-if="itemPermission('closedReason').visible" />
                </div>
            </mtd-form-item>
        </mtd-form>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import eventBus from '@/utils/event-bus';
import { itemPermission, markHyperLink } from '@/utils/tools';
import { Getter } from 'vuex-class';

/**
 * Ticket附件
 *
 * @author liyuyao
 * @date 04/23/2019
 */
@Component
export default class TicketResult extends Vue {
    @Getter language;
    @Prop({ default: () => {
        return {};
    } })
    info: any;

    itemPermission: Function = itemPermission;
    MarkHyperLink: Function = markHyperLink;

    handleModal (type: string) {
        eventBus.$emit('showModal', type);
    }
}
</script>

<style lang="scss">
.ticket-result-container {
    h4 {
        font-family: PingFangSC-Medium;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.87);
        letter-spacing: 0;
        line-height: 24px;
    }
    .mtd-form-item {
        margin-bottom: 0;
    }
    .item-wrapper {
        display: flex;
        .content {
            flex: 1 1 auto;
        }
        .mtdicon {
            flex: 0 0 17px;
            line-height: 32px;
            vertical-align: middle;
        }
    }
}
</style>