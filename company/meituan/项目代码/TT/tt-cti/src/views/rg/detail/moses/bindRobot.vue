<template>
    <div class="bind-robot-container">
        <mtd-tabs v-model="activeName" @tab-click="handleChangeTab">
            <mtd-tab-pane label="发起机器人" value="rg_moses_create_robot" />
            <mtd-tab-pane label="群聊机器人" value="rg_moses_group_robot" />
        </mtd-tabs>
        <router-view />
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component
export default class bindRobot extends Vue {
    activeName: string = '';
    created () {
        this.getActiveTab();
    }
    getActiveTab () {
        const routeName = this.$route.name;
        this.activeName = routeName;
    }
    handleChangeTab () {
        this.$router.push({
            name: this.activeName,
            query: {
                rgId: `${this.rgId}`
            }
        }).catch(e => e);
    }
    get rgId () {
        return parseInt(this.$route.query.rgId as string, 10);
    }
}
</script>
