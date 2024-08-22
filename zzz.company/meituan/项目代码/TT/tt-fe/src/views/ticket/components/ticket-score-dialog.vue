<template>
    <mtd-modal
        class="ticket-score-dialog"
        @close="handleClose"
        :title="$getText('ticket_score_dialog_title', '满意度评分')"
        width="450px"
        v-model="visible">
        <div class="score-dialog-container">
            <span>
                {{ $getText('ticket_score_dialog_welcome', '欢迎对我们的服务作出评价，您反馈的意见我们会及时跟进') }}
            </span>
            <div class="score-form-item">
                <span :class="['item-label', {'long-label': language === 'en'}]">{{ $getText('ticket_score_dialog_evaluation', '评价') }}:</span>
                <mtd-radio-group
                    v-model="scoreInfo.score"
                    size="small"
                    class="demo-mtd-radio-only-text">
                    <mtd-radio value="satisfied">{{ $getText('ticket_score_dialog_satisfied', '满意') }}</mtd-radio>
                    <mtd-radio value="common">{{ $getText('ticket_score_dialog_common', '一般') }}</mtd-radio>
                    <mtd-radio value="Dissatisfied">{{ $getText('ticket_score_dialog_dissatisfied', '不满意') }}</mtd-radio>
                </mtd-radio-group>
            </div>
            <div class="score-form-item item-flex" v-if="isDissatisfied || isCommon">
                <span class="required-mark" v-if="isRequiredDissatisfied || isRequiredCommon">*</span>
                <span :class="['item-label', {'long-label': language === 'en'}]">{{ $getText('ticket_score_dialog_reason', '原因') }}:</span>
                <div style="width: calc(100% - 120px); display: inline-block;">
                    <select-tag
                        v-for="(reason, index) in (isDissatisfied ? scoreInfo.dissatisfiedReasons : scoreInfo.commonReasons)"
                        :key="index"
                        :value="reason.value"
                        :selected="reason.selected"
                        @click.native="chooseReason(reason, index)">{{ reason.displayName }}</select-tag>
                </div>
            </div>
            <div class="score-form-item" v-if="scoreInfo.resolvedOptionDisplay">
                <span class="item-label long-label">{{ $getText('ticket_score_dialog_issue_resolved', '问题是否解决') }}:</span>
                <mtd-radio-group
                    v-model="scoreInfo.resolution"
                    size="small"
                    class="demo-mtd-radio-only-text">
                    <mtd-radio value="resolved">{{ $getText('ticket_score_dialog_resolved', '已解决') }}</mtd-radio>
                    <mtd-radio value="unresolved">{{ $getText('ticket_score_dialog_unresolved', '未解决') }}</mtd-radio>
                </mtd-radio-group>
            </div>
            <div class="require-hint" v-if="showHint">{{ $getText('ticket_score_dialog_select_feedback_reason', '请选择评价反馈原因~') }}</div>
            <div class="score-form-item">
                <span :class="['item-label', {'long-label': language === 'en'}]">{{ $getText('ticket_score_dialog_suggestion', '建议') }}:</span>
                <mtd-textarea
                    :placeholder="$getText('ticket_score_dialog_suggest_placeholder', '请反馈您的建议，方便处理方更好地跟进问题')"
                    v-model="scoreInfo.suggest"
                    type="text"
                    class="score-textarea" />
                <div class="error-tip" v-if="textError">{{ textError }}</div>
            </div>
            <div
                class="score-form-item"
                style="text-align: right;">
                <mtd-button
                    type="primary"
                    class="score-button"
                    :disabled="!scoreInfo.score"
                    @click="submitScore">{{ $getText('ticket_score_dialog_submit', '提交') }}</mtd-button>
            </div>
        </div>
    </mtd-modal>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import { getStringLength } from '@/utils/tools/index.ts';
import SelectTag from '@/components/select-tag.vue';
import eventBus from '@/utils/event-bus';
import * as api from '@/api';
/**
 * 处理人流转
 *
 * @author liyuyao
 * @date 04/22/2020
 */
@Component({
    components: {
        SelectTag
    }
})
export default class TicketScoreDialog extends Vue {
    @Getter language;
    @Prop({ default: () => {
        return {};
    } })
    info: any;

    scoreInfo: any = {
        score: '',
        suggest: '',
        dissatisfiedReasons: [],
        commonReasons: [],
        disRequire: false,
        comRequire: false,
        resolution: '',
        resolvedOptionDisplay: true
    };

    visible: Boolean = true;

    mounted () {
        if (this.$route.query.unsatisfy) {
            this.scoreInfo.score = 'Dissatisfied';
        } else if (this.$route.query.common) {
            this.scoreInfo.score = 'common';
        } else if (this.$route.query.unresolved) {
            // 不会存在同时选中未解决&不满意/一般的情况
            this.scoreInfo.resolution = 'unresolved';
        }
    }

    @Watch('info.rgId', { immediate: true })
    getRgId (rgId) {
        if (rgId) this.getSatisfationSetting(rgId);
    }

    get isDissatisfied () {
        return this.scoreInfo.score === 'Dissatisfied';
    }

    get isCommon () {
        return this.scoreInfo.score === 'common';
    }

    get isRequiredDissatisfied () {
        return this.isDissatisfied && this.scoreInfo.disRequire;
    }

