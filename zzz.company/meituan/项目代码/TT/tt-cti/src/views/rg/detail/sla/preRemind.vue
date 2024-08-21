<template>
    <li class="pre-remind-item">
        <mtd-form
            :model="preSettingItem"
            class="pre-setting-form"
            :rules="preSettingFormRules"
            ref="preSettingForm"
            inline>
            当等级为
            <mtd-select
                style="width: 120px;"
                v-model="preSettingItem.slaLevel"
                @input="valueChange">
                <mtd-option
                    v-for="item in slaLevels"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value" />
            </mtd-select>
            的工单发起后
            <div style="display: inline-block; width: 150px; vertical-align: middle;">
                <mtd-form-item prop="timeValue" label="">
                    <mtd-input
                        class="mtd-input-time"
                        type="number"
                        v-model="preSettingItem.timeValue"
                        @input="valueChange">
                        <template slot="append">
                            <mtd-select
                                v-model="preSettingItem.timeUnit"
                                @input="valueChange"
                                style="width: 70px; height: 30px;">
                                <mtd-option
                                    v-for="item in timeUnits"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value" />
                            </mtd-select>
                        </template>
                    </mtd-input>
                </mtd-form-item>
            </div>
            仍未
            <mtd-select
                v-model="preSettingItem.slaType"
                @input="valueChange"
                style="width: 120px;">
                <mtd-option
                    v-for="item in slaTypes"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value" />
            </mtd-select>
            ，则提醒
            <mtd-form-item prop="receiver" label="">
                <mtd-select
                    style="width: 350px;"
                    multiple
                    show-checkbox
                    filterable
                    remote
                    :loading="searchLoading"
                    :remote-method="searchMisId"
                    v-model="preSettingItem.receiver"
                    value-key="value"
                    @input="onUserChanged"
                    popper-class="sla-raise-notice-recivers-popper">
                    <mtd-option-group
                        v-for="group in groupedReceiverOptions"
                        :key="group.label"
                        :label="group.label">
                        <mtd-option
                            v-for="item in group.options"
                            :key="item.value"
                            :label="item.label"
                            :value="item" />
                    </mtd-option-group>
                </mtd-select></mtd-form-item>，并且<mtd-select
                style="width: 70px; margin: 0 4px;"
                v-model="preSettingItem.receiversJoinDxGroup"
                @change="valueChange">
                <mtd-option
                    v-for="item in joinGroupSettingOptions"
                    :key="item.value"
                    :value="item.value"
                    :label="item.label" />
            </mtd-select>自动入群
            <mtd-icon-button icon="mtdicon mtdicon-delete-o" @click="deletePreMindItem" />

        </mtd-form>
    </li>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { SlaList, TimeUnits, OpenAndCloseOptions } from '@/config/map.conf';
import { cloneDeep } from 'lodash';
import * as api from '@/api';
import { Form, FormRules } from '@ss/mtd-vue';

const FixedReceiverOptions: Array<CommonTypes.NoticeReceiverOption> = ([
    { role: 'LEVEL_ONE_LEADER', label: '一级主管', misId: null, value: 'LEVEL_ONE_LEADER' },
    { role: 'LEVEL_TWO_LEADER', label: '二级主管', misId: null, value: 'LEVEL_TWO_LEADER' },
    { role: 'ASSIGNED', label: '处理人', misId: null, value: 'ASSIGNED' },
    { role: 'CC', label: '抄送人', misId: null, value: 'CC' }
]);

const defaultSettingItem: CommonTypes.mapObject = {
    remindReceivers: {
        type: ['ASSIGNED'],
        username: []
    },
    slaLevel: 'S4',
    slaType: 'RESPONSE',
    timeUnit: 'MINUTE',
    timeValue: 10,
    receiversJoinDxGroup: false
};

@Component
export default class PreRemind extends Vue {
    @Prop({
        default: () => {
            return defaultSettingItem;
        }
    })
    setting: CommonTypes.mapObject;

    preSettingItem: CommonTypes.mapObject = defaultSettingItem;

