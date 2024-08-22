<template>
    <div id="layout">
        <!-- main-content -->
        <mtd-container class="container">
            <mtd-header v-if="isTT" style="height: auto; padding: 0;">
                <top-nav />
            </mtd-header>
            <mtd-main
                class="cti-main"
                v-loading.fullscreen.lock="loading"
                element-loading-custom-class="tt-fullscreen-vloading-class">
                <router-view />
                <data-export v-if="downloadTasks.length" />
            </mtd-main>
        </mtd-container>
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import TopNav from '@/components/topnav.vue';

import * as api from '@/api';
import store from '../store';
import { State, Getter, Mutation } from 'vuex-class';
import DataExport from './ticket/components/data-export.vue';
import { lxReportClick } from '@/utils/directive/lxanaly';
import { OUTSIDE_ENTRANCE } from '@/config/lx_map.conf';
import { DEFAULT_AVATAR } from '@/config/map.conf';

/**
 * 页面布局
 *
 * @author wutong18
 * @date 24/04/2019
 */
@Component({
    components: {
        TopNav,
        DataExport
    }
})
export default class Layout extends Vue {
    @Getter misX;
    @Getter isPrivateSpace;
    @Getter spaceDomain;
    @Getter loginType;

    @State(state => state.tt.downloadTasks)
    downloadTasks: string[];

    @Mutation setCreateEntrance;
    @Mutation setCreateReferrer;

    loading: boolean = true;
    mis: string = '';

    created () {
        // 获取当前cti树版本
        this.getCtiVersion();
        // 上报外部来源
        this.setPageReferrer();
        if (!this.isTT) this.getUserInfo();
    }

    get isTT () {
        const ignoreHeaderList = ['tt_mini_detail', 'tt_mini_create', 'tt_detail_case'];
        return !ignoreHeaderList.includes(this.$route.name);
    }
    // 获取当前登录用户信息，存入store
    async getUserInfo () {
        try {
            const res: Ajax.AxiosResponse = await api.ctiApi.getUserInfo();
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
    // 获取当前用户头像，存入store
    async getUserAvatar () {
        const res: Ajax.AxiosResponse = await api.ctiApi.searchDisplayNameList([this.mis]);
        let { code, data } = res;
        if (code === 200) {
            let avatar = data[this.mis] && data[this.mis]['avatar'] || DEFAULT_AVATAR;
        }
        return avatar;
    }

    async getCtiVersion () {
        this.loading = true;
        const res: Ajax.AxiosResponse = await api.ctiApi.getCtiVersion();
        let { code, data } = res;
        if (code === 200) {
            this.loading = false;
            let version = data.version;
            store.commit('SET_CTI_VERSION', version);
            // 保存版本信息，用于下次预判是否为内部用户
            if (typeof localStorage === 'object') {
                try {
                    localStorage.lastVersion = version;
                } catch (error) {
                    console.log(error);
                }
            }
        }
    }
    setPageReferrer () {
        const routeName = this.$route.name;
        const referrer = document.referrer;
        if (!referrer || !['tt_create', 'tt_helpdesk_create'].includes(routeName)) return;
        const passTtReg = /^((?!tt\.).)*sankuai\.com((?!tt\.).)*$/.test(referrer);
        let passCtiReg = /^((?!cti\.).)*sankuai\.com((?!cti\.).)*$/.test(referrer);
        let passKMReg = /^((?!km\.).)*sankuai\.com((?!km\.).)*$/.test(referrer);
        // 00 摩西 01 外部系统 02 学城
        if (!passKMReg) {
            this.setCreateReferrer('02');
        }
        if (passTtReg && passCtiReg && passKMReg) {
            lxReportClick(OUTSIDE_ENTRANCE['other_system']);
            this.setCreateReferrer('01');
        }
    }
}
</script>

<style lang="scss">
#layout {
    height: 100%;
    .container {
        height: 100%;
        .el-header {
            height: 49px;
            padding: 0;
        }
        .cti-main {
            padding: 0;
            background: #f5f5f5;
        }
        .el-main {
            height: 100%;
        }
    }
}
.tt-fullscreen-vloading-class {
    background: none;
    .el-loading-spinner {
        display: none;
    }
}
</style>
