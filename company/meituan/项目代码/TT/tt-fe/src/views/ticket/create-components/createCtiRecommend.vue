<template>
    <div class="create-recommend-wrapper">
        <div class="recommend-tip" v-if="dataList.length">
            <span>
                <i slot="icon" class="iconfont icon-prompt" />
                {{ $getText('create_cti_recommend_tip', '根据您的描述，我们向您推荐以下目录，选择之后您的问题可以更快的被解决哦~') }}</span>
        </div>
        <ul class="recommend-content-list">
            <li
                :class="['recommend-item', { 'selected-item': selectedItemId === recommend.itemId}]"
                v-for="(recommend, index) in dataList"
                :key="recommend.itemId"
                @click="selectRecommend(recommend)">
                <span class="list-icon">{{ index + 1 }}</span>
                <span>{{ recommend.categoryId === noCatalogId ? $getText('create_cti_recommend_no_catalog', '不选择目录直接发起') : `${recommend.categoryName} / ${recommend.typeName} / ${recommend.itemName}` }}</span>
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import { NoCatalog } from '@/config/map.conf';
import { lxReportClick } from '@/utils/directive/lxanaly';
import { CREATE_CTI_CHOOSE } from '@/config/lx_map.conf';
/**
 * 新版问题描述
 *
 * @author liyuyao
 * @date 04/20/2019
 */
@Component({
    components: {
    }
})
export default class CreateCtiRecommend extends Vue {
    @Getter inside;
    @Getter loginType;

    @Prop()
    recommendList: CommonTypes.ctiTreeItem[];
    @Prop()
    clearSelectedCti: boolean;

    dataList: CommonTypes.ctiTreeItem[] = [];

    @Watch('recommendList', { deep: true, immediate: true })
    getList (list) {
        if (list) {
            this.dataList = Object.assign([], list);
        }
    }

    @Watch('clearSelectedCti', { immediate: true })
    clearCti (flag) {
        if (flag) {
            this.selectedItemId = 0;
        }
    }

    value: string = '';
    noCatalogId: number = NoCatalog.categoryId;

    selectedItemId: number = 0;

    selectRecommend (cti) {
        if (this.selectedItemId === cti.itemId) {
            // 已选中该条目录，取消选中状态
            this.selectedItemId = 0;
            this.$emit('change');
        } else {
            lxReportClick(CREATE_CTI_CHOOSE['cti_select_recommend']);
            this.selectedItemId = cti.itemId;
            this.$emit('change', cti);
        }
    }
}
</script>

<style lang="scss" scoped>
.create-recommend-wrapper {
    // margin-top: 20px;
    .recommend-tip span {
        display: inline-block;
        padding: 0 12px 0 4px;
        background: #fff9e6;
        margin-left: -4px;
        border-radius: 4px;
        line-height: 25px;
        font-family: PingFang SC;
        font-size: 12px;
        color: #592d00;
        vertical-align: middle;
        .icon-prompt {
            vertical-align: middle;
            margin-right: 3px;
        }
    }
}
.recommend-item {
    margin-top: 12px;
    font-family: PingFang SC;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.84);
    letter-spacing: 0;
    line-height: 22px;
    font-weight: 400;
    cursor: pointer;
    .list-icon {
        display: inline-block;
        margin-right: 4px;
        width: 16px;
        line-height: 16px;
        background: rgba(0, 0, 0, 0.06);
        border-radius: 2px;
        text-align: center;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.36);
        letter-spacing: 0;
        font-weight: 500;
    }
    &:hover {
        color: #f80;
        font-family: PingFangSC-Medium;
        .list-icon {
            background: rgba(255, 136, 0, 0.12);
            color: #f80;
        }
    }
}
.selected-item {
    color: #f80;
    font-family: PingFangSC-Medium;
    .list-icon {
        background: rgba(255, 136, 0, 0.12);
        color: #f80;
    }
}
</style>
