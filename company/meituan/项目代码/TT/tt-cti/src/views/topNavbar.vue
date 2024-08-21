<template>
    <div class="top-navbar">
        <el-menu
            :default-active="activeIndex"
            class="tt-topnav"
            mode="horizontal"
            background-color="#2E2E2E"
            text-color="#999999"
            active-text-color="#fff">
            <li
                v-if="portalAccess"
                class="el-menu-item tt-topnav-portal"
                :class="[menuUserInfo.mis&&menuUserInfo.org?'':'tt-portal-hide']">
                <DynamicComponent
                    edc-id="ee-portal-component"
                    :user-info="menuUserInfo"
                    :edc-use-loading="false" />
            </li>
            <li @click="redirectTt" class="el-menu-item tt-topnav-title">
                <img src="@/assets/img/logo.png" alt="">
                <span style="margin-left: 8px;">
                    {{ $getText('cti_top_nav_title','问题流转工具') }}
                </span>
            </li>
            <el-menu-item
                v-for="item in navList"
                :key="item.value"
                :index="item.value">
                <a
                    :href="getHrefLink(item.value)"
                    class="menu-href">
                    <div class="nav-title">
                        {{ $getText(item.label) }}
                    </div>
                </a>
            </el-menu-item>
            <li class="el-menu-item tt-search-ticket">
                <mtd-input
                    class="search-ticket-input"
                    @click-suffix="handleSearch"
                    @keyup.enter="handleSearch"
                    prefix-icon="iconfont el-icon-search icon-search1"
                    v-model="ticket"
                    :placeholder="$getText('cti_top_nav_input_placeholder', '搜索标题、工单id')" />
            </li>
            <li class="el-menu-item tt-topnav-img">
                <mtd-dropdown
                    v-model="imgVisible"
                    popper-class="logout-dropdown"
                    placement="bottom-end">
                    <img
                        class="tt-user-img"
                        :src="defaultAvatar">
                    <mtd-dropdown-menu slot="dropdown">
                        <div v-if="hasMyHandover && hasMemberHandover">
                            <div class="nav-handover-wrapper" @click="showChildren = !showChildren">
                                <span>{{ $getText('cti_top_nav_avatar_transfer', '工作交接') }}</span>
                                <i :class="`mtdicon ${showChildren ? 'mtdicon-down-thick' : 'mtdicon-up-thick'}`" />
                            </div>
                            <mtd-collapse-transition>
                                <div class="handover-list">
                                    <div v-show="showChildren" class="handover-link-item">
                                        <a  :href="myHandoverUrl">
                                            <span class="handover-text">{{ $getText('cti_top_nav_avatar_transfer_my', '我的工作交接') }}</span>
                                        </a>
                                    </div>
                                    <div v-show="showChildren" class="handover-link-item">
                                        <a  :href="memberHandoverUrl">
                                            <span class="handover-text">{{ $getText('cti_top_nav_avatar_transfer_colleague', '组员的工作交接') }}</span>
                                        </a>
                                    </div>
                                </div>
                            </mtd-collapse-transition>
                        </div>
                        <div v-else-if="hasMyHandover || hasMemberHandover" class="handover-link-item handover-link-item-single">
                            <a  :href="hasMyHandover ? myHandoverUrl : memberHandoverUrl">
                                <span class="handover-text">{{ this.hasMyHandover ? this.$getText('cti_top_nav_avatar_transfer_my', '我的工作交接') : this.$getText('cti_top_nav_avatar_transfer_colleague', '组员的工作交接') }}</span>
                            </a>
                        </div>
                        <mtd-dropdown-menu-item>
                            <a class="logout-link" :href="logoutUrl">
                                <span class="logout-text">{{ this.$getText('cti_top_nav_sign_out','退出登录') }}</span>
                            </a>
                        </mtd-dropdown-menu-item>
                    </mtd-dropdown-menu>
                </mtd-dropdown>
            </li>
            <li class="el-menu-item tt-topnav-link">
                <mtd-tooltip
                    :content="$getText('cti_top_nav_response','反馈')"
                    size="small"
                    placement="bottom">
                    <a target="_blank" :href="callBackUrl"><i class="iconfont icon-customer" /></a>
                </mtd-tooltip>
            </li>
            <li class="el-menu-item tt-topnav-link">
                <mtd-tooltip
                    :content="$getText('cti_top_nav_help','帮助')"
                    size="small"
                    placement="bottom">
                    <a target="_blank" :href="getHelpUrl"><i class="iconfont icon-problem" /></a>
                </mtd-tooltip>
            </li>
            <li
                v-lxay
                lxay-act="moduleClick"
                lxay-bid="b_onecloud_scw2vcdy_mc"
                class="el-menu-item tt-create-ticket">
                <a
                    class="create-tt-link"
                    :href="getBaseURL+'/ticket/create'">
                    <i class="mtdicon mtdicon-add" /><span>{{ $getText('cti_top_nav_init_tt','发起TT') }}</span>
                </a>
            </li>
        </el-menu>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { State, Mutation } from 'vuex-class';
