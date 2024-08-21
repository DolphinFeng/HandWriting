<template>
    <div class="rg-sla-container" v-if="permission">
        <div class="sla-notice">
            <div class="title">SLA 等级说明</div>
            <div>SLA 是 Service Level Agreement（服务等级协议）的简称，工单各项目下处理员与用户订立的服务质量指标，承诺对特定的服务目录，在各个优先级下，多长时间响应，多长时间解决。请谨慎设置本团队的 SLA 等级和对应时间，来要求和衡量自己的团队，同时作为对用户的承诺。</div>
        </div>
        <div style="margin-top: 10px; text-align: right;">
            <mtd-tooltip
                placement="top-start">
                <div slot="content" class="sla-tip-content">
                    <h5>工作时间</h5>
                    <p style="margin-bottom: 10px;">除勾选的时间外，默认都是非工作时间，法定节假日会默认为非工作时间，如需节假日值班，请设置添加节假日。工作时间设置成功后，统计分析里会增加该服务组工作时间的响应时长。</p>
                    <h5>等级</h5>
                    <p>团队的 SLA 就按照每个等级后面设置好的响应时长和解决时长执行，超时会升级。同时支持设置非工作紧急等级的 SLA。</p>
                </div>
                <span class="noun-explain"><i class="mtdicon mtdicon-question-circle-o" />名词解释</span>
            </mtd-tooltip>
        </div>
        <mtd-tabs v-model="activeTab" @tab-click="handleTabClick">
            <mtd-tab-pane label="等级" value="level">
                <level v-if="activeTab === 'level'" />
            </mtd-tab-pane>
            <mtd-tab-pane label="工作时间" value="workTime">
                <workTime v-if="activeTab === 'workTime'" />
            </mtd-tab-pane>
            <mtd-tab-pane label="非工作时间" value="nonWorking">
                <nonWorking v-if="activeTab === 'nonWorking'" />
            </mtd-tab-pane>
            <mtd-tab-pane label="升级提醒" value="raiseNotice">
                <raise-notice-setting v-if="activeTab === 'raiseNotice'" />
            </mtd-tab-pane>
            <mtd-tab-pane label="工单预提醒" value="preRemindNotice">
                <pre-remind-setting v-if="activeTab === 'preRemindNotice'" />
            </mtd-tab-pane>
        </mtd-tabs>
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import workTime from './sla/workTime.vue';
import raiseNoticeSetting from './sla/raise-notice-setting.vue';
import nonWorking from './sla/nonWorking.vue';
import preRemindSetting from './sla/pre-remind-setting.vue';
import level from './sla/level.vue';

type TabName = 'level' | 'workTime' | 'nonWorking' | 'raiseNotice' | 'preRemindNotice';

const sanitilizeTab = (tabQuery: any) => {
    if (['level', 'workTime', 'raiseNotice', 'nonWorking', 'preRemindNotice'].includes(tabQuery)) {
        return tabQuery;
    }
    return 'level';
};

/**
 * sla设置
 *
 * @author liyuyao
 * @date 01/11/2019
 */
@Component({
    components: {
        workTime,
        raiseNoticeSetting,
        nonWorking,
        level,
        preRemindSetting
    }
})
export default class RgSla extends Vue {
    @State(state => state.cti.permission.rg_report)
    permission: boolean;

    activeTab: TabName = null;

    created () {
        const initialTab = sanitilizeTab(this.$route.query.tab);
        this.activeTab = initialTab;
        this.changeTabQuery(initialTab);
    }

    changeTabQuery (tab: string) {
        this.$router.push({
            query: {
                ...this.$route.query,
                tab
            }
        }).catch(e => e);
    }

    get rgId () {
        return parseInt(this.$route.query.rgId as string, 10);
    }

    handleTabClick (_: MouseEvent, tab: { value: TabName }) {
        this.changeTabQuery(tab.value);
    }
}
</script>

<style lang="postcss">
.rg-sla-container {
    position: relative;
    margin-top: 8px;
    .sla-notice {
        padding: 8px 12px;
        font-size: 12px;
        background: #EEF6FF;
        border-radius: 2px;
        color: #0A3C8C;
        .title {
            font-weight: bold;
        }
    }
    .noun-explain {
        font-size: 12px;
        font-weight: bold;
        cursor: pointer;
    }
}
.sla-tip-content {
    font-size: 12px;
}
</style>
