<template>
    <div style="height: 100%; overflow-y: auto;">
        <div class="related-tt-wrap">
            <span v-if="!isCollapse" class="related-tt-title">{{ $getText('handle_tt_sidebar_header', '工单管理') }}</span>
            <span v-if="!isCollapse" class="related-tt-num">
                <mtd-tooltip
                    :content="$getText('handle_tt_sidebar_refresh', '刷新数据')"
                    size="small"
                    placement="right">
                    <mtd-icon
                        class="reload-icon"
                        name="refresh-o"
                        v-lxay
                        lxay-act="moduleClick"
                        lxay-bid="b_techportal_nc10hc3y_mc"
                        @click="refreshTTNum" />
                </mtd-tooltip>
            </span>
        </div>
        <mtd-menu
            v-model="activeName"
            class="tt-sidemenu"
            :collapse="isCollapse"
            :default-expanded-names="defaultExpandedNames"
            @select="handleSelect"
            mode="inline"
            :accordion="true">
            <mtd-menu-item
                name="todo"
                v-lxay
                lxay-act="moduleClick"
                :lxay-bid="isHandle ? 'b_techportal_ujmvxn0l_mc' : 'b_techportal_5y1kvjq6_mc'"
                :filter="$getText('handle_tt_sidebar_my_todo', '我的待处理TT')"
                :num="relatedTTNum.unresolved">
                <i slot="icon" class="mtdicon mtdicon-time-o" />
                <span>{{ $getText('handle_tt_sidebar_my_todo', '我的待处理TT') }}</span>
                <span class="related-tt-num">{{ relatedTTNum.unresolved || 0 }}</span>
            </mtd-menu-item>
            <mtd-menu-item
                name="mine"
                v-lxay
                lxay-act="moduleClick"
                :lxay-bid="isHandle ? 'b_techportal_h2l15mz0_mc' : 'b_onecloud_oo7v868o_mc'"
                :filter="$getText('handle_tt_sidebar_assign_to_me', '指派给我的TT')"
                :num="relatedTTNum.assigned">
                <i slot="icon" class="mtdicon mtdicon-avatar-add" />
                <span>{{ $getText('handle_tt_sidebar_assign_to_me', '指派给我的TT') }}</span>
                <span class="related-tt-num">{{ relatedTTNum.assigned || 0 }}</span>
            </mtd-menu-item>
            <mtd-menu-item
                name="favor"
                v-lxay
                lxay-act="moduleClick"
                :lxay-bid="isHandle ? 'b_techportal_uvb5xcxs_mc' : 'b_onecloud_mqjt7snq_mc'"
                :filter="$getText('handle_tt_sidebar_cc_me', '抄送给我的TT')"
                :num="relatedTTNum.cc"
                v-if="inside">
                <i slot="icon" class="mtdicon mtdicon-file-import" />
                <span>{{ $getText('handle_tt_sidebar_cc_me', '抄送给我的TT') }}</span>
                <span class="related-tt-num">{{ relatedTTNum.cc || 0 }}</span>
            </mtd-menu-item>
            <mtd-menu-item
                name="createdBy"
                v-lxay
                lxay-act="moduleClick"
                :lxay-bid="isHandle ? 'b_techportal_q9bl5e0j_mc' : 'b_onecloud_e6jt4yi2_mc'"
                :filter="$getText('handle_tt_sidebar_init_by_me', '我发起的TT')"
                :num="relatedTTNum.reporter"
                v-if="inside">
                <i slot="icon" class="mtdicon mtdicon-avatar-o" />
                <span>{{ $getText('handle_tt_sidebar_init_by_me', '我发起的TT') }}</span>
                <span class="related-tt-num">{{ relatedTTNum.reporter || 0 }}</span>
            </mtd-menu-item>
            <mtd-menu-item
                name="joinBy"
                :filter="$getText('handle_tt_sidebar_transfer_by_me', '我流转的TT')"
                :num="relatedTTNum.join"
                v-lxay
                lxay-act="moduleClick"
                :lxay-bid="isHandle ? 'b_techportal_wp2q7m4j_mc' : 'b_techportal_mt4x7jlv_mc'"
                v-if="inside">
                <i slot="icon" class="mtdicon mtdicon-rotate" />
                <span>{{ $getText('handle_tt_sidebar_transfer_by_me', '我流转的TT') }}</span>
                <span class="related-tt-num">{{ relatedTTNum.join || 0 }}</span>
            </mtd-menu-item>
            <mtd-menu-item
                name="all"
                class="all-ticket-item"
                :filter="$getText('handle_tt_sidebar_all', '全部TT')"
                v-lxay
                lxay-act="moduleClick"
                :lxay-bid="isHandle ? 'b_techportal_7ct64ux0_mc' :'b_techportal_nj686dt2_mc'"
                v-if="inside">
                <i slot="icon" class="mtdicon mtdicon-theme-o" />
                <span>{{ $getText('handle_tt_sidebar_all', '全部TT') }}</span>
            </mtd-menu-item>
            <mtd-menu-item
                name="rg"
                :filter="$getText('handle_tt_sidebar_my_rg_filter', '我所在的RG')"
                v-lxay
                lxay-act="moduleClick"
                lxay-bid="b_techportal_x9pttsc2_mc"
                class="my-rg-title"
                v-if="myRgList.length && !isCollapse">
                <i slot="icon" class="iconfont icon-RG" />
                <span>{{ $getText('handle_tt_sidebar_my_rg', '我所在服务组(RG)') }}</span>
            </mtd-menu-item>
            <mtd-submenu
                name="rg"
                class="my-rg-menu"
                v-if="myRgList.length">
                <mtd-menu-item
                    class="rg-menu-item"
                    v-lxay
                    lxay-act="moduleClick"
                    lxay-bid="b_onecloud_z5wk66qm_mc"
                    v-for="item in myRgList"
                    :key="item.rgId"
                    :name="`${item.rgId}`"
                    :filter="item.rgName"
                    :num="item.ticketNumber ">
                    <span>{{ item.rgName }}</span>
                    <span class="related-tt-num rg-tt-num">{{ item.ticketNumber || 0 }}</span>
                </mtd-menu-item>
            </mtd-submenu>
            <mtd-menu-item
                name="space"
                :filter="$getText('handle_tt_sidebar_my_space', '我所在的空间')"
                v-lxay
                lxay-act="moduleClick"
                lxay-bid="b_techportal_2jsd0nxg_mc"
                :class="['my-space-title', {'auto-position': myRgList.length === 0}]"
                v-if="mySpaceList.length && !isCollapse">
                <i slot="icon" class="mtdicon mtdicon-star-o" />
                <span>{{ $getText('handle_tt_sidebar_my_space', '我所在的空间') }}</span>
            </mtd-menu-item>
            <mtd-submenu
                name="space"
                :class="['my-space-menu', {'auto-position': myRgList.length === 0}]"
                v-if="mySpaceList.length">
                <mtd-menu-item
                    class="space-menu-item"
                    v-for="item in mySpaceList"
                    :key="item.id"
                    :name="`space-${item.id}`"
                    :filter="item.name"
                    v-lxay
                    lxay-act="moduleClick"
                    lxay-bid="b_techportal_7e3n48ma_mc">
                    <span>{{ item.name }}</span>
                </mtd-menu-item>
            </mtd-submenu>
        </mtd-menu>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { State, Mutation, Getter } from 'vuex-class';
