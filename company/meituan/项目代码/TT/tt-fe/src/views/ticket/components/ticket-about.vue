<template>
    <div class="ticket-about-container">
        <div class="about-container">
            <div class="about-title" v-if="itemPermission('relateTT').visible">
                <h5>{{ $getText('ticket_about_relate_tt', '关联TT') }}：</h5>
                <search-about-dropdown
                    :placeholder="$getText('ticket_about_search_placeholder', '请输入TT标题或TT链接')"
                    @change="ticketsChange"
                    placement="bottom-end">
                    <span
                        class="add-button"
                        v-lxay
                        lxay-act="moduleClick"
                        lxay-bid="b_onecloud_3d2e990e_mc"
                        v-show="itemPermission('relateTT').editable">
                        <i class="mtdicon mtdicon-file-add" /></span>
                </search-about-dropdown>
            </div>
            <div class="links-container">
                <div
                    class="about-link"
                    v-for="(item, index) in connectTTList"
                    :key="index">
                    <mtd-tooltip
                        :content="$getText('ticket_about_cancel_relate_tooltip', '点击取消关联')"
                        placement="top"
                        theme="light"
                        size="small">
                        <img
                            :src="imgSrc"
                            @click="deleteLink('TT', item.destination)">
                    </mtd-tooltip>
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
                </div>
            </div>
        </div>
        <div class="about-container" v-if="itemPermission('relateCOE').visible">
            <h5>{{ $getText('ticket_about_relate_coe', '关联COE') }}：</h5>
            <span
                class="add-button add-button-coe"
                v-lxay
                lxay-act="moduleClick"
                lxay-bid="b_onecloud_bf4s4952_mc"
                v-show="!originCoeLink && itemPermission('relateCOE').editable"
                @click="openCoeDropdown">
                <i class="mtdicon mtdicon-file-add" /></span>
            <mtd-modal
                v-model="coeVisible"
                class="input-coe-panel-container">
                <mtd-tabs v-model="activeTab">
                    <mtd-tab-pane :label="$getText('ticket_about_create_coe', '新建COE')" value="create">
                        <div style="margin-bottom: 11px;">{{ $getText('ticket_about_confirm_create_coe', '是否确认新建COE？') }}</div>
                    </mtd-tab-pane>
                    <mtd-tab-pane :label="$getText('ticket_about_associate_coe', '绑定COE')" value="associate">
                        <span>{{ $getText('ticket_about_coe_link', 'COE链接') }}：</span><mtd-input
                            v-model="coeLink"
                            :placeholder="$getText('ticket_about_coe_link_placeholder', '填写相关COE链接')"
                            class="input-coe" />
                    </mtd-tab-pane>
                </mtd-tabs>
                <div slot="footer">
                    <mtd-button @click="cancelSave">{{ $getText('ticket_about_cancel', '取消') }}</mtd-button>
                    <mtd-button
                        type="primary"
                        :disabled="activeTab === 'associate' && !coeLink"
                        @click="contentSave('COE', coeLink)">{{ $getText('ticket_about_confirm', '确认') }}</mtd-button>
                </div>
            </mtd-modal>
            <div class="links-container" v-if="originCoeLink">
                <div class="about-link">
                    <mtd-tooltip
                        :content="$getText('ticket_about_cancel_relate_tooltip', '点击取消关联')"
                        placement="top"
                        theme="light"
                        size="small">
                        <img
                            :src="imgSrc"
                            @click="confirmDelete">
                    </mtd-tooltip>
                    <a :href="originCoeLink" target="_blank">{{ coeName }}</a>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import SearchAboutDropdown from '@/components/search-about-dropdown.vue';
import { Mutation, Getter, State } from 'vuex-class';
import { itemPermission } from '@/utils/tools';
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
export default class TicketAbout extends Vue {
    @Mutation setTicketAbout;
    @State(state => state.tt.ticketAbout)
    ticketAbout: any;
    @Getter spaceDomain;
    @Getter env;

    @Prop({ default: () => {
        return {};
    } })
    info: any;
    ticketId: number = 0;
    coeLink: string = '';
    coeName: string = '';
    originCoeLink: string = '';
    connectTTList: any = [];
    searchResult: any = [];
    coeVisible: Boolean = false;
    activeTab: string = 'create';
    itemPermission: Function = itemPermission;

