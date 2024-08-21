<template>
    <div class="category-assigned-circulation-container">
        <div class="">
            <mtd-radio-group
                v-model="searchType"
                @input="clearData"
                :class="{'with-label': isDetail}">
                <mtd-radio value="category">{{ $getText('category_assigned_radio_cti', '服务目录') }}</mtd-radio>
                <mtd-radio value="assigned" v-if="inside">{{ $getText('category_assigned_radio_person', '处理人') }}</mtd-radio>
            </mtd-radio-group>
        </div>
        <div class="category-search-container" v-if="searchType === 'category'">
            <div class="info-item">
                <div class="info-label" v-if="isDetail">{{ $getText('category_assigned_cti_title', '服务目录') }}</div>
                <div class="category-form-item">
                    <category-tree
                        class="category-tree"
                        :category-name="searchForm.categoryName"
                        :type-name="searchForm.typeName"
                        :item-name="searchForm.itemName"
                        :category-id="searchForm.categoryId"
                        :type-id="searchForm.typeId"
                        :item-id="searchForm.itemId"
                        :rg-id="searchForm.rgId"
                        :rg-name="searchForm.rgName"
                        :render-assigned="renderAssigned"
                        :list-loading="categoryDisabled"
                        ref="categoryTree"
                        @categoryChange="handleCategoryChange"
                        @searchedChanged="handleSearchedChanged" />
                </div>
            </div>
            <div :class="['info-item', {'assigned-item': isRgAdmin}]" v-if="isDetail && searchForm.assigned">
                <div class="info-label" v-if="isDetail">{{  $getText(showAssigned ? 'category_assigned_person_title' : 'category_assigned_group_title', '处理组') }}</div>
                <div class="category-form-item">
                    <div class="category-form-inline">
                        <div
                            class="rg-name"
                            v-if="(!showAssigned) && searchForm.rgName"> {{ searchForm.rgName }} </div>
                        <slot name="tips" />
                    </div>
                    <div v-if="showAssigned">
                        <text-item
                            v-if="!isWorkHour"
                            value="非工作时间处理人" />
                        <mtdx-select
                            v-else
                            v-model="searchForm.assigned"
                            :placeholder="$getText('category_assigned_select_placeholder', '请输入 MIS')"
                            filterable
                            :debounce="500"
                            @change="withCtiChange"
                            :class="showPopper ? `rglist-select-show` : `rglist-select`"
                            :options="withCtiRgList"
                            :clearable="false"
                            @update:visible="withOptsShow"
                            popper-class="rglist-popper"
                            style="min-width: fit-content;">
                            <template v-slot="scope">
                                {{ scope.label }}
                                <mtd-tag
                                    theme="gray"
                                    type="pure"
                                    size="small"
                                    v-if="scope.external">{{ $getText('category_assigned_outside_tag', '外部') }}</mtd-tag>
                            </template>    
                        </mtdx-select>
                        <div class="rglist-hint" v-if="!isWorkHour">
                            <p>{{ $getText('category_assigned_no_work_hour_tip', '该目录绑定服务组为非工作时间，暂时无法指派处理人') }}</p>
                        </div>
                        <mtd-button
                            class="add-rg-user-btn"
                            type="text"
                            size="small"
                            @click="showAddUserModal = true"
                            v-if="isRgAdmin"
                            icon="mtdicon mtdicon-avatar-add">{{ $getText('category_assigned_add_assigned_btn', '快捷添加处理人') }}</mtd-button>
                    </div>
                </div>
            </div>
        </div>
        <div class="assigned-search-container" v-if="searchType === 'assigned' && inside">
            <div class="info-item">
                <div class="info-label" v-if="isDetail">{{ $getText('category_assigned_person_title', '处理人') }}</div>
                <div class="category-form-item">
                    <mtd-cascader
                        @change="handleAssignedChange"
                        v-model="assignedCascader"
                        :data="personalRgList"
                        :remote-method="searchInAllUser"
                        :load-data="loadCtiData"
                        :placeholder="$getText('category_assigned_select_placeholder', '请输入 MIS')"
                        :no-data-text="$getText('category_assigned_select_placeholder', '请输入 MIS')"
                        popper-class="assigned-popper"
                        class="assigned-cascader"
                        separator=" | "
                        :debounce="500"
                        filterable
                        remote>
                        <span slot-scope="{ data }">
                            {{ data.label }}
                            <mtd-tag
                                theme="gray"
                                type="pure"
                                size="small"
                                v-if="data.external">{{ $getText('category_assigned_outside_tag', '外部') }}</mtd-tag>
                        </span>
                    </mtd-cascader>
                </div>
            </div>
        </div>
        <div v-if="circulationReason">
            <div class="info-item">
                <div class="info-label">{{ $getText('category_assigned_transfer_tile', '流转原因') }}</div>
                <div class="category-form-item">
                    <mtd-textarea
                        @change="withReasonChange"
                        :placeholder="$getText('cfill_in_the_reason_for_circulation_input_content_should_not_exceed_50_characters', '填写流转原因（输入内容不超过50个字符）')"
                        style="width: 100%;"
                        v-model="searchForm.transferReason"
                        rows="3"
                        maxlength="50" />
                </div>
            </div>
        </div>
        <add-rg-user
            v-if="showAddUserModal"
            :visible.sync="showAddUserModal"
            :id="searchForm.rgId"
            user-type="NORMAL"
            @success="updateUserAndAssigned" />
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Getter } from 'vuex-class';

