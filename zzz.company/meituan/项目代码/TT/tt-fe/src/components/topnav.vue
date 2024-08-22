<template>
    <div id="layout">
        <el-menu
            :default-active="activeTab"
            :class="['tt-topnav', routerName]"
            mode="horizontal"
            background-color="#2E2E2E"
            text-color="#999999"
            active-text-color="#fff">
            <li @click="redirectTt" class="el-menu-item tt-topnav-title">
                <img src="@/assets/img/logo.png" alt="">
                <span style="margin-left: 8px;">{{ $getText('top_nav_title', '问题流转工具') }}</span>
            </li>
            <el-menu-item
                :key="tab.value"
                v-for="tab in showTabs"
                :index="tab.value">
                <a :href="ctiUrl" v-if="tab.value === 'cti'">
                    <div
                        class="nav-title"
                        v-lxay
                        lxay-act="moduleClick"
                        :lxay-bid="tab.lx">
                        {{ $getText(tab.label) }}
                    </div>
                </a>
                <router-link
                    v-else
                    :to="getHrefLink(tab.value)"
                    class="menu-href">
                    <div
                        v-lxay
                        lxay-act="moduleClick"
                        :lxay-bid="tab.lx"
                        class="nav-title">
                        {{ $getText(tab.label) }}
                    </div>
                </router-link>
            </el-menu-item>
            <li class="el-menu-item tt-search-ticket" v-if="showSearchTicket">
                <mtd-input
                    class="search-ticket-input"
                    @click-suffix="handleSearch"
                    @keyup.enter="handleSearch"
                    suffix-icon="mtdicon mtdicon-search"
                    v-model="ticket"
                    :placeholder="$getText('top_nav_input_placeholder', '搜索标题、工单id')" />
            </li>
            <li class="el-menu-item tt-topnav-img">
                <mtd-dropdown
                    v-model="imgVisible"
                    popper-class="logout-dropdown"
                    placement="bottom-end">
                    <img
                        class="tt-user-img"
                        :src="userInfo.avatar || defaultAvatar"
                        alt="头像">
                    <mtd-dropdown-menu slot="dropdown">
                        <div v-if="hasMyHandover && hasMemberHandover">
                            <div class="nav-handover-wrapper" @click="showChildren = !showChildren">
                                <span>{{ $getText('top_nav_avatar_transfer', '工作交接') }}</span>
                                <i :class="`mtdicon ${showChildren ? 'mtdicon-up-thick' : 'mtdicon-down-thick'}`" />
                            </div>
                            <mtd-collapse-transition>
                                <div class="handover-list">
                                    <div v-show="showChildren" class="handover-link-item">
                                        <a  :href="myHandoverUrl">
                                            <span class="handover-text">{{ $getText('top_nav_avatar_transfer_my', '我的工作交接') }}</span>
                                        </a>
                                    </div>
                                    <div v-show="showChildren" class="handover-link-item">
                                        <a  :href="memberHandoverUrl">
                                            <span class="handover-text">{{ $getText('top_nav_avatar_transfer_colleague', '组员的工作交接') }}</span>
                                        </a>
                                    </div>
                                </div>
                            </mtd-collapse-transition>
                        </div>
                        <div v-else-if="hasMyHandover || hasMemberHandover" class="handover-link-item handover-link-item-single">
                            <a  :href="hasMyHandover ? myHandoverUrl : memberHandoverUrl">
                                <span class="handover-text">{{ $getText(this.hasMyHandover ? 'top_nav_avatar_transfer_my' : 'top_nav_avatar_transfer_colleague', '我的工作交接') }}</span>
                            </a>
                        </div>
                        <div>
                            <div class="nav-handover-wrapper" @click="showLanguageChildren = !showLanguageChildren">
                                <span>{{ $getText('top_nav_avatar_language', '语言与时区') }}</span>
                                <language-switch-modal :modal-visible="showLanguageChildren" @close="showLanguageChildren = !showLanguageChildren" />
                            </div>
                        </div>
                        <mtd-dropdown-menu-item>
                            <a class="logout-link" :href="logoutUrl">
                                <span class="logout-text">{{ $getText('top_nav_sign_out', '退出登录') }}</span>
                            </a>
                        </mtd-dropdown-menu-item>
                    </mtd-dropdown-menu>
                </mtd-dropdown>
            </li>
            <li class="el-menu-item tt-topnav-link" v-if="showCallbackHelp">
                <mtd-tooltip
                    :content="$getText('top_nav_response', '反馈')"
                    size="small"
                    placement="bottom">
                    <a  :href="customerUrl">
                        <i
                            v-lxay
                            lxay-act="moduleClick"
                            lxay-bid="b_techportal_smd95kj4_mc"
                            class="iconfont icon-customer" />
                    </a>
                </mtd-tooltip>
            </li>
            <li class="el-menu-item tt-topnav-link" v-show="showCallbackHelp && language === 'en'">
                <mtd-tooltip
                    :content="$getText('top_nav_faq', '常见问题')"
                    size="small"
                    placement="bottom">
                    <a  href="https://km.sankuai.com/collabpage/2218074023" target="_blank">
                        <i class="mtdicon mtdicon-question-circle-o" />
                    </a>
                </mtd-tooltip>
            </li>
            <li class="el-menu-item tt-topnav-link" v-show="showCallbackHelp && language !== 'en'">
                <mtd-tooltip
                    size="small"
                    placement="bottom"
                    theme="light"
                    popper-class="common-problems-popper">
                    <div slot="content">
                        <h4>{{ $getText('top_nav_faq', '常见问题') }}</h4>
                        <div class="problems-list">
                            <a
                                target="_blank"
                                v-for="(item, index) in commonProblems"
                                :key="index"
                                :href="item.link">
                                · {{ $getText(item.title) }}
                            </a>
                        </div>
                        <a
                            class="learn-more"
                            href="https://km.sankuai.com/page/1004881018"
                            target="_blank">
                            {{ $getText('top_nav_see_more', '查看更多') }} <i class="mtdicon mtdicon-right-thick" />
                        </a>
                    </div>
                    <i class="mtdicon mtdicon-question-circle-o" />
                </mtd-tooltip>
            </li>
            <li
                v-lxay
                lxay-act="moduleClick"
                lxay-bid="b_onecloud_scw2vcdy_mc"
                class="el-menu-item tt-create-ticket"
                v-if="showCreateButton">
                <router-link
                    :to="{ name: 'tt_create', params: {
                        space: spaceDomain
                    } }"
                    class="create-tt-link">
                    <i class="mtdicon mtdicon-add" /><span>{{ $getText('top_nav_init_tt', '发起TT') }}</span></router-link>
            </li>
        </el-menu>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import { State, Getter, Mutation } from 'vuex-class';
