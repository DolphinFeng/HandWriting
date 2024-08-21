<template>
    <mtd-modal
        :title="$getText('pend_ticket_modal_title', '请选择暂停原因')"
        class="handle-ticket-dialog form-dialog"
        :mask-closable="false"
        width="480px"
        @close="close"
        v-model="show">
        <mtd-form
            :model="formCustom"
            ref="formCustom"
            :label-width="120"
            :rules="ruleCustom"
            v-loading="!replyReady">
            <mtd-form-item
                class="require"
                prop="pendingReason"
                :label="$getText('pend_ticket_label_reason', '暂停原因')">
                <mtd-select
                    v-model="formCustom.pendingReason"
                    style="width: 100%;"
                    :placeholder="$getText('selector_default_placeholder', '请输入')">
                    <mtd-option
                        v-for="(item, index) in closeReason"
                        :key="index"
                        :label="item.label"
                        :value="item.value" />
                    <!-- :loading="reasonLoading"
                    :filterable="true"
                    :remote="true"
                    :remote-method="remoteMethod"
                    :debounce="500"
                    :placeholder="$getText('please_enter_the_reason_for_the_pause', '请输入暂停原因')">
                    <mtd-dropdown-menu
                        v-if="closeReason && closeReason.length > 0"
                        style="max-height: 224px;"
                        v-infinite-scroll="loadMorePendingReasons"
                        :infinite-scroll-disabled="noMoreReasons"
                        :infinite-scroll-delay="500"
                        :infinite-scroll-distance="10"
                        :infinite-scroll-immediate="false">
                        <mtd-option
                            v-for="(item, index) in closeReason"
                            :key="index"
                            :label="item.label"
                            :value="item.value" />
                    </mtd-dropdown-menu> -->
                </mtd-select>
            </mtd-form-item>
            <mtd-form-item
                v-if="formCustom.pendingTimeSwitch"
                class="require"
                prop="pendingTime"
                :label="$getText('pend_ticket_pause_duration', '暂停时长')">
                <mtd-tooltip
                    placement="top"
                    popper-class="demo-tooltip"
                    :content="$getText('pause_duration_range_0_60_info_new', '数字范围：0-60，输入0表示不自动解除工单暂停状态。')">
                    <mtd-input-number
                        class="input-pending-time"
                        v-model="formCustom.pendingTime" 
                        :max="60" 
                        :min="0" 
                        controls-position="right" />
                </mtd-tooltip>
                <mtd-select
                    class="select-pending-time"
                    v-model="formCustom.timeUnit">
                    <mtd-option
                        v-for="(item, index) in timeUnitOptions"
                        :key="index"
                        :label="item.label"
                        :value="item.value" />                
                </mtd-select>
            </mtd-form-item>
            <mtd-form-item
                prop="desc"
                :label="$getText('pend_ticket_label_desc', '描述')"
                :class="{ 'require': pendingReasonCustomized }">
                <editor
                    ref="editor"
                    v-if="replyReady"
                    :value="formCustom.desc"
                    :action="uploadApi"
                    :reply-list="replyList"
                    @input="handleChange"
                    @imgUpload="handleImgUpload"
                    @reply-quick="replyQuick">
                    <div slot="toolbar">
                        <slot name="toolbar" />
                    </div>
                </editor>
            </mtd-form-item>
        </mtd-form>
        <div slot="footer">
            <mtd-button @click="close">{{ $getText('pend_ticket_cancel', '取消') }}</mtd-button>
            <mtd-button
                :loading="btnLoading"
                type="primary"
                :disabled="imgUploadStatus || descOverflow"
                @click="submit">{{ $getText('pend_ticket_confirm', '确定') }}</mtd-button>
        </div>
    </mtd-modal>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import editor from '@/components/quill-editor.vue';
import * as api from '../../../../api/index';
// import { InfiniteScroll } from 'element-ui';
// Vue.use(InfiniteScroll);
interface Form {
    desc: string;
    pendingReason: string;
    pendingTime: number;
    timeUnit: string;
    pendingTimeSwitch: boolean;
}
const validateReason: Function = (_rule, value, callback) => {
    if (!value) {
        return callback(new Error(Vue.prototype.$getText('pend_ticket_error_not_empty', '暂停原因不能为空')));
    }
    return callback();
};
const validatePendingTime = (_rule, value, callback) => {
    if (value < 0 || value > 60) {
        return callback(new Error(Vue.prototype.$getText('pend_ticket_error_not_range_0_60','输入的数字有误，支持0-60范围的数字')));
    }
    return callback();
};


