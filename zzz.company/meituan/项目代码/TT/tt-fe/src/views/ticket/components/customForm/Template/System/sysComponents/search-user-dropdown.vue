<template>
    <div
        class="search-user-dropdown-container">
        <mtd-dropdown
            popper-class="search-user-panel-container"
            :placement="placement"
            :visible="visible"
            ref="dropdown">
            <slot />
            <mtd-dropdown-menu
                size="small"
                slot="dropdown"
                v-clickoutside="clickOutside">
                <mtd-input
                    v-model="targetUser"
                    :placeholder="placeholder || $getText('search_user_dropdown_placeholder', '请输入抄送人姓名或mis号')"
                    @input="debounceRemoteMethod"
                    @keydown.enter="enterOperate"
                    class="search-user-input" />
                <div class="search-num" v-if="targetUser"> {{ $getText('search_user_dropdown_search_result', {length: userList.length}) }}</div>
                <div class="dropdown-container">
                    <mtd-dropdown-menu-item
                        v-for="item in userList"
                        :key="item.username"
                        @click="userItemClick(item.username, item.displayName)"
                        class="dropdown-item-user">
                        <img class="avatar" :src="item.avatar || defaultAvatar"><span class="name" v-html="item.matchItem" />
                    </mtd-dropdown-menu-item>
                </div>
            </mtd-dropdown-menu>
        </mtd-dropdown>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import Clickoutside from '@/utils/tools/clickoutside.ts';
import debounce from 'lodash.debounce';
import { DEFAULT_AVATAR } from '@/config/map.conf';
import { highlightMatch } from '@/utils/tools';
import * as api from '@/api';

/**
 * 用户搜索框
 *
 * @author liyuyao
 * @date 04/22/2019
 */
@Component({
    directives: { Clickoutside }
})
export default class SearchUserDropdown extends Vue {
    @Prop({ default: '' })
    placeholder: string;

    @Prop({ default: 'bottom-end' })
    placement: string;

    @Prop({ default: false })
    visible: boolean;

    targetUser: string = '';
    userList: any = [];
    userLoading: boolean = false;
    debounceRemoteMethod: Function = debounce(this.remoteMethod, 500);
    defaultAvatar: string = DEFAULT_AVATAR;

    @Watch('visible')
    onVisibleChange (visible) {
        if (visible) this.focusInputWrapper();
    }
    focusInputWrapper () {
        this.$nextTick(() => {
            let inputDiv = document.getElementsByClassName('search-user-input')[0];
            let input = inputDiv && inputDiv.getElementsByTagName('input')[0];
            input && input.focus();
        });
    }
    async remoteMethod (query) {
        if (query.trim().length < 1) {
            this.userList = [];
            return;
        }
        this.userLoading = true;
        try {
            const res: Ajax.AxiosResponse = await api.ctiApi.searchUser({ keyword: query });
            this.userList = res.data.items.map(item => {
                let matchStr = `${item.displayName}/${item.username}`;
                return {
                    username: item.username,
                    displayName: item.displayName,
                    matchItem: highlightMatch(query, matchStr)
                };
            });
        } catch (e) {
            this.userList = [];
            console.log(e);
        }
        this.userLoading = false;
    }
    userItemClick (username, displayName) {
        // 选中后清空搜索记录
        this.userList = [];
        this.targetUser = '';
        this.$emit('change', username, displayName);
        this.$nextTick(() => {
            this.$refs.dropdown && this.$refs.dropdown.updatePopper();
        });
        this.focusInputWrapper();
    }
    // 回车操作
    enterOperate (e) {
        if (e && e.isComposing) return;
        // 仅有一个备选项时，选择该选项
        if (this.userList && this.userList.length === 1) {
            let selectUser = this.userList[0];
            this.userItemClick(selectUser.username, selectUser.displayName || selectUser.username);
        }
    }
    clickOutside () {
        this.$emit('close');
    }
}
</script>

<style lang="scss">
.search-user-panel-container {
    width: 236px;
    .mtd-dropdown-menu {
        overflow: hidden;
    }
    .search-user-input {
        width: 204px;
        margin: 8px 15px;
    }
    .mtd-dropdown-menu-item {
        padding: 0 16px;
        color: rgba(0, 0, 0, 0.87);
    }
    .dropdown-container {
        max-height: 220px;
        overflow-x: hidden;
        overflow-y: scroll;
        .dropdown-item-user {
            display: flex;
            align-items: center;
            height: 32px;
        }
        .name {
            flex: 1;
            word-break: break-all;
            line-height: 1;
        }
        .avatar {
            margin-right: 8px;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            vertical-align: sub;
        }
    }
    .search-num {
        padding: 0 16px 2px 16px;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.38);
        line-height: 18px;
    }
}

</style>