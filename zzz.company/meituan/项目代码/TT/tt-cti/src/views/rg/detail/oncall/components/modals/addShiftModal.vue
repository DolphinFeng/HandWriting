<template>
    <mtd-modal
        v-model="showModal"
        :destroy-on-close="true"
        :title="`${type === 'create' ? '新增' : '编辑'}班次`"
        @close="close"
        class="oncall-shift-modal common-modal"
        width="550px">
        <mtd-form
            :model="shiftData"
            :label-width="100"
            ref="shiftForm"
            :rules="rules">
            <mtd-form-item
                prop="name"
                label="班次名称：">
                <mtd-input
                    placeholder="请输入班次名称"
                    style="width: 100%;"
                    v-model.trim="shiftData.name"
                    type="text" />
            </mtd-form-item>
            <mtd-form-item
                prop="abbreviation"
                label="班次简称：">
                <mtd-input
                    placeholder="请输入汉字或英文字母，eg：早"
                    style="width: 100%;"
                    v-model="shiftData.abbreviation"
                    type="text" />
            </mtd-form-item>
            <mtd-form-item
                prop="color"
                label="班次颜色：">
                <color-select
                    disable-hint="其他班次正在使用该颜色，不可选择"
                    :options="colorOptions"
                    @change="onColorChanged" />
            </mtd-form-item>
            <mtd-form-item
                prop="time"
                label="班次时间：">
                <mtd-time-picker
                    format="HH:mm"
                    type="timerange"
                    style="width: 100%;"
                    v-model="shiftData.time"
                    placeholder="选择班次时间"
                    @input="emitTimeChange"
                    :clearable="true" />
            </mtd-form-item>
            <mtd-form-item
                prop="breakTime"
                label="休息时间：">
                <mtd-time-picker
                    format="HH:mm"
                    type="timerange"
                    style="width: 100%;"
                    v-model="shiftData.breakTime"
                    placeholder="选择休息时间"
                    @input="emitBreakTimeChange"
                    popper-class="break-time-picker"
                    :steps="[1, 5]"
                    :clearable="true" />
            </mtd-form-item>
        </mtd-form>
        <div slot="footer">
            <mtd-button class="tt-pure-btn" @click="close">取消</mtd-button>
            <mtd-button
                type="primary"
                class="tt-pure-btn"
                :loading="btnLoading"
                @click="confirm">确定</mtd-button>
        </div>
    </mtd-modal>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import ColorSelect from '../colorSelect.vue';
import { cloneDeep } from 'lodash';
import { Form } from '@ss/mtd-vue';
import * as api from '@/api';

const baseTime = 8 * 3600 * 1000;
const validateName: Function = (_rule, value, callback) => {
    if (!value) {
        return callback(new Error('班次名称不能为空'));
    }
    if (value.length > 10) {
        return callback(new Error('班次名称不能超过10个字'));
    }
    return callback();
};
const validateAbbreviation: Function = (_rule, value, callback) => {
    if (!value) {
        return callback(new Error('班次简称不能为空'));
    }
    if (value.length > 1) {
        return callback(new Error('班次简称不能超过1个字'));
    }
    if (!/^[\u4e00-\u9fa5a-zA-Z]+$/.test(value)) {
        return callback(new Error('班次简称只能为汉字或英文字母'));
    }
    return callback();
};
const validateColor: Function = (_rule, value, callback) => {
    if (!value) {
        return callback(new Error('班次颜色不能为空'));
    }
    return callback();
};
const validateTime: Function = (_rule, value, callback) => {
    if (!value || !value.length || !(value[0] || value[1])) {
        return callback(new Error('班次时间不能为空'));
    }
    return callback();
};
@Component({
    components: {
        ColorSelect
    }
})
export default class AddShiftModal extends Vue {
    @Prop({ default: false })
    visible: boolean;
    @Prop({ default: 'add' })
    type: 'add' | 'update';
    @Prop({ default: () => ({}) })
    formData: CommonTypes.mapObject;

    rules = {
        name: [
            { validator: validateName, trigger: 'blur', required: true }
        ],
        abbreviation: [
            { validator: validateAbbreviation, trigger: 'blur', required: true }
        ],
        color: [
            { validator: validateColor, trigger: 'blur', required: true }
        ],
        time: [
            { validator: validateTime, trigger: 'blur', required: true }
        ],
        breakTime: [
            { validator: this.validateBreakTime, trigger: 'blur, change', required: false }
        ]
    };
    validateBreakTime (_rule, value, callback) {
        if (value && value.length && value[0] && value[1]) {
            const breakStartAt = this.getMillisecond(this.shiftData.breakTime[0]);
            const breakEndAt = this.getMillisecond(this.shiftData.breakTime[1]);
            const startAt = this.getMillisecond(this.shiftData.time[0]);
            const endAt = this.getMillisecond(this.shiftData.time[1]);
            // 班次休息时间范围需要小于班次时间范围
            if (!(breakStartAt > startAt && breakEndAt < endAt)) {
                return callback(new Error('休息时间必须在班次时间范围内'));
            }
        }
        return callback();
    };
    $refs: {
        shiftForm: Form;
    };
    colorOptions: CommonTypes.mapObject[] = [];
    shiftData: CommonTypes.mapObject = {};
    showModal: boolean = false;
    btnLoading: boolean = false;

