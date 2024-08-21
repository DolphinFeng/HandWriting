<template>
    <div class="change-reporter-container">
        <span>{{ `${reporterDisplay.displayname}（${reporterDisplay.username}）` }}</span>
        <search-user-dropdown
            :visible="dropdownVisible"
            @change="userChange"
            @close="dropdownVisible = false"
            :placeholder="$getText('component_reporter_search_placeholder', '请输入发起人姓名或mis号')"
            v-if="inside">
            <i @click="dropdownVisible = true" class="mtdicon mtdicon-edit-o" />
        </search-user-dropdown>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Getter, State } from 'vuex-class';
import SearchUserDropdown from './sysComponents/search-user-dropdown.vue';
import TemplateMixin from '../TemplateMixin.vue';
import * as api from '@/api';
import store from '@/store';
interface UserDisplayItem {
    displayname: string;
    username: string;
}
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
    @Getter inside;

    @State(state => state.tt.userInfo)
    userDisplayInfo: CommonTypes.UserInfoItem;

    dropdownVisible: boolean = false;
    reporterDisplay: UserDisplayItem = {
        displayname: '',
        username: ''
    };

    @Watch('userDisplayInfo')
    onUserDisplayInfoChange (val: string) {
        this.reporterDisplay.displayname = val.displayname;
        this.reporterDisplay.username = val.username;
        this.value = this.reporterDisplay.username;
        this.valueChange();
    }
    // 获取当前登录用户信息，存入store
    async getUserInfo () {
        try {
            const res: Ajax.AxiosResponse = await api.ctiApi.getUserInfo();
            let userInfo = res.data;
            store.commit('GET_USER_INFO', userInfo);
        } catch (e) {
            console.log(e);
        }
    }
    userChange (username, displayname) {
        this.reporterDisplay.displayname = displayname;
        this.reporterDisplay.username = username;
        this.dropdownVisible = false;
        this.value = username;
        this.valueChange();
    }
    async mounted () {
        await this.getUserInfo();
    }
}
</script>

<style lang="scss">
.change-reporter-container {
    .search-user-dropdown-container {
        display: inline-block;
    }
    .mtdicon-edit-o {
        font-size: 16px;
        cursor: pointer;
    }
}
</style>