    get isRequiredCommon () {
        return this.isCommon && this.scoreInfo.comRequire;
    }

    get noCommonSelected () {
        return this.isRequiredCommon && !this.scoreInfo.commonReasons.find(val => val.selected === true);
    }

    get noDissatisfiedSelected () {
        return this.isRequiredDissatisfied && !this.scoreInfo.dissatisfiedReasons.find(val => val.selected === true);
    }

    get showHint () {
        return (this.isCommon && this.noCommonSelected) || (this.isDissatisfied && this.noDissatisfiedSelected);
    }
    async getSatisfationSetting (rgId: number) {
        const res: Ajax.AxiosResponse = await api.ctiApi.getSatisfation(rgId);
        let { data, code } = res;
        if (code === 200) {
            // let dissatisfiedReasons = data.dissatisfiedReasons || [];
            // let commonReasons = data.commonReasons || [];
            let dissatisfiedReasons = data.dissatisfiedReasonDisplayList || [];
            let commonReasons = data.commonReasonDisplayList || [];
            this.scoreInfo.dissatisfiedReasons = dissatisfiedReasons.map(item => {
                return {
                    value: item.label,
                    displayName: item.displayName,
                    selected: false
                };
            });
            this.scoreInfo.commonReasons = commonReasons.map(item => {
                return {
                    value: item.label,
                    displayName: item.displayName,
                    selected: false
                };
            });
            this.scoreInfo.disRequire = data.dissatisfiedReasonRequire;
            this.scoreInfo.comRequire = data.commonReasonRequire;
            this.scoreInfo.resolvedOptionDisplay = data.resolvedOptionDisplay;
        }
    }
    async submitTicketScore () {
        const reasons = this.isDissatisfied ? this.scoreInfo.dissatisfiedReasons : this.scoreInfo.commonReasons;
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.addTicketScore({
                ticketId: parseInt(this.ticketId, 10),
                satisfy: this.scoreInfo.score,
                suggest: this.scoreInfo.suggest,
                reasons: reasons.filter(item => item.selected).map(item => item.value),
                resolution: this.scoreInfo.resolution
            });
            let { code } = res;
            if (code === 200) {
                this.$mtd.message.success(this.$getText('ticket_score_dialog_tip_submitted', '评价提交成功'));
                eventBus.$emit('updateScore');
                this.handleClose();
            }
        } catch (e) {
            console.log('error: ', e);
        }
    }
    submitScore () {
        if (this.textError.length) {
            return ;
        }
        if (this.showHint) {
            return;
        }
        this.submitTicketScore();
    }
    handleClose () {
        this.$emit('close');
    }
    chooseReason (reason: { value: string, selected: boolean }, index: number) {
        const selected = this.isDissatisfied ? this.scoreInfo.dissatisfiedReasons[index]['selected'] : this.scoreInfo.commonReasons[index]['selected'];
        this.$nextTick(() => {
            this.$set(this.isDissatisfied ? this.scoreInfo.dissatisfiedReasons[index] : this.scoreInfo.commonReasons[index], 'selected', !selected);
        });
    }
    get ticketId () {
        return this.$route.query.id;
    }
    get textError () {
        let error = '';
        if (getStringLength(this.scoreInfo.suggest) > 300) {
            error = this.$getText('ticket_score_dialog_tip_max_300', '建议内容不能超过300个字符');
        } else {
            error = '';
        }
        return error;
    }
}
</script>

<style lang="scss">
.score-dialog-container {
    .item-flex {
        display: flex;
    }
    .score-form-item {
        line-height: 34px;
        color: #6c6c6c;
        position: relative;
        .item-label {
            display: inline-block;
            width: 48px;
            color: #000;
            &.long-label {
                width: 98px;
            }
        }
        .required-mark {
            color: #f5483b;
            position: absolute;
            left: -10px;
        }
        .score-rate {
            display: inline-block;
            .score-value {
                margin-left: 20px;
                display: inline-block;
                font-family: PingFangSC-Medium;
                font-size: 16px;
                color: rgba(0, 0, 0, 0.87);
            }
        }
        .score-textarea {
            width: calc(100% - 108px);
            height: 75px;
            line-height: 22px;
            vertical-align: text-top;
            &.mtd-textarea {
                padding: 5px 8px;
            }
        }
        .score-reason {
            width: calc(100% - 56px);
        }
        .score-button {
            margin-top: 16px;
            &.mtd-btn {
                padding: 0 26px;
            }
        }
        .auto-suggest {
            display: inline-block;
            width: calc(100% - 56px);
            font-family: PingFangSC-Regular;
            font-size: 14px;
            color: rgba(0, 0, 0, 0.87);
            letter-spacing: 0;
            line-height: 22px;
            vertical-align: text-top;
        }
    }
    .error-tip {
        margin-left: 48px;
        font-size: 12px;
        color: #ff6459;
    }
    .require-hint {
        color: #f5483b;
        font-size: 12px;
        line-height: 12px;
    }
}
</style>

<style lang="scss">
.ticket-score-dialog {
    .demo-mtd-radio-only-text {
        .mtd-radio-checked .mtd-radio-text {
            font-family: PingFangSC-Medium;
            color: #f80;
        }
        .mtd-radio-inner {
            display: none;
        }
    }
}

</style>