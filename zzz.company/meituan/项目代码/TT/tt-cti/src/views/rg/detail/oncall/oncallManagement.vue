<template>
    <div class="rg-oncall-container">
        <div v-if="isNewRgOncall" class="plan-switch">
            <mtd-tabs v-model="activeTab" @tab-click="handleChangeTab">
                <mtd-tab-pane
                    v-for="item in oncallTabs"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value" />
            </mtd-tabs>
            <router-view />
        </div>
        <oncall v-else />
    </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import SetOncallRule from '../components/set-oncall-rule.vue';
import OncallByPerson from '../components/oncall/oncall-by-person.vue';
import OncallByGroup from '../components/oncall/oncall-by-group.vue';
import Oncall from '../oncall.vue';
import { OncallSettingTabs } from '@/config/map.conf';
import { State } from 'vuex-class';
@Component({
    components: {
        SetOncallRule,
        OncallByPerson,
        OncallByGroup,
        Oncall
    }
})
export default class NewOncall extends Vue {
    @State(state => state.cti.isNewRgOncall)
    isNewRgOncall: boolean;

    oncallTabs: CommonTypes.mapObject[] = OncallSettingTabs;
    activeTab: string = 'rg_oncall_info';

    @Watch('isNewRgOncall')
    onStateChanged () {
        this.redirectNewOncall();
    }
    @Watch('$route.name', { immediate: true })
    onRouterChange (name) {
        if (this.validOncallTabNameList.includes(name)) {
            this.activeTab = name;
        }
    }
    created () {
        this.getActiveTab();
        this.redirectNewOncall();
    }
    redirectNewOncall () {
        if (this.isNewRgOncall && this.activeTab === 'rg_oncall') {
            this.activeTab = 'rg_oncall_info';
            this.$router.push({
                name: 'rg_oncall_info',
                query: {
                    rgId: `${this.rgId}`
                }
            }).catch(e => e);
        }
    }
    handleChangeTab () {
        this.$router.push({
            name: this.activeTab,
            query: {
                rgId: `${this.rgId}`
            }
        }).catch(e => e);
    }
    getActiveTab () {
        this.activeTab = this.$route.name;
    }
    get rgId () {
        return parseInt(this.$route.query.rgId as string, 10);
    }
    get validOncallTabNameList () {
        return this.oncallTabs.map(tab => tab.value);
    }
}
</script>

<style lang="postcss" scoped>
.rg-oncall-container {
    height: calc(100% - 135px);
    .plan-switch {
        margin: 8px 0;
        height: 100%;
    }
}
</style>
