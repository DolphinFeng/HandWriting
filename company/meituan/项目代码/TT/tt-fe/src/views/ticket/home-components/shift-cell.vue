<template>
    <div
        class="date-cell-shift"
        :id="timestamp"
        @click="onCellClick">
        <mtd-badge :value="$getText('shift_cell_official_holiday', '休')" :hidden="!(data.officialHoliday)">
            <div class="date-wrapper">
                <span :class="['date', {'today': data.today}, {'not-current-month': data.month !== currentMonth}]">{{ data.day }}</span>
            </div>
        </mtd-badge>
        <template>
            <span
                :class="['shift-wrapper', {'double': displayShiftList.length === 2}]">
                <span
                    :class="['oncall-shift-tag', item.color, {'offline': item.offline, 'multiple': displayShiftList.length > 2, 'text': !item.rgId}]"
                    :key="index"
                    v-for="(item, index) in displayShiftList">{{ item.label }}</span>
            </span>
        </template>
        <cell-shift-modal
            v-if="showCellModal"
            :visible.sync="showCellModal"
            :shift="shift"
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
import CellShiftModal from './cell-shift-modal.vue';
import { cloneDeep } from 'lodash';
const TODAY: number = new Date(new Date().setHours(0, 0, 0, 0)).valueOf();
@Component({
    components: {
        CellShiftModal
    }
})
export default class ShiftCell extends Vue {
    @Prop({ default: () => ({}) }) data: CommonTypes.mapObject;
    @Prop({ default: 0 }) timestamp: number;
    @Prop({ default: null }) endDate: Date;
    @Prop({ default: 0 }) currentMonth: number;

    displayShiftList: CommonTypes.mapObject[] = []; // 用于在单元格中展示的班次list，如果有“全天”，则为空
    allShiftList: CommonTypes.mapObject[] = []; // 各个rg组班次拼接而成
    shift: CommonTypes.mapObject[] = []; // 按照rg聚合的班次
    type: string = '';
    showCellModal: boolean = false;
    noShift: boolean = true;
    modalPosition = {
        left: 0,
        top: 0
    };

    @Watch('data', { immediate: true, deep: true })
    onTypeChanged () {
        if (this.data) {
            this.allShiftList = [];
            this.displayShiftList = [];
            this.noShift = true;
            this.data.rgOncallInfo?.forEach(rg => {
                if (rg.shiftList?.length) {
                    this.noShift = false;
                    this.allShiftList.push(...rg.shiftList);
                }
            });
            this.shift = cloneDeep(this.data.rgOncallInfo);
            if (!this.noShift) {
                // 根据班次个数处理
                if (this.allShiftList.length > 4) {
                    this.displayShiftList = this.allShiftList.slice(0, 3).concat([{
                        shiftId: 0,
                        abbreviation: `+${this.allShiftList.length - 3}`
                    }]);
                } else {
                    this.displayShiftList = cloneDeep(this.allShiftList);
                }
                const length = this.displayShiftList.length;
                this.displayShiftList = this.displayShiftList.map((item, index) => {
                    if (length <= 2) {
                        item.label = item.rgId ? `${item.abbreviation}/${item.rgName}` : item.abbreviation;
                    } else if (length === 3) {
                        if (index === 2) {
                            item.label = item.rgId ? `${item.abbreviation}/${item.rgName}` : item.abbreviation;
                        } else {
                            item.label = item.abbreviation;
                        }
                    } else {
                        item.label = item.abbreviation;
                    }
                    return item;
                });
            } else {
                this.displayShiftList = [];
            }
        }
    }
    formatRgOncallShift (data) {
        data.forEach(rg => {
            if (rg.shiftList?.length) {
                this.noShift = false;
                this.allShiftList.push(rg.shiftList);
            }
        });
    }
    onCellClick () {
        if (this.disableClick) return;
        this.calculateModalPosition();
        this.showCellModal = true;
    }
    // 计算弹窗应该出现的位置
    calculateModalPosition () {
        const el = document.getElementById(this.timestamp.toString());
        const { top, right, left } = el.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        let listHeight = 0;
        this.shift.forEach(item => {
            listHeight += (item.shiftList.length * 42 + 40);
        });
        const modalHeight = 90 + listHeight;
        // 默认在el的右侧展示，当右侧宽度不够时，在左侧展示
        // 根据窗口高度和弹窗高度，判断纵向位置
        this.modalPosition = {
            top: (windowHeight - top) > modalHeight ? top : (windowHeight - modalHeight),
            left: (windowWidth - right) > 356 ? (right + 2) : (left - 356 - 2)
        };
    }
    onModalClose () {
        this.$emit('close');
    }
    onSuccess () {
        this.$emit('success');
    }
    get disableClick () {
        // 不可操作日期不可点击
        return this.noShift || this.timestamp < TODAY;
    }
}
</script>

<style lang="scss">
.date-cell-shift {
    height: 100%;
    width: 100%;
    padding: 2px;
    font-weight: 600;
    font-size: 12px;
    vertical-align: middle;
    &.selected {
        border: 2px solid #ffd100;
        padding: 0;
    }
    .day-off {
        color: #00a85a;
        display: inline-block;
        line-height: 32px;
        &.pending {
            color: #d13030;
        }
    }
    .oncall-shift-tag {
        width: 60px;
        height: 16px;
        line-height: 16px;
        border-radius: 4px;
        display: inline-block;
        margin: 1px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        &.ALL {
            color: #fff;
        }
        &.text {
            font-weight: 500;
        }
    }
    .shift-wrapper {
        margin: 0 0;
        display: flex;
        flex-wrap: wrap;
        height: 100%;
        .oncall-shift-tag {
            flex: 1 1 40%;
            padding: 0 3px;
            margin: 1px;
            &.multiple {
                // height: calc((100% - 6px) / 2);
            }
        }
        &.double {
            .oncall-shift-tag {
                flex: 1 1 100%;
            }
        }
    }
}
</style>
