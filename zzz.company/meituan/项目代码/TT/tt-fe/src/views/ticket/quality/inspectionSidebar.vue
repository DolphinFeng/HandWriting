<template>
    <div style="height: 100%; overflow-y: auto;">
        <mtd-menu
            v-model="activeName"
            class="inspection-sidemenu"
            :collapse="isCollapse"
            :default-expanded-names="['workDesk', 'task']"
            @select="handleSelect"
            mode="inline">
            <mtd-submenu name="workDesk" v-if="inspectionInfo.isInspector">
                <template slot="title">质检工作台</template>
                <mtd-icon
                    slot="icon"
                    name="shield-success" />
                <mtd-menu-item
                    v-for="item in workDeskList"
                    :key="item.value"
                    :filter="item.value"
                    :name="item.value">
                    <span>{{ item.label }}</span>
                    <span class="related-num">{{ taskNum[item.value] || 0 }}</span>
                </mtd-menu-item>
            </mtd-submenu>
            <mtd-submenu name="task" v-if="inspectionInfo.isAdmin">
                <template slot="title">质检任务管理</template>
                <i slot="icon" class="iconfont icon-zhijianrenwuguanliicon" />
                <mtd-menu-item
                    v-for="item in spaceTaskList"
                    :key="item.name"
                    :filter="item.name"
                    :name="item.name">
                    <span>{{ item.objectName }}</span>
                </mtd-menu-item>
            </mtd-submenu>
        </mtd-menu>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Getter, Mutation } from 'vuex-class';
import { InspectionSideBar } from '@/config/inspection.conf';
import * as api from '@/api';

@Component({})
export default class QualitySideBar extends Vue {
    @Prop({ required: false, default: false }) isCollapse: boolean;
    @Getter inspectionInfo;
    @Mutation setInspectionFilterTitle;

    workDeskList: CommonTypes.mapObject[] = InspectionSideBar;
    spaceTaskList: CommonTypes.mapObject[] = [];
    activeName: string = 'toInspect';
    taskNum: object = {};
    spaceNameMap: object = {};

    @Watch('$route', { immediate: true })
    onRouteChanged (to) {
        if (to.query.filter) {
            this.activeName = to.query.filter;
            const isFromSpace = this.activeName.includes('space-');
            if (!this.inspectionInfo.isInspector && !isFromSpace) {
                // 非质检员，访问质检工作台链接
                this.$router.push({
                    name: this.$route.name,
                    query: {
                        filter: ''
                    }}).catch(e => e);
                return;
            }
            if (!this.inspectionInfo.isAdmin && isFromSpace) {
                // 非质检管理员，访问质检任务管理链接
                this.$router.push({
                    name: this.$route.name,
                    query: {
                        filter: 'toInspect'
                    }}).catch(e => e);
                return;
            }
            if (isFromSpace) {
                this.setInspectionFilterTitle(this.spaceNameMap[this.activeName]);
            } else {
                this.setFilterTitle(this.activeName, this.taskNum[this.activeName]);
            }
        } else {
            this.activeFirstMenu();
        }
    }
    mounted () {
        this.sidebarInit();
    }

    async sidebarInit () {
        if (this.inspectionInfo.isAdmin) {
            // 查询有质检任务的空间列表
            this.getSpaceList();
        }
        if (this.inspectionInfo.isInspector) {
            // 查询任务数量
            this.getTaskNum();
        }
    }
    async getSpaceList () {
        const res: Ajax.AxiosResponse = await api.inspectApi.getTaskManagementInfo();
        const { code, data } = res;
        if (code === 200 && data) {
            this.spaceTaskList = (data.items || []).map((item: any) => {
                item.name = 'space-' + item.objectId;
                this.spaceNameMap[item.name] = item.objectName;
                return item;
            });
            this.activeSpaceTask();
        }
    }
    async getTaskNum () {
        const res: Ajax.AxiosResponse = await api.inspectApi.getWorkSpaceInfo();
        const { code, data } = res;
        if (code === 200 && data) {
            this.taskNum = {
                toInspect: data.todoCount || 0,
                toSubmit: data.toSubmitCount || 0,
                finished: data.completedCount || 0,
                cancelled: data.cancelledCount || 0
            };
            if (!this.activeName?.includes('space-')) {
                this.setFilterTitle(this.activeName, this.taskNum[this.activeName]);
            }
        }
    }
    activeSpaceTask () {
        if (!this.inspectionInfo.isInspector && this.inspectionInfo.isAdmin) {
            // 不是质检员、是质检管理员
            this.activeName = this.spaceTaskList[0]?.name;
            this.activeName && this.$router.push({
                name: this.$route.name,
                query: {
                    filter: this.activeName
                }
            }).catch(e => e);
        }
        if (this.activeName?.includes('space-')) {
            this.setInspectionFilterTitle(this.spaceNameMap[this.activeName]);
        }
    }

    mountSubmenuExpand () {
        const filter = this.$route.query.filter;
        const workDeskFilter = this.workDeskList.map(item => item.value);
        if (!filter) {
            this.activeFirstMenu();
        } else if (workDeskFilter.includes(filter)) {
            this.setFilterTitle(this.activeName, this.taskNum[this.activeName]);
        } else if (filter && filter.includes('space-')) {
            this.setInspectionFilterTitle(this.spaceNameMap[this.activeName]);
        }
    }
    activeFirstMenu () {
        if (this.inspectionInfo.isInspector) {
            this.activeName = 'toInspect';
            this.$router.push({
                name: this.$route.name,
                query: {
                    filter: this.activeName
                }
            }).catch(e => e);
            this.setFilterTitle(this.activeName, this.taskNum[this.activeName]);
        } else if (this.spaceTaskList[0]?.name) {
            // 不是质检员，是质检管理员
            this.activeName = this.spaceTaskList[0]?.name;
            this.activeName && this.$router.push({
                name: this.$route.name,
                query: {
                    filter: this.activeName
                }
            }).catch(e => e);
            this.setInspectionFilterTitle(this.spaceNameMap[this.activeName]);
        }
    }
    setFilterTitle (query, num) {
        const name = this.workDeskList.find(item => item.value === query)?.label || '筛选';
        let filterTitle = num ? `${name} <span>${num}</span>` : name;
        this.setInspectionFilterTitle(filterTitle);
    }

    handleSelect (el: any) {
        const key = el.others.filter;
        const routeName = this.$route.name;
        const filter = this.$route.query.filter;
        let newQuery = { filter: key };
        // 如果侧边tab没切换，id保留
        if (key === filter) {
            let routeQuery = JSON.parse(JSON.stringify(this.$route.query));
            newQuery = Object.assign(routeQuery, {
                filter: key
            });
        }
        this.$router.push({
            name: routeName,
            query: newQuery
        }).catch(e => e);
    }

}
</script>

<style lang="scss">
.related-num {
    float: right;
    color: rgba(0, 0, 0, 0.6);
}
.inspection-sidemenu {
    color: rgba(0, 0, 0, 0.84);
    .mtd-submenu-title {
        padding-left: 14px !important;
        font-weight: 500;
        font-family: PingFangSC-Medium;
    }
    .mtd-menu-item-title {
        padding-left: 40px !important;
    }
    .mtd-submenu-icon {
        font-size: 18px;
        .mtdicon {
            line-height: 40px;
            vertical-align: top;
        }
    }
}
</style>
