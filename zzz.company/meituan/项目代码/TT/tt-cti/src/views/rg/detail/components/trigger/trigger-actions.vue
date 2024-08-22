<template>
    <div class="trigger-group-actions-container">
        <mtd-form-item
            :key="index"
            v-for="(action, index) in actionsForm"
            :helper="!action.mergeInvalidStatus ? (action.mergeInvalidReason || '触发器动作异常，请修改') : ''"
            :label="`动作${index + 1}：`"
            :label-width="76">
            <mtd-select
                v-model="action.fieldName"
                style="width: 172px; margin-right: 10px;"
                @change="actionChange(index)">
                <mtd-option
                    v-for="action in actionOptionsArr"
                    :key="action.value"
                    :label="action.label"
                    :value="action.value" />
            </mtd-select>
            <div style="display: inline-block;" v-if="action.fieldName">
                <mtd-select
                    v-if="action.fieldName === 'ASSIGNED'"
                    v-model="action.fieldValue"
                    :loading="searchLoading"
                    filterable
                    :debounce="200"
                    :class="{'mtd-input-invalid': !action.mergeInvalidStatus}"
                    @change="onActionDetailChanged(index)"
                    remote
                    style="width: 300px; margin-right: 10px;"
                    :remote-method="searchRgUsers">
                    <mtd-option
                        v-for="item in rgUserList"
                        :key="item.identify"
                        :label="`${item.displayName}(${item.identify})`"
                        :value="item.identify" />
                </mtd-select>
                <mtd-select
                    v-if="action.fieldName === 'CC'"
                    v-model="action.fieldValue"
                    :loading="searchLoading"
                    @change="onActionDetailChanged(index)"
                    multiple
                    :class="{'mtd-select-multiple-invalid': !action.mergeInvalidStatus}"
                    filterable
                    :debounce="200"
                    remote
                    style="width: 300px; margin-right: 10px;"
                    :remote-method="searchUsers">
                    <mtd-option
                        v-for="item in userList"
                        :key="item.username"
                        :label="`${item.displayName}(${item.username})`"
                        :value="item.username" />
                </mtd-select>
                <div style="display: inline-block;" v-if="action.fieldName === 'ITEM_ID'">
                    <category-tree
                        class="actions-catagory-tree"
                        :class="{'mtd-input-invalid': !action.actionItemStatus}"
                        :clearable="false"
                        :is-mw="true"
                        :index="index"
                        :category-tree="categoryTreeList"
                        :category-name="action && action.fieldValue.categoryName"
                        :category-id="action && action.fieldValue.categoryId"
                        :type-name="action && action.fieldValue.typeName"
                        :type-id="action && action.fieldValue.typeId"
                        :item-name="action && action.fieldValue.itemName"
                        :item-id="action && action.fieldValue.itemId"
                        @categoryChange="handleCategoryChange" />
                    <mtd-select
                        :value="action.child.temp"
                        style="width: 120px; margin: 0 10px 0 10px;"
                        @change="(e) => { handleProcessorChange(e, index) }"
                        v-if="actionsForm[index]['fieldValue']['rgId']">
                        <mtd-option
                            label="当前值班人"
                            value="AUTO" />
                        <mtd-option
                            label="指定处理人"
                            value="ASSIGNED" />
                    </mtd-select>
                    <mtd-select
                        v-model="action.child.fieldValue"
                        :loading="searchLoading"
                        filterable
                        :debounce="200"
                        remote
                        :remote-method="(e) => { searchRgUsers(e, categoryRgId, true) }"
                        @focus="currentIndex = index"
                        :class="{'mtd-input-invalid': !action.child.actionItemStatus}"
                        @change="onActionDetailChanged(index, true, true)"
                        style="width: 164px; margin-right: 10px;"
                        placeholder="请输入mis号搜索"
                        v-if="action.child && action.child.temp !== 'AUTO'">
                        <li class="mtd-dropdown-menu-item" slot="empty">
                            请输入mis号搜索
                        </li>
                        <mtd-option
                            v-for="item in categoryRgUserList"
                            :key="item.identify"
                            :label="`${item.displayName}(${item.identify})`"
                            :value="item.identify" />
                    </mtd-select>
                </div>
            </div>
            <span
                v-if="actionsForm.length > 1"
                class="text-button"
                @click="deleteAction(index)">删除</span>
            <div class="mtd-form-item-error-tip" v-if="withErrorArr[index]">请将动作{{ index + 1 }}补充完整</div>
        </mtd-form-item>
        <span class="text-icon-button" @click="addAction"><i class="iconfont icon-add-square-o" /> 添加动作</span>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { actionOptions, actionOptionsArr } from '@/config/map.conf';
