<template>
    <div class="search-about-dropdown-container">
        <mtd-dropdown popper-class="search-about-panel-container" :placement="placement">
            <slot />
            <mtd-dropdown-menu slot="dropdown">
                <mtd-input
                    v-model="targetTitle"
                    :placeholder="placeholder || $getText('search_about_dropdown_placeholder', '请输入TT标题')"
                    @input="debounceSearchTicketByName"
                    class="search-about-input" />
                <div class="dropdown-container">
                    <mtd-dropdown-menu-item
                        v-for="item in searchResult"
                        :key="item.id"
                        @click="targetItemClick(item.id)">
                        {{ item.name }}
                    </mtd-dropdown-menu-item>
                </div>
            </mtd-dropdown-menu>
        </mtd-dropdown>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import debounce from 'lodash.debounce';
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
export default class SearchAboutDropdown extends Vue {
    @Prop({ default: '' })
    placeholder: '';

    @Prop({ default: 'bottom-end' })
    placement: '';

    debounceSearchTicketByName: Function = debounce(this.searchTicketByName, 200);
    targetTitle: string = '';
    searchResult: any = [];

    async searchTicketByName (query) {
        if (query.trim().length < 1) {
            this.searchResult = [];
            return;
        }
        this.searchLoading = true;
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.searchTicketByName(query);
            this.searchResult = res.data.items;
        } catch (e) {
            this.searchResult = [];
            console.log(e);
        }
    }
    targetItemClick (username, displayName) {
        // 选中后清空搜索记录
        this.searchResult = [];
        this.targetTitle = '';
        this.$emit('change', username, displayName);
    }
}
</script>

<style lang="scss">
.search-about-panel-container {
    width: 260px;
    .search-about-input {
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