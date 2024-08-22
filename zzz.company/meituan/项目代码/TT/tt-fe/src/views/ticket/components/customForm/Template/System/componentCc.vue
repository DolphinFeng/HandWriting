<template>
    <pm-select
        popper-class="pm-select-dropdown"
        multiple
        option-type="more"
        type="dropdown"
        remote
        :remote-method="remoteMethod"
        v-model="value"
        class="component-cc"
        :no-data-text="$getText('ticket_data_filter_no_data', '暂无数据')"
        :no-match-text="$getText('category_select_tip_no_result', '暂无搜索结果')"
        :placeholder="$getText('component_cc_search_cc_placeholder', '搜索抄送人')"
        :input-placeholder="$getText('component_cc_select_cc_placeholder', '请选择抄送人')"
        @change="ccChange">
        <pm-select-option
            v-for="item in userList"
            :show-avatar="true"
            :key="item.username"
            :value="item.username"
            :name="item.i18nDisplayName ? item.i18nDisplayName : item.displayName"
            :label="item.i18nDisplayName ? `${item.i18nDisplayName}/${item.username}` : (item.displayName ? `${item.displayName}/${item.username}` : item.username)"
            :mis="item.username"
            :profile="item.avatar"
            :quit="item.quit">
            <template slot="empty">
                <div slot="empty">
                    {{ $getText('ticket_table_empty_text', '暂无数据') }}
                </div>
            </template>
        </pm-select-option>
    </pm-select>

</template>
<script lang="ts">
import { Component, Prop, Watch } from 'vue-property-decorator';
import { State } from 'vuex-class';

// import { highlightMatch } from '@/utils/tools';

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
    @Prop()
    ccList: any;

    @State(state => state.tt.userDisplayInfo)
    userDisplayInfo: CommonTypes.userDisplayItem[];

    dropdownVisible: boolean = false;
    ccListResult: any = [];

    userList: any = [];

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
    ccChange (val) {
        this.value = val;
        this.valueChange();
    }
}
</script>

<style lang="scss">
.component-cc {
    width: 280px;
}
.pm-select-dropdown {
    min-width: fit-content;
}
</style>
