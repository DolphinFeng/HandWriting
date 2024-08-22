<template>
    <div :class="`ticket-detail-header header-${info.sla}`">
        <div
            class="go-back-icon"
            @click="goBack"
            v-if="isTT"><i class="mtdicon mtdicon-arrow-left" /></div>
        <div class="left-info-wrapper">
            <div>
                <ticket-sla-change
                    :info="info"
                    class="detail-sla"
                    @update="getTicketTime" />
                <state-icon
                    :state="info.state && info.state.name"
                    :state-display-name="info.state && info.state.displayName"
                    class="detail-state" />
            </div>
            <ticket-head-time
                ref="time"
                :info="info" />
        </div>
        <div class="right-button">
            <ticket-handle-buttons
                :info="info"
                :is-ticket="isTicket"
                @success="handleSuccess" />
            <ticket-dx-group
                @chat-exist="handleChatEmit"
                @update="handleSuccess"
                :group-status="groupStatus"
                :info="info"
                :is-ticket="isTicket"
                ref="chat"
                v-if="itemPermission('createChatRoom').editable && language === 'zh'" />
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import { itemPermission } from '@/utils/tools';
import TicketHandleButtons from './ticket-handle-buttons.vue';
import TicketDxGroup from './ticket-dx-group.vue';
import TicketSlaChange from './ticket-sla-change.vue';
import TicketHeadTime from './ticket-head-time.vue';
import StateIcon from '@/components/state-icon.vue';

/**
 * 详情header容器
 *
 * @author liyuyao
 * @date 05/08/2019
 */
@Component({
    components: {
        TicketHandleButtons,
        TicketDxGroup,
        TicketSlaChange,
        TicketHeadTime,
        StateIcon
    }
})
export default class TicketHeader extends Vue {
    @Getter inside;
    @Getter spaceDomain;
    @Getter language;

    @Prop({ default: () => {
        return {};
    } })
    info: any;

    @Prop()
    groupStatus: string;
    @Prop() isTicket: boolean;

    itemPermission: Function = itemPermission;

    handleSuccess (param) {
        this.$emit('success', param);
    }
    handleChatEmit (id) {
        this.$emit('chat-exist', id);
    }
    getTicketTime () {
        this.$refs.time && this.$refs.time.getTicketTime();
    }
    goBack () {
        let isFromList = sessionStorage['tt_list'];
        let isFromSearch = sessionStorage['tt_search'];
        if (isFromList) {
            let query = JSON.parse(isFromList);
            this.$router.push({
                name: 'tt_list',
                params: {
                    space: this.spaceDomain
                },
                query: query
            }).catch(e => e);
        } else if (isFromSearch) {
            let query = JSON.parse(isFromSearch);
            this.$router.push({
                name: 'tt_search',
                params: {
                    space: this.spaceDomain
                },
                query: query
            }).catch(e => e);
        } else {
            this.$router.push({
                name: 'tt_list',
                params: {
                    space: this.spaceDomain
                }
            }).catch(e => e);
        }
    }

    get isTT () {
        const ignoreHeaderList = ['tt_mini_detail', 'tt_detail_case', 'tt_handle', 'quality_inspector_ticket'];
        return !ignoreHeaderList.includes(this.$route.name);
    }

}
</script>

<style lang="scss">
.ticket-detail-header {
    // margin: 4px 4px 4px 4px;
    margin-left: 4px;
    padding: 8px 12px;
    background: #fff;
    // border-top: 4px solid #fff;
    border-radius: 4px;
    line-height: 30px;
    position: sticky;
    position: -webkit-sticky;
    top: 0;
    z-index: 99;
    // border-top: 4px solid #fff;
    display: flex;
    box-shadow: 0 0 0 4px #fff;
    // outline: 8px solid #fff;
    &.header-S1,
    &.header-S2 {
        background: #ffe5e2;
    }
    &.header-S3 {
        background: #ffefcd;
    }
    &.header-S4 {
        background: #ecf6fd;
    }
    &.header-S5 {
        background: #efefef;
    }
    .detail-sla,
    .detail-state {
        margin-right: 16px;
    }
    .left-info-wrapper {
        flex: 1;
        display: flex;
        .ticket-time-container {
            flex: 1;
            line-height: 34px;
        }
    }
    .go-back-icon {
        float: left;
        margin-right: 13px;
        cursor: pointer;
        i {
            color: rgba(0, 0, 0, 0.84);
            font-size: 22px;
        }
    }
    .right-button {
        line-height: 34px;
        text-align: right;
        display: inline-block;
    }
}
</style>