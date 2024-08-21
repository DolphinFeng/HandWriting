<template>
    <div class="item-detail-form-container" v-if="currentRgInfo.categoryName">
        <h3>详情</h3>
        <mtd-form>
            <mtd-form-item label="服务目录:">{{ `${currentRgInfo.categoryName}/${currentRgInfo.typeName}/${currentRgInfo.itemName}` }}</mtd-form-item>
            <mtd-form-item label="itemId:">{{ itemId }}</mtd-form-item>
            <mtd-form-item label="绑定RG:" prop="rgName">{{ currentRgInfo.rgName || '无' }}</mtd-form-item>
            <mtd-form-item label="负责人:" prop="rgOwner">{{ `${currentRgInfo.cnName || '-'}(${currentRgInfo.rgOwner || '-'})` }} <span class="quit-tag" v-if="currentRgInfo.ownerActive === 16">离职</span></mtd-form-item>
            <mtd-form-item label="绑定时间:" prop="createdAt">{{ getCreateTime(currentRgInfo.createdAt) }}</mtd-form-item>
            <mtd-form-item label="RG描述:" prop="description">{{ currentRgInfo.description || '无' }}</mtd-form-item>
            <mtd-form-item label="发起链接:" prop="link">{{ linkFilter(currentRgInfo.link) }}</mtd-form-item>
            <mtd-form-item label="">
                <mtd-button
                    v-clipboard="onCopy"
                    size="small"
                    type="primary"
                    @success="handleCopySuccess">复制链接</mtd-button>
                <mtd-button
                    size="small"
                    type="primary"
                    @click="createTT(currentRgInfo.link)">点击发起TT</mtd-button></mtd-form-item>
        </mtd-form>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import * as api from '@/api';

import dayjs from 'dayjs';
import VueClipboards from 'vue-clipboards';
Vue.use(VueClipboards);

/**
 * item详情模块
 *
 * @author liyuyao
 * @date 09/06/2019
 */
@Component
export default class ItemDetail extends Vue {
    @Prop({ default: 0 })
    itemId: number;

    currentRgInfo: any = {};

    @Watch('itemId', { immediate: true })
    onItemIdChange () {
        this.getRgDetail();
    }

    linkFilter (link: string) {
        if (!link) {
            return '';
        }
        return link.replace(/\+/g, '%2B');
    }
    onCopy () {
        return this.linkFilter(this.currentRgInfo.link);
    }
    async getRgDetail () {
        if (!this.itemId) {
            return;
        }
        try {
            const res = await api.ctiApi.getRgDetail(this.itemId);
            this.currentRgInfo = res.data;
            this.$emit('auth', this.currentRgInfo.permission);
        } catch (e) {
            console.log(e);
        }
    }
    getCreateTime (time: number) {
        return dayjs(time).format('YYYY-MM-DD HH:mm:ss');
    }
    handleCopySuccess () {
        this.$mtd.message({
            message: '复制TT链接成功',
            type: 'success'
        });
    }
    createTT (link) {
        window.open(link);
    }
}
</script>

<style lang="postcss">
.item-detail-form-container {
    max-width: 420px;
    width: calc(100% - 1050px);
    min-width: 250px;
    padding: 20px;
    display: inline-block;
    h3 {
        margin-bottom: 20px;
        font-family: PingFangSC-Semibold;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.87);
        line-height: 22px;
    }
    .mtd-form-item {
        margin-bottom: 12px;
    }
    .mtd-form-item-label,
    .mtd-form-item-content {
        line-height: 17px;
        font-size: 14px;
    }
    .mtd-form-item-content {
        color: #464646;
        margin-left: 80px !important;
    }
    .mtd-form-item-label {
        width: 60px !important;
        color: #6F6F6F;
        padding-right: 0;
    }
    .quit-tag {
        color: #999999;
        font-size: 12px;
    }
}
</style>
