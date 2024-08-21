<template>
    <div class="rg-detail-container">
        <rg-info />
        <mtd-tabs v-model="activeName" @tab-click="handleChangeTab">
            <mtd-tab-pane label="绑定目录" value="rg_catalog" />
            <mtd-tab-pane label="RG成员" value="rg_user" />
            <mtd-tab-pane :label="`${isNewVersion ? '值班管理' : '值班组'}`" value="rg_oncall" />
            <mtd-tab-pane label="模板管理" value="rg_template" />
            <mtd-tab-pane
                label="通知报表"
                value="rg_report"
                v-show="permission.rg_report" />
            <mtd-tab-pane
                label="触发器"
                value="rg_trigger"
                v-show="permission.rg_trigger" />
            <mtd-tab-pane
                label="常用回复"
                value="rg_reply"
                v-show="permission.rg_reply" />
            <mtd-tab-pane
                label="问题归档"
                value="rg_file"
                v-show="permission.rg_file" />
            <mtd-tab-pane
                label="标签管理"
                value="rg_tag"
                v-show="permission.rg_label" />
            <mtd-tab-pane
                label="SLA等级"
                value="rg_sla"
                v-show="permission.rg_setting" />
            <mtd-tab-pane
                label="满意度"
                value="rg_satisfaction"
                v-show="permission.rg_satisfaction" />
            <mtd-tab-pane
                label="设置"
                value="rg_setting"
                v-show="permission.rg_setting" />
            <mtd-tab-pane label="大象相关设置" value="rg_dx" />
            <mtd-tab-pane label="操作日志" value="rg_history" />
            <mtd-tab-pane label="绑定机器人" value="rg_moses" />
            <mtd-tab-pane label="知识库配置" value="rg_brainpower" />
        </mtd-tabs>
        <router-view />
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import store from '@/store';
import RgInfo from './components/rg-info.vue';
import eventBus from '@/utils/event-bus';
import * as api from '@/api';
/**
 * RG详情tab页
 *
 * @author xiaokunyu
 * @date 01/11/2019
 */
@Component({
    components: {
        RgInfo
    }
})
export default class RgDetail extends Vue {
    @State(state => state.cti.permission)
    permission: CommonTypes.mapObject;

    activeName: string = '';
    isNewVersion: boolean = false;
    get rgId () {
        return parseInt(this.$route.query.rgId as string, 10);
    }
    created () {
        this.checkOncallVersion();
        this.getActiveTab();
        this.getRgPermission();
        // 切换路由时更新tab
        eventBus.$on('changeTabActive', this.handleChangeActive);
    }
    async checkOncallVersion () {
        const res = await api.ctiApi.switchOncall(this.rgId);
        if (res && res.code === 200) {
            this.isNewVersion = !!res.data;
            store.commit('GET_RG_ONCALL_VERSION', this.isNewVersion);
        }
    }
    getActiveTab () {
        const routeName = this.$route.name;
        this.activeName = routeName.split('_').slice(0, 2).join('_');
    }
    handleChangeTab () {
        this.$router.push({
            name: this.activeName,
            query: {
                rgId: `${this.rgId}`
            }
        }).catch(e => e);
    }
    handleChangeActive (activeName: string) {
        this.activeName = activeName;
    }
    async getRgPermission () {
        const res = await api.rgApi.getRgPermission(this.rgId);
        const { code, data } = res;
        if (code === 200) {
            store.commit('GET_USER_PERMISSION', data.permissionAll);
        }
    }
}
</script>

<style lang="postcss">
.rg-detail-container {
    margin: 0 20px;
    height: 100%;
    .table-link {
        padding: 0;
        min-width: 0;
        height: 14px;
        span {
            line-height: 14px !important;
        }
        &:hover {
            background: none;
        }
    }
    .quit-tag {
        color: #999999;
        font-size: 12px;
    }
}
</style>
