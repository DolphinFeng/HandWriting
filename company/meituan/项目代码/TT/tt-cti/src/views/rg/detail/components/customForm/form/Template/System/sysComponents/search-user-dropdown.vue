<template>
    <div
        class="search-user-dropdown-container">
        <mtd-dropdown
            popper-class="search-user-panel-container"
            :placement="placement"
            :visible="visible"
            ref="dropdown">
            <slot />
            <mtd-dropdown-menu slot="dropdown" v-clickoutside="clickOutside">
                <mtd-input
                    v-model="targetUser"
                    :placeholder="placeholder"
                    @input="debounceRemoteMethod"
                    @keyup.enter="enterOperate"
                    class="search-user-input" />
                <div class="dropdown-container">
                    <mtd-dropdown-menu-item
                        v-for="item in userList"
                        :key="item.username"
                        @click="userItemClick(item.username, item.displayName)">
                        {{ `${item.displayName}(${item.username})` }}
                    </mtd-dropdown-menu-item>
                </div>
            </mtd-dropdown-menu>
        </mtd-dropdown>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { Dropdown } from '@ss/mtd-vue';
import Clickoutside from '@/utils/clickoutside';
import { debounce } from 'lodash';
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
    @Prop({ default: '请输入抄送人姓名或mis号' })
    placeholder: string;

    @Prop({ default: 'bottom-end' })
    placement: string;

    @Prop({ default: false })
    visible: boolean;

    @Prop({ default: false })
    includeVirtual: boolean;

    targetUser: string = '';
    userList: any = [];
    userLoading: boolean = false;
    debounceRemoteMethod: Function = debounce(this.remoteMethod, 200);

    // TODO: MTD Vue 的 Dropdown 类型缺少 updatePopper 定义
    $refs: { dropdown: Dropdown & any };

    async remoteMethod (query) {
        if (query.trim().length < 1) {
            this.userList = [];
            return;
        }
        this.userLoading = true;
        try {
            const res = await api.rgApi.searchUser({
                keyword: query,
                includeVirtual: this.includeVirtual
            });
            this.userList = res.data.items;
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
            this.$refs.dropdown.updatePopper();
        });
    }
    // 回车操作
    enterOperate () {
        // 仅有一个备选项时，选择该选项
        if (this.userList && this.userList.length === 1) {
            const selectUser = this.userList[0];
            this.userItemClick(selectUser.username, selectUser.displayName || selectUser.username);
        }
    }
    clickOutside () {
        this.$emit('close');
    }
}
</script>

<style lang="postcss">
.search-user-panel-container {
    width: 260px;
    .mtd-dropdown-menu {
        overflow: hidden;
    }
    .search-user-input {
        width: 220px;
        margin: 10px 20px;
    }
    .mtd-dropdown-menu-item {
        padding: 7px 21px;
    }
    .dropdown-container {
        max-height: 150px;
        overflow-x: hidden;
        overflow-y: scroll;
    }
}

</style>
