<!-- 按组值班-设置页-内嵌在表单里 -->
<template>
    <div class="group-oncall-editor" :class="{ large: formData.onCallModeName === 'GROUP_TIME_TURN' }">
        <mtd-form :model="formData" :label-width="128">
            <mtd-form-item prop="onCallModeName" label="值班模式">
                <mtd-select v-model="formData.onCallModeName">
                    <mtd-option label="多组轮值" value="GROUP_TURN" />
                    <mtd-option label="按以下时间段轮值" value="GROUP_TIME_TURN" />
                </mtd-select>
            </mtd-form-item>

            <template v-if="formData.onCallModeName === 'GROUP_TURN'">
                <mtd-form-item prop="onCallRule.ruleCycle" label="轮值周期">
                    <mtd-select
                        v-model="formData.onCallRule.ruleCycle"
                        @change="resetRuleStartOptions"
                        key="oncallCycle">
                        <mtd-option value="day" label="按天轮值" />
                        <mtd-option value="day_skip" label="按天轮值（跳过节假日）" />
                        <mtd-option value="week" label="按周轮值（7天）" />
                    </mtd-select>
                </mtd-form-item>

                <mtd-form-item prop="onCallRule.ruleStart" label="轮值时间点">
                    <mtd-select v-model="formData.onCallRule.ruleStart" key="oncallStart">
                        <mtd-option
                            v-for="item in ruleStartOptions"
                            :key="item.value"
                            :value="item.value"
                            :label="item.label" />
                    </mtd-select>
                </mtd-form-item>

                <mtd-form-item
                    prop="groupList"
                    label="轮值顺序"
                    class="oncall-order-drop">
                    <div class="drop-tip">拖拽小组名称进行排序<span>共{{ wholeGroupList.length }}组</span></div>
                    <div class="drop-filter">
                        <Container @drop="onDropEvent">
                            <Draggable v-for="(item, index) in sortedGroupList" :key="`${index}-${item.id}`">
                                <div class="draggable-item">
                                    <i class="mtdicon mtdicon-sortupanddown-o" style="vertical-align: bottom;" />
                                    <span>{{ item.name }}</span>
                                </div>
                            </Draggable>
                        </Container>
                    </div>
                </mtd-form-item>

            </template>

            <template v-if="formData.onCallModeName === 'GROUP_TIME_TURN'">
                <mtd-form-item prop="weekTimeList" label="">
                    <mtd-checkbox-group
                        v-model="enabledWorkDays"
                        class="working-time-content"
                        @change="weekDayChange">
                        <div v-for="(day, index) in weekDaysZh" :key="index">
                            <mtd-checkbox :value="index + 1">{{ day }}</mtd-checkbox>
                            <!-- time-slot 组件共7个 -->
                            <oncall-time-slot
                                :whole-group-list="wholeGroupList"
                                :time-slots="timeSlots[index + 1]"
                                :disabled="!enabledWorkDays.includes(index + 1)"
                                @change="updateNthTimeSlot(index + 1)($event)"
                                style="display: inline-block;" />
                        </div>
                    </mtd-checkbox-group>
                </mtd-form-item>

                <mtd-form-item label="" prop="userList">
                    <span class="fallback-users-caption">
                        当日超出以上时间段发来的TT，系统自动将问题平均分配给
                    </span>
                    <mtd-select
                        key="userList"
                        v-model="formData.userList"
                        multiple
                        placeholder="请输入添加成员的mis号"
                        :filterable="true"
                        :debounce="200"
                        style="width: 300px;">
                        <mtd-option
                            v-for="item in wholeRgUserList"
                            :key="item.identify"
                            :label="`${item.displayName}(${item.identify})`"
                            :value="item.identify" />
                    </mtd-select>
                    (可多选)
                </mtd-form-item>
            </template>

            <mtd-form-item>
                <mtd-button
                    type="primary"
                    style="margin-right: 12px;"
                    @click="handleSubmit">确认</mtd-button>
                <mtd-button @click="cancel">取消</mtd-button>
            </mtd-form-item>
        </mtd-form>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Container, Draggable } from 'vue-smooth-dnd';
import { cloneDeep } from 'lodash';
import { applyDrag } from '@/utils/helpers';
import OncallTimeSlot from './oncall-time-slot.vue';
import { EveryWeekdayList, EveryHourList } from '@/config/map.conf';

/**
 * @description 此组件只维护与表单有关的值，不包含发送 GET 请求获取配置的操作，更不包含不幂等的 POST/PUT 操作
 * 输入：预填 rgId
 * 输出：
 */

// onCallModeName 固定为 'GROUP_TURN' 时
interface GroupTurnFields {
    onCallModeName: 'GROUP_TURN';

    // 值班组 ID 列表
    groupList: number[];

    onCallRule: { ruleCycle: 'day' | 'week' | 'day_skip'; ruleStart: string };
}