import CategoryTree from '@/views/cti/components/mtd-category-tree.vue';
import * as api from '@/api';

interface FormatActionData {
    fieldAction: string;
    fieldName: string;
    fieldValue: string;
    child?: any;
    id?: number;
    parentId?: number;
    parentScene?: number;
    actionItemStatus?: boolean;
    itemInvalidReason?: string;
}

/**
 * 触发器 触发条件
 *
 * @author liyuyao
 * @date 08/20/2019
 */
@Component({
    components: {
        CategoryTree
    }
})
export default class TriggerActions extends Vue {
    @Prop({ default: 0 })
    submitSingle: number;

    @Prop()
    actions: CommonTypes.actionDoItem[];

    actionsForm: any = [{
        fieldAction: '',
        fieldValue: [],
        fieldName: '',
        id: 0,
        parentId: 0,
        parentScene: 0,
        actionItemStatus: true,
        mergeInvalidStatus: true
    }];
    childAction: any = {
        fieldAction: '',
        fieldValue: '',
        fieldName: '',
        id: 0,
        parentId: 0,
        parentScene: 0,
        temp: 'AUTO',
        actionItemStatus: true
    };
    searchLoading: boolean = false;
    rgUserList: any = [];
    userList: any = [];

    actionOptions: any = actionOptions;
    actionOptionsArr: Array<{ value: any; label: string }> = actionOptionsArr;
    categoryRgId: number | null = null;
    categoryRgUserList: any = [];

    categoryTreeList: any = [];
    currentIndex: number = 0;
    oncallUser: string = '';

    withErrorArr: boolean[] = [false];
    // 原有的校验逻辑只在提交时触发，先单独展示校验信息
    withInvalidArr: boolean[] = [false];

