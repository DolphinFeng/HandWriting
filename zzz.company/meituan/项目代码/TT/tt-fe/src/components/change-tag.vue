<template>
    <div class="change-tag-container">
        <div class="tag-container">
            <mtd-tag
                v-for="(tag, index) in currentTagList"
                :key="tag.name"
                theme="gray"
                type="pure"
                :closeable="editPermission"
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
                :lxay-bid="lxBid"
                class="add-button"
                v-show="editPermission"
                @click="dropdownVisible = true"><i class="mtdicon mtdicon-file-add" /></span>
        </search-tag-dropdown>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { State, Getter } from 'vuex-class';
import { CREATE_LX_MAP } from '@/config/lx_map.conf';
import { lxReportClick } from '@/utils/directive/lxanaly';
import SearchTagDropdown from '@/components/search-tag-dropdown.vue';
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
export default class ChangeTag extends Vue {
    @Prop()
    tagList: any;

    @Prop({ default: false })
    isDetail: Boolean;

    @Prop({ default: 0 })
    rgId: number;

    @Getter rgPermissionMap;

    currentTagList: any = [];
    dropdownVisible: boolean = false;

    get editPermission () {
        return this.isDetail && this.rgPermissionMap.label || !this.isDetail;
    }

    get lxBid () {
        return this.isDetail ? 'b_onecloud_acgkat8y_mc' : CREATE_LX_MAP['click_addtag'];
    }

    @Watch('tagList', { immediate: true })
    async onGetTagList (tags) {
        if (tags && tags.length && (typeof tags[0] === 'string')) {
            let idList = await this.getLabelIdsByNames(tags) || [];
            this.currentTagList = tags.map((tag, index) => {
                return {
                    name: tag,
                    id: parseInt(idList[index], 10) || 0
                };
            });
            !this.isDetail && this.$emit('change', this.pureTagResult);
        }
    }
    tagChange (tag) {
        if (this.currentTagList.length > 9) {
            this.$mtd.message({
                message: this.$getText('tag_change_tip', '标签不能多于10个'),
                type: 'error'
            });
            return ;
        }
        let existTag = this.currentTagList.find((tagItem) => {
            return parseInt(tagItem.id, 10) === parseInt(tag.id, 10);
        });
        if (!existTag) {
            this.currentTagList.push(tag);
            this.$emit('change', this.pureTagResult);
        }
    }
    async getLabelIdsByNames (tags) {
        const res: Ajax.AxiosResponse = await api.ticketApi.getLabelIdsByNames({
            labels: tags,
            mode: 'NAME_TO_ID'
        });
        return res.data.items;
    }
    removeTag (index) {
        const bid = this.isDetail ? 'b_onecloud_xssqpmjj_mc' : CREATE_LX_MAP['click_removetag'];
        lxReportClick(bid);
        this.currentTagList.splice(index, 1);
        this.$emit('change', this.pureTagResult);
    }
    get pureTagResult () {
        let result = this.currentTagList.map((tag) => {
            return tag.id;
        });
        return result;
    }
}
</script>

<style lang="scss">
.change-tag-container {
    line-height: 22px;
    .add-button {
        display: flex;
        cursor: pointer;
        .mtdicon-file-add {
            color: rgba(0, 0, 0, 0.6);
            font-size: 16px;
            vertical-align: text-top;
        }
    }
    .tag-container,
    .search-tag-dropdown-container {
        display: inline-block;
        vertical-align: middle;
    }
    .mtd-tag {
        margin-right: 4px;
    }
}
</style>