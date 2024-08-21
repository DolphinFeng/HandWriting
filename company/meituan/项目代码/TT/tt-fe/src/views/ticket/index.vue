<template>
    <div class="ticket-container">
        <mtd-container class="content-container">
            <mtd-aside
                :class="{
                    'mtd-aside-collapse': isCollapse
                }"
                class="content-aside"
                width="186px"
                v-if="!hideSideBar">
                <side-bar :is-collapse="isCollapse" />
            </mtd-aside>
            <div
                v-if="!hideSideBar"
                class="collapse-btn">
                <mtd-tooltip
                    :content="isCollapse ? $getText('ticket_collapse_sidebar', '展开侧边栏') : $getText('ticket_expand_sidebar', '缩起侧边栏')"
                    placement="right">
                    <div
                        class="mtdicon-more-wrap"
                        v-lxay
                        lxay-act="moduleClick"
                        lxay-bid="b_techportal_6c3n0588_mc"
                        @click="() => isCollapse = !isCollapse">
                        <i class="mtdicon mtdicon-more" />
                    </div>
                </mtd-tooltip>
            </div>
            <mtd-main
                class="ticket-content"
                :class="{
                    'ticket-content-list-detail' : isHandleTicket,
                    'ticket-content-list-detail-announcement': showControl && hideLastClose,
                    'ticket-content-list-detail-filter-show': !hide && !(showControl && hideLastClose),
                    'ticket-content-list-detail-filter-show-and-announcement': !hide && showControl && hideLastClose,
                    'ticket-content-outside' : !inside,
                    'ticket-content-list-detail-hide-sidebar': hideSideBar
                }">
                <div
                    class="announcement-wrapper"
                    v-if="showControl && hideLastClose"
                    :class="{'statistic-announcement-wrapper': isStatisticPage }">
                    <mtd-announcement
                        v-if="showControl"
                        closeable
                        type="warning"
                        @close="closeNotice">
                        <div slot="description">
                            <span
                                class="notice-title"
                                v-html="noticeContent.title"
                                v-if="noticeContent.title" />
                            <span v-html="noticeContent.content" v-if="noticeContent.content" />
                            <a
                                :href="noticeContent.link"
                                v-if="noticeContent.link"
                                target="_blank">{{ $getText('ticket_notice_link', '前往查看') }}</a>
                        </div>
                    </mtd-announcement>
                </div>
                <div :class="['filter-list-container', { 'statistic-filter-list-container': isStatisticPage }]">
                    <router-view ref="list" />
                </div>
            </mtd-main>
        </mtd-container>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import { Getter } from 'vuex-class';

import sideBar from '@/components/sidebar.vue';
import * as api from '@/api';
import eventBus from '@/utils/event-bus';

/**
 * Ticket
 *
 * @author xiaokunyu
 * @date 01/22/2019
 */
@Component({
    components: {
        sideBar
    }
})
export default class Ticket extends Vue {
    @Getter inside;
    @Getter isPrivateSpace;

    noticeContent: string = '';
    userControl: boolean = false;
    ssoidControl: boolean = false;
    contentControl: boolean = false;

    isCollapse: boolean = false;
    hideSideBar: boolean = false;

    hide: boolean = true;
    hideLastClose: boolean = true;

    created () {
        eventBus.$on('ticketFilterShow', this.hideFilter);
    }

    beforeDestroy () {
        eventBus.$off('ticketFilterShow', this.hideFilter);
    }

    hideFilter (hide) {
        this.hide = hide;
    }

    get outsideHideSideBar () {
        return (!this.inside) && this.$route.query.filter === 'createdBy';
    }