/**
 * 暂停ticket 已经开始的tt，要暂停
 *
 * @author wutong
 */
@Component({
    components: {
        editor
    }
})
export default class PauseTicket extends Vue {
    @Getter loginType;

    @Prop({ default: '' })
    id: string;

    @Prop({ default: () => {
        return {};
    } })
    info: any;


    // reasonLoading: Boolean = false;
    // currentQuery: string = '';

    show: Boolean = true;
    replyReady: boolean = false;

    ruleCustom = {
        pendingReason: [
            { validator: validateReason, trigger: 'blur, change' }
        ],
        pendingTime: [
          { validator: validatePendingTime, trigger: 'blur, change' }
        ],
        desc: [
            {
                validator: (_rule, value, cb) => {
                    if (this.pendingReasonCustomized && !value) {
                        return cb(new Error(this.$getText('pend_ticket_error_desc', '请描述暂停原因')));
                    }
                    return cb();
                },
                trigger: 'blur'
            }
        ]
    };
    formCustom: Form = {
        desc: '',
        pendingReason: '',
        pendingTime: 0,
        timeUnit: '分钟',
        pendingTimeSwitch: false
    };
    timeUnitOptions = [
      { label: this.$getText('pend_ticket_minute', '分钟'), value: '分钟' },
      { label: this.$getText('time_type_hour', '小时'), value: '小时' },
      { label: this.$getText('time_type_day', '天'), value: '天' },
      { label: this.$getText('time_type_week', '周'), value: '周' },
      { label: this.$getText('time_type_month', '月'), value: '月' },
      { label: this.$getText('time_type_year', '年'), value: '年' }
    ];
    btnLoading: Boolean = false;
    closeReason: {value: string, label: string}[] = [];
    replyList: string[] = [];
    imgUploadStatus: boolean = false;

    get pendingReasonCustomized () {
        return this.formCustom.pendingReason === '其他';
    }
    $refs: any;


    // Infinite Scroll Variables
    // pageNum: number = 1;
    // pageSize: number = 20;
    // totalReasons: number = 0;
    // noMoreReasons: boolean = false;

    @Watch('info.rgId', { immediate: true })
    rgIdChange (rgId: number) {
        if (rgId) {
            this.replyReady = false;
            this.initCloseReason(rgId);
            this.getRgReplyText(rgId);
            this.getPendingTimeSwitch(rgId);
            // this.loadMorePendingReasons();
            // this.resetLoadState();
        }
    }

    // @Watch('show')
    // onShowChanged (val) {
    //     if (val) {
    //         this.resetLoadState();
    //     }
    // }

    // resetLoadState () {
    //     this.pageNum = 1;
    //     this.noMoreReasons = false;
    //     this.closeReason = [];
    // }


    close () {
        this.show = false;
        this.$emit('close');
        // 重置分页和状态变量
        // this.resetLoadState();
    }
    async initCloseReason (rgId) {
        try {
            const res: Ajax.AxiosResponse = await api.ctiApi.getRgReplyField({
                rgId: rgId,
                type: 'PENDING_REASON'
            });
            let { code, data } = res;
            if (code === 200) {
                this.closeReason = data.items.map(item => {
                    return {
                        value: item.content,
                        label: item.displayName || item.content
                    };
                });
            }
        } catch (e) {
            console.log(e);
        }
    }

    async submit () {
        if (this.btnLoading) {
            return;
        }
        this.$refs['formCustom'].validate(async (valid) => {
            if (valid) {
                this.btnLoading = true;
                const pendingReason = this.formCustom.desc || this.formCustom.pendingReason;
                // 根据 pendingTimeSwitch 构建请求 payload
                let requestData = {
                    state: '暂停中',
                    pendingReason: pendingReason
                };
                // 当开启暂停状态，请求包含时间戳，如果时间选择为0则不包含时间戳
                if (this.formCustom.pendingTimeSwitch && this.formCustom.pendingTime) {
                    const pendingCancelAt = this.computePendingCancelAt(this.formCustom.pendingTime, this.formCustom.timeUnit);
                    requestData.pendingCancelAt = pendingCancelAt;
                }
                try {
                    await api.ticketApi.updateTicket(this.id, requestData);
                    this.$mtd.message({
                        message: this.$getText('pend_ticket_tip_state_change', '状态变更成功'),
                        type: 'info'
                    });
                    this.$emit('success');
                    this.close();
                } catch (e) {
                    console.log(e);
                }
                this.btnLoading = false;
            }
        }).catch(err => console.log(`validate msg: `, err));
    }
    get uploadApi () {
        return this.loginType === 'PASSPORT' ? `/api/passport/tt/1.0/file/upload?ticketId=${this.ticketId}&area=comment` : `/api/tt/1.0/file/upload?ticketId=${this.ticketId}&area=comment`;
    }
    get descOverflow () {
        return this.formCustom.desc.length > 5000;
    }
    get ticketId () {
        return this.$route.query.id;
    }
    replyQuick (value: string) {
        this.$set(this.formCustom, 'desc', value);
        this.handleChange(value);
    }
    handleChange (value) {
        this.formCustom.desc = value;
    }
    handleImgUpload (val) {
        this.imgUploadStatus = val;
    }
    async getRgReplyText (rgId) {
        const res: Ajax.AxiosResponse = await api.ctiApi.getRgReplyText({
            rgId: rgId,
            type: 'PENDING_REASON'
        });
        let { code, data } = res;
        if (code === 200) {
            this.replyList = data.items.map(item => item.content);
            this.replyReady = true;
        }
    }

