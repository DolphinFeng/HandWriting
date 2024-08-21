<template>
    <pm-select
        popper-class="pm-select-dropdown"
        option-type="more"
        type="dropdown"
        remote
        :remote-method="remoteMethod"
        v-model="value"
        class="component-reporter"
        :placeholder="$getText('component_cc_placeholder', '搜索发起人')"
        :input-placeholder="$getText('component_cc_input_placeholder', '请选择发起人')"
        @change="reporterChange">
        <pm-select-option
            v-for="item in userList"
            :show-avatar="true"
            :key="item.username"
            :value="item.username"
            :name="item.i18nDisplayName ? item.i18nDisplayName : ''"
            :label="item.i18nDisplayName ? `${item.i18nDisplayName}/${item.username}` : (item.displayName ? `${item.displayName}/${item.username}` : (item.displayname ? `${item.displayname}/${item.username}` : item.username))"
            :mis="item.username"
            :profile="item.avatar"
            :quit="item.quit" />
    </pm-select>
</template>
<script lang="ts">
import { Component, Watch } from 'vue-property-decorator';
import { State } from 'vuex-class';

import TemplateMixin from '../TemplateMixin.vue';
import * as api from '@/api';

/**
 * 修改抄送人
 *
 * @author liyuyao
 * @date 04/22/2019
 */
@Component({
    components: {}
})
export default class ComponentCc extends TemplateMixin {
    @State(state => state.tt.userInfo)
    userInfo: CommonTypes.UserInfoItem;

    userList: any = [];

    @Watch('userInfo', { immediate: true })
    getUserInfo (userInfo) {
        const { username, i18nDisplayName, displayName, displayname } = userInfo;
        console.log('userInfo', displayname);
        if (username) {
            this.userList = [{
                username: username,
                i18nDisplayName: i18nDisplayName,
                displayName: displayName,
                displayname: displayname
            }];
            this.reporterChange(userInfo.username);
        }
    }

    async remoteMethod (query) {
        if (query.trim().length < 1) {
            this.userList = [];
            return;
        }
        try {
            const res: Ajax.AxiosResponse = await api.ctiApi.searchUser({ keyword: query });
            this.userList = res.data.items;
        } catch (e) {
            this.userList = [];
            console.log(e);
        }
    }
    reporterChange (val) {
        this.value = val;
        this.valueChange();
    }
}
</script>

<style lang="scss">
.component-reporter {
    width: 280px;
}
.pm-select-dropdown {
    min-width: fit-content;
}
</style>
