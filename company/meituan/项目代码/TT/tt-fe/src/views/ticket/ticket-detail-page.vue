<template>
    <div class="ticket-detail-page">
        <div class="ticket-detail-page-container">
            <ticket-detail :is-mini-detail="isMiniDetail" />
        </div>
        <ticket-tool
            v-if="!isMiniDetail"
            :ticket-id="ticketId"
            :tool-mode.sync="toolMode"
            :tool-exchangeable="toolExchangeable" />
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import TicketDetail from './ticket-detail.vue';
import TicketTool from './ticket-tool.vue';

@Component({
    components: {
        TicketDetail,
        TicketTool
    }
})
export default class TicketDetailPage extends Vue {
    toolMode: string = 'static';
    toolExchangeable: boolean = true;

    get ticketId () {
        return this.$route.query.id;
    }

    get isMiniDetail () {
        // 暂时不将case引入页面样式做修改
        return this.$route.name === 'tt_mini_detail';
    }

}
</script>

<style lang="scss" scoped>
.ticket-detail-page {
    display: flex;
    margin: 12px auto;
    max-width: 1340px;
    min-width: 848px;
    height: calc(100% - 24px);
}
.ticket-detail-page-container {
    position: relative;
    flex-grow: 1;
    margin: 0 auto;
    max-width: 1024px;
    min-width: 848px;
    height: 100%;
}
</style>
