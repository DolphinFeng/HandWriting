<template>
    <mtd-select
        class="satisfy-receiver-select"
        multiple
        show-checkbox
        filterable
        @change="onUserChanged"
        remote
        popper-class="sla-raise-notice-recivers-popper"
        :remote-method="searchMisId"
        placeholder="请选择或输入mis号搜索"
        :loading="searchLoading"
        v-model="selectedValue"
        value-key="value"
        style="width: 400px;">
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
    </mtd-select>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import * as api from '@/api';

const FixedReceiverOptions: Array<CommonTypes.NoticeReceiverOption> = ([
    { role: 'LEVEL_ONE_LEADER', label: '一级主管', misId: null, value: 'LEVEL_ONE_LEADER' },
    { role: 'LEVEL_TWO_LEADER', label: '二级主管', misId: null, value: 'LEVEL_TWO_LEADER' },
    { role: 'ASSIGNED', label: '处理人', misId: null, value: 'ASSIGNED' },
    { role: 'CC', label: '抄送人', misId: null, value: 'CC' }
]);

@Component({
    components: {}
})
export default class SatisfyNoticeReceiver extends Vue {
    @Prop() users: any;
    @Prop({ default: FixedReceiverOptions }) fixedReceiverOptions: CommonTypes.mapObject[];
    options: CommonTypes.mapObject[] = [];
    selectedValue: CommonTypes.mapObject[] = [];
    specialUserList: CommonTypes.mapObject[] = [];
    searchLoading = false;
    @Watch('users', { immediate: true, deep: true })
    async onUsersChanged () {
        if (this.users) {
            const userList = await this.searchDisplayNameList(this.users.username || []);
            this.specialUserList = this.users.type || [];
            this.options = this.fixedReceiverOptions.concat(userList);
            this.selectedValue = (this.users.type?.map(user => {
                return {
                    label: user,
                    value: user,
                    role: 'NO_MIS'
                };
            }) || []).concat(userList);
        }
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
        const checkedUsers = this.selectedValue.filter(item => item.role === 'MIS');

        if (userList.length > 0) {
            const checkedUsernames = checkedUsers.map(item => item.value);
            const freshUserList = userList.filter(user => !checkedUsernames.includes(user.username));
            const newReceiverOptions = freshUserList.map(item => ({
                value: item.username,
                label: `${item.displayName}(${item.username})`,
                role: 'MIS'
            }));

            this.options = [...this.fixedReceiverOptions, ...checkedUsers, ...newReceiverOptions];
        } else {
            this.options = [...this.fixedReceiverOptions, ...checkedUsers];
        }
        this.searchLoading = false;
    }
    onUserChanged (userList) {
        const recipientData = {
            type: [],
            username: []
        };
        userList.forEach(user => {
            if (user.role === 'MIS') {
                recipientData.username.push(user.value);
            } else {
                recipientData.type.push(user.value);
            }
        });
        this.$emit('change', recipientData);
    }
    get rgId () {
        return parseInt(this.$route.query.rgId as string, 10);
    }
    get groupedReceiverOptions () {
        return [
            {
                label: '请选择或输入mis号搜索',
                options: this.options
            }
        ];
    }
}
</script>
<style lang="scss" scoped>
.oncall-reminder-wrapper {
    .title {
        font-size: 16px;
        font-weight: 600;
        line-height: 32px;
        margin-top: 12px;
    }
}
</style>