// import MTD from '@ss/mtd-vue';

import * as api from '@/api';
import store from '@/store';
import eventBus from '@/utils/event-bus';

import {
    DEFAULT_AVATAR,
    HrefLinkMap,
    TopNavTabsNew,
    TopNavTabsOutside,
    TopnavOnlyMy,
    TopNavTabsSpace,
    CommonProblems,
    TopNavTabsWithQuality,
    LanguageType
} from '@/config/map.conf';
import { passportLogout } from '../env';
import { getSSOLogoutUrl } from '@/sso';
import { lxReportClick } from '@/utils/directive/lxanaly';
import { COMMON_LX_MAP } from '@/config/lx_map.conf';
import { Menu, MenuItem } from 'element-ui';
import LanguageSwitchModal from '@/views/ticket/components/language-switch-modal.vue';
import { changeLanguageForElement } from '@/inject-element-ui';
Vue.use(Menu);
Vue.use(MenuItem);
@Component({
    components: {
        LanguageSwitchModal
    }
})
export default class TopNav extends Vue {
    // from Vuex
    @Getter inside;
    @Getter loginType;
    @Getter isPrivateSpace;
    @Getter spaceDomain;
    @Getter env;
    @Getter inspectionInfo;
    @Getter language;
    @Getter timeZone;

