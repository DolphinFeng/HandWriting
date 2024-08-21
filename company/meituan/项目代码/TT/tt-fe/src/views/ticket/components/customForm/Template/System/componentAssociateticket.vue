<template>
    <pm-select
        multiple
        type="dropdown"
        remote
        :remote-method="searchTicketByName"
        class="component-label"
        v-model="value"
        :placeholder="$getText('component_associate_ticket_search_placeholder', '搜索关联TT')"
        :input-placeholder="$getText('component_associate_ticket_input_placeholder', '请输入关联TT标题')"
        @change="ticketsChange">
        <pm-select-option
            v-for="item in searchResult"
            :key="item.id"
            :value="item.id"
            :label="item.name" />
    </pm-select>
</template>
<script lang="ts">
import { Component } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import TemplateMixin from '../TemplateMixin.vue';
import * as api from '@/api';
/**
 * 关联TT
 *
 * @author liyuyao
 * @date 03/25/2019
 */
@Component
export default class ComponentAssociateTicket extends TemplateMixin {
    searchResult: any = [];

    @Getter spaceDomain;

    async searchTicketByName (query) {
        if (query.trim().length < 1) {
            this.searchResult = [];
            return;
        }
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.searchTicketByName(query);
            this.searchResult = res.data.items;
        } catch (e) {
            this.searchResult = [];
            console.log(e);
        }
    }
    ticketsChange (val) {
        this.value = val;
        this.valueChange();
    }
}
</script>
<style lang="postcss">
.ticket-about-custom-container {
    .add-button {
        color: #1c6cdc;
        cursor: pointer;
        .mtdicon-file-add-o {
            font-size: 12px;
        }
    }
}
</style>