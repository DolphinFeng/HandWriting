<template>
    <div class="content-wrapper">
        <div class="scroll-wrapper">
            <div class="empty-page" v-if="!rgList.length">
                <i class="mtd-icon mtdicon-barschart-o" />
                <div>{{ $getText('handover_content_empty_tip_1', '暂无需要交接的工作') }}</div>
                <div>{{ $getText('handover_content_empty_tip_2', '去试试别的功能吧~') }}</div>
            </div>
            <div
                class="handover-content"
                v-else>
                <handover-item
                    class="handover-item"
                    @update="getUserHandoverList"
                    :rg-item="item"
                    :user="user"
                    v-for="(item, index) in rgList"
                    :is-last-item="rgList.length === 1 && index === (rgList.length - 1)"
                    :key="item.rgId" />
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Watch, Prop } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import { PaginationMixin } from '@/utils/mixin';
import * as api from '@/api';
import Pike from '@dp/pike-message-web';
import { env } from '@/env';
import HandoverItem from '@/views/ticket/components/handover-item.vue';

const pikeEnv = {
    'prod': 'product',
    'staging': 'stage',
    'test': 'test'
};
@Component({
    components: {
        HandoverItem
    }
})
export default class HandoverContent extends PaginationMixin {
    @Getter env;
    @Prop() user: string;
    pike: any = null;
    rgList: any = [];
    loading: boolean = false;

    @Watch('user', { immediate: true })
    getUserChanged () {
        if (this.user) {
            this.pikeMessageServiceInit();
            this.getUserHandoverList();
        }
    }
    async getUserHandoverList () {
        this.loading = true;
        const res: Ajax.AxiosResponse = await api.ctiApi.handoverDetail(this.user);
        const { code, data } = res;
        if (code === 200 && data) {
            this.loading = false;
            this.$emit('get-user-date', data.lastDay);
            this.rgList = data.rgList || [];
            this.rgList.forEach(item => {
                item.showTicket = false;
                item.editStatus = false;
                item.validateOwner = true;
                item.validateOncall = true;
                item.validateTicket = true;
                item.ownerMis = '';
                item.oncallMis = '';
                item.ticketMis = '';
                item.loading = false;
                return item;
            });
        }
    }
    pikeMessageServiceInit () {
        this.pike = new Pike(`TroubleTracker_Pike_handover`, {
            env: pikeEnv[env],
            autoConnect: true,
            alias: this.user,
            isDebug: env !== 'prod'
        });
        this.pike?.onMessage(data => {
            console.log('handover pike: ', data, data.isCompleted);
            let msg = data.replace(/\\/g, '');
            msg = JSON.parse(msg);
            const { isCompleted, failedIdString } = msg;
            // 交接完成直接刷新页面
            if (isCompleted) {
                this.getUserHandoverList();
                if (failedIdString) {
                    // 提示流转失败工单ID
                    this.$mtd.message({
                        message: `${this.$getText('handover_content_failed_tip', '部分工单流转失败，请重试')}：${failedIdString}`,
                        type: 'error'
                    });
                }
            }
        });
    }
}
</script>
<style lang="scss">
.handover-content-loading {
    height: calc(100% - 63px);
    overflow: auto;
    overflow: overlay;
    box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.08);
    border-radius: 4px;
}
.content-wrapper {
    height: calc(100% - 63px);
    overflow: auto;
    overflow: overlay;
    box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.08);
    border-radius: 4px;
    position: relative;
}
.handover-content {
    background: #fff;
    width: 800px;
    padding: 0 20px 16px 20px;
}
.scroll-wrapper {
    background: #fff;
    width: 800px;
    height: 100%;
}
.empty-page {
    height: 154px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translateY(-50%) translateX(-50%);
    font-weight: 500;
    font-family: PingFangSC-Medium;
    font-size: 16px;
    color: rgba(0, 0, 0, 0.87);
    line-height: 24px;
    text-align: center;
    .mtd-icon {
        font-size: 112px;
        color: #c2c1c2;
    }
    div:last-child {
        font-weight: 400;
        font-family: PingFangSC-Regular;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.38);
        line-height: 20px;
    }
}
</style>