<template>
    <div>
        <mtd-form-item
            label="服务目录"
            prop="ctiNameList">
            <filter-category-tree
                :default-val="editForm.ctiNameList"
                :from-inspection="true"
                @categoryChange="categoryChange"
                ref="filterCategoryTree" />
        </mtd-form-item>
        <mtd-form-item
            label="工单创建时间"
            prop="createdAt">
            <mtd-date-picker
                clearable
                style="width:100%;"
                type="datetimerange"
                value-format="timestamp"
                v-model="editForm.createdAt"
                @change="onChanged"
                placeholder="请选择创建时间" />
        </mtd-form-item>
        <mtd-form-item
            label="工单状态"
            prop="state">
            <mtd-select
                style="width:100%;"
                v-model="editForm.state"
                collapse-tags
                placeholder="请选择TT状态"
                multiple
                clearable
                @change="onChanged"
                icon="mtdicon-down-thick mtdicon"
                class="overflow-filter">
                <mtd-option
                    v-for="(item, index) in ticketStatus"
                    :key="index"
                    :label="$getText(item.key)"
                    :value="item.value" />
            </mtd-select>
        </mtd-form-item>
        <mtd-form-item
            label="处理人"
            prop="assigned">
            <mtd-select
                clearable
                :multiple="true"
                v-model="editForm.assigned"
                style="width:100%;"
                placeholder="请输入处理人MIS"
                :filterable="true"
                :debounce="500"
                @change="onChanged"
                auto-clear-query
                icon="mtdicon-down-thick mtdicon"
                :remote="true"
                :remote-method="remoteMethod">
                <mtd-option
                    v-for="(item, index) in userList"
                    :key="index"
                    :label="`处理人:${item.username}`"
                    :value="item.username">
                    <span>{{ `${item.displayName}(${item.username})` }}</span>
                </mtd-option>
            </mtd-select>
        </mtd-form-item>
    </div>  
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import * as api from '@/api';
import selectTemplate from '../component/selectTemplate.vue';
import UserAvatar from '@/components/user-avatar.vue';
import FilterCategoryTree from '@/components/filter-category-tree.vue';
import { TicketStatus } from '@/config/map.conf';
import cloneDeep from 'lodash.clonedeep';
import TaskProgress from '../component/progress.vue';

@Component({
    components: {
        selectTemplate,
        FilterCategoryTree,
        UserAvatar,
        TaskProgress
    }
})
export default class TtTicketFilter extends Vue {
    @Prop() filterForm: any;
    templateList: any[] = [];
    ticketStatus: {key: string, value: string}[] = TicketStatus;
    userList: CommonTypes.UserInfoItem[] = [];
    editForm: any = {
        assigned: [],
        ctiNameList: [],
        createdAt: [],
        state: ['已解决', '已关闭']
    };
    @Watch('filterForm', { immediate: true, deep: true })
    onDataChanged () {
        if (this.filterForm) {
            this.editForm = cloneDeep(this.filterForm);
        }
    }
    categoryChange (val) {
        this.editForm.ctiNameList = val;
        this.onChanged();
    }
    onChanged () {
        this.$emit('change', this.editForm);
    }
    async remoteMethod (query?) {
        if (!query) {
            this.userList = [];
            return;
        }
        try {
            const res: Ajax.AxiosResponse = await api.ctiApi.searchUser({
                keyword: query || '',
                includeVirtual: true,
                includeOffJob: true,
                includeExternal: true
            });
            this.userList = res.data.items;
        } catch (e) {
            this.userList = [];
            console.log(e);
        }
    }
}
</script>