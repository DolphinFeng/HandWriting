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
        width="356px">
        <template slot="title">
            <span class="text">{{ title }}</span>
        </template>
        <div
            class="rg-shift-wrapper"
            v-for="(item, index) in shift"
            :key="index">
            <div class="title">{{ `${$getText('cell_shift_modal_rg_group', 'RG组')}：${item.rgName}` }}</div>
            <div
                :class="['oncall-shift-tag', shift.color]"
                v-for="(shift, index2) in item.shiftList"
                :key="index2">
                <span>{{ shift.name }}</span>
                <span>{{ shift.displayTime }}</span>
            </div>
        </div>
    </mtd-modal>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { OncallWeekdayList } from '@/config/map.conf';

@Component({
    components: {}
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
    showModal: boolean = false;
    btnLoading: boolean = false;

    @Watch('visible', { immediate: true })
    onVisibleChanged () {
        this.showModal = this.visible;
        this.$nextTick(() => {
            this.changeModalStyle();
        });
    }
    cancel () {
        this.$emit('close');
        this.$emit('update:visible', false);
    }
    changeModalStyle () {
        const modalDom: any = document.getElementById('date-edit-modal')?.getElementsByClassName('mtd-modal')[0];
        modalDom.style.top = `${this.positionMap.top}px`;
        modalDom.style.marginLeft = `${this.positionMap.left}px`;
    }

    get title () {
        const date = new Date(Number(this.timestamp));
        const day = date.getDay();
        return ` ${this.$getText('cell_shift_modal_date', { month: date.getMonth() + 1, day: date.getDate() })}（${this.$getText(this.weekDayMap.find(item => Number(item.value) === day).label)}）`;
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
        padding: 12px 16px 0 16px;
        font-weight: 600;
        .text {
            display: inline-block;
            vertical-align: middle;
        }
    }
    .mtd-modal-footer {
        padding: 8px 16px !important;
    }
    .mtd-modal-content-wrapper {
        padding: 0 16px 20px 16px;
        font-size: 14px;
        .rg-shift-wrapper {
            margin-top: 20px;
        }
        .title {
            font-weight: 600;
            padding-right: 24px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .oncall-shift-tag {
            margin-top: 6px;
            border-radius: 4px;
            height: 36px;
            padding: 8px 12px;
            font-weight: 600;
            display: flex;
            justify-content: space-between;
            &.ALL {
                color: #fff;
            }
            span {
                &:nth-of-type(2) {
                    font-weight: 400;
                    font-size: 12px;
                    line-height: 20px;
                }
            }
        }
    }
}
</style>
