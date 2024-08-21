<template>
    <mtd-modal
        v-model="showModal"
        :destroy-on-close="true"
        @close="cancel"
        :mask="false"
        :mask-closable="true"
        id="date-edit-modal"
        placement="top"
        class="oncall-date-edit-modal common-modal"
        width="320px">
        <template slot="title">
            <user-avatar
                :username="member.identify"
                :avatar="member.avatarUrl"
                :display-name="member.displayName" />
            <span class="text">{{ title }}</span>
        </template>
        <span class="hint">请选择班次<span>（可多选）</span></span>
        <color-select
            :inline="false"
            :multiple="true"
            label-text="abbreviation"
            @change="onShiftChanged"
            :options="shift" />
        <template slot="footer">
            <mtd-button class="tt-pure-btn" @click="cancel">取消</mtd-button>
            <mtd-button
                class="tt-pure-btn"
                type="primary"
                :loading="btnLoading"
                @click="confirm">确定</mtd-button>
        </template>
    </mtd-modal>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import UserAvatar from '@/views/components/userAvatar.vue';
import { OncallWeekdayList } from '@/config/map.conf';
import ColorSelect from '../colorSelect.vue';
import * as api from '@/api';

@Component({
    components: {
        UserAvatar,
        ColorSelect
    }
})
export default class CellShiftModal extends Vue {
    @Prop({ default: false }) visible: boolean;
    @Prop({ default: () => ({}) }) member: CommonTypes.mapObject;
    @Prop({ default: 0 }) timestamp: number;
    @Prop({ default: () => [] }) shift: CommonTypes.mapObject[];
    @Prop({
        default: () => ({
            left: 0,
            top: 0
        })
    }) positionMap: CommonTypes.mapObject;

    weekDayMap: CommonTypes.mapObject[] = OncallWeekdayList;
    selectedShiftList: CommonTypes.mapObject[] = [];
    showModal: boolean = false;
    btnLoading: boolean = false;

    @Watch('visible', { immediate: true })
    onVisibleChanged () {
        this.showModal = this.visible;
        this.$nextTick(() => {
            this.changeModalStyle();
        });
    }
    @Watch('shift', { deep: true, immediate: true })
    onShift () {
        this.onShiftChanged(this.shift);
    }
    cancel () {
        this.$emit('close');
        this.$emit('update:visible', false);
    }
    onShiftChanged (options) {
        this.selectedShiftList = options.filter(item => item.selected);
    }
    changeModalStyle () {
        const modalDom: any = document.getElementById('date-edit-modal')?.getElementsByClassName('mtd-modal')[0];
        modalDom.style.top = `${this.positionMap.top}px`;
        modalDom.style.marginLeft = `${this.positionMap.left}px`;
    }

    async confirm () {
        this.btnLoading = true;
        try {
            const hasWholeDayShift = !!this.selectedShiftList.find(item => item.color === 'ALL');
            const shiftWithoutWholeDay = hasWholeDayShift ? this.selectedShiftList.filter(item => item.color !== 'ALL') : this.selectedShiftList;
            const res = await api.oncallApi.updateOncallTableByDate({
                rgId: this.rgId,
                mis: this.member.identify,
                date: this.timestamp,
                shift: shiftWithoutWholeDay.map(item => item.id),
                wholeDay: hasWholeDayShift
            });
            const { code } = res;
            if (code === 200) {
                this.$mtd.message.success('编辑值班信息成功');
                this.btnLoading = false;
                this.$emit('success');
                this.cancel();
            }
        } catch (error) {
            this.btnLoading = false;
        }
    }
    get title () {
        const date = new Date(this.timestamp);
        return ` ${date.getMonth() + 1}月${date.getDate()}日（${this.weekDayMap.find(item => item.value === date.getDay() + 1).label}）的值班`;
    }
    get rgId () {
        return parseInt(this.$route.query.rgId as string, 10);
    }
}
</script>

<style lang="scss">
.oncall-date-edit-modal {
    .mtd-modal {
        min-width: 320px;
        border: 1px solid rgba(0, 0, 0, 0.04);
        box-shadow: 0 13px 39px 0 rgba(0, 0, 0, 0.15);
    }
    .mtd-modal-close {
        top: 12px;
        right: 12px;
    }
    .mtd-modal-header {
        border: none !important;
        font-size: 16px;
        padding: 12px 16px 18px 16px;
        .user-name {
            font-size: 16px;
        }
        .text {
            display: inline-block;
            vertical-align: middle;
            margin-left: 2px;
        }
    }
    .mtd-modal-footer {
        padding: 8px 16px !important;
    }
    .mtd-modal-content-wrapper {
        padding: 0 16px 12px 16px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        .color-option-wrapper {
            padding-top: 8px;
        }
        .hint {
            font-weight: 600;
            span {
                color: rgba(0, 0, 0, 0.35);
                font-weight: 400;
            }
        }
    }
}
</style>