    @Watch('submitSingle')
    catchSubmitSingle () {
        if (!this.formError) {
            this.$emit('change', this.formatActionsData);
        }
    }
    @Watch('actions', { deep: true })
    async onGetDetailActions () {
        if (this.actions && this.actions.length) {
            this.actionsForm = await Promise.all(this.actions.map(async (action) => {
                return this.formatActionItem(action);
            }));
            this.actionsForm = this.actionsForm.filter(val => val !== undefined);
            this.actionsForm.map(val => {
                if (val.fieldName === 'ITEM_ID') {
                    val.child = this.childAction;
                    // 需要合并父子action的失效状态，有一个为FALSE则为FALSE
                    val.mergeInvalidStatus = val.actionItemStatus && val.child?.actionItemStatus;
                } else {
                    val.mergeInvalidStatus = val.actionItemStatus;
                }
                val.mergeInvalidReason = this.formatInvalidReason(val);
                return val;
            });
            console.log('actionsForm', this.actionsForm);
        }
    }
    formatInvalidReason (actionItem) {
        const reasonStrList = [];
        !actionItem.actionItemStatus && reasonStrList.push(actionItem.itemInvalidReason);
        if (actionItem.child) {
            !actionItem.child.actionItemStatus && reasonStrList.push(actionItem.child?.itemInvalidReason);
        }
        actionItem.mergeInvalidReason = reasonStrList.join('；');
        return reasonStrList.join('；');
    }
    async formatActionItem (action) {
        if (action.parentScene === 2 && action.fieldName === 'ASSIGNED') {
            // 连带动作
            this.childAction = action;
            if (action && action.fieldValue === 'AUTO') {
                this.childAction = { ...action, temp: 'AUTO' };
            } else {
                this.childAction = { ...action, temp: 'ASSIGNED' };
            }
            return;
        }
        const format = {
            fieldAction: action.fieldAction,
            fieldName: action.fieldName,
            fieldValue: await this.handleFieldValue(action.fieldValue, action.fieldName),
            id: action.id,
            parentId: action.parentId,
            parentScene: action.parentScene,
            actionItemStatus: action.actionItemStatus, // 标识该action是否失效
            itemInvalidReason: action.itemInvalidReason // action的失效原因，actionItemStatus=false时存在
        };
        return format;
    }
    // created () {
    //     this.onGetDetailActions()
    // }
    async mounted () {
        this.searchRgUsers('');
        this.setAssigned();
        await this.getCategoryTree();
    }
    async handleFieldValue (fieldValue, fieldName) {
        let result = null;
        switch (fieldName) {
            case 'CC':
                result = fieldValue.split(',');
                break;
            case 'ITEM_ID':
                result = await this.getItemDetail(fieldValue);
                break;
            default:
                result = fieldValue;
                break;
        }
        return result;
    }
    addAction () {
        if (this.actionsForm.length < 3) {
            this.actionsForm.push({
                fieldAction: '',
                fieldName: '',
                fieldValue: [],
                child: null,
                mergeInvalidStatus: true,
                actionItemStatus: true
            });
            this.withErrorArr.push(false);
            this.withInvalidArr.push(false);
        } else {
            this.$mtd.message.error('最多允许添加3个动作');
        }
    }
    deleteAction (index) {
        this.actionsForm.splice(index, 1);
    }
    clearMergeStatusAndReason (index) {
        this.actionsForm[index].mergeInvalidStatus = true;
        this.actionsForm[index].mergeInvalidReason = '';
    }
    clearItemStatusAndReason (index) {
        this.actionsForm[index].actionItemStatus = true;
        this.actionsForm[index].itemInvalidReason = '';
    }
    actionChange (index) {
        this.actionsForm[index].fieldValue = [];
        this.actionsForm[index].child = null;
        // 修改动作类型时，直接清空对应action的invalid状态
        this.clearItemStatusAndReason(index);
        this.clearMergeStatusAndReason(index);
    }
    onActionDetailChanged (index, isCategoryItem?, isCategoryChildItem?) {
        console.log('change');
        if (isCategoryItem) {
            // 只有服务目录类型的action有child，不能直接清空merge status
            if (isCategoryChildItem) {
                this.actionsForm[index].child.itemInvalidReason = '';
                this.actionsForm[index].child.actionItemStatus = true;
            } else {
                this.clearItemStatusAndReason(index);
            }
            // 根据父子action状态的变化，重新计算reason
            this.actionsForm[index].mergeInvalidStatus = this.actionsForm[index].actionItemStatus && this.actionsForm[index].child?.actionItemStatus;
            this.actionsForm[index].mergeInvalidReason = this.formatInvalidReason(this.actionsForm[index]);
        } else {
            this.clearItemStatusAndReason(index);
            this.clearMergeStatusAndReason(index);
        }
    }
    formatActionsChange () {
        this.$emit('change', this.formatActionsData);
    }
    handleCategoryChange (category, index) {
        this.categoryRgId = category.rgId;
        if (!this.actionsForm[index].child) {
            this.actionsForm[index].child = {
                fieldAction: 'UPDATE',
                fieldName: 'ASSIGNED',
                fieldValue: 'AUTO',
                temp: 'AUTO',
                actionItemStatus: true
            };
            this.categoryRgUserList = [];
        } else {
            const val = this.actionsForm[index].child.fieldValue;
            this.searchRgUsers(val, this.categoryRgId, true);
        }
        // this.searchRgUsers(null, this.categoryRgId, true);
        this.actionsForm[index].fieldValue = category;
        this.onActionDetailChanged(index, true, false);
        // this.actionsForm[index]['child']['temp'] = 'AUTO';
    }
    async searchRgUsers (query, curRgId?: number, isCategory?: Boolean) {
        //  跨rg指定指派人时，不主动检索
        if (isCategory && !query) return;
        this.searchLoading = true;
        const res = await api.rgApi.getRgUser({
            rgId: curRgId || this.rgId,
            identify: query,
            includeOncall: true
        });
        if (res && res.code === 200) {
            if (isCategory) {
                this.categoryRgUserList = res.data.items.filter(user => user.active === true);
            } else {
                this.rgUserList = res.data.items.filter(user => user.active === true);
            }
        }
        this.searchLoading = false;
    }
    async getCategoryTree () {
        try {
            const res = await api.ctiApi.getCategoryTreeTotal();
            this.categoryTreeList = res.data.items || [];
        } catch (e) {
            console.log(e);
        }
    }

