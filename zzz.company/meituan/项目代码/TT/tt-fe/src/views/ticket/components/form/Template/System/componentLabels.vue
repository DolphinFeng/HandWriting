<template>
    <div class="change-cc-container">
        <div class="cc-container">
            <mtd-tag
                v-for="(tag, index) in currentTagList"
                :key="tag"
                theme="gray"
                type="unbordered"
                closeable
                @close="removeTag(index)">{{ tag }}
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
                @click="dropdownVisible = true"><i class="mtdicon mtdicon-file-add-o" /> {{ $getText('component_label_add_button', '添加') }}</span>
        </search-tag-dropdown>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Watch } from 'vue-property-decorator';
import SearchTagDropdown from './sysComponents/search-tag-dropdown.vue';
import TemplateMixin from '../TemplateMixin.vue';
import cloneDeep from 'lodash.clonedeep';
import { CREATE_LX_MAP } from '@/config/lx_map.conf';

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
    @Prop()
    tagList: any;

    @Prop({ default: false })
    isDetail: Boolean;

    @Prop({ default: 0 })
    rgId: number;

    currentTagList: any = [];
    dropdownVisible: boolean = false;

    get lxBid () {
        return this.isDetail ? 'b_onecloud_acgkat8y_mc' : CREATE_LX_MAP['click_addtag'];
    }

    @Watch('value', { immediate: true })
    async onGetTagList () {
        if (this.value.length) {
            this.currentTagList = cloneDeep(this.value);
            this.$emit('change', this.currentTagList, this.field);
        }
    }
    tagChange (tag) {
        if (this.currentTagList.length > 9) {
            this.$mtd.message({
                message: this.$getText('component_label_max_tag_message', '标签不能多于10个'),
                type: 'error'
            });
            return ;
        }
        let existTag = this.currentTagList.find(tagItem => {
            return parseInt(tagItem, 10) === parseInt(tag.name, 10);
        });
        if (!existTag) {
            this.currentTagList.push(tag.name);
            this.$emit('change', this.currentTagList, this.field);
        }
    }
    removeTag (index) {
        this.currentTagList.splice(index, 1);
        this.$emit('change', this.currentTagList, this.field);
    }
}
</script>

<style lang="scss">
.change-cc-container {
    .add-button {
        color: #1c6cdc;
        cursor: pointer;
        .mtdicon-file-add-o {
            font-size: 12px;
        }
    }
}
</style>