import { LIST_PAGE_TILTE_MAP, ticketNumToSidebar } from '@/config/map.conf';
import * as api from '@/api';

@Component
export default class SideBar extends Vue {
    @Prop({ required: false, default: false }) isCollapse: boolean;
    @State(state => state.tt.title) title: string;
    @Mutation setTtListTitle;
    @Mutation setMySpaces;
    @Mutation setMyRgs;
    @Mutation setMySpaceList;
    @Getter spaceDomain;
    @Getter inside;
    @Getter language;

    activeName: string = 'todo';
    mis: string = '';
    name: string = '';
    myRgList: CommonTypes.MyRgItem[] = [];
    mySpaceList: CommonTypes.SpaceItem[] = [];

    relatedTTNum: object = {};
    defaultExpandedNames: string[] = [];

    hasGetNum: boolean = false;

    mounted () {
        this.sidebarInit();
    }

    get isHandle () {
        return this.$route.name === 'tt_handle';
    }

    @Watch('language', { immediate: true })
    handleLanguageChange () {
        console.log('change language');
        this.initFilterName();
    }

    @Watch('$route', { immediate: true })
    onRouteChanged (to, from) {
        this.activeName = to.query.filter || 'todo';
        if (from && to.name !== from.name) {
            this.initFilterName();
        }
    }

