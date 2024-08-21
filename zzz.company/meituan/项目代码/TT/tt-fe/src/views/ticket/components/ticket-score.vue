<template>
    <div class="ticket-score-container" v-if="scoreInfo.satisfy">
        <h4>{{ $getText('ticket_score_title', '满意度') }}</h4>
        <div class="score-form-item">
            <span :class="['item-label', {'long-label': language === 'en'}]">{{ $getText('ticket_score_evaluation', '评价') }}:</span>
            <span :class="['score-value', { 'dissatisfied': scoreInfo.satisfy === 'Dissatisfied' }]">{{ scoreInfo.satisfy | formateScore }}</span>
        </div>
        <div class="score-form-item" v-if="scoreInfo.satisfy === 'Dissatisfied' || scoreInfo.satisfy === 'common'">
            <span :class="['item-label', {'long-label': language === 'en'}]">{{ $getText('ticket_score_reason', '原因') }}:</span>
            <span class="score-value">{{ (scoreInfo.satisfy === 'Dissatisfied' ? (scoreInfo.dissatisfiedReasons || $getText('ticket_score_no_reason', '无')) :  (scoreInfo.commonReasons || $getText('ticket_score_no_reason', '无'))) }}</span>
        </div>
        <div class="score-form-item" v-if="scoreInfo.resolution">
            <span class="item-label long-label">{{ $getText('ticket_score_solved', '问题是否解决') }}:</span>
            <span :class="['score-value', { 'dissatisfied': scoreInfo.resolution === 'unresolved' }]">{{ scoreInfo.resolution | formatSolved }}</span>
        </div>
        <div class="score-form-item">
            <span :class="['item-label', {'long-label': language === 'en'}]">{{ $getText('ticket_score_suggestion', '建议') }}:</span>
            <div class="auto-suggest">{{ scoreInfo.suggest || $getText('ticket_score_no_suggestion', '无') }}</div>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import eventBus from '@/utils/event-bus';
import * as api from '@/api';
import store from '@/store';

/**
 * Ticket评分
 *
 * @author liyuyao
 * @date 08/07/2019
 */
@Component({
    filters: {
        formateScore (val: string) {
            const map = {
                satisfied: 'ticket_score_satisfied',
                common: 'ticket_score_common',
                Dissatisfied: 'ticket_score_dissatisfied'
            };
            return Vue.prototype.$getText(map[val]);
        },
        formatSolved (val: string) {
            const map = {
                resolved: 'ticket_score_resolved',
                unresolved: 'ticket_score_unresolved'
            };
            return Vue.prototype.$getText(map[val]);
        }
    }
})
export default class TicketScore extends Vue {
    @Getter language;
    @Prop({ default: () => {
        return {};
    } })
    info: any;

    scoreInfo: CommonTypes.mapObject = {
        satisfy: '',
        suggest: '',
        dissatisfiedReasons: '',
        commonReasons: '',
        resolution: ''
    };
    ticketId: number = 0;

    withScore: Boolean = false;

    mounted () {
        eventBus.$on('updateScore', this.getTicketScore);
    }

    beforeDestroy () {
        eventBus.$off('updateScore', this.getTicketScore);
    }

    @Watch('info.id', { immediate: true })
    getTicketId (id) {
        this.ticketId = id;
        this.ticketId && this.getTicketScore();
    }

    async getTicketScore () {
        const res: Ajax.AxiosResponse = await api.ticketApi.getTicketScore(this.ticketId);
        let { code, data } = res;
        if (code === 200) {
            this.scoreInfo.satisfy = data.satisfy || '';
            this.scoreInfo.suggest = data.suggest || '';
            this.scoreInfo.dissatisfiedReasons = data.reasons && data.satisfy === 'Dissatisfied' && data.reasons.join('，') || '';
            this.scoreInfo.commonReasons = data.reasons && data.satisfy === 'common' && data.reasons.join('，') || '';
            this.scoreInfo.resolution = data.resolution || '';
            store.commit('SET_HAS_SCORE', data.score > 0);
        }
    }
}
</script>

<style lang="scss">
.ticket-score-container {
    margin-top: 8px;
    h4 {
        font-family: PingFangSC-Medium;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.87);
        letter-spacing: 0;
        line-height: 24px;
    }
    .score-form-item {
        line-height: 34px;
        color: rgba(0, 0, 0, 0.84);
        .item-label {
            display: inline-block;
            width: 48px;
            color: #000;
            &.long-label {
                width: 98px;
            }
        }
        .auto-suggest {
            display: inline-block;
            width: calc(100% - 108px);
            font-family: PingFangSC-Regular;
            font-size: 14px;
            color: rgba(0, 0, 0, 0.84);
            letter-spacing: 0;
            line-height: 22px;
            vertical-align: text-top;
        }
        .dissatisfied {
            color: #f5483b;
        }
    }
}
</style>