<template>
    <div class="catalog-header-container">
        <search-header @change="handleCategoryChange" />
        <div class="header-content">
            <span
                class="header-item"
                v-for="(item, index) in header"
                :key="index">
                <span class="item-title">{{ item.title }} <span class="first-important">{{ item.title_First }}</span>{{ item.title_En }}</span>
                <span class="item-count">{{ item.count }}</span>
            </span>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import SearchHeader from './search-header.vue';
import CategoryTree from './category-tree.vue';

/**
 * CTI目录头部信息
 *
 * @author xiaokunyu
 * @date 01/11/2019
 */
@Component({
    components: {
        CategoryTree,
        SearchHeader
    }
})
export default class CatalogHeader extends Vue {
    @Prop({
        default: () => [
            {
                title: '一级目录',
                count: 0
            },
            {
                title: '二级目录',
                count: 0
            },
            {
                title: '三级目录',
                count: 0
            }
        ]
    })
    header: Array<{ title: string; count: number }>;

    handleCategoryChange (val) {
        this.$emit('change', val);
    }
    clearEvent () {
        this.$emit('clear');
    }
}
</script>

<style lang="postcss">
.catalog-header-container {
    border-bottom: 1px solid #D3D8E4;
    .header-content {
        width: fit-content;
        padding: 10px 20px;
        .header-item {
            display: table-cell;
            vertical-align: middle;
            width: 333px;
            height: 28px;
            .item-title {
                margin: 0 6px 0 14px;
                font-family: PingFangSC-Medium;
                color: #464646;
                letter-spacing: 0;
                text-align: center;
            }
            .item-count {
                font-size: 12px;
                color: #6F6F6F;
            }
            &:not(:last-child) {
                border-right: 1px solid #D3D8E4;
            }
            .first-important {
                color: #FF8800;
            }
        }
    }
}
</style>
