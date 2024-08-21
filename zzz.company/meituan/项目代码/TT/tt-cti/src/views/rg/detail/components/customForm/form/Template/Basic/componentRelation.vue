<template>
    <div>
        <mtd-radio-group
            :disabled="disabled || readonly"
            v-model="poiType"
            @input="typeChange">
            <mtd-radio value="MEITUAN">美团门店ID</mtd-radio>
            <mtd-radio value="DIANPING">点评门店ID</mtd-radio>
        </mtd-radio-group>
        <div>
            <mtd-input
                :disabled="disabled"
                :readonly="readonly"
                v-model="shopId"
                placeholder="请填写对应门店ID"
                @blur="getPoiInfo" />
            <div :class="`${shopName ? 'mtd-form-item-helper' : 'mtd-form-item-error-tip'}`">{{ showInfo }}</div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Watch } from 'vue-property-decorator';
import TemplateMixin from '../TemplateMixin.vue';
import * as api from '@/api';

/**
 * 自定义字段展示列表
 *
 * @author liyuyao
 * @date 03/12/2020
 */
@Component
export default class ComponentRelation extends TemplateMixin {
    shopId: number = null;
    poiType: 'MEITUAN' | 'DIANPING' = 'MEITUAN';
    showInfo: string = '';
    shopName: string = '';

    get formValObj () {
        return {
            shopId: this.shopId,
            shopName: this.shopName,
            poiType: this.poiType
        };
    }
    @Watch('formValObj')
    formValObjChange () {
        this.$emit('change', this.formValObj, this.field);
    }

    async getPoiInfo () {
        if (!this.shopId) return;
        const res = await api.ticketApi.getPoiInfo({
            poiType: this.poiType,
            shopId: this.shopId
        });
        const { code, data } = res;
        if (code === 200) {
            this.showInfo = data.shopName;
            this.shopName = data.shopName;
        }
        if (data.errorMsg) {
            this.showInfo = data.errorMsg;
            this.shopName = '';
        }
    }
    typeChange () {
        this.shopId = null;
        this.shopName = '';
        this.showInfo = '';
    }
}
</script>