type WeekDayType = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

// 最小数据单元：在 ${startAt}~${endAt} 这一段时间内，由 ${groupId} 这个组值班
interface TimeSlotOnCallRule {
    id?: number;
    groupId: number;
    startAt: number;
    endAt: number;
}

// 在 ${weekDay} 这一天(如周一) 的 a~b, b~c, c~d 三个工作时间段，分别由 x,y,z 三个小组值班
interface WeekDayOnCallRule {
    weekDay: WeekDayType;
    groupTimeList: Array<TimeSlotOnCallRule>;
}

// onCallModeName 固定为 'GROUP_TIME_TURN' 时
interface GroupTimeTurnFields {
    onCallModeName: 'GROUP_TIME_TURN';
    weekTimeList: Array<WeekDayOnCallRule>;
    userList: string[];
}

// 合并两种模式下的多个字段到同一个 interface 定义里
interface MergedFormFields extends Omit<GroupTurnFields, 'onCallModeName'>, Omit<GroupTimeTurnFields, 'onCallModeName'> {
    onCallModeName: 'GROUP_TURN' | 'GROUP_TIME_TURN';
}

const defaultFields = {
    onCallModeName: 'GROUP_TURN' as const,
    groupList: [],
    onCallRule: { ruleCycle: 'day' as const, ruleStart: '' },
    weekTimeList: [],
    userList: []
};

// [ { value: '0-0', label: '每天0点' }, ...]
const EVERY_HOUR_OPTIONS = EveryHourList.map((hour) => ({ value: `0-${hour}`, label: `每天${hour}点` }));

// [ { value: '1-0', label: '每周一0点' }]
const EVERY_WEEKDAY_OPTIONS = EveryWeekdayList.map(item => ({ ...item, value: `${item.digit}-0`, label: `每${item.label}0点` }));

// { '1': 'MONDAY', '2': 'TUESDAY', ... }
const WEEKDAYS_EN_MAP = Object.values(EveryWeekdayList).reduce((result, item) => Object.assign(result, { [item.digit]: item.value }), {});

// [{ value: 'MONDAY', label: '周一' }, ...]
const WEEKDAYS_ZH_OPTIONS = EveryWeekdayList.map(item => item.label);

// 输入 'MONDAY' 输出 '1'
const convertDayEnToDigit = (weekDayEn) => {
    const day = EveryWeekdayList.find(item => item.value === weekDayEn);
    return day ? day.digit : '';
};

/**
 * 硬编码初始化的时间插槽设置
 * - why 86340000?
 * - 因为 new Date(86340000) 等于 GMT 时间的 1970年1月1日23:59:00
 */
const defaultTimeSlots = {
    1: [[0, 86340000, null]],
    2: [[0, 86340000, null]],
    3: [[0, 86340000, null]],
    4: [[0, 86340000, null]],
    5: [[0, 86340000, null]],
    6: [[0, 86340000, null]],
    7: [[0, 86340000, null]]
};

@Component({
    name: 'group-oncall-editor',
    components: { Container, Draggable, OncallTimeSlot }
})
export default class GroupOncallEditor extends Vue {
    @Prop({ required: true, default: {} })
    initData: any;

    @Prop({ required: true, default: [] })
    wholeGroupList: Array<CommonTypes.OnCallGroupRecord>;

    @Prop({ required: true, default: [] })
    wholeRgUserList: Array<CommonTypes.RgUserItem>;

    @Prop({ required: false, default: 'medium' })
    size: 'small' | 'large';

    formData: MergedFormFields = defaultFields;
    sortedGroupList: Array<CommonTypes.OnCallGroupRecord> = [];

    weekDaysZh: string[] = WEEKDAYS_ZH_OPTIONS;

    // 勾选了的工作日
    enabledWorkDays: number[] = [];

    // 默认 timeSlots 设置
    timeSlots: any = { ...defaultTimeSlots };

    get ruleStartOptions () {
        if (this.formData == null || this.formData.onCallModeName === 'GROUP_TIME_TURN') {
            return [];
        }
        const ruleCycle = this.formData.onCallRule.ruleCycle;
        if (ruleCycle === 'day' || ruleCycle === 'day_skip') {
            return EVERY_HOUR_OPTIONS;
        }
        return EVERY_WEEKDAY_OPTIONS;
    }

