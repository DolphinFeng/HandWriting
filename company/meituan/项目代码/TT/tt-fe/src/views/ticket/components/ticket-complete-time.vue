<template>
    <div class="ticket-complete-time-container">
        <div
            class="info-item"
            :key="item.field"
            v-for="item in displayFields">
            <span class="info-label important-title">{{ item.displayName }}：</span>
            <span class="info-text">{{ timeData[item.field] |  formatTimeWithTimeZone  }}</span>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
/**
 * Ticket详情侧栏完整时间
 *
 * @author liyuyao
 * @date 10/29/2020
 */
@Component
export default class TicketCompleteTime extends Vue {
    @State(state => state.tt.timeData)
    timeData: CommonTypes.mapObject;

    get displayFields () {
        return this.timeData.displayTimeFields;
    }
}
</script>