    @State(state => state.tt.userInfo)
    userInfo: CommonTypes.UserInfoItem;
    @Mutation setInspectionInfo;
    @Mutation setLanguage;
    @Mutation setTimeZone;
    @Mutation setTimeZoneList;

    // Local State
    activeName: string = 'tt';
    mis: string = '';
    name: string = '';
    ticket: string = '';
    imgVisible: Boolean = false;
    routerName: string = '';
    // 工作交接
    hasMyHandover: boolean = false;
    hasMemberHandover: boolean = false;
    showChildren: boolean = false;
    showLanguageChildren: boolean = false;

    activeTab: string = 'handle';

    defaultAvatar: string = DEFAULT_AVATAR;
    hrefLinkMap: CommonTypes.mapObject = HrefLinkMap;

    commonProblems: CommonTypes.mapObject[] = CommonProblems;
    LanguageType: CommonTypes.mapObject[] = LanguageType;
    get showTabs () {
        let tabList;
        if (this.onlyMyTicket) {
            tabList = TopnavOnlyMy;
        } else if (!this.inside) {
            tabList = TopNavTabsOutside;
        } else if (this.isPrivateSpace) {
            tabList = TopNavTabsSpace;
        } else if (this.isMosesHelper) {
            tabList = [];
        } else if (this.inspectionInfo?.showInspection) {
            tabList = TopNavTabsWithQuality;
        } else {
            tabList = TopNavTabsNew;
        }
        if (this.language !== 'zh') {
            tabList = tabList.filter((item) => !['quality'].includes(item.value));
        }
        return tabList;
    }
    async mounted () {
        this.routeRedirct(this.$route);
        eventBus.$on('changeTab', this.changeTab);
    }

    beforeDestroy () {
        eventBus.$off('changeTab', this.changeTab);
    }

    routeRedirct (route: any) {
        const routerName = route.name;
        const filter = route.query.filter;
        if (!this.inside) {
            if (routerName === 'tt_handle') {
                this.activeTab = filter && filter === 'createdBy' ? 'outsideMyTT' : 'outsideAssigned';
            } else if (routerName === 'tt_create') {
                this.activeTab = 'outsideAsk';
            }
            return;
        }
        if (routerName.includes('tt_statistic_new') || routerName.includes('tt_statistic_create') || routerName.includes('tt_statistic_edit')) {
            this.activeTab = 'statisticNew';
        } else if (routerName === 'tt_list') {
            this.activeTab = 'filter';
        } else if (this.isPrivateSpace) {
            this.activeTab = 'spaceQuestion';
        } else if (routerName === 'tt_handle') {
            this.activeTab = 'handle';
        } else if (routerName.includes('quality')) {
            this.activeTab = 'quality';
        }
    }

    changeTab (tab) {
        this.activeTab = tab;
    }

