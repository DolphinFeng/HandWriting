<template>
    <div class="catalog-container">
        <el-menu
            :default-active="activeId.toString()"
            class="category-menu"
            ref="categoryMenu"
            :class="[isScorll && allowAdd ? 'normal-menu' : '', 'category-menu']"
            @select="selectMenu">
            <div v-if="!list || list.length === 0" class="category-no-data">
                <i class="iconfont icon-sq-wushuju" />
                <div>暂无目录</div>
            </div>
            <Container
                :drag-begin-delay="500"
                :remove-on-drop-out="true"
                drag-class="drag-item"
                non-drag-area-selector=".list-undragable"
                @drop="onDrop"
                :get-child-payload="getChildPayload">
                <Draggable
                    v-for="(item, index) in list"
                    :key="index">
                    <el-menu-item
                        :index="item.id.toString()"
                        class="with-next-list">
                        <span class="catalog-item-name">{{ item.name }}</span>
                        <i
                            v-if="allowDelete"
                            @click="deleteMenu(parseInt(activeId, 10))"
                            class="iconfont icon-shanchu-" />
                        <i
                            v-if="allowEdit"
                            @click="editMenu(parseInt(activeId, 10))"
                            class="iconfont icon-edit-" />
                        <i class="iconfont icon-xiayibu-" v-if="hasNext" />
                    </el-menu-item>
                </Draggable>
            </Container>
            <div
                v-if="!isScorll && allowAdd"
                class="add-category"
                @click="$emit('add', parseInt(activeId, 10));">
                <span class="add-category-btn">
                    <i class="iconfont icon-add-filled-" />
                    <span class="add-text">添加</span>
                </span>
            </div>
        </el-menu>
        <div
            v-if="isScorll && allowAdd"
            :class="[isScorll ? 'add-absolute' : '', 'add-category']"
            @click="$emit('add', parseInt(activeId, 10));">
            <span class="add-category-btn">
                <i class="iconfont icon-add-filled-" />
                <span class="add-text">添加</span>
            </span>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { applyDrag } from '@/utils/helpers';

import dayjs from 'dayjs';
import VueClipboards from 'vue-clipboards';
Vue.use(VueClipboards);

/**
 * CTI目录组件
 *
 * @author xiaokunyu
 * @date 01/11/2019
 */

@Component
export default class Catalog extends Vue {
    @State(state => state.cti.userInfo)
    userInfo: CommonTypes.UserInfoItem;
    @Prop({ default: false })
    allowAdd: Boolean;
    @Prop({ default: false })
    allowDelete: Boolean;
    @Prop({ default: false })
    allowEdit: Boolean;
    @Prop()
    level: number;
    @Prop({ default: true })
    hasNext: Boolean;
    @Prop({ default: () => [] })
    list: CommonTypes.CatalogItem[];
    @Prop({ default: 0 })
    activeId: number;
    $refs: any;
    isScorll: Boolean = false;

    @Watch('list', { immediate: true })
    onListChanged () {
        const menuRef = this.$refs.categoryMenu;
        if (menuRef) {
            // 目录数量过多则把添加按钮固定在页面底部
            this.$nextTick(function () {
                this.isScorll = menuRef.$el.scrollHeight > menuRef.$el.clientHeight;
            });
        }
    }
    @Watch('activeId', { immediate: true })
    onGetActiveId () {
        if (this.activeId) {
            this.$nextTick(() => {
                this.$refs.categoryMenu.activeIndex = this.activeId.toString();
            });
        }
    }
    getChildPayload (index) {
        return this.list[index];
    }
    selectMenu (index: string) {
        this.$emit('change-select', parseInt(index, 10));
    }
    onDrop (dropResult) {
        if (!this.userInfo.sysAdmin) {
            return;
        }
        const { removedIndex, addedIndex } = dropResult;
        // 每次拖拽重新填装数据 忽略这种情况触发的事件
        if (removedIndex === null || addedIndex === null || removedIndex === addedIndex) {
            return;
        }
        const list = applyDrag(this.list, dropResult);
        const ids = list.map((item) => {
            return item.id;
        });
        this.$emit('drop-handler', this.level, ids, list);
    }
    deleteMenu (id: number) {
        this.$emit('delete', id);
    }
    editMenu (id: number) {
        this.$emit('edit', id);
    }
    linkFilter (link: string) {
        if (!link) {
            return '';
        }
        return link.replace(/\+/g, '%2B');
    }
    getCreateTime (time: number) {
        return dayjs(time).format('YYYY-MM-DD HH:mm:ss');
    }
    handleCopySuccess () {
        this.$mtd.message({
            message: '复制TT链接成功',
            type: 'success'
        });
    }
    mounted () {
        const menuRef = this.$refs.categoryMenu;
        if (menuRef) {
            this.$nextTick(function () {
                this.isScorll = menuRef.$el.scrollHeight > menuRef.$el.clientHeight;
            });
        }
    }
}
</script>

