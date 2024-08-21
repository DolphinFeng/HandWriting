<template>
    <div class="change-cc-container">
        <div class="cc-container">
            <mtd-tooltip
                v-for="(user, index) in ccListResult"
                :key="user.username"
                trigger="hover"
                :content="user.i18nDisplayName ? `${user.i18nDisplayName}/${user.username}` : (user.displayName ? `${user.displayName}/${user.username}` : user.username)"
                placement="top">
                <mtd-tag
                    theme="gray"
                    type="pure"
                    :closeable="!user.withDefault"
                    @close="removeTag(index, user.withDefault)">{{ `${user.i18nDisplayName || user.displayName || user.username}` }}
                    <span class="quit-tag" v-if="user.isQuit">{{ $getText('cc_modify_quit_tag', '离职') }}</span>
                </mtd-tag>
            </mtd-tooltip>
        </div>
        <search-user-dropdown
            @change="userChange"
            @close="dropdownVisible = false"
            placement="bottom-start"
            :ticket-id="ticketId"
            :visible="dropdownVisible">
            <span class="add-button" @click="dropdownVisible = true"><i class="mtdicon mtdicon-file-add" /></span>
        </search-user-dropdown>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import SearchUserDropdown from '@/components/search-user-dropdown.vue';

import { submitUserArrToVuex, uniqueObject } from '@/utils/tools';
import { State } from 'vuex-class';

/**
 * 修改抄送人
 *
 * @author liyuyao
 * @date 04/22/2019
 */
@Component({
    components: {
        SearchUserDropdown
    }
})
export default class ChangeCC extends Vue {
    @Prop()
    ccList: any;
    @Prop({ default: false })
    withDefault: boolean;
    @Prop({ default: 0 })
    ticketId: number;

    @State(state => state.tt.userDisplayInfo)
    userDisplayInfo: CommonTypes.userDisplayItem[];

    dropdownVisible: boolean = false;
    ccListResult: any = [];

    @Watch('ccList')
    async onGetCClist () {
        if (this.ccList && this.ccList.length) {
            const newCCList: any[] = Array.from(new Set(this.ccList));
            await submitUserArrToVuex(this.userDisplayInfo, newCCList);
            // debugger;
            this.ccListResult = newCCList.map((username) => {
                let userObj = this.userDisplayInfo.find((user) => {
                    return user.username === username;
                });
                return {
                    username: username,
                    displayName: userObj && userObj['displayName'],
                    i18nDisplayName: userObj && userObj['i18nDisplayName'],
                    withDefault: this.withDefault,
                    isQuit: userObj && userObj.jobStatus === 16
                };
            });
            this.$emit('getCCresult', this.ccListResult);
        } else {
            this.ccListResult = [];
        }
    }
    userChange (username, displayName) {
        if (this.ccListResult.length > 29) {
            this.$mtd.message({
                message: this.$getText('cc_modify_tip', '抄送人不能多于30个'),
                type: 'error'
            });
            return ;
        }
        let existUser = this.ccListResult.find((userItem) => {
            return userItem.username === username;
        });
        if (!existUser) {
            this.ccListResult.push({
                username: username,
                displayName: displayName,
                isQuit: false
            });
            this.$emit('change', this.pureCcResult);
        }
    }
    removeTag (index, withDefault) {
        if (withDefault) {
            return;
        }
        this.ccListResult.splice(index, 1);
        this.$emit('change', this.pureCcResult);
    }
    get pureCcResult () {
        let result = this.ccListResult.map((user) => {
            return user.username;
        });
        return result;
    }
}
</script>

<style lang="scss">
.change-cc-container {
    line-height: 22px;
    .add-button {
        display: flex;
        cursor: pointer;
        .mtdicon-file-add {
            color: rgba(0, 0, 0, 0.6);
            font-size: 16px;
            vertical-align: text-top;
        }
    }
    .cc-container,
    .search-user-dropdown-container {
        display: inline-block;
        vertical-align: middle;
    }
    .mtd-tag {
        margin-right: 4px;
    }
}
</style>