    // Watch
    @Watch('$route', { immediate: true, deep: true })
    // Methods
    onRouteChanged (to, from) {
        this.routerName = to.name;
        let that = this;
        this.$nextTick(() => {
            that.routeRedirct(this.$route);
        });
    }
    // LifeCycle
    created () {
        this.getUserInfo();
        // 获取时区信息
        this.getTimeZoneOptions();
        this.getHandoverStatus();
        if (this.loginType === 'SSO') {
            this.getQualityStatus();
        }
        this.handleLanguage();
    }
    async handleLanguage () {
        let newLanguage = '';
        let newTimeZone = '';
        try {
            // 获取用户时区，提前设置时区信息
            const res = await api.preferenceApi.getUserLanguage();
            const { code, data } = res;
            if (code === 200 && data) {
                newLanguage = data.locale || '';
                newTimeZone = data.timeZone || '';
            }
        } catch (error) {
            console.error('Get language setting error', error);
        }
        // 用户没有设置过语言，则使用浏览器语言
        if (!newLanguage) {
            const userLang = navigator.language || navigator.userLanguage;
            if (userLang) {
                const enLangRegex = /^en(-[a-zA-Z]+)?$/;
                // const zhLangRegex = /^zh(-[a-zA-Z]+)?$/;
                // const simplify = ['zh-CN', 'zh-SG', "zh"];
                if (enLangRegex.test(userLang)) {
                    newLanguage = 'en';
                } else if (userLang === 'zh-HK') {
                    newLanguage = 'zh-HK';
                } else {
                    newLanguage = 'zh';
                }
            }
        }
        // 如果语言和默认语言不一致则替换语言
        if (newLanguage && newLanguage !== this.language) {
            this.$i18nClient.changeLanguage(newLanguage, (err) => {
                if (err) {
                    this.$mtd.message.error(this.$getText('change_language_failed', '语言切换失败'));
                    return;
                }
                this.setLanguage(newLanguage);
            });
        }
        changeLanguageForElement(newLanguage);

        if (newTimeZone && newTimeZone !== this.timeZone) {
            // this.setLanguage(newLanguage);
            this.setTimeZone(newTimeZone);
        }
    }
    async getQualityStatus () {
        // 判断是否展示质检TT
        const res: any = await api.inspectApi.getUserPermission();
        const { code, data } = res;
        if (code === 200 && data && data.role) {
            this.setInspectionInfo({
                showInspection: !!data.role.length,
                isAdmin: data.role.includes('ADMIN'),
                isInspector: data.role.includes('INSPECTOR')
            });
        }
    }
    async getHandoverStatus () {
        const res: Ajax.AxiosResponse = await api.ctiApi.hasHandover();
        const { code, data } = res;
        if (code === 200 && data) {
            // 如果有两项，展示 工作交接
            this.hasMyHandover = data.myHandover || false;
            this.hasMemberHandover = data.memberHandover || false;
        }
    }
    // 获取当前登录用户信息，存入store
    async getUserInfo () {
        try {
            const res: Ajax.AxiosResponse = await api.ctiApi.getUserInfo();
            this.name = res.data.displayname;
            this.mis = res.data.username;
            let userInfo = res.data;
            userInfo.avatar = await this.getUserAvatar();
            store.commit('GET_USER_INFO', userInfo);
            if (typeof localStorage === 'object') {
                try {
                    localStorage.ticketUserInfo = JSON.stringify(userInfo);
                } catch (error) {
                    console.log(error);
                }
            }
            document.cookie = `bgId=${userInfo.bgId || null}; path=/`;
            document.cookie = `buId=${userInfo.buId || null}; path=/`;
            document.cookie = `tenantId=${userInfo.tenantId}; path=/`;
            document.cookie = `space=${this.spaceDomain}; path=/`;
            document.cookie = `orgId=${userInfo.orgId}; path=/`;
            document.cookie = `jobFamily=${userInfo.jobFamily}; path=/`;
            document.cookie = `jobFamilyName=${userInfo.jobFamilyName}; path=/`;
            // 将cat上报信息改为mis号
            window.owl && window.owl('setDimension', {
                'unionId': this.mis
            });
        } catch (e) {
            console.log(e);
        }
    }
    async getTimeZoneOptions () {
        const res = await api.preferenceApi.getTimeZoneOptions();
        let map = new Map();
        if (res.data && res.data['en']) {
            Object.entries(res.data['en']).forEach(([key, value]) => map.set(value, key));
            this.setTimeZoneList(map);
        }
    }

