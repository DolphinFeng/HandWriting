<template>
    <!-- 每条设置就是一个条目(entry) 对应设置页上的一行 -->
    <div class="sla-raise-notice-entry">
        <mtd-form
            :model="entryFormData"
            :rules="entryFormRules"
            ref="entryForm"
            inline>
            <mtd-form-item prop="slaLevel" label="">
                <mtd-select v-model="entryFormData.slaLevel" @change="handleSlaLevelChange">
                    <mtd-option
                        v-for="item in slaLevelOptions"
                        :key="item.value"
                        :value="item.value"
                        :label="item.label" />
                </mtd-select>
            </mtd-form-item>
            <span class="inline-text-fragment">的工单第</span>
            <mtd-form-item prop="expiredTimes" label="">
                <mtd-select v-model="entryFormData.expiredTimes" @change="commitFormDataChange">
                    <mtd-option
                        v-for="item in expiredTimesOptions"
                        :key="item.value"
                        :value="item.value"
                        :label="item.label" />
                </mtd-select>
            </mtd-form-item>
            <span class="inline-text-fragment">次{{ label }}超时，通知</span>
            <mtd-form-item prop="receivers" label="">
                <mtd-select
                    :key="refreshToken"
                    multiple
                    show-checkbox
                    filterable
                    remote
                    :loading="searchLoading"
                    :remote-method="searchMisId"
                    v-model="entryFormData.receivers"
                    value-key="computedValue"
                    @change="commitFormDataChange"
                    popper-class="sla-raise-notice-recivers-popper"
                    style="width: 370px;">
                    <mtd-option-group
                        v-for="group in groupedReceiverOptions"
                        :key="group.label"
                        :label="group.label">
                        <mtd-option
                            v-for="item in group.options"
                            :key="item.computedValue"
                            :label="item.label"
                            :value="item" />
                    </mtd-option-group>
                </mtd-select>
                <span class="inline-text-fragment">，并且</span>
                <mtd-select
                    style="width: 70px; margin-right: 6px;"
                    v-model="entryFormData.receiversJoinDxGroup"
                    @change="commitFormDataChange">
                    <mtd-option
                        v-for="item in joinGroupSettingOptions"
                        :key="item.value"
                        :value="item.value"
                        :label="item.label" />
                </mtd-select><span class="inline-text-fragment">自动入群</span>

            </mtd-form-item>
            <mtd-form-item>
                <mtd-icon-button icon="mtdicon mtdicon-delete-o" @click="deleteEntry(index)" />
            </mtd-form-item>
        </mtd-form>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Model, Prop, Watch } from 'vue-property-decorator';
import { Form, FormRules } from '@ss/mtd-vue';
import { Sla2CN, OpenAndCloseOptions } from '@/config/map.conf';
import * as api from '@/api';
import { getUserInfoMapByMisIds } from '@/services/user';

type SlaLevel = string;
type ExpiredTimes = number;

interface Opt<T = string> { label: string; value: T }

type ReceiverRoleType = CommonTypes.ReceiverRole | 'EXPLICIT_USER';

const SlaLevelOptions: Array<Opt<SlaLevel>> = Object.entries(Sla2CN).map((tuple) => {
    const [k, v] = tuple;
    return {
        label: `${v}(${k})`,
        value: k
    };
});

const ExpiredTimesOptions: Array<Opt<ExpiredTimes>> = [
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' }
];

// 收到通知的用户配置 数据结构为 {}
interface NoticeReceiverOption {
    computedValue: string;
    label: string;
    role: ReceiverRoleType;
    misId: string | null;
}

const FixedReceiverOptions: Array<NoticeReceiverOption> = ([
    { role: 'LEVEL_ONE_LEADER', label: '一级主管', misId: null },
    { role: 'LEVEL_TWO_LEADER', label: '二级主管', misId: null },
    { role: 'RG_ADMIN', label: 'RG组管理员', misId: null }
]).map(item => {
    return {
        ...item,
        role: item.role as ReceiverRoleType,
        computedValue: item.role + ':' + item.misId
    };
});

export type SettingEntryProp = Pick<CommonTypes.SlaRaiseNotice, 'slaLevel' | 'expiredTimes' | 'receiversJoinDxGroup'> & {
    receivers: Array<{ role: ReceiverRoleType; misId?: string}>;
    id: number;
    receiversJoinDxGroup: boolean;
};

interface EntryFormData {
    id: number;
    slaLevel: SlaLevel;
    expiredTimes: ExpiredTimes;
    receivers: Array<NoticeReceiverOption>;
    receiversJoinDxGroup: boolean;

}

const getDerivedDataFromValueProp = (initValue: SettingEntryProp): EntryFormData => {
    const { slaLevel = null, expiredTimes = null, id = null, receivers = [], receiversJoinDxGroup = false } = initValue;
    return {
        id,
        slaLevel,
        expiredTimes,
        // 此处应当查询到选项
        receivers: receivers.map(person => ({
            role: person.role,
            misId: person.misId,
            computedValue: person.role + ':' + (person.misId || null),
            label: person.misId
        })),
        receiversJoinDxGroup
    };
};