    @Watch('visible', { immediate: true })
    onVisibleChanged () {
        this.showModal = this.visible;
    }
    @Watch('formData', { immediate: true })
    onDataChanged () {
        if (this.formData.id) {
            this.shiftData = cloneDeep(this.formData);
            this.shiftData.time = [this.shiftData.startAt, this.shiftData.endAt].map(item => new Date(item - baseTime));
            this.shiftData.formatTime = this.shiftData.time.map(time => {
                return this.getMillisecond(time);
            });
            if (this.shiftData.breakStartAt && this.shiftData.breakEndAt) {
                this.shiftData.breakTime = [this.shiftData.breakStartAt || 0, this.shiftData.breakEndAt || 0].map(item => new Date(item - baseTime));
                this.shiftData.formatBreakTime = this.shiftData.breakTime.map(time => {
                    return this.getMillisecond(time);
                });
            } else {
                this.shiftData.formatBreakTime = [0, 0];
            }
        } else {
            // 默认填充 9:00 - 18:00
            const time = [32400000, 64800000].map(item => new Date(item - baseTime));
            this.shiftData = {
                time: time,
                formatTime: time.map(time => {
                    return this.getMillisecond(time);
                }),
                formatBreakTime: [0, 0]
            };
        }
        this.colorOptions = cloneDeep(this.formData.colorOptions) || [];
        this.shiftData.color = this.colorOptions.find(item => item.selected)?.color;
    }
    getMillisecond (date) {
        if (date) {
            const hour = date.getHours();
            const min = date.getMinutes();
            return (hour * 3600 + min * 60) * 1000;
        } else {
            return 0;
        }
    }
    confirm () {
        this.$refs.shiftForm.validate(async valid => {
            if (valid) {
                // 班次的编辑改为实时生效，所以不再进行修改的二次确认
                await this.addOrUpdateShift();
            }
        }).catch(e => {
            console.log('error: ', e);
            this.btnLoading = false;
        });
    }
    async addOrUpdateShift () {
        this.btnLoading = true;
        try {
            const { formatTime, formatBreakTime } = this.shiftData;
            const res = await api.oncallApi[`${this.type}Shift`]({
                ...this.shiftData,
                rgId: this.rgId,
                startAt: formatTime[0],
                endAt: formatTime[1],
                breakStartAt: formatBreakTime[0] === 0 ? null : formatBreakTime[0],
                breakEndAt: formatBreakTime[1] === 0 ? null : formatBreakTime[1]
            });
            const { code } = res;
            if (code === 200) {
                this.$mtd.message.success(`${this.type === 'add' ? '添加' : '编辑'}班次成功`);
                this.btnLoading = false;
                this.$emit('success');
                this.close();
            }
        } catch (error) {
            this.btnLoading = false;
        }
    }
    emitTimeChange () {
        this.$refs.shiftForm.validateFields(['time', 'breakTime'], (valid) => {
            if (valid) {
                this.shiftData.formatTime = this.shiftData.time.map(time => {
                    return this.getMillisecond(time);
                });
                this.shiftData.formatBreakTime = this.shiftData.breakTime.map(time => {
                    return this.getMillisecond(time);
                });
            }
        });
    }
    emitBreakTimeChange () {
        this.$refs.shiftForm.validateFields('breakTime', (valid) => {
            if (valid) {
                this.shiftData.formatBreakTime = this.shiftData.breakTime.map(time => {
                    return this.getMillisecond(time);
                });
            }
        });
    }

    onColorChanged (options) {
        this.shiftData.color = options.find(item => item.selected)?.color;
        this.$refs.shiftForm.validateFields('color');
    }
    close () {
        this.$emit('update:visible', false);
    }
    get rgId () {
        return parseInt(this.$route.query.rgId as string, 10);
    }
}
</script>

<style lang="scss">
.oncall-shift-modal {
    .mtd-modal-content-wrapper {
        padding-top: 16px !important;
    }
}
.break-time-picker {
    .mtd-time-picker-cells-list {
        height: 122px;
    }
}
</style>