    // 初始化设置内容，把数据"预填"到表单
    @Watch('initData')
    setupFormData (data: any) {
        this.formData = cloneDeep({ ...this.formData, ...data });

        if (data.onCallModeName === 'GROUP_TURN') {
            // 按组轮流值班时的特殊逻辑：预填值班组列表时，把全部组都预填到排序组件中
            // 面向场景：先设置了2个值班组轮值，然后又新增了第三个组，第三个组也要出现在排序组件中
            if (Array.isArray(data.groupList) && data.groupList.length > 0) {
                const initialGroupList = [];
                const map = {};
                for (const item of data.groupList) {
                    map[item.groupId] = true;
                    initialGroupList.push({ id: item.groupId, name: item.groupName });
                }
                for (const item of this.wholeGroupList) {
                    if (map[item.id]) continue;
                    initialGroupList.push({ id: item.id, name: item.name });
                }
                this.sortedGroupList = initialGroupList;
            } else {
                this.sortedGroupList = [...this.wholeGroupList];
            }
        }

        if (data.onCallModeName === 'GROUP_TIME_TURN') {
            this.enabledWorkDays = [];
            if (Array.isArray(data.weekTimeList) && data.weekTimeList.length > 0) {
                for (const weekTimeConf of data.weekTimeList) {
                    const dayDigit = convertDayEnToDigit(weekTimeConf.weekDay);
                    this.enabledWorkDays.push(parseInt(dayDigit, 10));
                    const slots = (weekTimeConf.groupTimeList || []).map(item => {
                        return [item.startAt, item.endAt, item.groupId, item.id || null];
                    });
                    this.timeSlots[dayDigit] = slots;
                }

                // 给 this.timeSlots 未选中的项填上默认值
                for (const key in defaultTimeSlots) {
                    if (!this.timeSlots[key]) {
                        this.timeSlots[key] = defaultTimeSlots[key];
                    }
                }
            } else {
                this.enabledWorkDays = [1, 2, 3, 4, 5];
                this.timeSlots = { ...defaultTimeSlots };
            }
        }
    }

    // 初始化时，如果
    @Watch('wholeGroupList')
    setupGroupList (list) {
        if (list.length === 0) return;

        // 如果 wholeGroupList 有新的 group 则添加到列表尾部
        const currentGroupIdList = this.sortedGroupList.map(item => item.id);
        const newItems = list.filter(item => currentGroupIdList.indexOf(item.id));
        this.sortedGroupList.push(...newItems);
    }

    weekDayChange (val) {
        const days = [1, 2, 3, 4, 5, 6, 7];
        days.forEach((day) => {
            if (val.includes(day) && !this.timeSlots[day]) {
                // 需要保留的值
                this.timeSlots[day] = defaultTimeSlots[day];
            }
        });
        console.log(this.timeSlots);
    }

    // 更新第 N 个 timeSlot 的值
    updateNthTimeSlot (index) {
        return (val) => {
            this.timeSlots[index] = val;
        };
    }

    resetRuleStartOptions () {
        this.$nextTick(() => {
            this.formData.onCallRule.ruleStart = '';
        });
    }

    handleSubmit () {
        const weekTimeList: Array<WeekDayOnCallRule> = [];

        if (this.formData.onCallModeName === 'GROUP_TIME_TURN') {
            for (const day of this.enabledWorkDays) {
                const item: WeekDayOnCallRule = {
                    weekDay: WEEKDAYS_EN_MAP[day],
                    groupTimeList: this.timeSlots[day].map(item => ({
                        startAt: item[0],
                        endAt: item[1],
                        groupId: item[2],
                        id: item[3]
                    }))
                };
                weekTimeList.push(item);
            }
        }

        this.$emit('submit', {
            ...this.formData,
            groupList: this.sortedGroupList.map(item => item.id),
            weekTimeList
        });
    }

    cancel () {
        this.$emit('cancel');
    }

    onDropEvent (dropResult) {
        this.sortedGroupList = applyDrag(this.sortedGroupList, dropResult);
    }
}
</script>
<style lang="postcss">
.group-oncall-editor {
    width: 720px;
    &.large {
        width: 1080px;
    }
    .oncall-order-drop {
        .mtd-form-item-content {
            border: 1px solid #D3D8E4;
        }
        .drop-tip {
            padding: 0 16px;
            span {
                float: right;
            }
        }
        .drop-filter {
            .smooth-dnd-container.vertical {
                .smooth-dnd-draggable-wrapper:first-child {
                    .online-status {
                        display: block;
                    }
                }
            }
            .smooth-dnd-ghost {
                background: rgba(247, 248, 250, 0.88);
            }
            .draggable-item {
                cursor: grab;
                &:active {
                    cursor: -webkit-grabbing;
                }

                padding: 5px 16px;
                span {
                    vertical-align: middle;
                }
                .online-status {
                    display: none;
                    float: right;
                    .online-icon {
                        vertical-align: middle;
                        display: inline-block;
                        width: 10px;
                        height: 10px;
                        border-radius: 50%;
                        background: #97D783;
                        margin-right: 8px;
                    }
                }
            }
        }
    }
    /* 覆盖 mtd 多个相关组件的默认样式 */
    .mtd-checkbox-group .mtd-checkbox {
        margin-right: 8px;
    }
    .working-time-content {
        display: inline-block;
        vertical-align: top;
    }
}
</style>