@Component({})
export default class SlaNoticeEntry extends Vue {
    @Model('change')
    value: EntryFormData;

    @Prop()
    index: number;

    @Prop()
    label: string;

    refreshToken: number = 0;
    joinGroupSettingOptions = OpenAndCloseOptions;

    @Watch('value', { immediate: true, deep: true })
    onDataChanged () {
        if (this.value) {
            if (this.value?.receivers?.length !== this.entryFormData?.receivers?.length) {
                this.entryFormData = getDerivedDataFromValueProp(this.value);
                const receiversOptionsToAppend = this.entryFormData.receivers.filter(item => item.role === 'EXPLICIT_USER');
                this.receiverOptions.push(...receiversOptionsToAppend);
                // HACK: 异步请求 api 查询到用户中文姓名并填充到选项中
                this.padUserDisplayNames(receiversOptionsToAppend.map(item => item.misId));
            } else {
                this.entryFormData = getDerivedDataFromValueProp(this.value);
            }
        }
    }

    async padUserDisplayNames (misIds: string[]) {
        const userInfoMap = await getUserInfoMapByMisIds(misIds);
        Object.keys(userInfoMap).forEach(misId => {
            const userInfo = userInfoMap[misId];
            const label = `${userInfo.displayName}(${misId})`;
            const i = this.receiverOptions.findIndex(item => item.misId === misId);
            const newUserOption = {
                ...this.receiverOptions[i],
                label
            };
            this.receiverOptions.splice(i, 1, newUserOption);
            const j = this.entryFormData.receivers.findIndex(item => item.misId === misId);
            const newReceiverVal = {
                ...this.entryFormData.receivers[j],
                label
            };
            this.entryFormData.receivers.splice(j, 1, newReceiverVal);
        });
        // HACK: 否则只有 option 选项刷新，mtd-select 的输入框那里还不变
        this.refreshToken++;
    }

    get groupedReceiverOptions () {
        return [
            {
                label: '请选择或输入mis号搜索',
                options: this.receiverOptions
            }
        ];
    }

    entryFormData: EntryFormData = {
        id: null,
        slaLevel: null,
        expiredTimes: null,
        receivers: [],
        receiversJoinDxGroup: false

    };

    entryFormRules: FormRules = {
        slaLevel: [
            { required: true, message: '请选择SLA等级' }
        ],
        expiredTimes: [
            { required: true, message: '请选择次数' }
        ],
        receivers: [
            { required: true, message: '请选择至少一个通知人' }
        ]
    };

    searchLoading = false;

    async searchMisId (query: string) {
        if (!query) {
            return;
        }
        this.searchLoading = true;
        let userList: Array<CommonTypes.userDisplayItem> = [];
        try {
            const res = await api.rgApi.searchUser({ keyword: query, includeExternal: false });
            if (res.code === 200 && Array.isArray(res.data.items)) {
                userList = res.data.items;
            }
        } catch (e) {
            console.log(e);
        }

        const checkedUsers = this.entryFormData.receivers.filter(item => item.role === 'EXPLICIT_USER');

        if (userList.length > 0) {
            const checkedUsernames = checkedUsers.map(item => item.misId);
            const freshUserList = userList.filter(user => !checkedUsernames.includes(user.username));
            const newReceiverOptions: Array<NoticeReceiverOption> = freshUserList.map(item => ({
                misId: item.username,
                label: `${item.displayName}(${item.username})`,
                role: 'EXPLICIT_USER',
                computedValue: `EXPLICIT_USER:${item.username}`
            }));

            this.receiverOptions = [...FixedReceiverOptions, ...checkedUsers, ...newReceiverOptions];
        } else {
            this.receiverOptions = [...FixedReceiverOptions, ...checkedUsers];
        }

        this.searchLoading = false;
    }

    validate (): Promise<boolean> {
        const entryForm = this.$refs.entryForm as Form;
        return new Promise((resolve) => {
            entryForm.validate(async (valid: boolean) => {
                return resolve(valid);
            }).catch(e => {
                console.log(e);
                return resolve(false);
            });
        });
    }

    deleteEntry (index: number) {
        this.$emit('delete', index);
    }

    handleSlaLevelChange (val: string) {
        if (val === 'S4' || val === 'S5') {
            if (this.entryFormData.expiredTimes !== 1) {
                this.entryFormData.expiredTimes = null;
            }
        }
        this.commitFormDataChange();
    }

    commitFormDataChange () {
        this.$nextTick(() => {
            this.$emit('change', { ...this.entryFormData });
        });
    }

    slaLevelOptions = SlaLevelOptions;
    get expiredTimesOptions () {
        if (['S4', 'S5'].includes(this.entryFormData.slaLevel)) {
            return ExpiredTimesOptions.slice(0, 1);
        }
        return ExpiredTimesOptions;
    }
    receiverOptions = [...FixedReceiverOptions];
}
</script>
<style lang="postcss">
.sla-raise-notice-entry {
    .inline-text-fragment {
        display: inline;
        vertical-align: -5px;
        margin-right: 8px;
    }
}
.sla-raise-notice-recivers-popper {
    .mtd-select-group-title {
        color: rgba(0, 0, 0, 0.36);
    }
}
</style>
