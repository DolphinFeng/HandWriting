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
                    :placeholder="placeholder"
                    @input="debounceRemoteMethod"
                    @keyup.enter="enterOperate"
                    class="search-tag-input"
                    genre="line"
                    prefix-icon="mtdicon mtdicon-search"
                    clearable />
                <div class="tags-title" v-if="!((!targetTag) && (!recommandTagList.length))">{{ `${!targetTag ? '常用标签' : '搜索结果'}：` }}</div>
                <div class="dropdown-container">
                    <mtd-tag
                        v-for="tag in tagList"
                        :key="tag.id"
                        :disabled="isSelectionTag(tag)"
                        @click="tagItemClick(tag)"
                        size="small"
                        theme="blue">{{ tag.name }}</mtd-tag>
                </div>
                <div class="no-match-tip" v-if="noMatchTag && !errorTip">{{ `没有搜索到“${targetTag}”` }}</div>
                <div class="no-match-tip error-message" v-if="errorTip && noMatchTag"> {{ errorTip }} </div>
                <div class="no-match-tag" v-if="noMatchTag">
                    <mtd-button
                        type="text-primary"
                        @click="createTag"
                        :loading="buttonLoading">创建标签</mtd-button>
                </div>
            </mtd-dropdown-menu>
        </mtd-dropdown>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Dropdown } from '@ss/mtd-vue';
import { getStringLength } from '@/utils/tool.ts';
import Clickoutside from '@/utils/clickoutside.ts';
import { debounce } from 'lodash';
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
    @Prop({ default: '搜索标签' })
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

    // TODO: MTD Vue 的 Dropdown 类型缺少 updatePopper 定义
    $refs: { dropdown: Dropdown & any };

    get tagList () {
        return this.targetTag ? this.searchTagList : this.recommandTagList;
    }

    get selectionList () {
        return this.list.map((item) => {
            return item.id;
        });
    }
    @Watch('visible')
    onVisibleChange () {
        this.rgId && (this.oldRgId !== this.rgId) && this.getRecommandTags();
        this.oldRgId = this.rgId;
    }

    async getRecommandTags () {
        this.searchLoading = true;
        try {
            const res = await api.ctiApi.searchTagsByRg({
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
            const res = await api.ticketApi.searchTicketTags({
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
            const res = await api.ticketApi.createTicketTags({
                name: name
            });
            const { code, data } = res;
            if (code === 200) {
                const newTag = {
                    id: data.id,
                    name: this.targetTag
                };
                this.tagItemClick(newTag);
            }
        } catch (e) {
            this.$mtd.message.error(`标签创建失败，原因：${e}`);
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
    }
    // 回车操作
    enterOperate () {
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
        const ifMatch = this.searchTagList.find((tag) => {
            return tag.name === this.targetTag;
        });
        return this.targetTag && (!ifMatch) && (!this.searchLoading) && (!ifMatch);
    }
    get errorTip () {
        let error = '';
        if (getStringLength(this.targetTag) > 20) {
            error = '标签名称不能超过20个字符';
        } else {
            error = '';
        }
        return error;
    }
}
</script>

<style lang="postcss">
.search-tag-panel-container {
    width: 260px;
    .mtd-dropdown-menu {
        padding: 5px 16px;
        overflow: hidden;
    }
    .search-tag-input {
        width: 220px;
    }
    .dropdown-container {
        max-height: 150px;
        overflow-x: hidden;
        overflow-y: scroll;
        .mtd-tag {
            margin: 0 4px 6px 0;
        }
        .mtd-tag-blue {
            color: #FF8800;
            border-color: #FF8800;
            background-color: #FFFFFF;
            .mtd-tag-content {
                color: #FF8800;
            }
            &.mtd-tag-disabled {
                opacity: 0.45;
                background: none !important;
                border-color: #FF8800 !important;
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
            color: #FF8800;
        }
        .mtd-btn:active,
        .mtd-btn:hover {
            background: none;
        }
    }
    .no-match-tip {
        font-family: PingFangSC-Regular;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.87);
        text-align: center;
        &.error-message {
            color: #FF6459;
        }
    }
    .mtd-input-wrapper .mtd-input,
    .mtd-textarea {
        border-top: none;
        border-left: none;
        border-right: none;
        border-radius: 0;
    }
}

</style>