    mounted () {
        this.ticketId = this.$route.query.id;
        this.getConnectPage();
        this.getConnectCoe();
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
    ttLinkAdd (val) {
        if (val) {
            this.contentSave('TT', val);
        }
    }
    confirmDelete () {
        this.$mtd.confirm({
            title: this.$getText('ticket_about_cancel_relate', '取消关联'),
            message: `<div style="max-width: 400px">${this.$getText('ticket_about_confirm_cancel_relate', '是否取消TT与COE：')}<a href="${this.coeLink}" target="_blank">${this.coeName}</a>${this.$getText('ticket_about_relate_confirm', '的关联？')}</div>`,
            dangerouslyUseHTMLString: true,
            showCancelButton: true,
            onOk: () => {
                this.deleteLink('COE');
            }
        }).catch(e => { console.log(e); });
    }
    async deleteLink (type, destination?) {
        if (type === 'COE' && !this.coeLink) {
            return;
        }
        let params = {
            source: parseInt(this.ticketId, 10),
            linkType: type
        };
        if (type === 'TT') {
            params.destination = destination;
        }
        const res: Ajax.AxiosResponse = await api.ticketApi.deleteConnectPage(params);
        if (res.code === 200) {
            this.$mtd.message.success(this.$getText('ticket_about_cancel_relate_success', { type: type }));
            if (type === 'COE') {
                this.coeLink = '';
                this.originCoeLink = '';
            } else {
                this.getConnectPage();
            }
        }
    }
    async contentSave (type, url) {
        let params: any = {
            linkType: type,
            source: parseInt(this.ticketId, 10)
        };
        if (type === 'COE') {
            const isCreateCoe = this.activeTab === 'create';
            const apiName = isCreateCoe ? 'createCoe' : 'connectCoe';
            if (isCreateCoe) {
                params = parseInt(this.ticketId, 10);
            } else {
                params.content = url;
            }
            const res: Ajax.AxiosResponse = await api.ticketApi[apiName](params);
            if (res.code === 200) {
                this.originCoeLink = isCreateCoe ? `${this.coeHost}detail/${res.data.id}` : this.coeLink;
                this.coeLink = this.originCoeLink;
                this.coeName = res.data.brief;
                this.$mtd.message.success(this.$getText('ticket_about_relate_coe_success', '关联COE成功'));
                this.$emit('update');
            }
            this.coeVisible = false;
        } else {
            params.destination = url;
            params = [params];
            try {
                const res: Ajax.AxiosResponse = await api.ticketApi.connectTT(params);
                if (res.code === 200) {
                    this.$mtd.message.success(this.$getText('ticket_about_relate_tt_success', '关联TT成功'));
                    this.getConnectPage();
                }
            } catch (e) {
                console.log(e);
            }
        }
    }
    cancelSave () {
        this.coeLink = this.originCoeLink;
        this.coeVisible = false;
    }
    async getConnectCoe () {
        if (!+this.ticketId) return;
        const res: Ajax.AxiosResponse = await api.ticketApi.getConnectCoe(this.ticketId);
        let { data, code } = res;
        if (code === 200 && data) {
            let ticketAbout: { [k: string]: string | { url: string; id: string } } = {};
            this.originCoeLink = data.content || '';
            this.coeLink = this.originCoeLink;
            this.coeName = data.title || data.content;
            ticketAbout.coe = this.coeLink;
            this.setTicketAbout({
                ...this.ticketAbout,
                ...ticketAbout
            });
        }
    }
    // getConnectPage
    async getConnectPage () {
        if (!+this.ticketId) return;
        const res: Ajax.AxiosResponse = await api.ticketApi.getConnectPage(this.ticketId);
        let { data, code } = res;
        if (code === 200) {
            this.connectTTList = [];
            let ticketAbout: { [k: string]: string | { url: string; id: string } } = {};
            data.items.forEach((item) => {
                // 仅关联TT通过该接口返回；COE使用新接口
                if (item.linkType === 'TT') {
                    // 美维工单 单独处理
                    if (item.destination === 110) {
                        let mwId = item.content.split('-')[1];
                        let destination = `https://helpdesk.sankuai.com/issue/view?id=${mwId}`;
                        this.connectTTList.push({
                            isMw: true,
                            destination: destination,
                            content: item.content
                        });
                    } else {
                        this.connectTTList.push({
                            destination: item.destination,
                            content: item.content
                        });
                    }
                    ticketAbout.tt = this.connectTTList;
                }
            });
            this.setTicketAbout({
                ...this.ticketAbout,
                ...ticketAbout
            });
        }
    }
    ticketsChange (val) {
        this.ttLinkAdd(val);
    }
    openCoeDropdown () {
        this.coeVisible = true;
    }
    get coeHost () {
        return this.env === 'test' ? 'http://coe.mws.cloud.test.sankuai.com/' : 'https://coe.mws.sankuai.com/';
    }
    get imgSrc () {
        return require(`../../../assets/img/associate-icon.svg`);
    }
}
</script>

<style lang="scss">
.ticket-about-container {
    .add-button {
        cursor: pointer;
        .mtdicon-file-add {
            color: rgba(0, 0, 0, 0.6);
            font-size: 16px;
            vertical-align: text-top;
        }
        &-coe {
            .mtdicon-file-add {
                line-height: 22px;
            }
        }
    }
    .search-about-dropdown-container {
        display: inline-block;
        vertical-align: middle;
        margin-left: 11px;
    }
    h5 {
        display: inline-block;
        font-family: PingFangSC-Regular;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.84);
        letter-spacing: 0;
        line-height: 20px;
    }
    .about-container {
        .about-link {
            line-height: 20px;
            font-size: 12px;
            display: flex;
            a {
                color: #005ade;
                width: 220px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                display: inline-block;
                line-height: 22px;
            }
            img {
                vertical-align: middle;
                cursor: pointer;
                margin-right: 3px;
            }
        }
        .mtd-dropdown {
            width: auto;
        }
    }
}
.input-coe {
    width: 280px;
}
</style>
