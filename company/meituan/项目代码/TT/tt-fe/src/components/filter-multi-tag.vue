<template>
    <mtd-dropdown
        :visible="showDropDown"
        popper-class="filter-multi__tag"
        class="filter-multi__content">
        <mtd-tooltip
            :content="showNames.join('、')"
            placement="top"
            :disabled="!labels.length || !showNames.length">
            <mtd-button
                ref="toggle-button"
                @mouseup.stop="toggleDropDown"
                type="text">
                <span
                    class="filter-multi__text"
                    style="margin-right: 4px;"
                    :class="{ 'filter-multi__text--placehoder': !labels.length }">{{ filterMultiText }}</span>
                <i class="filter-multi__icon mtdicon mtdicon-down" />
            </mtd-button>
        </mtd-tooltip>
        <mtd-dropdown-menu slot="dropdown" v-clickoutside="handleClose">
            <mtd-dropdown-menu-item>
                <mtd-select
                    :append-to-container="false"
                    :value="catagory"
                    @change="typeChangeHandler"
                    style="width: 100%;">
                    <mtd-option
                        v-for="item in filterOptions"
                        :key="item.id"
                        :label="item.label"
                        :value="item.id" />
                </mtd-select>
            </mtd-dropdown-menu-item>
            <mtd-dropdown-menu-item>
                <mtd-input
                    @input="debounceSearchTags"
                    v-model="tagQuery"
                    ref="filter-labels"
                    :placeholder="
                        $getText('filter_multi_tag_search_placeholder', '搜索TT标签')
                    "
                    :disabled="loading || disabled"
                    clearable
                    style="width: 100%;"
                    prefix-icon="mtdicon mtdicon-search" />
            </mtd-dropdown-menu-item>
            <mtd-dropdown-menu-item v-if="labels.length" @click="clear">
                <i class="mtdicon mtdicon-delete-selected-row" />{{
                    $getText("filter_multi_tag_clear_selected", "清除已选择项")
                }}
            </mtd-dropdown-menu-item>
            <div style="max-height: 180px; overflow: auto;">
                <mtd-dropdown-menu-item
                    v-for="tag in tagLists"
                    :key="tag.id"
                    :label="tag.name"
                    :value="tag.id"
                    @click="chooseTagItem(tag.id)"
                    :class="[
                        { 'checked-item': labels.includes(tag.id) },
                        'tag-dropdown-item',
                    ]">
                    <span>
                        {{ tag.name }}
                    </span>
                    <i class="mtdicon mtdicon-check" />
                </mtd-dropdown-menu-item>
            </div>
        </mtd-dropdown-menu>
    </mtd-dropdown>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import Clickoutside from '@/utils/tools/clickoutside.ts';
import * as api from '@/api';
import debounce from 'lodash.debounce';
import { lxReportClick } from '@/utils/directive/lxanaly';
import { FILTER_LX_MAP } from '@/config/lx_map.conf';

@Component({
    directives: {
        Clickoutside
    }
})
export default class FilterMultiTag extends Vue {
    @Prop({ required: false, default: false })
    loading: boolean;
    @Prop({ required: true })
    labelsShow: any;
    @Prop({ required: true })
    labelsRelationShow: number;

    showDropDown: boolean = false;
    tagLoading: boolean = false;
    disabled: boolean = false;
    tagLists: any = [];
    labels: any = [];
    catagory: number = 1;
    options: any = [];

    tagQuery: string = '';
    names: any[] = [];
    debounceSearchTags: Function = debounce(this.searchTags, 500);

    get filterOptions () {
        return [{
            label: this.$getText('filter_multi_tag_or_relation', '标签关系为“或”'),
            id: 1
        }, {
            label: this.$getText('filter_multi_tag_and_relation', '标签关系为“且”'),
            id: 2
        }, {
            label: this.$getText('filter_multi_tag_empty_relation', '标签为“空”'),
            id: 3
        }, {
            label: this.$getText('filter_multi_tag_not_include_relation', '标签为“不包含”'),
            id: 4
        }];
    }

    get filterMultiText () {
        if (this.labels.length) {
            return `${this.showNames[0] || ''} ${this.$getText('filter_multi_tag_selected', { length: this.labels.length })}`;
        } else {
            return this.$getText('filter_multi_tag_input', '请输入TT标签');
        }
    }

    get showNames () {
        return this.labels.map(id => {
            let nameItem = this.names.find(item => id === item.id);
            return nameItem && nameItem.name || '';
        }).filter(name => name.length > 0);
    }

    @Watch('labels')
    saveLabelNames () {
        const nameList = this.tagLists.filter((item) => {
            return this.labels.includes(item.id);
        });
        this.names = Array.from(new Set(this.names.concat(nameList)));
    }

    @Watch('labelsShow')
    labelsHander (val) {
        this.labels = val;
    }

    @Watch('labelsRelationShow')
    catagoryHander (val) {
        this.catagory = val;
    }

    created () {
        this.searchTags('');
    }

    handleClose () {
        this.$nextTick(() => {
            if (this.showDropDown) {
                this.showDropDown = false;
            }
        });
    }

    typeChangeHandler (val) {
        lxReportClick(FILTER_LX_MAP['label_relation']);
        this.catagory = val;
        this.labels = [];
        if (val === 3) {
            this.disabled = true;
        } else {
            this.disabled = false;
        }
        this.submit();
    }

    toggleDropDown () {
        this.showDropDown = !this.showDropDown;
    }

    chooseTagItem (id: number) {
        const itemIndex = this.labels.indexOf(id);
        if (itemIndex > -1) {
            this.labels.splice(itemIndex, 1);
        } else {
            let labels = this.labels.concat(id);
            this.labels = Array.from(new Set(labels));
        }
        this.submit();
    }

    submit () {
        this.$emit('filterChangedHander', [this.catagory, this.labels]);
    }

    clear () {
        this.labels = [];
        this.submit();
    }

    async searchTags (query) {
        this.tagLoading = true;
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.searchTicketTags({
                name: query
            });
            this.tagLists = res.data.items;
        } catch (e) {
            this.tagLists = [];
            console.log(e);
        }
        this.tagLoading = false;
        lxReportClick(FILTER_LX_MAP['label_search']);
    }
}
</script>

<style lang="scss">
.filter-multi__tag {
    // .mtd-dropdown-menu {
    //     min-height: 400px;
    // }
    .mtd-dropdown-menu-item {
        &.hover,
        &:hover {
            background-color: #fff;
        }
    }
}
.tag-dropdown-item .mtdicon-check {
    display: none;
    line-height: 36px;
    float: right;
}
.checked-item .mtdicon-check {
    display: inline-block;
    font-family: PingFangSC-Medium;
}
.filter-multi__content {
    width: 100%;
    button {
        width: 100%;
        background-color: #fff;
        border-color: rgba(0, 0, 0, 0.12) !important;
        padding-left: 8px;
        .filter-multi__text {
            float: left;
            color: rgba(0, 0, 0, 0.84);
            font-size: 12px;
        }
        .filter-multi__icon {
            float: right;
            margin-top: 10px;
        }
        .filter-multi__text--placehoder {
            color: rgba(0, 0, 0, 0.24);
            font-size: 14px;
        }
    }
}
.tag-hidden-popper {
    display: none !important;
}
</style>