    slaLevels: CommonTypes.mapObject[] = SlaList;
    timeUnits: CommonTypes.mapObject[] = TimeUnits;
    slaTypes: CommonTypes.mapObject[] = [{
        value: 'RESPONSE',
        label: '响应'
    }, {
        value: 'RESOLVE',
        label: '解决'
    }];
    searchLoading: boolean = false;
    fixedReceiverOptions: CommonTypes.mapObject[] = FixedReceiverOptions;
    receiverOptions: CommonTypes.mapObject[] = [];
    joinGroupSettingOptions = OpenAndCloseOptions;
    preSettingFormRules: FormRules = {
        timeValue: [
            { required: true, message: '时间不能为空' }
        ],
        receiver: [
            { required: true, message: '请选择至少一个通知人' }
        ]
    };

    @Watch('setting', { immediate: true })
    async getPropSetting () {
        const setItem = cloneDeep(this.setting);
        const userList = await this.searchDisplayNameList(setItem.remindReceivers?.username || []);
        this.receiverOptions = this.fixedReceiverOptions.concat(userList);
        setItem.receiver = (setItem.remindReceivers?.type || []).map(user => {
            const item = this.fixedReceiverOptions.find(e => e.role === user);
            return {
                label: item.label,
                value: item.role,
                role: item.role
            };
        }).concat(userList);
        this.preSettingItem = setItem;
    }
    valueChange () {
        this.$emit('change', this.preSettingItem);
    }
    async searchDisplayNameList (userArr) {
        const defaultUserList = userArr.map(user => {
            return {
                label: `${user}/${user}`,
                value: user,
                role: 'MIS'
            };
        });
        try {
            const res = await api.ctiApi.searchDisplayNameList(userArr);
            const { code, data } = res;
            if (code === 200) {
                return userArr.map((user) => {
                    return {
                        label: `${data[user].displayName || user}/${user}`,
                        value: user,
                        role: 'MIS'
                    };
                });
            } else {
                return defaultUserList;
            }
        } catch (error) {
            return defaultUserList;
        }
    }
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
        if (userList.length > 0) {
            this.concatUniqueList(userList.map(user => {
                return {
                    label: `${user.displayName}/${user.username}`,
                    value: user.username,
                    role: 'MIS'
                };
            }));
        }
        this.searchLoading = false;
    }
    onUserChanged (userList) {
        const setting = {
            type: [],
            username: []
        };
        userList.forEach(user => {
            if (user.role === 'MIS') {
                setting.username.push(user.value);
            } else {
                setting.type.push(user.value);
            }
        });
        this.preSettingItem.remindReceivers = setting;
        this.valueChange();
    }
    concatUniqueList (opt) {
        this.receiverOptions = Object.values([...opt, ...this.receiverOptions].reduce((acc, cur) => {
            if (cur.value && !acc[cur.value]) {
                acc[cur.value] = cur;
            }
            return acc;
        }, {}));
    }
    validate (): Promise<boolean> {
        const preSettingForm = this.$refs.preSettingForm as Form;
        return new Promise((resolve) => {
            preSettingForm.validate(async (valid: boolean) => {
                return resolve(valid);
            }).catch(e => {
                console.log(e);
                return resolve(false);
            });
        });
    }
    get rgId () {
        return parseInt(this.$route.query.rgId as string, 10);
    }
    get groupedReceiverOptions () {
        return [
            {
                label: '请选择或输入mis号搜索',
                options: this.receiverOptions
            }
        ];
    }
    deletePreMindItem () {
        this.$emit('delete');
    }
}
</script>
<style lang="postcss" scoped>
.pre-setting-form {
    .mtd-form-item {
        margin: 0;
    }
}
.pre-remind-item {
    margin-top: 12px;
    .mtd-select,
    .mtd-input-wrapper,
    .mtd-icon-btn {
        vertical-align: middle;
    }
    .mtd-icon-btn {
        margin-left: 12px;
    }
    .mtd-input-time {
        /deep/ .mtd-input {
            &::-webkit-outer-spin-button,
            &::-webkit-inner-spin-button {
                -webkit-appearance: none;
            }

            -moz-appearance: textfield;
        }
    }
}
</style>
