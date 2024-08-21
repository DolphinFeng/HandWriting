<template>
    <div class="ticket-about-custom-container">
        <div class="about-title">
            <search-about-dropdown
                :placeholder="$getText('component_associate_ticket_search_input_placeholder', '请输入TT标题或TT链接')"
                @change="ticketsChange"
                placement="bottom-start">
                <span
                    class="add-button"
                    v-lxay
                    lxay-act="moduleClick"
                    lxay-bid="b_onecloud_3d2e990e_mc">
                    <i class="mtdicon mtdicon-file-add-o" /> {{ $getText('component_associate_ticket_add_button', '添加') }}</span>
            </search-about-dropdown>
        </div>
        <div class="links-container">
            <div
                class="about-link"
                v-for="(item, index) in connectTTList"
                :key="index">
                <router-link
                    v-if="!item.isMw"
                    :to="{
                        name: 'tt_detail',
                        params: {
                            space: spaceDomain
                        },
                        query: {
                            id: item.destination
                        }
                    }"
                    target="_blank">
                    {{ item.content }}
                </router-link>
                <a
                    v-else
                    :href="item.destination"
                    target="_blank">{{ item.content }}</a>
                <mtd-tooltip :content="$getText('component_associate_ticket_delete_tooltip', '删除')" placement="top">
                    <i class="mtdicon mtdicon-delete-o" @click="deleteLink(index)" />
                </mtd-tooltip>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import SearchAboutDropdown from './sysComponents/search-about-dropdown.vue';
import TemplateMixin from '../TemplateMixin.vue';
import * as api from '@/api';
/**
 * Ticket详情
 *
 * @author liyuyao
 * @date 03/25/2019
 */
@Component({
    components: {
        SearchAboutDropdown
    }
})
export default class ComponentAssociateTicket extends TemplateMixin {
    @Prop({ default: () => {
        return {};
    } })
    info: any;
    connectTTList: any = [];
    searchResult: any = [];

    @Getter spaceDomain;

    mounted () {
        this.value = [];
    }
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
    ticketsChange (id, name) {
        this.connectTTList.push({
            destination: id,
            content: name
        });
        this.$emit('change', this.connectTTList, this.field);
    }
    deleteLink (index) {
        this.connectTTList.splice(index, 1);
        this.$emit('change', this.connectTTList, this.field);
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
    .about-link {
        line-height: 26px;
        a {
            color: #3d91f2;
        }
        .mtdicon-delete-o {
            /* float: right; */
            font-size: 12px;
            color: rgba(0, 0, 0, 0.38);
            cursor: pointer;
        }
    }
    .mtd-dropdown {
        width: auto;
    }
}
</style>
