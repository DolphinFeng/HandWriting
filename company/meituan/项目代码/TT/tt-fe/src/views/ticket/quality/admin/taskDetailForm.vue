<template>
    <mtd-form
        :rules="customRules"
        :model="infoForm"
        :label-width="125"
        ref="infoForm">
        <div class="info">
            <div class="title-text">基本信息</div>
            <div class="display-wrapper" v-if="inDisplay">
                <div class="item"><span class="label">抽检任务名称：</span>{{ formData.name || '质检任务' }}</div>
                <div class="item"><span class="label">质检模板：</span>{{ formData.templateName || '模板' }}</div>
            </div>
            <div v-else>
                <mtd-form-item
                    label="质检任务名称"
                    prop="name">
                    <mtd-input
                        type="text"
                        @change="onChanged"
                        v-model="infoForm.name" />
                </mtd-form-item>
                <mtd-form-item label="质检模板" prop="templateId">
                    <select-template
                        style="width:100%;"
                        placeholder="请选择质检模板"
                        remote
                        popper-class="inspection-template-popper"
                        :remote-method="searchTemplate"
                        :default-none="defaultNone"
                        :value="infoForm.templateId"
                        :jump-link="ctiSettingUrl"
                        @change="onTemplateChanged"
                        input-placeholder="请输入模板名称">
                        <mtd-option
                            v-for="(item, index) in templateList"
                            :key="index"
                            :value="item.id"
                            :label="item.name" />
                        <mtd-button
                            v-if="!defaultNone"
                            class="template-setting-btn"
                            :href="ctiSettingUrl"
                            target="_blank"
                            type="text"
                            icon="mtdicon mtdicon-setting">去配置质检模板</mtd-button>
                    </select-template>
                </mtd-form-item>
            </div>
        </div>
        <div class="filter">
            <div class="title-text">抽取范围</div>
            <div class="display-wrapper" v-if="inDisplay">
                <div class="item"><span class="label">TT服务目录：</span>{{ formData.ticketCtiName }}</div>
                <div class="item"><span class="label">工单状态：</span>{{ formData.ticketState }}</div>
                <div class="item"><span class="label">工单创建时间：</span>{{ formData.ticketCreated }}</div>
                <div class="item"><span class="label">处理人：</span>{{ formData.ticketAssigned }}</div>
            </div>
            <div v-else>
                <div class="title-tips">抽取范围需同时满足以下筛选条件</div>
                <tt-ticket-filter :filter-form="infoForm.ticketFilter" @change="onTicketFilterChanged" />
            </div>
        </div>
        <div class="rules">
            <div class="title-text">抽取规则</div>
            <div class="display-wrapper" v-if="inDisplay">
                <div class="item"><span class="label">抽取总量：</span>{{ displayDrawNumber }}</div>
                <div class="item"><span class="label">质检员：</span><user-avatar
                    v-for="(item, index) in formData.inspector"
                    :key="index"
                    :username="item.name"
                    :display-name="item.displayName"
                    :avatar="item.avatarUrl" /></div>
                <div class="item"><span class="label">抽取时间：</span>{{ formData.drawAt | formatTime }}</div>
                <div class="item"><span class="label">截止时间：</span>{{ formData.dueAt | formatTime }}</div>
            </div>
            <div v-else>
                <mtd-form-item
                    label="抽取总量"
                    class="draw-amount-item"
                    prop="drawNumber">
                    <mtd-radio-group v-model="infoForm.drawType" @input="onDrawTypeChanged">
                        <mtd-radio value="COUNT">按数字</mtd-radio>
                        <mtd-radio value="PERCENT">按比例</mtd-radio>
                    </mtd-radio-group>
                    <mtd-input-number
                        v-model="infoForm.drawNumber"
                        @change="onChanged"
                        :controls="false"
                        :max="editMaxNumber"
                        :precision="0"
                        :min="1" />{{ infoForm.drawType === 'COUNT' ? '单' : '%' }}
                </mtd-form-item>
                <mtd-form-item
                    label="质检员"
                    prop="inspectorList">
                    <mtd-select
                        placeholder="请选择质检员"
                        multiple
                        class="item"
                        style="width:100%;"
                        clearable
                        @change="onChanged"
                        collapse-tags
                        :filterable="true"
                        :debounce="500"
                        v-model="infoForm.inspectorList"
                        ref="inspector">
                        <mtd-option
                            v-for="(item, index) in inspectorList"
                            :key="index"
                            :label="`${item.displayName}/${item.name}`"
                            :value="item.name" />
                    </mtd-select>
                </mtd-form-item>
                <mtd-form-item
                    label="任务抽取时间"
                    prop="drawAt">
                    <span slot="label">任务抽取时间<mtd-tooltip
                        size="small"
                        placement="top"
                        content="仅支持选中未来30天内的时间">
                        <i class="mtdicon mtdicon-question-circle-o" />
                    </mtd-tooltip>
                    </span>
                    <mtd-date-picker
                        ref="drawTime"
                        class="item"
                        @change="onChanged"
                        style="width:100%;"
                        v-model="infoForm.drawAt"
                        clearable
                        :options="drawTimeOptions"
                        :open.sync="openDrawTimePanel"
                        confirm
                        type="datetime"
                        value-format="timestamp"
                        placeholder="请选择任务抽取时间">
                        <template v-slot:confirm>
                            <mtd-button-group>
                                <mtd-button type="text-primary" @click="onDrawPanelCurrentBtn">此刻</mtd-button>
                                <mtd-button type="primary" @click="onDrawPanelConfirm">确定</mtd-button>
                            </mtd-button-group>
                        </template>
                    </mtd-date-picker>
                </mtd-form-item>
                <mtd-form-item
                    label="任务截止时间"
                    prop="dueAt">
                    <mtd-date-picker
                        ref="drawTime"
                        style="width:100%;"
                        class="item"
                        @change="onChanged"
                        v-model="infoForm.dueAt"
                        clearable
                        type="datetime"
                        value-format="timestamp"
                        placeholder="请选择任务截止时间" />
                </mtd-form-item>
            </div>
        </div>
    </mtd-form>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import * as api from '@/api';
