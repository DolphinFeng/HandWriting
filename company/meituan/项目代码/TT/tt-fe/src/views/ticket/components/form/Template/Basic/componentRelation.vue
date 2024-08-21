<template>
    <div>
        <mtd-radio-group
            v-model="poiType"
            @input="typeChange"
            :disabled="disabled">
            <mtd-radio value="MEITUAN">{{ $getText('component_relation_meituan', '美团门店ID') }}</mtd-radio>
            <mtd-radio value="DIANPING">{{ $getText('component_relation_dianping', '点评门店ID') }}</mtd-radio>
        </mtd-radio-group>
        <div>
            <mtd-input
                v-model="shopId"
                :placeholder="$getText('component_relation_placeholder', '请填写对应门店ID')"
                @blur="getPoiInfo"
                :class="{'mtd-input-invalid': showInfo && !shopName}"
                :disabled="disabled" />
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
    shopId: string = '';
    poiType: 'MEITUAN' | 'DIANPING' = 'MEITUAN';
    showInfo: string = '';
    shopName: string = '';

    get formValObj () {
        return {
            'shopId': this.shopId,
            'shopName': this.shopName,
            'poiType': this.poiType
        };
    }

    @Watch('formValObj')
    formValObjChange () {
        this.$nextTick(() => {
            this.$emit('change', JSON.stringify(this.formValObj), this.field);
        });
    }

    @Watch('value', { immediate: true })
    getValueChange (value) {
        if (value) {
            const valueObj = JSON.parse(value);
            this.shopId = valueObj.shopId;
            this.shopName = valueObj.shopName;
            this.poiType = valueObj.poiType;
            this.showInfo = this.shopName;
        }
    }

    async getPoiInfo () {
        if (!this.shopId) {
            this.shopName = '';
            this.showInfo = '';
            return ;
        }
        const res: Ajax.AxiosResponse = await api.ticketApi.getPoiInfo({
            poiType: this.poiType,
            shopId: this.shopId
        });
        const { code, data } = res;

        if (data.errorMsg) {
            this.showInfo = data.errorMsg;
            this.shopName = '';
            // this.shopId = '';
            return ;
        }

        if (code === 200) {
            this.showInfo = data.shopName;
            this.shopName = data.shopName;
            setTimeout(() => {
                this.$emit('blur-change', JSON.stringify(this.formValObj), this.field);
            }, 0);
            // this.$nextTick(() => {
            //     this.$emit('blur-change', JSON.stringify(this.formValObj), this.field);
            // });
        }
    }
    typeChange () {
        this.shopId = '';
        this.shopName = '';
        this.showInfo = '';
    }
}
</script>
<style lang="scss">

.mtd-input-invalid {
    .mtd-input {
        border-color: #f5483b;
    }
}
</style>
