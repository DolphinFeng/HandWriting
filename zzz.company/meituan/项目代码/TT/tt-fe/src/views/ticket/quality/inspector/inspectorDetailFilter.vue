<template>
    <mtd-form
        :inline="true"
        :label-width="0"
        v-model="filterForm"
        ref="taskDetailFilterForm"
        class="task-detail-filter-form">
        <mtd-form-item class="inline-item mtd-item">
            <mtd-select
                placeholder="请选择任务质检状态"
                multiple
                class="item"
                clearable
                collapse-tags
                v-model="filterForm.inspectorTicketState"
                @change="submit"
                ref="filter-type">
                <mtd-option
                    v-for="(item, index) in taskStatusOption"
                    :key="index"
                    :label="item.label"
                    :value="item.value" />
            </mtd-select>
        </mtd-form-item>
        <mtd-form-item class="inline-item">
            <mtd-input
                class="item"
                v-model="filterForm.inspectorTicketId"
                @keyup.enter.native="submit('ticketId')"
                placeholder="请输入质检工单ID" />
        </mtd-form-item>
        <mtd-form-item class="inline-item">
            <mtd-input
                class="item"
                v-model="filterForm.ticketName"
                @keyup.enter.native="submit"
                placeholder="请搜索TT标题" />
        </mtd-form-item>
        <mtd-form-item class="inline-item mtd-item">
            <mtd-select
                placeholder="请选择TT处理人"
                multiple
                class="item"
                clearable
                collapse-tags
                :filterable="true"
                :debounce="500"
                :remote="true"
                :remote-method="remoteSearchMethod"
                v-model="filterForm.ticketAssigned"
                @change="submit"
                ref="filter-type">
                <mtd-option
                    v-for="(item, index) in misList"
                    :key="index"
                    :label="item.displayName"
                    :value="item.username">
                    <span>{{ `${item.displayName}(${item.username})` }}</span>
                </mtd-option>
            </mtd-select>
        </mtd-form-item>
    </mtd-form>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { InspectorTicketStatusOption } from '@/config/inspection.conf';
import * as api from '@/api';

@Component({
    components: {}
})
export default class InspectorTicketFilter extends Vue {
    @Prop({ default: 1 }) currentPage: number;
    taskStatusOption: any[] = InspectorTicketStatusOption;
    misList: any[] = [];
    filterForm: any = {
        inspectorTicketId: null,
        inspectorTicketState: [],
        ticketName: '',
        ticketAssigned: []
    };
    resetFilter () {
        this.filterForm = {
            inspectorTicketId: null,
            inspectorTicketState: [],
            ticketName: '',
            ticketAssigned: []
        };
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
    submit (type: any) {
        if (type === 'ticketId' && isNaN(Number(this.filterForm.inspectorTicketId))) {
            this.$mtd.message.error('请输入正确的ID进行搜索');
            return;
        }
        this.$emit('update:currentPage', 1);
        this.$emit('change', this.filterForm);
    }
}
</script>


