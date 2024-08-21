<template>
    <span v-if="!toolMosesId || !rgId" />
    <div v-else-if="hasExpand" :class="[ 'ticket-tool-content', { 'ticket-tool-hidden': toolMode !== 'static' }  ]">
        <ticket-tool-detail
            :mode="toolMode"
            :exchangeable="toolExchangeable"
            :config="toolConfig"
            :robot-key="toolMosesId"
            :rg-id="rgId"
            :ticket-id="tooTicketId"
            @change="changeMode"
            @close="toggleTool" />
    </div>
    <div v-else :class="[ 'ticket-tool-collapse', { 'ticket-tool-collapse-list': inListDetail } ]">
        <span class="ticket-tool-collapse-operation" @click="toggleTool">
            <span class="ticket-tool-collapse-text">{{ $getText('ticket_tool_knowledge', '知识库') }}</span>
        </span>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import TicketToolDetail from './ticket-tool-detail.vue';
import * as api from '@/api';
import { INSPECTION_KNOWLEDGE_MAP } from '@/config/lx_map.conf';
import { lxReportClick } from '@/utils/directive/lxanaly';

@Component({
    components: {
        TicketToolDetail
    }
})
export default class TicketTool extends Vue {
    @Prop({ default: 'static' }) toolMode: 'float' | 'static';
    @Prop({ default: false }) toolExchangeable: boolean;
    @Prop({ default: false }) inListDetail: boolean;
    @Prop() ticketId: string;

    toolMosesId: string = '';
    hasExpand: boolean = false;
    rgId: string = '';
    tooTicketId: string = '';

    get toolConfig () {
        const config: any = {
            top: '64px',
            width: '300px',
            height: 'calc(100% - 76px)'
        };
        if (!this.inListDetail) return config;
        return { ...config, top: '160px', height: 'calc(100% - 175px)' };
    }

    async getMosesConfig () {
        const res: Ajax.AxiosResponse = await api.ticketApi.getMosesSwitch(this.ticketId);
        let { code, data } = res;
        if (code === 200) {
            this.rgId = data.isActive ? data.rgId : '';
            this.toolMosesId = data.isActive ? data.mosesId : '';
            this.tooTicketId = this.ticketId; // 在toolMosesId后更新后触发，保证子组件watch tooTicketId时toolMosesId也为最新
        }
    }

    changeMode (mode: string) {
        this.$emit('update:toolMode', mode);
    }

    toggleTool () {
        this.hasExpand = !this.hasExpand;
        if (this.hasExpand) {
            lxReportClick(INSPECTION_KNOWLEDGE_MAP['open_knowledge_tool'], {
                rgId: this.rgId
            });
        }
    }

    @Watch('ticketId', { immediate: true })
    getPermission (ticketId: string, oldTicketId: string) {
        if (!this.ticketId || ticketId === oldTicketId) return ;
        this.getMosesConfig();
    }

}
</script>

<style lang="scss" scoped>
.ticket-tool-content {
    position: relative;
    width: 300px;
    height: 100%;
    margin-left: 16px;
    overflow: hidden;
    border-radius: 6px;
    box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.08);
}
.ticket-tool-hidden {
    width: 0;
    margin: 0;
}
.ticket-tool-collapse {
    display: flex;
    width: 13px;
    position: fixed;
    right: 0;
    background-color: #fff;
    top: 65px;
    bottom: 15px;
    box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.08);
    border-radius: 6px 0 0 6px;
    &-list {
        top: 160px;
    }
    &-operation {
        position: relative;
        right: 21px;
        display: inline-block;
        line-height: 14px;
        padding: 25px 27px 25px 0;
        margin: auto;
        cursor: pointer;
        background-image: url("../../assets/img/tool-btn-shadow.png");
        background-repeat: no-repeat;
        background-size: contain;
        background-position: center;
    }
    &-text {
        position: relative;
        left: 15px;
        font-family: PingFangSC-Medium;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.5);
        font-weight: 500;
    }
}
</style>