import CategoryTree from '@/components/category-tree.vue';
import TextItem from '@/components/text-item.vue';
import AddRgUser from './add-rg-user.vue';
import * as api from '@/api';
import cloneDeep from 'lodash.clonedeep';
import { getDisplayName } from '@/utils/tools/getDisplayName';
/**
 * 服务目录 + 处理人
 *
 * @author liyuyao
 * @date 04/22/2019
 */

@Component({
    components: {
        CategoryTree,
        TextItem,
        AddRgUser
    }
})
export default class CategoryAssignedSearch extends Vue {
    @Getter inside;
    @Getter misX;
    @Getter env;

    @Prop({ default: () => {
        return {};
    } })
    catagoryInfo: any;

    @Prop({ default: false })
    circulationReason: boolean;

    @Prop({ default: false })
    isDetail: boolean;

    @Prop({ default: true })
    showAssigned: boolean;

    @Prop({ default: true })
    renderAssigned: boolean;

    @Prop({ default: () => {
        return {
            mis: '',
            displayName: ''
        };
    } })
    assignedDetail: CommonTypes.mapObject;


    @Prop()
    isWorkHour: boolean;

    curWorkHour: boolean = false;

    searchForm: any = {
        assigned: '',
        categoryName: '',
        categoryId: 0,
        typeName: '',
        typeId: 0,
        itemName: '',
        itemId: 0,
        rgId: 0,
        rgName: '',
        transferReason: '',
        appointAssigned: true
    };
    withCtiRgList: any = [];
    personalRgList: any = [];
    visible: boolean = true;
    showPopper: boolean = false;
    searchType: string = 'category';

    constDefault: any = {
        label: this.$getText('category_assigned_tip_not_found', '暂无对应的用户及服务目录'),
        value: '',
        disabled: true
    };
    assignedCascader: any[] = [];
    defaultAssigned: string = '';
    oldSearchForm: any = {};
    categoryDisabled: boolean = false;
    isRgAdmin: boolean = false;
    showAddUserModal: boolean = false;

    @Watch('catagoryInfo', { deep: true, immediate: true })
    onGetCatagoryInfo () {
        for (let key in this.searchForm) {
            this.searchForm[key] = this.catagoryInfo[key];
        }
        if (this.searchForm.rgId && !this.searchForm.assigned) {
            // 无处理人信息时，需要将处理人设置为值班人
            this.setAssigned(this.searchForm.rgId);
        }
    }
    @Watch('searchType')
    onSearchType () {
        this.categoryDisabled = false;
    }

    created () {
        this.oldSearchForm = cloneDeep(this.catagoryInfo);
        this.getRgUser('');
        if (this.misX) {
            this.checkRgAdmin();
        }
    }

    handleSearchedChanged (searchedStatus) {
        this.$emit('searchedChanged', searchedStatus);
    }


    withOptsShow () {
        this.showPopper = !this.showPopper;
    }