    // 获取当前用户头像，存入store
    async getUserAvatar () {
        const res: Ajax.AxiosResponse = await api.ctiApi.searchDisplayNameList([this.mis]);
        let { code, data } = res;
        if (code === 200) {
            let avatar = data[this.mis] && data[this.mis]['avatar'] || DEFAULT_AVATAR;
        }
        return avatar;
    }
    // 搜索ticket
    handleSearch () {
        if (!this.ticket) {
            return ;
        }
        lxReportClick(COMMON_LX_MAP['topnav_search_ticket']);
        this.$router.push({
            name: 'tt_search',
            params: {
                space: this.spaceDomain
            },
            query: {
                name: this.ticket
            }
        }).catch(err => err);
    }
    createdTicket () {
        if (!this.isNewTTBtnshow) return;
        this.$router.push({
            name: 'tt_create',
            params: {
                space: this.spaceDomain
            }
        }).catch(err => err);
    }
    redirectTt () {
        const routerName = this.$route.name;
        // special cases: 这些页面 logo 的链接不可点击
        if (routerName === 'tt_helpdesk_rg' || routerName === 'tt_helpdesk_create' || routerName === 'tt_moses_helper') {
            return ;
        } else if (this.isPrivateSpace) {
            this.$router.push({
                name: 'tt_create',
                params: {
                    space: this.spaceDomain
                }
            }).catch(err => err);
        } else {
            this.$router.push({
                name: 'home',
                params: {
                    space: this.spaceDomain
                }
            }).catch(err => err);
        }
    }
    changeRoute (tab) {
        if (tab === 'statisticNew') {
            this.$router.push({
                name: 'tt_statistic_new',
                params: {
                    space: this.spaceDomain
                }
            }).catch(e => e);
        } else if (tab === 'filter') { // 查询TT
            this.$router.push({
                name: 'tt_list',
                params: {
                    space: this.spaceDomain
                }
            }).catch(err => err);
        } else if (tab === 'cti') { // 服务黄页
            window.open(this.ctiUrl, '_self');
        } else if (tab === 'spaceAsk') {
            this.$router.push({
                name: 'tt_create',
                params: {
                    space: this.spaceDomain
                }
            }).catch(err => err);
        } else { // 处理TT
            let queryObj = Object.assign({
                ...this.$route.query
            }, {
                filter: tab === 'outsideMyTT' || tab === 'spaceQuestion' ? 'createdBy' : 'todo'
            });
            this.$router.push({
                name: 'tt_handle',
                params: {
                    space: this.spaceDomain
                },
                query: queryObj
            }).catch(err => err);
        }
        this.activeTab = tab;
    }
    getHrefLink (val) {
        let link = HrefLinkMap[val];
        if (val === 'cti') link = this.ctiUrl;
        if (val === 'spaceQuestion') link = `/${this.spaceDomain}/handle?filter=createdBy`;
        if (val === 'spaceAsk') link = `/${this.spaceDomain}/create`;
        if (val === 'quality') link = `/quality/inspection`;
        return link;
    }
    get isNewTTBtnshow () {
        return !['tt_create'].includes(this.$route.name);
    }
    get ctiUrl () {
        return this.env === 'prod' ? '//cti.sankuai.com' : (this.env === 'test' ? '//cti.cloud.test.sankuai.com' : '//cti.fetc.st.sankuai.com');
    }
    get helpUrl () {
        return 'https://km.sankuai.com/page/134109797';
    }
    get callbackUrl () {
        return '/ticket/create?cid=112&tid=2190&iid=9397';
    }
    get myHandoverUrl () {
        return '/ticket/my/handover';
    }
    get memberHandoverUrl () {
        return '/ticket/member/handover';
    }
    get logoutUrl () {
        const isLocal = location.href.indexOf('localhost') > -1;
        return this.loginType === 'PASSPORT' ? passportLogout : isLocal ? '/sso/logout' : getSSOLogoutUrl();
    }
    get customerUrl () {
        if (this.language === 'en') return 'https://tt.sankuai.com/ticket/create?cid=17&tid=4348&iid=37613';
        else return 'https://tt.sankuai.com/ticket/moses-helper?rgId=7';
    }
    get showCreateButton () {
        return this.inside && !(this.isCreatePage || this.isRgHelpdesk || this.onlyMyTicket || this.isPrivateSpace) && !this.isMosesHelper;
    }
    get showSearchTicket () {
        return this.inside && !this.isPrivateSpace && !this.onlyMyTicket && !(this.isCreatePage || this.isRgHelpdesk) && !this.isMosesHelper;
    }
    get showCallbackHelp () {
        return this.inside && !this.isRgHelpdesk;
    }
    // 当前页面是创建页时，不显示发起TT按钮
    get isCreatePage () {
        return this.$route.name === 'tt_create';
    }
    // 当页面是rg帮助台时，创建时，不显示tab、发起tt、帮助按钮
    get isRgHelpdesk () {
        return this.$route.name === 'tt_helpdesk_rg';
    }
    get isMosesHelper () {
        return this.$route.name === 'tt_moses_helper';
    }
    // 仅展示我发起的问题的情况：外部用户 & 自定义表单界面
    get onlyMyTicket () {
        const hiddenList = ['tt_helpdesk_create', 'tt_helpdesk_rg'];
        return hiddenList.includes(this.$route.name);
    }
    get menuUserInfo () {
        const targetInfo = {
            mis: this.userInfo.username,
            org: this.userInfo.orgId || ''
        };
        return targetInfo;
    }
    get portalAccess () {
        const routerName = this.$route.name;
        if (routerName === 'tt_helpdesk_rg' || routerName === 'tt_helpdesk_create' || routerName === 'tt_moses_helper') {
            return false;
        }
        const whiteList: string[] = ['xiaoqian07', 'zhouxiaobo02', 'liuchen24', 'tanxiaosong'];
        if (this.userInfo.username && whiteList.includes(this.userInfo.username)) {
            return true;
        }
        const groupList: string[] = ['150053', '162994', '40000922', '108635', '1020422', '150858', '114426', '40004401'];
        if (this.userInfo.orgIdPath) {
            const group: string[] = this.userInfo.orgIdPath.split('-');
            const result = group.filter((item) => {
                return groupList.indexOf(item) !== -1;
            });
            if (result.length) {
                return true;
            }
        }
        return false;
    }
}
</script>

