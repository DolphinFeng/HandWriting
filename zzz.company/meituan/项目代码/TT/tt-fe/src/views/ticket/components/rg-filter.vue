<template>
    <div class="rg-filter">
        <span class="rg-filter-item">
            <span class="rg-filter-label">{{ $getText('rg_filter_rg_select', 'RG选择') }}</span>
            <mtd-select
                no-data-text="{{ $getText('rg_filter_no_rg', '暂无rg') }}"
                v-model="currentRgId"
                @change="lxSubmit('rg_select_rg')">
                <mtd-option
                    v-for="(item, index) in rgList"
                    :key="index"
                    :label="item.name"
                    :value="item.id" />
            </mtd-select>
        </span>

        <span
            v-if="currentRgId"
            class="filter-item"
            v-show="showNameFilter">
            <span class="rg-filter-label">{{ $getText('rg_filter_member_select', '成员选择') }}</span>
            <mtd-select
                v-if="currentRgId"
                v-model="currentUser"
                clearable
                filterable
                remote
                :remote-method="searchRgUsers"
                :debounce="500"
                :no-data-text="$getText('rg_filter_all_members', '全部成员')"
                :placeholder="$getText('rg_filter_all_members', '全部成员')"
                @change="lxSubmit('rg_select_user')"
                key="member">
                <mtd-option
                    v-for="item in rgUsers"
                    :key="`${item.identify}-${item.id}`"
                    :label="`${item.displayName}(${item.identify})`"
                    :value="item.identify" />
            </mtd-select>
        </span>

    </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import { CHART_LX_MAP } from '@/config/lx_map.conf';
import { State } from 'vuex-class';
import * as api from '@/api';
/**
 * rg筛选器
 *
 * @author xiaokunyu
 * @date 02/26/2019
 */
@Component({ name: 'rg-filter' })
export default class RgFilter extends Vue {
    @State(state => state.tt.userInfo)
    userInfo: CommonTypes.UserInfoItem;

    @Prop({ default: true })
    showNameFilter: boolean;

    @Prop({ default: 0 })
    rgId: number;

    @Prop({ default: () => {
        return [];
    }})
    rgArr: number[];

    @Prop({ default: 0 })
    rgName: number;

    @Prop({ default: '' })
    misId: string;

    rgList: CommonTypes.RgItem[] = [];
    // 当前rg ID
    currentRgId: number = this.rgId;

    currentUser: string = this.misId;
    currentFilterType: string = 'MEMBER';

    rgUsers: any = [];

    @Watch('currentRgId')
    onRgIdChanged (val: number) {
        this.searchRgUsers('');
        this.currentUser = '';
        this.$emit('update:rgId', val);
    }
    @Watch('currentUser')
    onMisIdChanged (val: number) {
        this.$emit('update:misId', val);
    }
    async getRgList () {
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.getMyRg();
            this.rgList = res.data.items.reverse();
            this.currentRgId = this.rgList && this.rgList.length ? this.rgList[0].id : 0;
        } catch (e) {
            this.rgList = [];
            console.log(e);
        }
    }
    async searchRgUsers (query) {
        const res: Ajax.AxiosResponse = await api.ctiApi.getRgUser({ identify: query, rgId: this.currentRgId });
        let { code, data } = res;
        if (code === 200) {
            this.rgUsers = data.items;
        }
    }
    async created () {
        await this.getRgList();
    }
    lxSubmit (eventName) {
        window.LXAnalytics && window.LXAnalytics('moduleClick', CHART_LX_MAP[eventName], { custom: { mis: this.userInfo.username } });
    }
}
</script>

<style lang="scss">
.rg-filter {
    display: inline-block;
    float: left;
    .rg-filter-item {
        margin-right: 16px;
    }
    .rg-filter-label {
        margin-right: 8px;
        font-family: PingFangSC-Medium;
        color: #666;
        line-height: 34px;
    }
}
</style>