    @Watch('$route.name', { immediate: true })
    sideBarCollapseChange (name) {
        this.hideSideBar = this.isPrivateSpace || name.includes('tt_statistic') || this.outsideHideSideBar;
        this.isCollapse = ['tt_handle'].includes(name);
    }
    async mounted () {
        await this.getAnnouncement();
        this.judgeSSOid();
        this.judgeUserControl();
        if (this.lastClose === 'false') {
            this.hideLastClose = true;
        }
    }
    get isHandleTicket () {
        return this.$route.name === 'tt_handle';
    }
    get oldVersion () {
        return parseInt(localStorage['notice'], 10) || 0;
    }
    get lastClose () {
        return localStorage['lastClose'] || 'false';
    }
    get isStatisticPage () {
        const routeName = this.$route.name;
        return routeName.includes('tt_statistic');
    }
    closeNotice () {
        this.hideLastClose = false;
        localStorage['lastClose'] = 'true';
    }
    // 判断用户是否ssoid登陆过期
    judgeSSOid () {
        let ssoid = '';
        let lastSSOid = localStorage['ssoid'] || '';
        // const ONLINE_ENV: string = 'tt.sankuai.com';
        // 不同环境的clientId
        let cookieName = 'tt_ssoid';
        if (document.cookie) {
            let cookies = document.cookie;
            let cookieList = cookies.split('; ');
            cookieList.forEach((item) => {
                let itemName = item.split('=')[0];
                if (itemName === cookieName) {
                    ssoid = item.split('=')[1];
                }
            });
        }
        this.ssoidControl = (ssoid !== lastSSOid);
        if (typeof localStorage === 'object') {
            try {
                localStorage['ssoid'] = ssoid;
            } catch (error) {
                console.log(error);
            }
        }
    }
    judgeUserControl () {
        // 如果用户关闭了公告 且公告未更新过
        if (this.lastClose === 'true' && (this.oldVersion === (this.noticeContent?.version || ''))) {
            this.userControl = false;
        } else {
            this.userControl = true;
        }
        if (typeof localStorage === 'object') {
            try {
                localStorage['notice'] = this.noticeContent?.version;
            } catch (error) {
                console.log(error);
            }
        }
    }
    // 获取tt公告
    async getAnnouncement () {
        const res: Ajax.AxiosResponse = await api.ticketApi.getAnnouncement();
        let { code, data } = res;
        if (code === 200) {
            this.noticeContent = data;
            if (this.noticeContent.title || this.noticeContent.content || this.noticeContent.link) {
                this.contentControl = true;
            }
        }
    }
    get showControl () {
        if (!this.inside) {
            return false;
        } else {
            let show = (this.contentControl && this.userControl) || this.ssoidControl;
            if (show) {
                if (typeof localStorage === 'object') {
                    try {
                        localStorage['lastClose'] = 'false';
                    } catch (error) {
                        console.log(error);
                    }
                }
            }
            return show;
        }
    }
}
</script>

<style lang="scss">
.ticket-container {
    min-width: 1200px;
    height: 100%;
    .collapse-btn {
        flex: 0 0 auto;
        position: relative;
        width: 24px;
        height: 100%;
        vertical-align: middle;
        background: transparent;
        .mtdicon-more-wrap {
            position: absolute;
            top: 50%;
            // left: -8px;
            margin-top: -26px;
            width: 40px;
            height: 52px;
            .mtdicon-more {
                position: absolute;
                top: 50%;
                left: -3px;
                margin-top: -11px;
                font-size: 22px;
                color: #bebebe;
            }
        }
        .mtdicon-more-wrap {
            background-image: url("../../assets/img/more-btn-shadow.png");
            background-size: 16px;
            background-repeat: no-repeat;
        }
    }
    .mtd-aside {
        box-sizing: border-box;
        border-right: none;
        position: relative;
        transition: all 0.3s, width 0.3s;
        background-color: #fff;
    }
    .mtd-aside-collapse {
        width: 48px !important;
    }
    .mtd-menu-collapse {
        width: 48px;
    }
    .mtd-announcement-has-description {
        margin: 0 34px 0 0;
        padding: 7px 12px;
    }
    .mtd-announcement-description {
        padding-right: 20px;
        color: #592d00;
        font-size: 14px;
        .notice-title {
            display: inline-block;
            margin-right: 6px;
            font-weight: bold;
        }
        a {
            color: #005ade;
        }
    }
    .mtd-announcement-close {
        right: 16px;
    }
    .announcement-wrapper {
        // background: #fff;
        padding-top: 12px;
    }
    .statistic-announcement-wrapper {
        background: #fff;
    }
    .content-container {
        height: 100%;
        .ticket-content {
            padding: 0;
        }
        .filter-list-container {
            padding: 12px 34px 0 0;
            background-color: #f5f5f5;
        }
        .statistic-filter-list-container {
            position: relative;
            padding: 0 !important;
            height: 100%;
        }
        .mtd-menu-light {
            background: #fff;
        }
        .content-aside {
            box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.08);
        }
    }
    .ticket-content-list-detail {
        overflow: hidden;
        .filter-list-container {
            height: 100%;
            .mtd-loading-nested {
                height: calc(100% - 61px);
            }
        }
    }
    .ticket-content-list-detail-announcement {
        .filter-list-container {
            height: calc(100% - 50px) !important;
            .mtd-loading-nested {
                height: calc(100% - 61px) !important;
            }
            // &.statistic-filter-list-container {
            //     .mtd-loading-nested {
            //         height: auto !important;
            //     }
            // }
        }
    }
    .ticket-content-list-detail-filter-show-and-announcement {
        .filter-list-container {
            height: calc(100% - 50px) !important;
            .mtd-loading-nested {
                height: calc(100% - 222px) !important;
            }
        }
    }
    .ticket-content-list-detail-filter-show {
        .filter-list-container {
            // height: calc(100% - 120px) !important;
            height: 100% !important;
            .mtd-loading-nested {
                height: calc(100% - 222px) !important;
            }
        }
    }
    .ticket-content-outside {
        padding-left: 24px !important;
        padding-bottom: 0 !important;
        .filter-list-container {
            height: 100% !important;
        }
        .ticket-table-detail-container {
            height: 100%;
        }
    }
    .ticket-content-list-detail-hide-sidebar {
        .mtd-announcement {
            margin-left: 24px;
        }
    }
    // .ticket-container,
    // .mtd-announcement-close {
    //     right: 2px;
    // }
}
</style>
