<template>
    <div class="change-label-container">
        <div class="label-container">
            <mtd-tag
                v-for="(tag, index) in currentTagList"
                :key="tag.name"
                theme="gray"
                type="unbordered"
                :closeable="!readonly"
                @close="removeTag(index)">{{ tag.name }}
            </mtd-tag>
        </div>
        <search-tag-dropdown
            @change="tagChange"
            @close="dropdownVisible = false"
            placement="bottom-start"
            :rg-id="rgId"
            :list="currentTagList"
            :visible="dropdownVisible">
            <span
                v-lxay
                lxay-act="moduleClick"
                :lxay-bid="isDetail ? 'b_onecloud_acgkat8y_mc' : 'b_onecloud_b6iuqn4k_mc'"
                class="add-button"
                @click="!readonly && (dropdownVisible = true)"><i class="iconfont icon-add" /> 添加</span>
        </search-tag-dropdown>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Watch } from 'vue-property-decorator';
import SearchTagDropdown from './sysComponents/search-tag-dropdown.vue';
import TemplateMixin from '../TemplateMixin.vue';
import * as api from '@/api';

/**
 * 修改抄送人
 *
 * @author liyuyao
 * @date 04/22/2019
 */
@Component({
    components: {
        SearchTagDropdown
    }
})
export default class ComponentLabel extends TemplateMixin {
    @Prop({ default: false })
    isDetail: Boolean;

    @Prop({ default: 0 })
    rgId: number;

    currentTagList: any = [];
    dropdownVisible: boolean = false;

    @Watch('value', { immediate: true })
    async onGetTagList () {
        if (this.value) {
            const tags = this.value.split(',');
            const idList = await this.getLabelIdsByNames(tags) || [];
            this.currentTagList = tags.map((tag, index) => {
                return {
                    name: tag,
                    id: parseInt(idList[index], 10) || 0
                };
            });
        } else {
            this.currentTagList = [];
        }
    }
    tagChange (tag) {
        if (this.currentTagList.length > 9) {
            this.$mtd.message({
                message: '标签不能多于10个',
                type: 'error'
            });
            return;
        }
        const existTag = this.currentTagList.find((tagItem) => {
            return parseInt(tagItem.id, 10) === parseInt(tag.id, 10);
        });
        if (!existTag) {
            this.currentTagList.push(tag);
            this.$emit('change', this.pureTagResult, this.field);
        }
    }
    async getLabelIdsByNames (tags) {
        const res = await api.ticketApi.getLabelIdsByNames({
            labels: tags,
            mode: 'NAME_TO_ID'
        });
        return res.data.items;
    }
    removeTag (index) {
        this.currentTagList.splice(index, 1);
        console.log('remove tag', this.pureTagResult);
        this.$emit('change', this.pureTagResult, this.field);
    }
    get pureTagResult () {
        const result = this.currentTagList.map((tag) => {
            return this.formName === 'fieldSetting' ? tag.name : tag.id;
        });
        return result.join(',');
    }
}
</script>

<style lang="postcss">
.change-label-container {
    display: inline-block;
    .add-button {
        color: #FF8800;
        cursor: pointer;
        .icon-add {
            font-size: 12px;
        }
    }
}
</style>