    async handleProcessorChange (e, index) {
        const item = { ...this.actionsForm[index] };
        item.child.temp = e;
        Vue.set(this.actionsForm, index, item);
        if (e === 'ASSIGNED') {
            this.actionsForm[index].child.fieldValue = '';
        } else {
            this.actionsForm[index].child.fieldValue = 'AUTO';
        }
        this.onActionDetailChanged(index, true, true);
    }

    // 获取rg下的值班人员
    async setAssigned () {
        try {
            const res = await api.rgApi.getOncallUser({ rgId: this.rgId });
            this.oncallUser = res.data.identify;
        } catch (e) {
            console.log(e);
        }
    }
    async getItemDetail (itemId) {
        let categoryInfo = {
            categoryName: '',
            categoryId: 0,
            typeName: '',
            typeId: 0,
            itemName: '',
            itemId: 0,
            rgId: 0
        };
        const res = await api.ctiApi.getItemInfoWithAllStatus(itemId);
        const { code, data } = res;
        if (code === 200) {
            categoryInfo = {
                categoryName: data.categoryName,
                categoryId: data.categoryId,
                typeName: data.typeName,
                typeId: data.typeId,
                itemName: data.itemName,
                itemId: data.itemId,
                rgId: data.rgId
            };
        }
        return categoryInfo;
    }
    get formatActionsData (): Array<FormatActionData> {
        let hasItemAction: boolean = false;
        const formatActions = this.actionsForm.map((action) => {
            if (action.fieldName === 'ITEM_ID') hasItemAction = true;
            return this.formateActionObj(action);
        });
        if (this.childAction.fieldValue && hasItemAction) formatActions.push(this.childAction);
        return formatActions;
    }
    formateActionObj (action) {
        // 需要将连带的 itemID + assigned 拆分为两个action
        const fieldValue = action.fieldValue;
        const format: FormatActionData = {
            fieldAction: action.fieldName && actionOptions[action.fieldName].action || '',
            fieldName: action.fieldName,
            actionItemStatus: action.actionItemStatus,
            itemInvalidReason: action.itemInvalidReason,
            fieldValue: action.fieldName === 'ITEM_ID' ? fieldValue.itemId : (fieldValue instanceof Array ? fieldValue.join(',') : fieldValue),
            parentScene: action.parentScene || ((action.fieldName === 'ASSIGNED' && action.temp) ? 2 : 1)
        };
        if (action.id) {
            format.id = action.id;
            format.parentId = action.parentId;
        }
        if (action.child) {
            this.childAction = this.formateActionObj(action.child);
        }
        return format;
    }
    async searchUsers (query: any) {
        this.searchLoading = true;
        const res = await api.rgApi.searchUser({
            keyword: query,
            includeVirtual: true
        });
        if (res && res.code === 200) {
            this.userList = res.data?.items || [];
        }
        this.searchLoading = false;
    }
    get formError () {
        this.formatActionsData.forEach((action, index) => {
            const validate = (action.fieldAction && action.fieldValue && ((!action.child) || (action.child && action.child.fieldAction && action.child.fieldValue))) || false;
            const statusValid = action.actionItemStatus;
            this.$set(this.withErrorArr, index, !validate);
            this.$set(this.withInvalidArr, index, !statusValid);
        });
        const hasArror = this.withErrorArr.includes(true);
        const hasInvalidArror = this.withInvalidArr.includes(true);
        // 在原有的校验逻辑上增加对invalid信息的校验
        this.$emit('error', hasArror || hasInvalidArror || false);
        return hasArror;
    }
    get rgId () {
        return parseInt(this.$route.query.rgId as string, 10);
    }
}
</script>

<style lang="postcss">
.trigger-group-actions-container {
    margin: 0 0 12px 42px;
    padding: 15px 0;
    background: #F7F7F7;
    border-radius: 4px;
    .text-icon-button {
        margin-left: 75px;
    }
    .text-button {
        /* margin-left: 10px; */
        display: inline-block;
        cursor: pointer;
        font-size: 14px;
        color: #FF8800;
        line-height: 22px;
        &.delete-group {
            float: right;
            margin-right: 16px;
        }
    }
    .actions-catagory-tree {
        width: 300px;
        display: inline-block;
        .category-cascader {
            line-height: 32px;
            .el-input input {
                height: 32px;
            }
            .el-cascader__label {
                padding: 0 25px 0 10px;
            }
        }
        &.is-error {
            .el-input__inner {
                border-color: #F5483B;
            }
        }
    }
}
</style>