<style lang="postcss">
.catalog-container {
    width: 330px;
    height: 100%;
    display: inline-block;
    vertical-align: top;
    border-right: 1px solid #EDF0F7;
    background-color: #FFFFFF;
    &:first-child {
        border-left: 1px solid #EDF0F7;
    }
    .category-menu {
        height: calc(100% - 1px);
        border-right: none;
        overflow: auto;
        .category-no-data {
            height: 40px;
            margin-top: 24px;
            text-align: center;
            font-size: 14px;
            color: #C2C8D8;
            .icon-sq-wushuju {
                font-size: 28px;
            }
        }
        .el-menu-item {
            position: relative;
            height: 34px;
            line-height: 34px;
            color: #6F6F6F;
            padding-left: 12px;
            .icon-xiayibu- {
                position: absolute;
                right: 8px;
                color: #D3D8E4;
                font-size: 12px;
            }
            .icon-shanchu-,
            .icon-edit- {
                position: absolute;
                right: 8px;
                visibility: hidden;
                opacity: 0;
                color: #808AB1;
                &:hover {
                    color: #FF6459;
                }
            }
            .icon-edit-:hover {
                color: #FF8800;
            }
            .icon-edit- {
                right: 28px;
            }
            .catalog-item-name {
                display: inline-block;
                width: 95%;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                .item-name {
                    display: inline-block;
                    width: calc(100% - 25px);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
            }
            &.no-next {
                padding: 0;
                span {
                    padding-left: 12px;
                }
            }
        }
        .el-menu-item.with-next-list.is-active {
            .icon-shanchu-,
            .icon-edit- {
                color: #FFFFFF;
                opacity: 1;
                transition: opacity 0.3s ease-in;
                visibility: visible;
            }
        }
        .el-menu-item.is-active {
            background-color: #7080BD;
            color: #FFFFFF;
            .iconfont {
                color: #FFFFFF;
            }
        }
    }
    .normal-menu {
        height: calc(100% - 35px);
    }
    .add-category {
        height: 40px;
        padding: 10px 0;
        border-top: 1px solid #EDF0F7;
        border-bottom: 1px solid #EDF0F7;
        text-align: center;
        cursor: pointer;
        &:hover {
            .add-category-btn {
                .add-text {
                    color: #FF8800;
                }
            }
        }
        .add-category-btn {
            height: 19px;
            line-height: 19px;
            .icon-add-filled- {
                color: #FF8800;
                font-size: 18px;
            }
            .add-text {
                vertical-align: top;
                color: #464646;
            }
        }
    }
    .add-absolute {
        position: absolute;
        background-color: #FFFFFF;
        bottom: 0;
        width: 328px;
    }
    .with-next-list.el-menu-item {
        .iconfont.icon-edit- {
            right: 18px;
        }
        .iconfont.icon-shanchu- {
            right: 38px;
        }
    }
}
.rg-detail-popper {
    width: 260px;
    min-height: 230px;
    max-height: 500px;
    padding: 8px 10px 0 3px;
    .loading-container {
        margin-top: 10px;
    }
}
.rg-detail-tip {
    .mtd-form-item {
        margin-bottom: 12px;
    }
    .mtd-form-item-label,
    .mtd-form-item-content {
        line-height: 17px;
        font-size: 14px;
    }
    .mtd-form-item-content {
        color: #464646;
        margin-left: 80px !important;
    }
    .mtd-form-item-label {
        width: 60px !important;
        color: #6F6F6F;
        padding-right: 0;
    }
    .quit-tag {
        color: #999999;
        font-size: 12px;
    }
}
.drag-item {
    background-color: #CFCBCB;
}
</style>
