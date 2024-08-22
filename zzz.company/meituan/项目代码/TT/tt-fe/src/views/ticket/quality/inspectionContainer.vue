<template>
    <div class="inspection-list">
        <mtd-container class="inspection-list-container">
            <mtd-aside
                :class="{
                    'mtd-aside-collapse': isCollapse
                }"
                class="list-aside"
                width="186px">
                <side-bar ref="inspectionSidebar" :is-collapse="isCollapse" />
            </mtd-aside>
            <div class="collapse-btn">
                <mtd-tooltip
                    :content="isCollapse ? '展开侧边栏' : '缩起侧边栏'"
                    placement="right">
                    <div
                        class="mtdicon-more-wrap"
                        @click="() => isCollapse = !isCollapse">
                        <i class="mtdicon mtdicon-more" />
                    </div>
                </mtd-tooltip>
            </div>
            <mtd-main class="list-content-container">
                <inspector-list v-if="listType === 'inspector'" @update="updateNum" />
                <task-list v-else-if="listType === 'admin'" />
            </mtd-main>
        </mtd-container>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import sideBar from './inspectionSidebar.vue';
import { Getter } from 'vuex-class';
import InspectorList from './inspector/inspectorList.vue';
import TaskList from './admin/taskList.vue';
import { InspectionSideBar } from '@/config/inspection.conf';

@Component({
    components: {
        sideBar,
        InspectorList,
        TaskList
    }
})
export default class QualityList extends Vue {
    @Getter inspectionInfo;
    workDeskList: CommonTypes.mapObject[] = InspectionSideBar;
    listType: 'inspector' | 'admin' | 'none' = 'inspector';
    isCollapse: boolean = false;
    @Watch('$route.query.filter', { immediate: true })
    onQueryChanged (filter) {
        if (!filter) {
            // 判断是否展示质检工作台
            if (this.inspectionInfo.isInspector) {
                this.$router.push({
                    name: this.$route.name,
                    query: {
                        filter: 'toInspect'
                    }}).catch(e => e);
            }
        } else {
            const workDeskFilter = this.workDeskList.map(item => item.value);
            if (this.inspectionInfo.isInspector && !this.inspectionInfo.isAdmin) {
                // 是质检员，不是质检管理员
                this.listType = workDeskFilter.includes(filter) ? 'inspector' : 'none';
            } else if (!this.inspectionInfo.isInspector && this.inspectionInfo.isAdmin) {
                // 不是质检员，是质检管理员
                this.listType = workDeskFilter.includes(filter) ? 'none' : 'admin';
            } else {
                // 双重身份
                this.listType = workDeskFilter.includes(filter) ? 'inspector' : 'admin';
            }
        }
    }
    updateNum () {
        this.$refs.inspectionSidebar?.getMissionNum();
    }

}
</script>

<style lang="scss">
.inspection-list {
    min-width: 1200px;
    height: 100%;
    .collapse-btn {
        flex: 0 0 auto;
        position: relative;
        width: 24px;
        height: 100%;
        vertical-align: middle;
        background: transparent;
        .mtdicon-more-wrap {
            position: absolute;
            top: 50%;
            margin-top: -26px;
            width: 40px;
            height: 52px;
            .mtdicon-more {
                position: absolute;
                top: 50%;
                left: -3px;
                margin-top: -11px;
                font-size: 22px;
                color: #bebebe;
            }
        }
        .mtdicon-more-wrap {
            background-image: url("../../../assets/img/more-btn-shadow.png");
            background-size: 16px;
            background-repeat: no-repeat;
        }
    }
    .mtd-aside {
        box-sizing: border-box;
        border-right: none;
        position: relative;
        transition: all 0.3s, width 0.3s;
        background-color: #fff;
        padding-top: 8px;
    }
    .mtd-aside-collapse {
        width: 48px !important;
    }
    .mtd-menu-collapse {
        width: 48px;
    }
    .inspection-list-container {
        height: 100%;
        .ticket-content {
            padding: 0;
        }
        .mtd-menu-light {
            background: #fff;
        }
        .list-aside {
            box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.08);
        }
    }
    .list-content-container {
        padding: 14px 24px 12px 0;
    }
    .list-content {
        .filter-title {
            font-family: PingFangSC-Medium;
            font-size: 18px;
            color: rgba(0, 0, 0, 0.84);
            vertical-align: middle;
            padding-left: 10px;
            display: flex;
            align-items: center;
            .title {
                span {
                    color: rgba(0, 0, 0, 0.35);
                }
            }
            .empty-line {
                display: inline-block;
                vertical-align: middle;
                margin-right: 16px;
                border-right: 1px solid rgba(0, 0, 0, 0.07);
                height: 16px;
                width: 16px;
            }
            .reset-btn {
                border: none;
                background: rgba(0, 0, 0, 0.06);
                font-family: PingFangSC-Regular;
                font-weight: 400;
            }
        }
        .filter-items {
            margin-top: 14px;
            background: #fff;
            box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.08);
            border-radius: 4px;
            padding: 11px 4px;
        }
        .filter-table {
            margin-top: 12px;
            .mtd-table {
                border-radius: 4px 4px 0 0;
                th {
                    background-color: #fff;
                    font-weight: 500;
                    font-family: PingFangSC-Medium;
                }
            }
        }
    }
    .pagination-container {
        margin: 0;
        background: #fff;
        padding: 12px 24px 16px 0;
        border-radius: 0 0 4px 4px;
    }
    .mtd-pagination-total {
        font-size: 14px;
    }
}
</style>
