<template>
    <pm-select
        multiple
        option-type="more"
        type="dropdown"
        remote
        popper-class="pm-select-create"
        :remote-method="remoteMethod"
        class="component-label"
        v-model="value"
        :add-value="addValue"
        :no-data-text="$getText('ticket_data_filter_no_data', '暂无数据')"
        :no-match-text="$getText('category_select_tip_no_result', '暂无搜索结果')"
        :placeholder="$getText('component_label_search_tag', '搜索标签')"
        @change="labelChange"
        :input-placeholder="$getText('component_label_search_tag_placeholder', '请搜索标签')">
        <pm-select-option
            v-for="item in tagList"
            :key="item.id"
            :value="item.name"
            :label="item.name" />
        <pm-select-create
            :create-method="createTicketTags"
            :options="tagList"
            :label-text="$getText('search_tag_dropdown_create_tag','创建标签')"
            options-value="name"
            :existed-hint="$getText('component_label_tag_existed_hint', '该标签已存在，无法添加！')"
            :exceed-length-hint="$getText('component_label_tag_exceed_length_hint', '标签名称不能超过20个字符')"
            :max-length="maxLength"
            :query="query" />
    </pm-select>
</template>
<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import TemplateMixin from '../TemplateMixin.vue';
import * as api from '@/api';

/**
 * 修改抄送人
 *
 * @author liyuyao
 * @date 04/22/2019
 */
@Component
export default class ComponentLabel extends TemplateMixin {
    @Prop({ default: 0 })
    rgId: number;

    currentTagList: any = [];
    dropdownVisible: boolean = false;

    buttonLoading: boolean = false;

    tagList: any = [];
    searchLoading: boolean = false;

    query: string = '';
    addValue: any = '';
    maxLength: number = 20;

    async getRecommandTags () {
        try {
            const res: Ajax.AxiosResponse = await api.ctiApi.searchTagsByRg({
                rgId: this.rgId
            });
            this.tagList = res.data.items;
        } catch (e) {
            this.tagList = [];
            console.log(e);
        }
    }

    async remoteMethod (query) {
        this.searchLoading = true;
        this.query = query;
        if (query.trim().length < 1) {
            this.tagList = [];
            return;
        }
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.searchTicketTags({
                name: query
            });
            this.tagList = res.data.items;
        } catch (e) {
            this.tagList = [];
            console.log(e);
        }
        this.searchLoading = false;
    }

    async createTicketTags (name) {
        this.buttonLoading = true;
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.createTicketTags({
                name: name
            });
            let { code, data } = res;
            if (code === 200) {
                this.addValue = name;
            }
        } catch (e) {
            // this.$mtd.message.error(`${this.$getText('component_label_tag_create_failed', '标签创建失败，原因')}：${e}`);
            console.log(e);
        }
        this.buttonLoading = false;
    }

    labelChange (val) {
        this.value = val;
        this.valueChange();
    }
}
</script>

<style lang="scss">
body {
    .mtd-popper.pm-select-create {
        max-width: 280px;
    }
}
.component-label {
    width: 280px;
    // max-width: 280px;
}
</style>