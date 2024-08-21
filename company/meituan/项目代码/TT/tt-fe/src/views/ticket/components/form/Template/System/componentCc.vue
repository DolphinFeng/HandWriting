<template>
    <div class="change-cc-container">
        <div class="cc-container">
            <mtd-tag
                v-for="(user, index) in ccListResult"
                :key="user.username"
                theme="gray"
                type="unbordered"
                :closeable="!user.withDefault"
                @close="removeTag(index, user.withDefault)">{{ `${user.displayName}(${user.username})` }}
                <span class="quit-tag" v-if="user.isQuit">{{ $getText('component_cc_quit_tag', '离职') }}</span>
            </mtd-tag>
        </div>
        <search-user-dropdown
            @change="userChange"
            @close="dropdownVisible = false"
            placement="bottom-start"
            :visible="dropdownVisible">
            <span class="add-button" @click="dropdownVisible = true"><i class="mtdicon mtdicon-file-add-o" /> {{ $getText('component_cc_add_button', '添加') }}</span>
        </search-user-dropdown>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import SearchUserDropdown from './sysComponents/search-user-dropdown.vue';

import { submitUserArrToVuex, uniqueObject } from '@/utils/tools/index.ts';
import { State } from 'vuex-class';

import TemplateMixin from '../TemplateMixin.vue';

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
export default class ComponentCc extends TemplateMixin {
    @Prop()
    ccList: any;

    @State(state => state.tt.userDisplayInfo)
    userDisplayInfo: CommonTypes.userDisplayItem[];

    dropdownVisible: boolean = false;
    ccListResult: any = [];

    @Watch('ccList', { immediate: true })
    async onGetCClist () {
        if (this.ccList && this.ccList.length) {
            const nameList = [];
            const newCCList: any[] = uniqueObject(this.ccList.filter(elem => elem.username), 'username');
            newCCList.forEach(elem => {
                elem.username && nameList.push(elem.username);
            });
            await submitUserArrToVuex(this.userDisplayInfo, nameList);
            this.ccListResult = newCCList.map((elem: {username: string, withDefault: boolean}) => {
                const username = elem.username;
                const withDefault = elem.withDefault;
                let userObj = this.userDisplayInfo.find((user) => {
                    return user.username === username;
                });
                return {
                    username: username,
                    displayName: userObj && userObj['displayName'] || username,
                    withDefault: withDefault,
                    isQuit: userObj && userObj.jobStatus === 16
                };
            });
        } else {
            this.ccListResult = [];
        }
        this.value = this.pureCcResult;
        this.valueChange();
    }
    userChange (username, displayName) {
        if (this.ccListResult.length > 29) {
            this.$mtd.message({
                message: this.$getText('component_cc_max_cc_message', '抄送人不能多于30个'),
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
            this.value = this.pureCcResult;
            this.valueChange();
        }
    }
    removeTag (index, withDefault) {
        if (withDefault) {
            return;
        }
        this.ccListResult.splice(index, 1);
        this.value = this.pureCcResult;
        this.valueChange();
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
    .add-button {
        color: #1c6cdc;
        cursor: pointer;
        .mtdicon-file-add-o {
            font-size: 12px;
        }
    }
}
</style>