import { Menu, MenuItem } from 'element-ui';
import { DEFAULT_AVATAR, NavBar, NavBarWithQuality } from '@/config/map.conf';
import * as api from '@/api';
Vue.use(Menu);
Vue.use(MenuItem);

@Component
export default class TopNav extends Vue {
    @State(state => state.cti.language)
    language: string;

    @State(state => state.cti.env)
    env: string;
    @State(state => state.cti.userInfo)
    userInfo: CommonTypes.UserInfoItem;
    @Prop({ default: DEFAULT_AVATAR, required: false })
    userAvatar: string;
    @Mutation setLanguage;

    @Watch('userAvatar')
    handlerAvatarChange (val) {
        if (val) {
            this.defaultAvatar = val;
        }
    }

    activeIndex: string = 'cti';
    defaultAvatar: string = DEFAULT_AVATAR;
    logoutUrl: string = '/sso/logout';
    imgVisible: boolean = false;
    ticket: string = '';
    navList: any = NavBar;
    // 工作交接
    hasMyHandover: boolean = false;
    hasMemberHandover: boolean = false;
    showChildren: boolean = false;

    get getBaseURL () {
        return this.env === 'prod' ? '//tt.sankuai.com' : (this.env === 'test' ? '//tt.cloud.test.sankuai.com' : '//tt.fetc.st.sankuai.com');
    }
    get callBackUrl () {
        if (this.language === 'en') return 'https://tt.sankuai.com/ticket/create?cid=17&tid=4348&iid=37613';
        else return '//tt.sankuai.com/ticket/create?cid=112&tid=2190&iid=9397';
    }
    get myHandoverUrl () {
        return `${this.getBaseURL}/ticket/my/handover`;
    }
    get memberHandoverUrl () {
        return `${this.getBaseURL}/ticket/member/handover`;
    }

    get getHelpUrl () {
        return this.language === 'en' ? 'https://km.sankuai.com/collabpage/2218074023' : 'https://km.sankuai.com/page/1004881018';
    }

    handleSearch () {
        if (!this.ticket) {
            return;
        }
        window.location.href = `${this.getBaseURL}/ticket/search?name=${this.ticket}`;
    }

