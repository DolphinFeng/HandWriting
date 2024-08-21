<template>
    <mtd-form
        :inline="true"
        :label-width="0"
        v-model="filterForm"
        ref="taskFilterForm"
        class="task-list-filter-form">
        <div>
            <mtd-form-item class="inline-item inline-wider">
                <mtd-input
                    placeholder="请搜索质检任务名称"
                    class="item"
                    @keyup.enter.native="submit"
                    v-model="filterForm.name" />
            </mtd-form-item>
            <mtd-form-item class="inline-item mtd-item">
                <mtd-select
                    placeholder="请选择任务状态"
                    multiple
                    class="item"
                    clearable
                    collapse-tags
                    v-model="filterForm.state"
                    @change="submit"
                    ref="filter-type">
                    <mtd-option
                        v-for="(item, index) in taskStatusOption"
                        :key="index"
                        :label="item.label"
                        :value="item.value" />
                </mtd-select>
            </mtd-form-item>
            <mtd-form-item class="inline-item mtd-item">
                <mtd-select
                    placeholder="请选择质检员"
                    multiple
                    class="item"
                    clearable
                    collapse-tags
                    :filterable="true"
                    :debounce="500"
                    v-model="filterForm.inspectorList"
                    @change="submit"
                    ref="inspector">
                    <mtd-option
                        v-for="(item, index) in inspectorList"
                        :key="index"
                        :label="`${item.displayName}/${item.name}`"
                        :value="item.name" />
                </mtd-select>
            </mtd-form-item>
        </div>
        <div>
            <mtd-form-item class="inline-item mtd-item">
                <mtd-select
                    placeholder="请选择创建人"
                    multiple
                    class="item"
                    clearable
                    collapse-tags
                    :filterable="true"
                    :debounce="500"
                    :remote="true"
                    :remote-method="remoteSearchMethod"
                    v-model="filterForm.createdByList"
                    @change="submit"
                    ref="createdByList">
                    <mtd-option
                        v-for="(item, index) in creatorList"
                        :key="index"
                        :label="item.displayName"
                        :value="item.username">
                        <span>{{ `${item.displayName}(${item.username})` }}</span>
                    </mtd-option>
                </mtd-select>
            </mtd-form-item>
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
        </div>
    </mtd-form>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { TaskStatusOptionMap } from '@/config/inspection.conf';
import * as api from '@/api';
@Component({
    components: {}
})
export default class TaskFilter extends Vue {
    @Prop({ default: 1 }) currentPage: number;
    taskStatusOption: any = TaskStatusOptionMap;
    creatorList: any[] = [];
    inspectorList: any[] = [];
    filterForm: any = {
        name: '',
        state: [],
        inspectorList: [],
        createdByList: [],
        drawAtStart: null,
        drawAtEnd: null,
        drawTime: []
    };
    resetFilter () {
        this.filterForm = {
            name: '',
            state: [],
            inspectorList: [],
            createdByList: [],
            drawAtStart: null,
            drawAtEnd: null,
            drawTime: []
        };
        this.$emit('change', this.filterForm);
    }
    created () {
        this.getInspector();
    }
    async getInspector () {
        const res: Ajax.AxiosResponse = await api.inspectApi.getInspector({
            objectId: Number(this.spaceId),
            role: ['INSPECTOR']
        });
        const { code, data } = res;
        if (code === 200 && data) {
            this.inspectorList = res.data.inspector || [];
        }
    }
    submit () {
        this.$emit('update:currentPage', 1);
        this.$emit('change', this.filterForm);
    }
    async remoteSearchMethod (query?) {
        if (!query) {
            this.creatorList = [];
            return;
        }
        try {
            const res: Ajax.AxiosResponse = await api.ctiApi.searchUser({
                keyword: query || '',
                includeVirtual: true,
                includeOffJob: true,
                includeExternal: true
            });
            this.creatorList = res.data.items;
        } catch (e) {
            this.creatorList = [];
            console.log(e);
        }
    }
    get spaceId () {
        return (this.$route.query.filter || '').slice(6);
    }
}
</script>