    async sidebarInit () {
        await this.getMyRgAndNum();
        await this.getMySpace();
        this.mountSubmenuExpand();
        this.$route.query.filter !== 'inMyTodo' && this.initFilterName();
    }

    async initFilterName () {
        const key = this.$route.query.filter || 'todo';
        let title = this.$getText('handle_tt_sidebar_filter', '筛选');
        let num = null;
        await this.getTtNum();
        if (LIST_PAGE_TILTE_MAP[key]) { // 是「我的tt」
            title = this.$getText(LIST_PAGE_TILTE_MAP[key]);
            const numKey = ticketNumToSidebar[key];
            num = this.relatedTTNum[numKey];
        } else if (key.includes('space-')) { // 是空间
            const spaceId = key.split('space-')[1];
            let matched = this.mySpaceList.find(item => item.id.toString() === spaceId);
            title = matched.name;
        } else if (!isNaN(key)) { // 是rg
            const rgId = key;
            let matched = this.myRgList.find(item => item.rgId.toString() === rgId);
            title = matched && matched.rgName;
        }
        this.setFilterTitle(title, num);
    }

    mountSubmenuExpand () {
        const filter = this.$route.query.filter;
        if (filter && !isNaN(filter)) {
            this.defaultExpandedNames = ['rg'];
        }
        if (filter && filter.includes('space-')) {
            this.defaultExpandedNames = ['space'];
        }
    }

    async getMySpace () {
        try {
            const res: Ajax.AxiosResponse = await api.spaceApi.getMySpace();
            this.mySpaceList = res.data.items;
            const spaceIds = this.mySpaceList.map(item => item.id);
            this.setMySpaces(spaceIds);
            this.setMySpaceList(this.mySpaceList);
        } catch (e) {
            console.log(e);
        }
    }
    async getMyRgAndNum () {
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.getMyRgAndNum();
            this.myRgList = res.data.items;
            const rgIds = this.myRgList.map(item => item.rgId);
            this.setMyRgs(rgIds);
        } catch (e) {
            console.log(e);
        }
    }

    // 获取与我相关的tt的数量
    async getTtNum () {
        this.hasGetNum = true;
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.getRelatedTT();
            this.relatedTTNum = res.data;
        } catch (e) {
            console.log(e);
        }
    }
    handleSelect (el: any) {
        const key = el.name;
        const routeName = this.$route.name;
        const filter = this.$route.query.filter;
        let newQuery = { filter: key };
        console.log('filter', filter, 'key', key);
        // 如果侧边tab没切换，id保留
        if (key === filter) {
            let routeQuery = JSON.parse(JSON.stringify(this.$route.query));
            newQuery = Object.assign(routeQuery, {
                filter: key
            });
        }
        this.setFilterTitle(el.$attrs.filter, el.$attrs.num);
        this.$router.push({
            name: routeName,
            params: {
                space: this.spaceDomain
            },
            query: newQuery
        }).catch(e => e);
    }

    refreshTTNum () {
        this.getTtNum();
    }

    setFilterTitle (name, num) {
        let filterTitle = num ? `${name || this.$getText('handle_tt_sidebar_filter', '筛选')} <span>(${num})</span>` : (name || this.$getText('handle_tt_sidebar_filter', '筛选'));
        this.setTtListTitle(filterTitle);
    }
}
</script>

