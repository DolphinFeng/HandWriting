<template>
    <div style="display: inline-block;" v-if="showEvaluate">
        <mtd-button
            v-if="!hasScore"
            type="primary"
            @click="scoreDialogController = true"
            style="margin-right: 6px; vertical-align: middle;">{{ $getText('ticket_score_button_evaluate', '评价') }}</mtd-button>
        <ticket-score-dialog
            v-if="scoreDialogController"
            :info="info"
            @close="scoreDialogController = false"
            @success="handleUpdate" />
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { Getter, State } from 'vuex-class';
import { itemPermission } from '@/utils/tools';
import TicketScoreDialog from './ticket-score-dialog.vue';
/**
 * 评分按钮
 *
 * @author liyuyao
 * @date 05/09/2020
 */
@Component({
    components: {
        TicketScoreDialog
    }
})
export default class TicketScoreButton extends Vue {
    @Getter env;
    @Getter misX;
    @State(state => state.tt.ticketAbout)
    ticketAbout: any;

    @State(state => state.tt.hasScore)
    hasScore: boolean;

    @Prop({ default: () => {
        return {};
    } })
    info: any;

    scoreDialogController: boolean = false;
    itemPermission: Function = itemPermission;

    mounted () {
        if (this.$route.query.unsatisfy || this.$route.query.common || this.$route.query.unresolved) {
            this.scoreDialogController = true;
        }
    }
    // 是否展示评价按钮
    get showEvaluate () {
        let ifCreate = false;
        let ifFinishState = false;
        if (this.info.createdBy && this.misX) {
            ifCreate = (this.misX === this.info.createdBy) || (this.misX === this.info.reporter);
        }
        if (this.info.state) {
            ifFinishState = (this.info.state.category === 'DONE') || (this.info.state.category === 'CLOSE');
        }
        if (this.ticketAbout.itsm) {
            return false;
        }
        // 如果rg配置了关闭评价，则隐藏按钮，通过评价链接进入也不会展示弹窗
        return ifCreate && ifFinishState && itemPermission('evaluation').visible;
    }
    handleUpdate () {
        this.$emit('success');
    }
}
</script>
