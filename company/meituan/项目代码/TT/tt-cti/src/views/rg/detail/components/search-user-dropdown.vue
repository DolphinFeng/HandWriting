<template>
    <div class="public-search-user-dropdown-container">
        <mtd-dropdown popper-class="public-search-user-panel-container" :placement="placement">
            <slot />
            <mtd-dropdown-menu slot="dropdown">
                <mtd-input
                    v-model="targetUser"
                    :placeholder="placeholder"
                    @input="debounceRemoteMethod"
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
import { debounce } from 'lodash';
import * as api from '@/api';

/**
 * 用户搜索框
 *
 * @author liyuyao
 * @date 04/22/2019
 */
@Component({
    components: {
    }
})
export default class SearchUserDropdown extends Vue {
    @Prop({ default: '请输入抄送人姓名或mis号' })
    placeholder: '';

    @Prop({ default: 'bottom-end' })
    placement: '';

    targetUser: string = '';
    userList: any = [];
    userLoading: boolean = false;
    debounceRemoteMethod: Function = debounce(this.remoteMethod, 200);

    async remoteMethod (query) {
        if (query.trim().length < 1) {
            this.userList = [];
            return;
        }
        this.userLoading = true;
        try {
            const res = await api.rgApi.searchUser({ keyword: query });
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
    }
}
</script>

<style lang="postcss">
.public-search-user-panel-container {
    width: 260px;
    .search-user-input {
        width: 226px;
        margin: 10px 16px;
    }
    .dropdown-container {
        max-height: 150px;
        overflow: auto;
        .mtd-dropdown-menu-item {
            height: 34px;
            padding: 0 16px;
        }
    }
}

</style>