    async handleCategoryChange (val, renderAssigned) {
        let isKeepAssigned = false;
        if (this.searchForm.rgId && this.searchForm.rgId === val.rgId) {
            // 同一个RG组下如果设置不流转，则不需要更新流转人
            try {
                const RgSetting: Ajax.AxiosResponse = await api.ctiApi.getRgSetting(this.searchForm.rgId);
                const { code, data } = RgSetting;
                // 条件1: 接口正常返回
                // 条件2: 在RG配置中配置了不需要流转
                // 条件3: 用户如果手动选择了值班人，仍需要请求接口获取当前值班人
                if (code === 200 && data.keepAssignedIfInRgTransfer && this.searchForm.assigned !== 'defaultAssigned') {
                    isKeepAssigned = true;
                }
            } catch (error) {
                console.log(error);
            }
        }
        this.$emit('changeHandler', isKeepAssigned);
        for (let key in val) {
            this.searchForm[key] = val[key];
        }
        if (this.searchForm.rgId) {
            if (renderAssigned) {
                this.setAssigned(this.searchForm.rgId, isKeepAssigned);
                this.getRgUser('');
                this.checkRgAdmin();
            }
        } else {
            this.searchForm.assigned = '';
        }
        this.$emit('change', this.searchForm, this.searchType, this.isRecommendAssigned);
        this.$emit('template-change', this.searchForm.itemId);
    }
    // 设置处理人
    async setAssigned (val, isKeepAssigned?) {
        try {
            // RG组不变的话不触发处理人改变
            if (isKeepAssigned) {
                // this.$emit('change', this.searchForm, this.searchType, this.isRecommendAssigned);
                return;
            }
            const res: Ajax.AxiosResponse = await api.ctiApi.getOncallUser({ rgId: val });
            let { code, data } = res;
            if (code === 200) {
                // 切换服务目录后，获取当前Rgid是否为非工作时间
                await this.getNonWorkingSetting();
                this.defaultAssigned = data.identify;
                this.searchForm.assigned = data.identify;
                if (this.isWorkHour) {
                    this.searchForm.assigned = 'defaultAssigned';
                }
                this.$emit('change', this.searchForm, this.searchType, this.isRecommendAssigned);
            }
        } catch (e) {
            console.log(e);
        }
    }
    // 获取当前rg下的用户列表
    async getRgUser (query) {
        if (!this.searchForm.rgId) return;
        this.withCtiRgList = [];
        try {
            const res: Ajax.AxiosResponse = await api.ctiApi.getRgUser({ identify: query, rgId: this.searchForm.rgId });
            let { code, data } = res;
            if (code === 200) {
                this.withCtiRgList = data.items;
                this.withCtiRgList = this.withCtiRgList.map(item => {
                    item.label = getDisplayName(this.inside, item.i18nDisplayName, item.displayName, item.identify);
                    item.value = item.identify;
                    return item;
                });
                this.withCtiRgList.unshift({ label: this.$getText(this.isWorkHour ? 'category_assigned_default_select' : 'category_assigned_default_select_no_working_hour', '非工作时间处理人'), value: 'defaultAssigned' });
            }
        } catch (e) {
            this.withCtiRgList = [];
            console.log(e);
        }
    }
    async checkRgAdmin () {
        const res: Ajax.AxiosResponse = await api.ctiApi.isRgAdmin({ mis: this.misX, rgId: this.searchForm.rgId });
        let { code, data } = res;
        if (code === 200) {
            this.isRgAdmin = !!data;
        }
    }
    async updateUserAndAssigned (mis) {
        await this.getRgUser('');
        this.searchForm.assigned = mis;
        this.$emit('changeHandler', true);
        this.$emit('change', this.searchForm, this.searchType, this.isRecommendAssigned);
    }
    withCtiChange (val) {
        // 如选中默认值班人，需要手动触发接口请求获取当前值班人
        this.$emit('changeHandler', (val && val !== 'defaultAssigned') ? true : false);
        this.$emit('change', this.searchForm, this.searchType, this.isRecommendAssigned);
    }
    withReasonChange (val) {
        this.$emit('change', this.searchForm, this.searchType, this.isRecommendAssigned);
    }
    // 仅按人搜索时
    async searchInAllUser (query) {
        this.$emit('searchedChanged', true);
        if (!query) {
            return ;
        }
        try {
            const res: Ajax.AxiosResponse = await api.ctiApi.searchUser({
                keyword: query,
                includeVirtual: true,
                includeExternal: true
            });
            const result = res.data.items.map((item) => {
                return {
                    label: item.i18nDisplayName ? `${item.i18nDisplayName}/${item.username}` : (item.displayName ? `${item.displayName}/${item.username}` : item.username),
                    value: item.username,
                    children: [],
                    external: item.external
                };
            });
            this.$emit('searchedChanged', false);
            this.personalRgList = result.length ? result : [this.constDefault];
        } catch (e) {
            this.personalRgList = [this.constDefault];
            console.log(e);
        }
    }
    // 动态获取用户所属rg目录
    async loadCtiData (item, callback) {
        let result = await this.getUserCti(item.value);
        callback(result);
    }
    // 根据用户名搜索rg
    async getUserCti (mis) {
        let result = [];
        try {
            const res: Ajax.AxiosResponse = await api.ctiApi.getUserCti(mis);
            let { code, data } = res;
            data.forEach((item) => {
                let obj = {
                    value: item,
                    label: item.categoryName === '找不到合适的目录' ? this.$getText('category_assigned_not_fount_title', '找不到合适的目录') : `${item.categoryName}／${item.typeName}／${item.itemName}（${item.rgName}）`,
                    isLeaf: true
                };
                result.push(obj);
            });
        } catch (e) {
            console.log(e);
        }
        return result;
    }
    handleAssignedChange (val) {
        const [assigned, categoryInfo] = val;
        if (categoryInfo && assigned) {
            for (let key in categoryInfo) {
                this.searchForm[key] = categoryInfo[key];
            }
            this.searchForm.assigned = assigned;
        } else {
            this.searchForm = {
                assigned: '',
                categoryName: '',
                categoryId: 0,
                typeName: '',
                typeId: 0,
                itemName: '',
                itemId: 0,
                rgId: 0,
                rgName: ''
            };
        }
        this.$emit('change', this.searchForm, this.searchType, this.isRecommendAssigned);
        this.$emit('template-change', this.searchForm.itemId);
        this.$emit('changeHandler', true);
    }
    clearData () {
        // 在创建页使用时，切换radio埋点上报
        if (!this.isDetail) {
            let bid = this.searchType === 'assigned' ? 'b_onecloud_ygdwxt7h_mc' : 'b_onecloud_h6bfy0pa_mc';
            window.LXAnalytics && window.LXAnalytics('moduleClick', bid, { custom: { mis: this.misX } });
        }
        this.searchForm = {
            assigned: '',
            categoryName: '',
            categoryId: 0,
            typeName: '',
            typeId: 0,
            itemName: '',
            itemId: 0,
            rgId: 0,
            rgName: ''
        };
        this.withCtiRgList = [];
        this.personalRgList = [];
        this.$emit('change', this.searchForm, this.searchType, this.isRecommendAssigned);
    }
    reset () {
        this.$refs.categoryTree && this.$refs.categoryTree.reset();
    }
    // 用户是否使用默认推荐人
    get isRecommendAssigned () {
        return (this.searchType === 'category') && (this.defaultAssigned === this.searchForm.assigned);
    }
    // 获取RG的非工作时间状态
    async getNonWorkingSetting () {
        const res: Ajax.AxiosResponse = await api.ticketApi.getNonWorkingSetting({
            rgId: this.searchForm.rgId,
            includeTimeState: true
        });
        let { data, code } = res;
        if (code === 200) {
            this.curWorkHour = data.active ? data.isWorkHour : true;
            this.$emit('changeWorkHour', this.curWorkHour);
        }
    }
}
</script>

