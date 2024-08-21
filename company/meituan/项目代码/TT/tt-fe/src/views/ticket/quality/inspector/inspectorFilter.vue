<template>
    <mtd-form
        :inline="true"
        :label-width="0"
        v-model="filterForm"
        ref="taskFilterForm"
        class="inspector-filter-form">
        <div>
            <mtd-form-item class="inline-item inline-wider">
                <mtd-input
                    placeholder="请搜索质检任务名称"
                    class="item"
                    @keyup.enter.native="submit"
                    v-model="filterForm.taskName" />
            </mtd-form-item>
            <mtd-form-item class="inline-item mtd-item">
                <mtd-select
                    placeholder="请选择任务所属空间"
                    v-model="filterForm.taskSpaceIdList"
                    multiple
                    class="item"
                    :filterable="true"
                    clearable
                    collapse-tags
                    @change="submit"
                    ref="taskSpaceIdList">
                    <mtd-option
                        v-for="(item, index) in spaceList"
                        :key="index"
                        :label="item.objectValue"
                        :value="item.objectId" />
                </mtd-select>
            </mtd-form-item>
            <mtd-form-item class="inline-item mtd-item">
                <mtd-select
                    placeholder="请输入任务创建人MIS"
                    multiple
                    class="item"
                    clearable
                    collapse-tags
                    :filterable="true"
                    :debounce="500"
                    :remote="true"
                    :remote-method="remoteSearchMethod"
                    v-model="filterForm.taskCreatorMisList"
                    @change="submit"
                    ref="taskCreatorMisList">
                    <mtd-option
                        v-for="(item, index) in misList"
                        :key="index"
                        :label="item.displayName"
                        :value="item.username">
                        <span>{{ `${item.displayName}(${item.username})` }}</span>
                    </mtd-option>
                </mtd-select>
            </mtd-form-item>
        </div>
        <div>
            <mtd-form-item class="inline-item inline-wider">
                <mtd-date-picker
                    @change="submit"
                    ref="drawTime"
                    class="item"
                    v-model="filterForm.drawTime"
                    clearable
                    type="datetimerange"
                    placeholder="请选择任务抽取时间" />
            </mtd-form-item>
            <mtd-form-item class="inline-item">
                <mtd-date-picker
                    @change="submit"
                    ref="dueTime"
                    clearable
                    class="item"
                    v-model="filterForm.dueTime"
                    type="datetimerange"
                    placeholder="请选择任务截止时间" />
            </mtd-form-item>
        </div>
    </mtd-form>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { InspectionRouteStatusMap } from '@/config/inspection.conf';
import * as api from '@/api';

@Component({
    components: {}
})
export default class InspectorFilter extends Vue {
    @Prop({ default: 1 }) currentPage: number;
    inspectionRouteStatusMap: any = InspectionRouteStatusMap;
    spaceList: any[] = [];
    misList: any[] = [];
    filterForm: any = {
        taskName: '',
        taskSpaceIdList: [],
        taskCreatorMisList: [],
        drawTime: [],
        dueTime: []
    };
    created () {
        this.getSpaceList();
        this.$emit('change', this.filterForm);
    }
    async getSpaceList () {
        const res: Ajax.AxiosResponse = await api.inspectApi.getInspectorTaskSpaceList({
            inspectorTaskState: this.inspectorTaskStatus
        });
        const { code, data } = res;
        if (code === 200 && data) {
            this.spaceList = data.items || [];
        }
    }
    resetFilter () {
        this.filterForm = {
            taskName: '',
            taskSpaceIdList: [],
            taskCreatorMisList: [],
            drawTime: [],
            dueTime: []
        };
        this.$emit('change', this.filterForm);
    }
    async remoteSearchMethod (query?) {
        if (!query) {
            this.misList = [];
            return;
        }
        try {
            const res: Ajax.AxiosResponse = await api.ctiApi.searchUser({
                keyword: query || '',
                includeVirtual: true,
                includeOffJob: true,
                includeExternal: true
            });
            this.misList = res.data.items;
        } catch (e) {
            this.misList = [];
            console.log(e);
        }
    }
    submit () {
        this.$emit('update:currentPage', 1);
        this.$emit('change', this.filterForm);
    }
    get inspectionQuery () {
        return this.$route.query.filter || 'toInspect';
    }
    get inspectorTaskStatus () {
        return this.inspectionRouteStatusMap[this.inspectionQuery as any];
    }
}
</script>

<style lang="scss">
.inspector-filter-form {
    .mtd-form-item {
        margin: 5px 12px;
        width: 30%;
        .item {
            width: 100%;
        }
        .mtd-input-suffix-inner {
            width: 32px;
            line-height: 30px;
            font-size: 16px;
        }
        .mtd-select-tags {
            padding-left: 8px;
            .mtd-select-search-field {
                margin: 0;
            }
        }
    }
}
</style>