    async getPendingTimeSwitch (rgId) {
        const res: Ajax.AxiosResponse = await api.ctiApi.getRgSetting(rgId);
        const { code, data } = res;
        if (code === 200) {
            this.formCustom.pendingTimeSwitch = data.pendingTimeSwitch || false;
        }
    }
    /**
     * 根据暂停时长(0-60)和时间单位计算结束时间的时间戳
     * @param pendingTime 暂停时长
     * @param timeUnit 单位
     * @returns 结束时间的时间戳
     */
    computePendingCancelAt (pendingTime, timeUnit) {
        let currentDate = new Date();
        let futureDate = new Date(currentDate);
        switch (timeUnit) {
            case '年':
                futureDate.setFullYear(futureDate.getFullYear() + pendingTime);
                break;
            case '月':
                futureDate.setMonth(futureDate.getMonth() + pendingTime);
                break;
            case '周':
                futureDate.setDate(futureDate.getDate() + (pendingTime * 7));
                break;
            case '天':
                futureDate.setDate(futureDate.getDate() + pendingTime);
                break;
            case '小时':
                futureDate.setHours(futureDate.getHours() + pendingTime);
                break;
            case '分钟':
                futureDate.setMinutes(futureDate.getMinutes() + pendingTime);
                break;
            default:
                console.error('无效的时间单位');
                return null;
        }
        return futureDate.getTime(); // 返回时间戳（毫秒）
    }

    // select远程搜索
    // async remoteMethod (query?: string) {
    //     this.pageNum = 1;
    //     this.noMoreReasons = false;
    //     this.closeReason = [];
    //     this.currentQuery = query || '';
    //     await this.loadMorePendingReasons(this.currentQuery);
    // }

    // async loadMorePendingReasons (query?: string) {
    //     // debugger;
    //     console.log('触发了吗', this.currentQuery);
    //     console.log('2', this.noMoreReasons);
    //     if (this.reasonLoading || this.noMoreReasons) return;
    //     // this.reasonLoading = true;

    //     try {
    //         const res: Ajax.AxiosResponse = await api.ctiApi.getCloseReasonList({
    //             rgId: this.info.rgId,
    //             type: 'PENDING_REASON',
    //             content: query || this.currentQuery,  // Assuming content is empty for initial load, change if necessary
    //             pageNum: this.pageNum,
    //             pageSize: this.pageSize
    //         });

    //         console.log('2.1111', res);
    //         const { items, tn } = res.data;

    //         const mappedItems = items.map(item => {
    //             return {
    //                 value: item.content,
    //                 label: item.displayName || item.content
    //             };
    //         });

    //         this.closeReason = [...this.closeReason, ...mappedItems];
    //         this.totalReasons = tn;
    //         this.pageNum += 1;

    //         if (this.closeReason.length >= tn) {
    //             this.noMoreReasons = true;
    //         }
    //         console.log('3', this.noMoreReasons);
    //     } catch (error) {
    //         console.error('Failed to load close reasons:', error);
    //     } finally {
    //         this.reasonLoading = false;
    //     }
    // }
}
</script>

<style lang="scss" scoped>
/* 暂停时长输入框样式 */
.input-pending-time {
    width: 80px;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-right: 0;
    /deep/ .mtd-input-number {
        padding: 0 30px 0 0;
    }
}
.select-pending-time {
    width: 100px;
    margin-left: -5px;
    /deep/ .mtd-input {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
    }
}
</style>