import selectTemplate from '../component/selectTemplate.vue';
import UserAvatar from '@/components/user-avatar.vue';
import FilterCategoryTree from '@/components/filter-category-tree.vue';
import cloneDeep from 'lodash.clonedeep';
import { Getter } from 'vuex-class';
import TaskProgress from '../component/progress.vue';
import TtTicketFilter from './ttTicketFilter.vue';
const TODAY: number = new Date(new Date().setHours(0, 0, 0, 0)).valueOf();
const validateName: Function = (_rule, value, callback) => {
    if (!value) {
        return callback(new Error('名称不能为空'));
    }
    if (value.length > 25) {
        return callback(new Error('名称不能超过25个字'));
    }
    return callback();
};
const validateTemplateId: Function = (_rule, value, callback) => {
    if (!value) {
        return callback(new Error('模板不能为空'));
    }
    return callback();
};
const validateDrawNumber: Function = (_rule, value, callback) => {
    if (!value) {
        return callback(new Error('抽取总量不能为0'));
    }
    return callback();
};
const validateInspector: Function = (_rule, value, callback) => {
    if (!value || !value.length) {
        return callback(new Error('质检员不能为空'));
    }
    return callback();
};
const validateDrawAt: Function = (_rule, value, callback) => {
    if (!value) {
        return callback(new Error('任务抽取时间不能为空'));
    }
    return callback();
};
@Component({
    components: {
        selectTemplate,
        FilterCategoryTree,
        UserAvatar,
        TaskProgress,
        TtTicketFilter
    }
})
export default class TaskDetailForm extends Vue {
    @Getter env;
    @Prop() formData: any;
    @Prop({ default: 'display' }) mode: 'copy' | 'edit' | 'create' | 'display';
    inDisplay: boolean = false;
    inspectorList: any[] = [];
    templateList: any[] = [];
    defaultTemplates: any[] = [];
    defaultNone: boolean = true;
    openDrawTimePanel: boolean = false;
    infoForm: any = {};
    customRules: any = {
        name: { validator: validateName, trigger: 'blur', required: true },
        templateId: { validator: validateTemplateId, trigger: 'blur', required: true },
        drawNumber: { validator: validateDrawNumber, trigger: 'blur', required: true },
        inspectorList: { validator: validateInspector, trigger: 'blur', required: true },
        drawAt: { validator: validateDrawAt, trigger: 'blur', required: true }
    };
    @Watch('mode', { immediate: true })
    onModeChanged () {
        this.inDisplay = this.mode === 'display';
    }
    @Watch('formData', { immediate: true, deep: true })
    onDataChanged () {
        if (this.formData) {
            this.infoForm = cloneDeep(this.formData);
        }
    }
    created () {
        this.getInspector();
        if (this.mode === 'create') {
            this.getTemplateList();
        } else {
            this.getTemplateList('', 999);
        }
    }
    onTemplateChanged (val) {
        this.infoForm.templateId = val;
        this.$refs['infoForm']?.validateFields('templateId', valid => {
            if (valid) {
                this.$emit('change-template');
                this.onChanged();
            }
        });
    }
    onDrawTypeChanged (val) {
        if (val === 'PERCENT' && this.infoForm.drawNumber > 100) {
            // 主动校验drawNumber是否符合要求
            this.infoForm.drawNumber = 100;
        }
        this.onChanged();
    }
    onTicketFilterChanged (val) {
        this.infoForm.ticketFilter = val;
        this.onChanged();
    }
    onChanged () {
        this.$emit('change', this.infoForm);
    }
    onDrawPanelConfirm () {
        this.openDrawTimePanel = false;
        this.$refs['infoForm']?.validateFields('drawAt');
    }
    onDrawPanelCurrentBtn () {
        // 点“此刻”时，按照点击时间增加45s
        this.infoForm.drawAt = new Date().getTime() + 45000;
        this.onChanged();
    }
    checkDefaultTemplate () {
        const target = this.templateList.find(item => item.id === this.infoForm.templateId);
        if (!target) {
            this.infoForm.templateId = null;
        }
    }
    // checkDefaultInspector () {
    //     const deletedItem = this.infoForm.inspectorList?.filter(item => {
    //         const hasInspector = this.inspectorList.find(ele => ele.name === item);
    //         return !hasInspector;
    //     });
    // }
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
    async searchTemplate (query?) {
        if (!query) {
            this.templateList = this.defaultTemplates;
            return;
        }
        this.getTemplateList(query);
    }
    async getTemplateList (keyword?: string, total?: number) {
        const res: Ajax.AxiosResponse = await api.inspectApi.searchInspectTemplates({
            objectId: Number(this.spaceId),
            keyword,
            total
        });
        const { code, data } = res;
        if (code === 200 && data) {
            this.templateList = data.items || [];
            this.defaultTemplates = data.items || [];
            this.defaultNone = !keyword && !data.items?.length;
            this.checkDefaultTemplate();
        }
    }
    get ctiSettingUrl () {
        const baseUrl = this.env === 'prod' ? '//cti.sankuai.com' : (this.env === 'staging' ? '//cti.fetc.st.sankuai.com' : '//cti.cloud.test.sankuai.com');
        return `${baseUrl}/space/${this.spaceId}/quality-inspection-template`;
    }
    get displayDrawNumber () {
        return this.formData.drawType === 'COUNT' ? `${this.formData.drawNumber || 0}单` : `按抽取范围内总数的 ${this.formData.drawNumber || 0}%抽取`;
    }
    get editMaxNumber () {
        return this.infoForm.drawType === 'COUNT' ? 1000 : 100;
    }
    get drawTimeOptions () {
        return {
            disabledDate (date: any) {
                const time = date.getTime();
                return time < TODAY || (time - TODAY) / (1000 * 60 * 60 * 24) > 30;
            }
        };
    }
    get spaceId () {
        return (this.$route.query.filter || '').slice(6);
    }
}
</script>
<style lang="scss">
.inspection-template-popper {
    min-width: 208px;
    max-width: 425px;
    padding-bottom: 0;
    &.default-none-popper {
        width: 208px;
        .mtd-dropdown-menu {
            padding-bottom: 28px;
        }
    }
    .mtd-dropdown-menu {
        padding-bottom: 36px;
    }
    .template-setting-btn {
        height: 36px;
        border: none;
        border-radius: 0;
        box-shadow: inset 0 1px 0 0 rgba(0, 0, 0, 0.06);
        width: 100%;
        color: rgba(0, 0, 0, 0.5);
        font-size: 12px;
        position: absolute;
        bottom: 0;
        background: #fff;
        span {
            line-height: 36px;
        }
        .mtdicon-setting {
            color: rgba(0, 0, 0, 0.5);
            vertical-align: top;
            line-height: 36px;
        }
        &:hover {
            text-decoration: none;
        }
    }
}
</style>