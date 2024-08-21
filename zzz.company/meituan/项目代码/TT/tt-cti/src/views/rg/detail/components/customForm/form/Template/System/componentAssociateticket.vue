<template>
    <div class="ticket-about-container">
        <div class="about-container">
            <div class="about-title">
                <!-- <h3>相关TT</h3> -->
                <span
                    class="add-button"
                    v-if="readonly">
                    <i class="iconfont icon-add" /> 添加</span>
                <search-about-dropdown
                    placeholder="请输入TT标题或TT链接"
                    @change="ticketsChange"
                    placement="bottom-end"
                    v-else>
                    <span
                        class="add-button">
                        <i class="iconfont icon-add" /> 添加</span>
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
                    <mtd-tooltip content="删除" placement="top">
                        <i class="iconfont icon-delete" @click="deleteLink('TT', item.destination)" />
                    </mtd-tooltip>
                </div>
            </div>
        </div>
        <!-- <div class="about-container">
            <h3>相关COE</h3>
            <mtd-dropdown
                :visible="coeVisible"
                popper-class="input-coe-panel-container"
                placement="bottom-end">
                <span
                    class="add-button"
                    v-lxay
                    lxay-act="moduleClick"
                    lxay-bid="b_onecloud_bf4s4952_mc"
                    v-show="!originCoeLink"
                    @click="openCoeDropdown">
                    <i class="iconfont icon-add" /> 添加</span>
                <mtd-dropdown-menu slot="dropdown">
                    <mtd-input
                        v-model="coeLink"
                        placeholder="填写相关COE链接"
                        class="input-coe" />
                    <mtd-button
                        @click="cancelSave"
                        size="small">取消</mtd-button>
                    <mtd-button
                        @click="coeVisible = false;contentSave('COE', coeLink)"
                        type="primary"
                        size="small"
                        :disabled="!coeLink">保存</mtd-button>
                </mtd-dropdown-menu>
            </mtd-dropdown>
            <div class="links-container" v-if="originCoeLink">
                <div class="about-link">
                    <a :href="originCoeLink" target="_blank">{{ originCoeLink }}</a>
                    <mtd-tooltip content="删除" placement="top">
                        <i class="iconfont icon-delete" @click="deleteLink('COE')" />
                    </mtd-tooltip>
                </div>
            </div>
        </div> -->
    </div>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import TemplateMixin from '../TemplateMixin.vue';
import SearchAboutDropdown from './sysComponents/search-about-dropdown.vue';

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
export default class ComponentAssociate extends TemplateMixin {
    @Prop({
        default: () => {
            return {};
        }
    })
    info: any;
    ticketId: number = 0;
    coeLink: string = '';
    originCoeLink: string = '';
    connectTTList: any = [];
    searchResult: any = [];
    coeVisible: Boolean = false;

    mounted () {
        this.ticketId = parseInt(this.$route.query.id as string, 10);
        this.getConnectPage();
    }
    async searchTicketByName (query) {
        if (query.trim().length < 1) {
            this.searchResult = [];
            return;
        }
        try {
            const res = await api.ticketApi.searchTicketByName(query);
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
    goToCOE () {
        if (this.coeLink) {
            window.open(this.coeLink, '_blank');
        }
    }
    async deleteLink (type, destination?) {
        if (type === 'COE' && !this.coeLink) {
            return;
        }
        const params: { source: number; linkType: string; destination?: number } = {
            source: this.ticketId,
            linkType: type
        };
        if (type === 'TT') {
            params.destination = destination;
        }
        const res = await api.ticketApi.deleteConnectPage(params);
        if (res.code === 200) {
            this.$mtd.message.success(`删除关联${type}成功`);
            if (type === 'COE') {
                this.coeLink = '';
                this.originCoeLink = '';
            } else {
                this.getConnectPage();
            }
        }
    }
    async contentSave (type, url) {
        interface Params {
            linkType: string;
            source: number;
            content?: string;
            destination?: number;
        }
        const params: Params = {
            linkType: type,
            source: this.ticketId
        };
        if (type === 'COE') {
            if (this.originCoeLink === this.coeLink) {
                return;
            }
            if (url.length > 2000) {
                this.coeLink = this.originCoeLink;
                this.$mtd.message.error('输入内容超过2000字符');
                return;
            }
            if (!this.judgeCoeLink(url)) {
                this.coeLink = this.originCoeLink;
                this.$mtd.message.error('请输入正确的COE链接');
                return;
            }
            params.content = url;
            const res = await api.ticketApi.connectCoe(params);
            if (res.code === 200) {
                this.originCoeLink = this.coeLink;
                this.$mtd.message.success('关联COE成功');
            }
        } else {
            params.destination = url;
            // params = [params];
            // try {
            //     const res = await api.ticketApi.connectTT(params);
            //     if (res.code === 200) {
            //         this.$mtd.message.success(`关联TT成功`);
            //         this.getConnectPage();
            //     }
            // } catch (e) {
            //     console.log(e);
            // }
        }
    }
    cancelSave () {
        this.coeLink = this.originCoeLink;
        this.coeVisible = false;
    }
    // 判断是否是coe链接
    judgeCoeLink (url) {
        const reg = /^(https:\/\/coe.mws.sankuai.com)/;
        return reg.test(url);
    }
    // getConnectPage
    async getConnectPage () {
        // const res = await api.ticketApi.getConnectPage(this.ticketId);
        // let { data, code } = res;
        // if (code === 200) {
        //     this.connectTTList = [];
        //     data.items.forEach((item) => {
        //         if (item.linkType === 'COE') {
        //             this.originCoeLink = item.content;
        //             this.coeLink = this.originCoeLink;
        //         }
        //         if (item.linkType === 'TT') {
        //             // 美维工单 单独处理
        //             if (item.destination === 110) {
        //                 let mwId = item.content.split('-')[1];
        //                 let destination = `https://helpdesk.sankuai.com/issue/view?id=${mwId}`;
        //                 this.connectTTList.push({
        //                     isMw: true,
        //                     destination: destination,
        //                     content: item.content
        //                 });
        //             } else {
        //                 this.connectTTList.push({
        //                     destination: item.destination,
        //                     content: item.content
        //                 });
        //             }
        //         }
        //         if (item.linkType === 'ONES') {
        //             this.$emit('withOnes', item.content, item.destination);
        //         }
        //         if (item.linkType === 'ITSM') {
        //             this.$emit('withItsm', item.content);
        //         }
        //     });
        // }
    }
    ticketsChange (val) {
        this.ttLinkAdd(val);
    }
    openCoeDropdown () {
        this.coeVisible = true;
    }
}
</script>

<style lang="postcss">
.ticket-about-container {
    .add-button {
        color: #FF8800;
        cursor: pointer;
        .icon-add {
            font-size: 12px;
        }
    }
    /* .search-about-dropdown-container {
        float: right;
    } */
    h3 {
        display: inline-block;
        font-family: PingFangSC-Regular;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.38);
        letter-spacing: 0;
    }
    .about-container {
        margin-bottom: 12px;
        .about-link {
            line-height: 26px;
            a {
                color: #3D91F2;
            }
            .icon-delete {
                /* float: right; */
                font-size: 12px;
                color: rgba(0, 0, 0, 0.38);
                cursor: pointer;
            }
        }
        .mtd-dropdown {
            width: auto;
            /* float: right; */
        }
    }
}
.input-coe-panel-container {
    padding: 12px 20px;
    .input-coe {
        margin-right: 10px;
    }
}
</style>
