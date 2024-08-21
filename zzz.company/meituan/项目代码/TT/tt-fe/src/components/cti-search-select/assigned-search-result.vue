<template>
    <div class="assigned-result-container">
        <div class="empty-tip" v-if="!searchUserList.length">{{ $getText('assigned_search_result_empty_tip', '暂无处理人结果') }}</div>
        <user-cti-item
            v-for="user in searchUserList"
            :key="user.username"
            :user="user"
            @change="emitChange" />
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import UserCtiItem from './user-cti-item';
import debounce from 'lodash.debounce';
import * as api from '@/api';


/**
 * 新版问题描述
 *
 * @author liyuyao
 * @date 06/24/2021
 */
@Component({
    components: {
        UserCtiItem
    }
})
export default class AssignedSearchResult extends Vue {
    @Getter inside;
    @Getter loginType;

    @Prop({ default: '' })
    query: string;

    visible: boolean = true;
    searchType: string = 'cti';
    searchUserList: CommonTypes.userDisplayItem[] = [];
    debounceSearchUser: Function = debounce(this.searchUser, 500);

    @Watch('query', { immediate: true })
    getQueryChange (query: string) {
        this.debounceSearchUser(query);
    }

    async searchUser (query) {
        if (!query) return ;
        try {
            const res: Ajax.AxiosResponse = await api.ctiApi.searchUser({
                keyword: query,
                includeVirtual: true,
                includeExternal: true
            });
            this.searchUserList = res.data.items;
        } catch (e) {
            this.searchUserList = [];
            console.log(e);
        }
    }

    emitChange (cti, user) {
        const ctiRes = Object.assign(cti, {
            assigned: user.username,
            displayName: user.displayName,
            i18nDisplayName: user.i18nDisplayName
        });
        this.$emit('change', ctiRes);
    }
}
</script>

<style lang="scss" scoped>
.assigned-result-container {
    max-height: 320px;
    overflow: auto;
}
.empty-tip {
    text-align: center;
    margin-top: 8px;
}
</style>
