<template>
    <div class="city-select-container">
        <mtd-cascader
            @change="handleCityChange"
            v-model="city"
            :data="provinceList"
            :load-data="loadCityData"
            separator="-"
            placeholder="请选择省份"
            no-data-text="请选择省份"
            popper-class="city-popper"
            class="city-cascader"
            style="width: 220px;"
            clearable
            :disabled="readonly"
            :class="{'component-cascader-readonly': readonly}"
            change-on-select />
    </div>
</template>
<script lang="ts">
import { Component, Watch } from 'vue-property-decorator';
import { ProvinceList } from '@/config/map.conf';
import * as api from '@/api';
import TemplateMixin from '../TemplateMixin.vue';

interface ProvinceOption {
    value: string;
    label: string;
    isLeaf: boolean;
    level?: number;
}

/**
 * 用户搜索框
 *
 * @author liyuyao
 * @date 12/02/2019
 */
@Component
export default class CitySelect extends TemplateMixin {
    city: string[] = [];
    provinceList: Array<ProvinceOption> = [];

    @Watch('value')
    getValueChange (value) {
        value && this.getDefaultCity(value);
    }
    async mounted () {
        const value = this.field.defaultValue || this.value;
        if (value) {
            this.getDefaultCity(value);
        } else {
            this.provinceList = ProvinceList.map((province: any) => {
                return {
                    value: province.name,
                    label: province.name,
                    code: province.code,
                    isLeaf: false,
                    level: 4
                };
            });
        }
    }

    async getDefaultCity (value) {
        this.city = value ? value.split('-') : [];
        this.$emit('change', this.formatCity, this.field);
        const province = this.city[0];
        const targetProvince = ProvinceList.find((val) => {
            return val.name === province;
        }).code;
        // TODO: 这里加 as any 防止编译不通过
        const cityList = await this.getCityByProvince(targetProvince, province && (province as any).level || 5);
        this.provinceList = ProvinceList.map((item: any) => {
            if (item.code === targetProvince) {
                return {
                    value: item.name,
                    label: item.name,
                    code: item.code,
                    isLeaf: false,
                    level: 4,
                    children: cityList
                };
            } else {
                return {
                    value: item.name,
                    label: item.name,
                    code: item.code,
                    isLeaf: false,
                    level: 4
                };
            }
        });
    }

    async loadCityData (item, callback) {
        const level = parseInt(item.level, 10);
        const result = await this.getCityByProvince(item.code, level + 1);
        callback(result);
    }
    async getCityByProvince (query, level) {
        if (!(query && level)) return;
        const res = await api.ticketApi.getCityByProvince({
            regionId: query,
            type: level
        });
        return res.data.result.items.map((city) => {
            return {
                value: city.name,
                label: city.name,
                code: city.code,
                isLeaf: level === 5,
                level: city.level
            };
        });
    }
    handleCityChange () {
        this.$emit('change', this.formatCity, this.field);
    }
    get formatCity () {
        return this.city.join('-');
    }
}
</script>

<style lang="postcss" scoped>
.city-select-container {
    background: #FFFFFF;
}
.component-cascader-readonly {
    /deep/ .mtd-input-disabled .mtd-input {
        background-color: #FFFFFF;
    }
}
</style>
