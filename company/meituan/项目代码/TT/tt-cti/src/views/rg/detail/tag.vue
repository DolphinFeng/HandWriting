<template>
    <div class="rg-tag-container">
        <div class="add-tag-container">
            <div class="tag-permission-wrapper">
                <span class="label">工单发起后，仅允许RG成员增删标签</span>
                <mtd-switch
                    size="small"
                    v-model="tagPermission"
                    @change="setLabelPermission($event, 'permission')" />
            </div>
            <div class="tag-permission-wrapper">
                <span class="label">RG成员处理工单时，标签必填</span>
                <mtd-switch
                    size="small"
                    v-model="tagRequired"
                    @change="setLabelPermission($event, 'required')" />
            </div>
            <mtd-select
                v-model="searchTag"
                :loading="searchLoading"
                filterable
                remote
                auto-clear-query
                :debounce="200"
                :remote-method="remoteMethod"
                @change="chooseTag"
                placeholder="搜索并添加推荐标签"
                style="width: 270px;">
                <mtd-option
                    :value="searchQuery"
                    v-if="noMatchTag">{{ `点击创建并添加「${searchQuery}」标签` }}</mtd-option>
                <mtd-option
                    v-for="tag in searchTagList"
                    :key="tag.id"
                    :label="tag.name"
                    :value="tag.name" />
            </mtd-select>
            <div class="tags-wrapper">
                <div class="no-tag-text" v-if="!recommandTagList.length">当前RG下 暂无推荐标签</div>
                <mtd-tag
                    v-for="tag in recommandTagList"
                    :key="tag.id"
                    closable
                    @close="deleteTag(tag.id)">{{ tag.name }}</mtd-tag>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import * as api from '@/api';

/**
 * rg操作记录
 *
 * @author liyuyao
 * @date 11/07/2019
 */
@Component
export default class RgTag extends Vue {
    searchTag: string = '';
    searchQuery: string = '';
    searchLoading: boolean = false;
    searchTagList: any = [];

    recommandTagList: any = [];
    rgId: number = 0;

    tagPermission: boolean = false;
    tagRequired: boolean = false;

    $mtd: any;

    get noMatchTag () {
        const ifMatch = this.searchTagList.find((tag) => {
            return tag.name === this.searchQuery;
        });
        return this.searchQuery && (!ifMatch);
    }

    mounted () {
        this.rgId = parseInt(this.$route.query.rgId as string, 10);
        this.searchTagsByRg();
        this.getLabelPermission();
    }
    chooseTag (tagName) {
        if (!tagName) return;
        this.addRgTag(tagName);
    }
    createTag () {
        this.searchQuery && this.addRgTag(this.searchQuery);
    }
    async remoteMethod (query) {
        if (!query.length) return;
        this.searchLoading = true;
        try {
            const res = await api.ctiApi.searchTicketTags({
                name: query
            });
            this.searchQuery = query;
            this.searchTagList = res.data.items;
        } catch (e) {
            this.searchTagList = [];
            console.log(e);
        }
        this.searchLoading = false;
    }

    async searchTagsByRg () {
        const res = await api.ctiApi.searchTagsByRg({
            rgId: this.rgId
        });
        const { code } = res;
        if (code === 200) {
            this.recommandTagList = res.data.items;
        }
    }
    async addRgTag (name: string) {
        const res = await api.ctiApi.addRgTag({
            rgId: this.rgId,
            name: name
        });
        const { code } = res;
        if (code === 200) {
            this.$mtd.message.success('常用标签添加成功');
            this.searchTag = '';
            this.searchTagsByRg();
        }
    }
    async deleteTag (tagId: number) {
        const res = await api.ctiApi.deleteRgTag(tagId, this.rgId);
        const { code } = res;
        if (code === 200) {
            this.$mtd.message.success('常用标签删除成功');
            this.searchTagsByRg();
        }
    }
    async setLabelPermission (val: boolean, type: string) {
        const isPermission = type === 'permission';
        const requestParam = isPermission ? {
            labelSwitch: val
        } : {
            labelRequired: val
        };
        const res = await api.rgApi.setLabelPermission({
            rgId: this.rgId,
            ...requestParam
        });
        const { code } = res;
        if (code === 200) {
            this.$mtd.message.success(isPermission ? '标签编辑权限设置成功' : '标签是否必填设置成功');
        }
        this.getLabelPermission();
    }
    async getLabelPermission () {
        const res = await api.rgApi.getLabelPermission({
            rgId: this.rgId
        });
        const { code, data } = res;
        if (code === 200) {
            this.tagPermission = data.labelSwitch;
            this.tagRequired = data.labelRequired;
        }
    }
}
</script>

<style lang="postcss">
.rg-tag-container {
    margin-top: 8px;
    .tags-wrapper {
        margin-top: 16px;
        padding: 8px;
        min-height: 84px;
        border: 1px solid rgba(0, 0, 0, 0.07);
        border-radius: 4px;
        .mtd-tag {
            margin: 0 4px 6px 0;
        }
        .no-tag-text {
            margin-top: 20px;
            text-align: center;
            font-size: 16px;
            color: rgba(0, 0, 0, 0.87);
            letter-spacing: 0;
            line-height: 22px;
        }
    }
    .tag-permission-wrapper {
        .label {
            width: 235px;
            display: inline-block;
            text-align: left;
        }

        color: rgba(0, 0, 0, 0.6);
        vertical-align: middle;
        line-height: 34px;
        .mtd-switch {
            vertical-align: middle;
            margin-left: 5px;
        }
    }
    .mtd-select {
        margin-top: 10px;
    }
}
</style>
