<template>
    <div class="change-cc-container">
        <div class="cc-container">
            <mtd-tag
                v-for="(user, index) in ccListResult"
                :key="user.username"
                theme="gray"
                type="unbordered"
                :closeable="!readonly"
                @close="removeTag(index, user.withDefault)">{{ `${user.displayName}(${user.username})` }}
                <span class="quit-tag" v-if="user.isQuit">离职</span>
            </mtd-tag>
        </div>
        <search-user-dropdown
            @change="userChange"
            @close="dropdownVisible = false"
            placement="bottom-start"
            :visible="dropdownVisible"
            :include-virtual="field.prop === 'defaultValue'">
            <span class="add-button" @click="!readonly && (dropdownVisible = true)"><i class="iconfont icon-add" /> 添加</span>
        </search-user-dropdown>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Watch } from 'vue-property-decorator';
import { State } from 'vuex-class';

import { submitUserArrToVuex } from '@/utils/tool.ts';
import SearchUserDropdown from './sysComponents/search-user-dropdown.vue';
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
    @Prop({ default: false })
    withDefault: boolean;

    @State(state => state.cti.userDisplayInfo)
    userDisplayInfo: CommonTypes.userDisplayItem[];

    dropdownVisible: boolean = false;
    ccListResult: any = [];

    @Watch('value', { immediate: true })
    async onGetCClist () {
        if (this.value) {
            const ccList = this.value.split(',');
            await submitUserArrToVuex(this.userDisplayInfo, ccList);
            this.ccListResult = ccList.map((username) => {
                const userObj = this.userDisplayInfo.find((user) => {
                    return user.username === username;
                });
                return {
                    username: username,
                    displayName: userObj && userObj.displayName || username,
                    withDefault: this.withDefault,
                    isQuit: userObj && userObj.jobStatus === 16
                };
            });
        } else {
            this.ccListResult = [];
        }
    }

    userChange (username, displayName) {
        if (this.ccListResult.length > 29) {
            this.$mtd.message({
                message: '抄送人不能多于30个',
                type: 'error'
            });
            return;
        }
        const existUser = this.ccListResult.find((userItem) => {
            return userItem.username === username;
        });
        if (!existUser) {
            this.ccListResult.push({
                username: username,
                displayName: displayName,
                isQuit: false
            });
            this.$emit('change', this.pureCcResult, this.field);
        }
    }
    removeTag (index, withDefault) {
        if (withDefault) {
            return;
        }
        this.ccListResult.splice(index, 1);
        this.$emit('change', this.pureCcResult, this.field);
    }
    get pureCcResult () {
        const result = this.ccListResult.map((user) => {
            return user.username;
        });
        return result.join(',');
    }
}
</script>

<style lang="postcss">
.change-cc-container {
    display: inline-block;
    .add-button {
        color: #FF8800;
        cursor: pointer;
        .icon-add {
            font-size: 12px;
        }
    }
}
</style>
