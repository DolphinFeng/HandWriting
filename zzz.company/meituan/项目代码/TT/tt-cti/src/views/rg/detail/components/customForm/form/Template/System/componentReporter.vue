<template>
    <div class="change-reporter-container">
        <span>{{ `${userDisplayInfo.displayname}（${userDisplayInfo.username}）` || reporter }}</span>
        <search-user-dropdown
            :visible="dropdownVisible"
            @change="userChange"
            @close="dropdownVisible = false"
            placeholder="请输入发起人姓名或mis号">
            <i
                v-if="!readonly"
                @click="dropdownVisible = true"
                class="iconfont icon-edit1" />
        </search-user-dropdown>
    </div>
</template>
<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import SearchUserDropdown from './sysComponents/search-user-dropdown.vue';
import TemplateMixin from '../TemplateMixin.vue';

/**
 * 用户搜索框
 *
 * @author liyuyao
 * @date 04/22/2019
 */
@Component({
    components: {
        SearchUserDropdown
    }
})
export default class ComponentReporter extends TemplateMixin {
    @Prop({ default: '' })
    reporter: string;

    @State(state => state.cti.userInfo)
    userDisplayInfo: CommonTypes.userDisplayItem;

    dropdownVisible: boolean = false;

    userChange (username) {
        this.dropdownVisible = false;
        this.$emit('change', username);
    }
}
</script>

<style lang="postcss">
.change-reporter-container {
    .search-user-dropdown-container {
        display: inline-block;
    }
    .icon-edit1 {
        cursor: pointer;
    }
}
</style>