<style lang="scss">
.related-tt-wrap {
    position: relative;
    padding: 0 16px 0 14px;
    height: 52px;
    line-height: 52px;
    .reload-icon {
        position: absolute;
        top: 19px;
        right: 16px;
        cursor: pointer;
        color: rgba(0, 0, 0, 0.36);
    }
}
.related-tt-title {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.36);
    font-family: PingFangSC-Medium;
}
.related-tt-num {
    // position: relative;
    float: right;
    color: rgba(0, 0, 0, 0.36);
}
.sub-title {
    display: inline-block;
    width: 108px;
}
.mtd-menu-light .mtd-menu-item-active::before,
.mtd-menu-light .mtd-submenu-active::before {
    // background: none !important;
    width: 0;
}
.mtd-menu-light .mtd-menu-item-title.hover,
.mtd-menu-light .mtd-menu-item-title:hover,
.mtd-menu-light .mtd-submenu-title.hover,
.mtd-menu-light .mtd-submenu-title:hover {
    color: rgba(0, 0, 0, 0.84) !important;
}
.tt-sidemenu {
    height: auto;
    border-right: none;
    background-color: #fff;
    padding: 0 4px;
    .mtd-menu-item,
    .mtd-submenu__title {
        height: 40px;
        line-height: 40px;
        color: rgba(0, 0, 0, 0.6);
        background-color: #fff;
        .mtd-submenu__icon-arrow {
            margin-top: -5px;
        }
    }
    .mtd-menu-item:hover {
        color: rgba(0, 0, 0, 0.84) !important;
        background: #f5f5f5;
        .mtdicon {
            color: rgba(0, 0, 0, 0.84);
        }
    }
    .mtd-menu-item.mtd-menu-item-active {
        // background-color: rgba(0, 0, 0, 0.06);
        font-family: PingFangSC-Semibold;
        .mtd-menu-item-title {
            // display: block;
            background-color: #f5f5f5;
            border-radius: 4px;
            color: rgba(0, 0, 0, 0.84);
            // border: 1px solid  #999;
            &:hover {
                background-color: #f5f5f5;
                border-radius: 4px;
                color: rgba(0, 0, 0, 0.84);
            }
        }
    }
    .mtd-menu-item-title {
        padding: 0 12px !important;
        align-items: flex-start;
        color: rgba(0, 0, 0, 0.84);
        font-weight: 400;
        font-family: PingFangSC-Regular;
        .mtd-menu-item-icon {
            i {
                color: rgba(0, 0, 0, 0.84);
                font-weight: 600;
                vertical-align: top;
                line-height: 40px;
            }
        }
    }
    // .mtd-submenu-title {
    //     padding-left: 14px !important;
    // }
    .mtd-submenu .mtd-menu-item {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        i {
            font-size: 10px;
        }
    }
    .my-rg-title,
    .my-space-title {
        z-index: 1;
    }
    .my-rg-menu,
    .my-space-menu {
        position: relative;
        top: -40px;
        .mtd-tooltip-rel {
            position: relative;
            margin-left: auto;
            display: block;
            width: 42px;
        }
        .mtd-submenu-title {
            padding: 0 !important;
            display: block;
            z-index: 2;
            .mtd-submenu-direction {
                border-radius: 50%;
                padding: 3px;
                &:hover {
                    background-color: rgba(0, 0, 0, 0.06);
                }
            }
        }
        .mtd-submenu-content {
            .mtd-tooltip-rel {
                width: 100%;
                float: none;
            }
        }
    }
    .my-space-title {
        top: -40px;
    }
    .my-space-menu {
        top: -80px;
    }
    .auto-position {
        top: 0 !important;
        &.my-space-menu {
            top: -40px !important;
        }
    }
    .all-ticket-item {
        border-top: 1px solid rgba(0, 0, 0, 0.06);
    }
}
.mtd-popper.mtd-menu.mtd-menu-vertical.mtd-submenu-dropdown.mtd-popper-show-arrow {
    max-height: 250px;
    overflow-y: scroll;
}
.mtd-popper.mtd-popper-show-arrow.mtd-menu.mtd-menu-light.mtd-menu-vertical.mtd-submenu-dropdown {
    display: none;
}
</style>
