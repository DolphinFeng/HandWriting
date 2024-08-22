<template>
    <div
        class="search-tag-dropdown-container">
        <mtd-dropdown
            popper-class="search-tag-panel-container"
            :placement="placement"
            :visible="visible"
            ref="dropdown">
            <slot />
            <mtd-dropdown-menu
                slot="dropdown"
                v-clickoutside="clickOutside">
                <mtd-input
                    v-model="targetTag"
                    :placeholder="placeholder || $getText('search_tag_dropdown_placeholder', '搜索标签')"
                    @input="debounceRemoteMethod"
                    @keydown.enter="enterOperate"
                    class="search-tag-input"
                    prefix-icon="mtdicon mtdicon-search"
                    clearable />
                <div class="tags-title" v-if="!((!targetTag) && (!recommandTagList.length))">{{ `${!targetTag ? $getText('search_tag_dropdown_common_tags', '常用标签') : $getText('search_tag_dropdown_search_result', '搜索结果')}：` }}</div>
                <div class="dropdown-container">
                    <mtd-tag
                        v-for="tag in tagList"
                        :key="tag.id"
                        :disabled="isSelectionTag(tag)"
                        @click="tagItemClick(tag)"
                        size="small"
                        theme="blue">{{ tag.name }}</mtd-tag>
                </div>
                <div class="no-match-tip" v-if="noMatchTag && !errorTip">{{ $getText('search_tag_dropdown_no_search_result', {tag: targetTag}) }}</div>
                <div class="no-match-tip error-message" v-if="errorTip && noMatchTag"> {{ errorTip }} </div>
                <div class="no-match-tag" v-if="noMatchTag">
                    <mtd-button
                        type="text-primary"
                        @click="createTag"
                        :loading="buttonLoading">{{ $getText('search_tag_dropdown_create_tag', '创建标签') }}</mtd-button>
                </div>
            </mtd-dropdown-menu>
        </mtd-dropdown>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { getStringLength } from '@/utils/tools/index.ts';
import Clickoutside from '@/utils/tools/clickoutside.ts';
import debounce from 'lodash.debounce';
import * as api from '@/api';

/**
 * 用户搜索框
 *
 * @author liyuyao
 * @date 04/22/2019
 */
@Component({
    directives: { Clickoutside }
})
export default class SearchTagDropdown extends Vue {
    @Prop({ default: '' })
    placeholder: string;

    @Prop({ default: 'bottom-end' })
    placement: string;

    @Prop({ default: false })
    visible: boolean;

    @Prop({ default: 0 })
    rgId: number;

    @Prop()
    list: any;

    targetTag: string = '';
    searchTagList: any = [];
    recommandTagList: number[] = [];
    searchLoading: boolean = true;
    buttonLoading: boolean = false;
    oldRgId: number = 0;

    debounceRemoteMethod: Function = debounce(this.remoteMethod, 200);

    get tagList () {
        return this.targetTag ? this.searchTagList : this.recommandTagList;
    }

    get selectionList () {
        return this.list.map((item) => {
            return item.id;
        });
    }
    @Watch('visible')
    onVisibleChange (visible) {
        this.rgId && (this.oldRgId !== this.rgId) && this.getRecommandTags();
        this.oldRgId = this.rgId;
        if (visible) this.focusInputWrapper();
    }
    focusInputWrapper () {
        this.$nextTick(() => {
            let inputDiv = document.getElementsByClassName('search-tag-input')[0];
            let input = inputDiv && inputDiv.getElementsByTagName('input')[0];
            input && input.focus();
        });
    }
    async getRecommandTags () {
        this.searchLoading = true;
        try {
            const res: Ajax.AxiosResponse = await api.ctiApi.searchTagsByRg({
                rgId: this.rgId
            });
            this.recommandTagList = res.data.items;
        } catch (e) {
            this.recommandTagList = [];
            console.log(e);
        }
        this.searchLoading = false;
    }
    async remoteMethod (query) {
        this.searchLoading = true;
        if (query.trim().length < 1) {
            this.searchTagList = [];
            return;
        }
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.searchTicketTags({
                name: query
            });
            this.searchTagList = res.data.items;
        } catch (e) {
            this.searchTagList = [];
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
                let newTag = {
                    id: data.id,
                    name: this.targetTag
                };
                this.tagItemClick(newTag);
            }
        } catch (e) {
            // this.$mtd.message.error(`${this.$getText('search_tag_dropdown_new_create_fail', '标签创建失败，原因')}：${e}`);
            console.log(e);
        }
        this.buttonLoading = false;
    }
    createTag () {
        if (!this.errorTip) {
            this.createTicketTags(this.targetTag);
        }
    }
    tagItemClick (tag) {
        // 选中后清空搜索记录
        this.searchTagList = [];
        this.targetTag = '';
        this.$emit('change', tag);
        this.$nextTick(() => {
            this.$refs.dropdown.updatePopper();
        });
        this.focusInputWrapper();
    }
    // 回车操作
    enterOperate (e) {
        console.log('isComposing', e, e.isComposing);
        if (e && e.isComposing) return;
        // 仅有一个备选项时，选择该选项
        if (this.searchTagList && this.searchTagList.length === 1) {
            this.tagItemClick(this.searchTagList[0]);
        } else if (this.noMatchTag) { // 触发创建新标签
            this.createTag();
        }
    }
    clickOutside () {
        this.$emit('close');
    }
    isSelectionTag (tag) {
        return this.selectionList.includes(tag.id);
    }
    get noMatchTag () {
        let ifMatch = this.searchTagList.find((tag) => {
            return tag.name === this.targetTag;
        });
        return this.targetTag && (!ifMatch) && (!this.searchLoading) && (!ifMatch);
    }
    get errorTip () {
        let error = '';
        if (getStringLength(this.targetTag) > 20) {
            error = this.$getText('search_tag_dropdown_new_name_length', '标签名称不能超过20个字符');
        } else {
            error = '';
        }
        return error;
    }
}
</script>

<style lang="scss">
.search-tag-panel-container {
    width: 236px;
    .mtd-dropdown-menu {
        padding: 12px 16px;
        overflow: hidden;
    }
    .search-tag-input {
        width: 204px;
    }
    .dropdown-container {
        max-height: 150px;
        overflow-x: hidden;
        overflow-y: scroll;
        .mtd-tag {
            margin: 0 4px 6px 0;
        }
        .mtd-tag-blue {
            color: #1c6cdc;
            border-color: #1c6cdc;
            background-color: #fff;
            .mtd-tag-content {
                color: #1c6cdc;
            }
            &.mtd-tag-disabled {
                opacity: 0.45;
                background: none !important;
                border-color: #1c6cdc !important;
            }
        }
    }
    .tags-title {
        margin: 12px 0 8px 0;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.6);
        line-height: 20px;
    }
    .no-match-tag {
        text-align: center;
        button {
            width: 100%;
        }
        .mtd-btn-text-primary {
            color: #1c6cdc;
        }
        .mtd-btn:active,
        .mtd-btn:hover {
            background: none;
        }
    }
    .no-match-tip {
        font-family: PingFangSC-Regular;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.87);
        text-align: center;
        &.error-message {
            color: #ff6459;
        }
    }
}

</style>