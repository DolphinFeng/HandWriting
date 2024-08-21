<template>
    <mtd-select
        class="reminder-receiver-select"
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
import ReminderTime from '../components/reminderTime.vue';
import * as api from '@/api';
@Component({
    components: {
        ReminderTime
    }
})
export default class ReminderReceiver extends Vue {
    @Prop() users: any;

    options: CommonTypes.mapObject[] = [];
    selectedValue: CommonTypes.mapObject[] = [];
    specialUserList: CommonTypes.mapObject[] = [];
    searchLoading = false;

    @Watch('users', { immediate: true, deep: true })
    async onUsersChanged () {
        if (this.users) {
            const userList = await this.searchDisplayNameList(this.users.misIdList || []);
            if (!this.specialUserList.length) {
                await this.getDefaultOptions();
            }
            this.options = this.specialUserList.concat(userList);

            this.selectedValue = (this.users.roleList?.map(user => {
                return {
                    label: user.roleName,
                    value: user.roleId,
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
            this.options = [...this.specialUserList, ...checkedUsers, ...newReceiverOptions];
        } else {
            this.options = [...this.specialUserList, ...checkedUsers];
        }

        this.searchLoading = false;
    }
    onUserChanged (userList) {
        const recipientData = {
            roleList: [],
            misIdList: []
        };
        userList.forEach(user => {
            if (user.role === 'MIS') {
                recipientData.misIdList.push(user.value);
            } else {
                recipientData.roleList.push({
                    roleId: user.value
                });
            }
        });
        this.$emit('change', recipientData);
    }
    async getDefaultOptions () {
        const res = await api.oncallApi.getReminderConfigRecipient(this.rgId);
        const { data, code } = res;
        if (code === 200 && data) {
            this.specialUserList = (data.items || []).map((user => {
                return {
                    label: user.name,
                    value: user.id,
                    role: 'NO_MIS'
                };
            }));
            this.concatUniqueList(this.specialUserList);
        }
    }
    concatUniqueList (opt) {
        this.options = Object.values([...opt, ...this.options].reduce((acc, cur) => {
            if (cur.value && !acc[cur.value]) {
                acc[cur.value] = cur;
            }
            return acc;
        }, {}));
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