<style lang="scss">
#layout {
    height: 100%;
    .tt-topnav {
        border-bottom: 0;
        box-shadow: 0 3px 6px 0 rgba(0, 0, 0, 0.04);
        z-index: 99;
        .el-menu-item * {
            vertical-align: top;
            text-decoration: none;
        }
        .nav-title {
            padding: 0 14px;
            font-size: 14px;
            font-family: PingFangSC-Medium;
        }
        & > .el-menu-item {
            height: 52px;
            border: none;
            padding: 0;
            line-height: 52px;
            font-family: PingFangSC-Regular;
            font-size: 14px;
            &.is-active {
                background: #17191c;
                font-family: PingFangSC-Semibold;
            }
            i.mtdicon::before {
                color: #f7f7f7;
            }
        }
        .tt-topnav-title {
            /* margin-right: 33px; */
            /* mv logo */
            margin-right: 23px;
            border: none;
            cursor: pointer;
            img {
                /* margin: 7px 0 7px 12px; */
                /* mv logo */
                margin: 7px 0 7px 22px;
                width: 22px;
                height: 22px;
                vertical-align: middle;
            }
            span {
                font-family: PingFangSC-Medium;
                font-size: 16px;
                color: #fff;
            }
        }
        .tt-topnav-portal {
            margin: 10px 0 10px 12px;
            height: 32px;
            width: 32px;
            line-height: 32px;
        }
        .tt-portal-hide {
            visibility: hidden;
        }
        .tt-topnav-tab {
            width: 196px;
            margin-left: 40px;
            .topnav-tabs {
                margin-top: 9px;
                .mtd-tabs-item-large {
                    line-height: 35px;
                }
            }
        }
        .tt-search-ticket {
            margin-left: 20px;
            .search-ticket-input {
                vertical-align: middle;
                width: 280px;
                .mtd-input-suffix-inner i {
                    vertical-align: middle;
                }
                input.mtd-input {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 4px;
                    border: none;
                    color: #f5f5f5;
                    &::-webkit-input-placeholder {
                        color: rgba(255, 255, 255, 0.36);
                    }
                    &:-moz-placeholder {/* Firefox 18- */
                        color: rgba(255, 255, 255, 0.36);
                    }
                    &::-moz-placeholder {/* Firefox 19+ */
                        color: rgba(255, 255, 255, 0.36);
                    }
                    &:-ms-input-placeholder {
                        color: rgba(255, 255, 255, 0.36);
                    }
                }
            }
        }
        .tt-create-ticket {
            float: right;
            margin-right: 20px;
            button.mtd-btn.mtd-btn-primary {
                height: 28px;
                margin: 9px 0;
                padding: 0 10px;
                background: #1c6cdc;
                border-radius: 4px;
                border-color: #1c6cdc;
                span {
                    font-size: 12px;
                    line-height: 28px;
                }
                .mtdicon::before {
                    margin-right: 4px;
                    font-size: 16px;
                    line-height: 28px;
                    color: white;
                    position: relative;
                }
            }
            &:hover {
                color: #1c6cdc;
            }
            .create-tt-link {
                display: inline-block;
                margin: 11px 0;
                padding: 0 12px;
                color: rgba(0, 0, 0, 0.84);
                line-height: 30px;
                font-size: 14px;
                background: #ffc300;
                border-radius: 4px;
                font-family: PingFangSC-Medium;
                .mtdicon-add {
                    vertical-align: middle;
                    font-weight: bold;
                    margin-right: 4px;
                    &::before {
                        color: rgba(0, 0, 0, 0.84);
                    }
                }
                span {
                    vertical-align: middle;
                }
                &:hover {
                    text-decoration: none;
                    background: #ffd420;
                    border-color: #ffd420;
                }
            }
        }
        .tt-topnav-link {
            float: right;
            color: rgba(0, 0, 0, 0.6);
            transition: color 0s;
            font-weight: normal;
            font-size: 14px;
            margin-right: 14px;
            a {
                text-decoration: none;
            }
            i {
                margin-right: 6px;
                font-size: 20px;
                font-weight: normal;
                color: #f7f7f7;
                vertical-align: middle;
            }
            &:hover {
                color: #ffc300;
                i::before {
                    color: #ffc300;
                }
            }
        }
        .tt-topnav-img {
            float: right;
            margin-right: 24px;
            .tt-user-img {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                margin: 13px 0;
                vertical-align: middle;
            }
        }
        .menu-href {
            text-decoration: none;
        }
    }
    .mtd-tabs-nocard .mtd-tabs-bar {
        height: 3px;
    }
    .el-menu,
    .el-menu--horizontal > .el-menu-item:not(.is-disabled):focus,
    .el-menu--horizontal > .el-menu-item:not(.is-disabled):hover,
    .el-menu--horizontal > .el-submenu .el-submenu__title:hover {
        background: none;
    }
}
.logout-dropdown {
    a {
        text-decoration: none;
        color: rgba(0, 0, 0, 0.84);
    }
    .mtd-dropdown-menu-item {
        line-height: 32px;
        height: 36px;
        width: 154px;
    }
    .logout-text {
        margin-right: 20px;
        vertical-align: text-bottom;
        color: rgba(0, 0, 0, 0.84);
    }
    .logout-link {
        text-decoration: none;
    }
    .nav-handover-wrapper {
        line-height: 32px;
        height: 36px;
        padding: 0 16px;
        text-align: left;
        cursor: pointer;
        position: relative;
        &:hover {
            background-color: rgba(0, 0, 0, 0.04);
            color: rgba(0, 0, 0, 0.84);
        }
        .mtdicon {
            position: absolute;
            right: 16px;
            top: 10px;
        }
    }
    .handover-link-item {
        line-height: 32px;
        height: 36px;
        padding-left: 32px;
        a {
            width: 100%;
        }
        &:hover {
            background-color: rgba(0, 0, 0, 0.04);
            color: rgba(0, 0, 0, 0.84);
        }
    }
    .handover-link-item-single {
        padding-left: 16px;
    }
}
.common-problems-popper {
    padding: 6px 0;
    min-width: 214px;
    h4 {
        padding: 0 16px;
        font-family: PingFangSC-Medium;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.84);
        letter-spacing: 0;
        text-align: justify;
        line-height: 22px;
    }
    .problems-list a {
        display: block;
        padding: 0 16px;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.84);
        line-height: 28px;
        text-decoration: none;
    }
    .problems-list {
        padding: 6px 0;
    }
    .learn-more {
        display: block;
        padding: 4px 0;
        border-top: 1px solid rgba(0, 0, 0, 0.06);
        font-family: PingFangSC-Medium;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.84);
        text-align: center;
        line-height: 22px;
        text-decoration: none;
        i {
            font-size: 16px;
        }
    }
}
</style>