<style lang="scss">
.category-assigned-circulation-container {
    width: 100%;
    .with-label {
        margin-left: 70px;
    }
    .category-form-item {
        display: inline-block;
        width: 100%;
        position: relative;
        .mtd-select {
            width: 100%;
        }
        .rglist-hint {
            color: rgba(0, 0, 0, 0.356);
            margin-top: 1px;
            padding-left: 8px;
            margin-bottom: -7px;
        }
        .text-click {
            pointer-events: none;
        }
    }
    .rg-name {
        padding-left: 12px;
    }
    .info-item {
        margin-top: 12px;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: flex-start;
        &.assigned-item {
            margin-bottom: 24px;
        }
    }
    .info-label {
        width: 64px;
        margin-right: 8px;
        text-align: right;
        line-height: 34px;
        vertical-align: bottom;
    }
    .assigned-cascader {
        width: 100%;
        height: 34px;
        line-height: 34px;
        .el-input__icon {
            line-height: 34px;
        }
        .el-cascader__label {
            color: #464646;
        }
    }
    .rglist-select {
        margin-top: 0;
        width: 100%;
    }
    .rglist-select-show {
        margin-top: 0;
        width: 100%;
        input {
            color: rgba(0, 0, 0, 0.356);
        }
    }
    .category-form-inline {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
    }
    .add-rg-user-btn {
        padding: 0;
        position: absolute;
        left: 0;
        bottom: -26px;
        .mtdicon-avatar-add {
            line-height: 22px;
            vertical-align: top;
        }
    }
}
.rglist-popper {
    max-width: 400px;
    min-width: fit-content !important;
}
.assigned-popper {
    z-index: 10000 !important;
}
.out-tag {
    display: inline-block;
    font-size: 12px;
    line-height: 16px;
    padding: 0 3px;
    color: #fff;
    background: #999;
    border-radius: 4px;
}
</style>