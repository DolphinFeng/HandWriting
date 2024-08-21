<template>
    <div class="pre-remind-setting-container">
        是否开启预处理提醒：
        <mtd-switch
            v-model="preRemindOpen"
            @change="preRemindOpenChange"
            size="small"
            style="vertical-align: middle;" />
        <ul class="pre-remind-setting-wrapper" v-if="preRemindOpen">
            <PreRemindItem
                v-for="(item, index) in remindSettings"
                :key="index"
                :setting="item"
                ref="preRemindItem"
                @change="preRemindChange(arguments, index)"
                @delete="preRemindDelete(index)" />
        </ul>
        <mtd-button
            v-if="preRemindOpen"
            type="text"
            icon="mtdicon mtdicon-file-add-o"
            @click="addRemindItem">添加</mtd-button>
        <section class="actions">
            <mtd-button type="primary" @click="setPreRemindSetting">保存</mtd-button>
            <!-- <mtd-button @click="cancel">取消</mtd-button> -->
        </section>
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import * as api from '@/api';
import PreRemindItem from './preRemind.vue';
import { cloneDeep } from 'lodash';

const defaultPreSetting = {
    remindReceivers: {
        type: ['ASSIGNED'],
        username: []
    },
    slaLevel: 'S4',
    slaType: 'RESPONSE',
    timeUnit: 'MINUTE',
    timeValue: 10,
    receiversJoinDxGroup: false
};

@Component({
    components: {
        PreRemindItem
    }
})
export default class PreRemindSetting extends Vue {
    preRemindOpen: Boolean = false;
    remindSettings: Array<CommonTypes.PreRemindSettingItem> = [];
    remindSettingItems: Array<CommonTypes.PreRemindSettingItem> = [];

    created () {
        this.getPreRemindSetting();
    }
    async getPreRemindSetting () {
        const rgId = this.$route.query.rgId;
        const res = await api.ticketApi.getPreRemind({
            rgId: rgId
        });
        const { code, data } = res;
        if (code === 200) {
            this.remindSettings = data.items;
            if (this.remindSettings.length && this.remindSettings[0].active) {
                this.preRemindOpen = true;
                this.remindSettingItems = this.remindSettings;
            }
        }
    }
    preRemindOpenChange (val) {
        if (val) {
            this.remindSettingItems = this.remindSettings;
            if (!this.remindSettingItems.length) {
                this.$set(this.remindSettingItems, 0, defaultPreSetting);
            }
        }
    }
    preRemindChange (arg, index) {
        const setting = arg[0];
        this.$set(this.remindSettingItems, index, setting);
    }
    addRemindItem () {
        const pos = this.remindSettingItems.length;
        this.$set(this.remindSettingItems, pos, defaultPreSetting);
    }
    async validateAll () {
        const premindRefs = (this.$refs.preRemindItem || []) as any[];
        const responseTasks = premindRefs.map((ref) => {
            return ref.validate();
        });

        const results = await Promise.all(responseTasks);

        return results.every(success => success);
    }
    async setPreRemindSetting () {
        const validateSuccess = await this.validateAll();
        if (!validateSuccess) return;
        const rgId = this.$route.query.rgId;
        let params: any[] = cloneDeep(this.remindSettingItems);
        params = params.map(item => {
            return {
                active: this.preRemindOpen,
                rgId: rgId,
                remindReceivers: item.remindReceivers,
                slaLevel: item.slaLevel,
                slaType: item.slaType,
                timeUnit: item.timeUnit,
                timeValue: item.timeValue,
                receiversJoinDxGroup: item.receiversJoinDxGroup
            };
        });
        const res = await api.ticketApi.setPreRemind(rgId, params);
        const { code } = res;
        if (code === 200) {
            this.$mtd.message.success('保存成功');
            this.getPreRemindSetting();
        }
    }
    preRemindDelete (index) {
        const remindItems = this.remindSettingItems;
        remindItems.splice(index, 1);
        this.$set(this, 'remindSettingItems', remindItems);
    }
}
</script>

<style lang="postcss">
.pre-remind-setting-container {
    margin-bottom: 60px;
    .actions {
        position: fixed;
        bottom: 0;
        width: 100%;
        text-align: right;
        padding: 14px 14px 14px 0;
        padding-right: 15%;
        border-top: 1px solid rgba(209, 209, 209, 0.8);
        background-color: #FFFFFF;
        z-index: 99;
    }
}
</style>
