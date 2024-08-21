<template>
    <div
        class="date-cell-shift"
        :id="`${timestamp}-${member.identify}`"
        @click="onCellClick">
        <span
            v-if="type === 'dayOff' || type === 'dayOffPending'"
            :class="['day-off', {'pending': type === 'dayOffPending'}]">{{ type === 'dayOff' ? '请假' : '请假中' }}</span>
        <template v-else>
            <span
                v-if="type === 'wholeDay' || type === 'wholeDayOffline'"
                :class="['oncall-shift-tag ALL', {'offline': type === 'wholeDayOffline'}]">值班</span>
            <span
                :class="['multi-shift-wrapper', {'double': displayShiftList.length === 2}]"
                v-else>
                <span
                    :class="['oncall-shift-tag', item.color, {'offline': item.offline, 'multiple': displayShiftList.length > 2, 'text': !item.shiftId}]"
                    :key="index"
                    v-for="(item, index) in displayShiftList">{{ item.abbreviation }}</span>
            </span>
        </template>
        <cell-shift-modal
            v-if="showCellModal"
            :visible.sync="showCellModal"
            :member="member"
            :shift="allShiftList"
            :timestamp="timestamp"
            :position-map="{
                left: modalPosition.left,
                top: modalPosition.top
            }"
            @success="onSuccess"
            @close="onModalClose" />
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import CellShiftModal from './modals/cellShiftModal.vue';
import { cloneDeep } from 'lodash';
import { lxReportClick } from '@/utils/directive/lxanaly';
import { OncallReportMap } from '@/config/lx.conf';
const TODAY: number = new Date(new Date().setHours(0, 0, 0, 0)).valueOf();
@Component({
    components: {
        CellShiftModal
    }
})
export default class ShiftCell extends Vue {
    @Prop({ default: () => ({}) }) data: CommonTypes.mapObject;
    @Prop({ default: () => ({}) }) member: CommonTypes.mapObject;
    @Prop({ default: () => [] }) shiftList: CommonTypes.mapObject[];
    @Prop({ default: 0 }) timestamp: number;
    @Prop({ default: null }) endDate: Date;

    displayShiftList: CommonTypes.mapObject[] = []; // 用于在单元格中展示的班次list，如果有“全天”，则为空
    allShiftList: CommonTypes.mapObject[] = []; // 用于在弹窗中展示的班次list，包括“全天”
    shift: CommonTypes.mapObject[] = [];
    type: string = '';
    showCellModal: boolean = false;
    modalPosition = {
        left: 0,
        top: 0
    };

    @Watch('data', { immediate: true, deep: true })
    onTypeChanged () {
        if (this.data) {
            this.type = this.data.type;
            this.shift = cloneDeep(this.data.shift);
            if (this.data.type === 'shift') {
            // 根据班次个数处理
                if (this.shift.length > 4) {
                    this.displayShiftList = this.shift.slice(0, 3).concat([{
                        shiftId: 0,
                        abbreviation: `+${this.shift.length - 3}`,
                    }]);
                } else {
                    this.displayShiftList = cloneDeep(this.shift);
                }
            } else {
                this.displayShiftList = [];
            }
            this.formatAllShiftList();
        }
    }
    @Watch('shiftList', { deep: true })
    onShiftListChanged () {
        this.formatAllShiftList();
    }
    formatAllShiftList () {
        this.allShiftList = this.shiftList.map(shift => {
            return {
                ...shift,
                selected: shift.color === 'ALL'
                    ? (this.data.type === 'wholeDay' || this.data.type === 'wholeDayOffline')
                    : !!this.data.shift?.find(item => item.shiftId === shift.id)
            };
        });
    }
    onCellClick () {
        if (this.disableClick) return;
        lxReportClick(OncallReportMap.edit_date_oncall);
        this.calculateModalPosition();
        this.showCellModal = true;
    }
    // 计算弹窗应该出现的位置
    calculateModalPosition () {
        const el = document.getElementById(`${this.timestamp}-${this.member.identify}`);
        const { top, right, left } = el.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const modalHeight = 165 + 36 * (this.allShiftList.length);
        // 默认在el的右侧展示，当右侧宽度不够时，在左侧展示
        // 根据窗口高度和弹窗高度，判断纵向位置
        // TODO：用屏幕中间位置兜底
        this.modalPosition = {
            top: (windowHeight - top) > modalHeight ? top : (windowHeight - modalHeight),
            left: (windowWidth - right) > 330 ? (right + 10) : (left - 330)
        };
    }
    onModalClose () {
        this.$emit('close');
    }
    onSuccess () {
        lxReportClick(OncallReportMap.submit_date_oncall);
        this.$emit('success');
    }
    get disableClick () {
        // 不可操作日期不可点击、被删除的值班人不可点击、请假/请假中不可点击
        return this.member.deleted || this.timestamp < TODAY || this.timestamp > this.endDate.getTime() || this.type === 'dayOff' || this.type === 'dayOffPending';
    }
}
</script>

<style lang="scss">
.date-cell-shift {
    height: 100%;
    padding: 13px 2px;
    font-weight: 600;
    font-size: 12px;
    vertical-align: middle;
    &.selected {
        border: 2px solid #FFD100;
        padding: 11px 0;
    }
    .day-off {
        color: #00A85A;
        display: inline-block;
        line-height: 32px;
        &.pending {
            color: #D13030;
        }
    }
    .oncall-shift-tag {
        border-radius: 4px;
        display: inline-block;
        margin: 1px;
        &.ALL {
            color: #FFFFFF;
            height: calc(100% - 2px);
            width: calc(100% - 2px);
            line-height: 32px;
        }
        &.text {
            font-weight: 500;
        }
    }
    .multi-shift-wrapper {
        margin: 0 0;
        display: flex;
        flex-wrap: wrap;
        height: 100%;
        .oncall-shift-tag {
            flex: 1 1 40%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 1px;
            &.multiple {
                height: 15px;
            }
        }
        &.double {
            .oncall-shift-tag {
                flex: 1 1 100%;
                height: 44%;
            }
        }
    }
}
</style>