    redirectTt () {
        window.location.href = `${this.getBaseURL}`;
    }
    created () {
        this.getHandoverStatus();
        this.getQualityInspectionStatus();
        this.handleLanguage();
    }
    async handleLanguage () {
        /*
        * 和 tt-fe 工程逻辑保持一致
        */
        let newLanguage = '';
        // let newTimeZone = '';
        try {
            // 获取用户时区，提前设置时区信息
            const res = await api.preferenceApi.getUserLanguage();
            const { code, data } = res;
            if (code === 200 && data) {
                newLanguage = data.locale || '';
                // newTimeZone = data.timeZone || '';
            }
        } catch (error) {
            console.error('Get language setting error', error);
        }
        if (!newLanguage) {
            const userLang = navigator.language || navigator.userLanguage;
            if (userLang) {
                const enLangRegex = /^en(-[a-zA-Z]+)?$/;
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
    }
    async getHandoverStatus () {
        const res: any = await api.ctiApi.hasHandover();
        const { code, data } = res;
        if (code === 200 && data) {
            // 如果有两项，展示 工作交接
            this.hasMyHandover = data.myHandover || false;
            this.hasMemberHandover = data.memberHandover || false;
        }
    }
    async getQualityInspectionStatus() {
        // 判断是否展示质检TT
        const res: any = await api.inspectApi.getUserPermission();
        const { code, data } = res;
        if (code === 200 && data) {
            if (data.role && data.role.length) {
                this.navList = NavBarWithQuality;
            }
        }
    }

    getHrefLink (val) {
        let link = '';
        switch (val) {
            case 'handle':
                link = `${this.getBaseURL}/ticket/handle?filter=todo`;
                break;
            case 'filter':
                link = `${this.getBaseURL}/ticket/list?filter=todo`;
                break;
            case 'statistic':
                link = `${this.getBaseURL}/ticket/statistic/new`;
                break;
            case 'cti':
                link = 'javascript:void(0)';
                break;
            case 'quality':
                link = `${this.getBaseURL}/quality/inspection/list`;
                break;
            default:
                break;
        }
        return link;
    }
    get ctiUrl () {
        return this.env === 'prod' ? '//cti.sankuai.com' : '//cti.cloud.test.sankuai.com';
    }
    get menuUserInfo () {
        const targetInfo = {
            mis: this.userInfo.username,
            org: this.userInfo.orgId || ''
        };
        return targetInfo;
    }
    get portalAccess () {
        const whiteList:string[] = ['xiaoqian07', 'zhouxiaobo02', 'liuchen24', 'tanxiaosong'];
        if (this.userInfo.username && whiteList.includes(this.userInfo.username)) {
            return true;
        }
        const groupList:string[] = ['150053', '162994', '40000922', '108635', '1020422', '150858', '114426', '40004401'];
        if (this.userInfo.orgIdPath) {
            const group:string[] = this.userInfo.orgIdPath.split('-');
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
.top-navbar {
    .menu-href {
        text-decoration: none;
    }
    .el-menu--horizontal {
        .el-menu-item {
            &.is-active {
                border-bottom: 2px solid transparent !important;
            }
        }
    }
    .icon-search1 {
        margin-top: 6px;
    }
    .icon-search1::before {
        color: #555555;
    }
    .tt-search-ticket {
        margin-left: 20px;
        .search-ticket-input {
            vertical-align: initial;
            width: 240px;
            .mtd-input-prefix-inner {
                width: 28px;
                height: 28px;
                line-height: 28px;
                .icon-search1 {
                    // vertical-align: text-top;
                    color: #555555;
                    &::before {
                        color: #555555;
                    }
                }
            }
            input.mtd-input {
                line-height: 28px;
                background: #F7F7F7;
                height: 28px;
                border-radius: 4px;
                border: none;
            }
        }
    }
    .el-menu,
    .el-menu--horizontal > .el-menu-item:not(.is-disabled):focus,
    .el-menu--horizontal > .el-menu-item:not(.is-disabled):hover,
    .el-menu--horizontal > .el-submenu .el-submenu__title:hover {
        background: none;
    }
}
.tt-topnav {
    border-bottom: 0;
    box-shadow: 0 3px 6px 0 rgba(0, 0, 0, 0.04);
    z-index: 99;
    .el-menu-item * {
        vertical-align: top;
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
            background: #17191C;
            font-family: PingFangSC-Semibold;
        }
        i.iconfont::before {
            color: #F7F7F7;
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
            color: #FFFFFF;
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
            vertical-align: initial;
            width: 240px;
            .mtd-input-prefix-inner {
                width: 28px;
                height: 28px;
                line-height: 28px;
                .icon-search1 {
                    // vertical-align: text-top;
                    color: #555555;
                    &::before {
                        color: #555555;
                    }
                }
            }
            input.mtd-input {
                line-height: 28px;
                background: #F7F7F7;
                height: 28px;
                border-radius: 4px;
                border: none;
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
            background: #FF8800;
            border-radius: 4px;
            border-color: #FF8800;
            span {
                font-size: 12px;
                line-height: 28px;
            }
            .iconfont::before {
                margin-right: 4px;
                font-size: 16px;
                line-height: 28px;
                color: white;
                position: relative;
            }
        }
        &:hover {
            color: #FF8800;
        }
        .create-tt-link {
            display: inline-block;
            margin: 11px 0;
            padding: 0 12px;
            color: rgba(0, 0, 0, 0.84);
            line-height: 30px;
            font-size: 14px;
            background: #FFC300;
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
                background: #FFD420;
                border-color: #FFD420;
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
            color: #808AB1;
            vertical-align: bottom;
        }
        &:hover {
            color: #FFC300;
            i::before {
                color: #FFC300;
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
    .icon-CTIRG {
        font-size: 16px;
        color: #474B5A;
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
        color: #FFFFFF;
    }
}
</style>
