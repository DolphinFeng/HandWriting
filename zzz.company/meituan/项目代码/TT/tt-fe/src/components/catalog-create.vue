<template>
    <div class="category-assigned-search-container">
        <mtd-form-item
            class="mtd-form-item-required"
            :label="`${$getText('create_category_form_assign', '指派')}：`"
            style="margin-bottom: 10px;"
            :label-width="72">
            <mtd-radio-group
                v-model="searchType"
                @input="clearData">
                <mtd-radio value="category">{{ $getText('create_category_form_radio_cti', '服务目录') }}</mtd-radio>
                <mtd-radio value="assigned" v-if="inside">{{ $getText('create_category_form_radio_assigned', '处理人') }}</mtd-radio>
            </mtd-radio-group>
        </mtd-form-item>
        <div class="category-search-container" v-if="searchType === 'category'">
            <div class="info-item">
                <div class="category-form-item">
                    <catalog-static v-if="showStaticCti" :cti="newestBindCti" />
                    <catalog-group
                        v-else
                        ref="catalogGroup"
                        @change="handleCategoryChange"
                        :default-catalog.sync="defaultQuery" />
                </div>
            </div>
        </div>
        <div class="assigned-search-container" v-if="searchType === 'assigned' && inside">
            <div class="info-item">
                <div class="info-label">{{ $getText('create_category_form_assigned_person', '处理人') }}:</div>
                <div class="category-form-item">
                    <mtd-cascader
                        @change="handleAssignedChange"
                        v-model="assignedCascader"
                        :data="personalRgList"
                        :remote-method="searchInAllUser"
                        :load-data="loadCtiData"
                        :placeholder="$getText('create_category_form_assigned_person_placeholder', '请输入MIS')"
                        :no-data-text="$getText('create_category_form_assigned_person_placeholder', '请输入MIS')"
                        popper-class="assigned-popper"
                        class="assigned-cascader"
                        separator="| "
                        :debounce="500"
                        filterable
                        remote>
                        <span slot-scope="{ data }">
                            {{ data.label }}
                            <mtd-tag
                                theme="gray"
                                type="pure"
                                size="small"
                                v-if="data.external">{{ $getText('create_category_form_assigned_tag', '外部') }}</mtd-tag>
                        </span>
                    </mtd-cascader>
                </div>
            </div>
        </div>
        <mtd-form-item
            class="hidden-item"
            label=""
            prop="itemName"
            style="margin-bottom: 0;" />
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import { NoCatalog } from '@/config/map.conf';
import CatalogGroup from '@/components/catalog-group.vue';
import CatalogStatic from '@/components/catalog-static.vue';
import pick from 'lodash.pick';
import * as api from '@/api';
import { CREATE_LX_MAP } from '@/config/lx_map.conf';
import { lxReportClick } from '@/utils/directive/lxanaly';
/**
 * 服务目录 + 处理人
 *
 * @author liyuyao
 * @date 04/22/2019
 */

@Component({
    components: {
        CatalogGroup,
        CatalogStatic
    }
})
export default class CatalogCreateSelect extends Vue {
    @Getter inside;
    @Getter isPrivateSpace;
    @Getter spaceDomain;

    @Prop({ default: () => {
        return {};
    } })
    catalogInfo: any;

    @Prop({ required: false })
    defaultRgUsers: CommonTypes.mapObject[];

    @Prop({ default: true })
    showAssigned: boolean;

    searchForm: any = {
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
    withCtiRgList: any = [];
    personalRgList: any = [];

    searchType: string = 'category';

    constDefault: any = {
        label: this.$getText('create_category_tip_not_found', '暂无对应的用户及服务目录'),
        value: '',
        disabled: true
    };
    assignedCascader: any[] = [];
    defaultAssigned: string = '';
    defaultQuery: any = {};

    // newest/bind接口的标示，请求过一次后不要再请求第二次
    newestApiFlag: boolean = false;
    newestBindCti: CommonTypes.mapObject = {};
    // 是否展示静态的CTI
    showStaticCti: boolean = false;

    @Watch('catalogInfo', { deep: true, immediate: true })
    async onGetCatalogInfo () {
        this.checkUserURLPermission();
        // this.defaultQuery = JSON.parse(JSON.stringify(this.catalogInfo));
        for (let key in this.searchForm) {
            this.searchForm[key] = this.catalogInfo[key];
        }
        if (this.searchForm.rgId) {
            // (!this.defaultRgUsers) && this.getRgUser();
            // 有处理人信息时，不需要将处理人设置为值班人
            if (!this.searchForm.assigned) {
                this.setAssigned(this.searchForm.rgId);
            }
        }
    }
    async checkUserURLPermission () {
        const { categoryId, typeId, itemId } = this.catalogInfo;
        if (categoryId && typeId && itemId) {
            try {
                const res = await api.ctiApi.getPermissionURL({
                    cid: categoryId,
                    tid: typeId,
                    iid: itemId
                });
                const { data } = res;
                if (data.authPermitted) {
                    this.defaultQuery = JSON.parse(JSON.stringify(this.catalogInfo));
                }
            } catch (error) {
                console.log('err', error);
            }
        } else {
            this.defaultQuery = JSON.parse(JSON.stringify(this.catalogInfo));
        }
    }
    // 服务目录切换
    async handleCategoryChange (val, fromUrl) {
        const urlQuery = pick(this.$route.query, ['category', 'type', 'item', 'cid', 'tid', 'iid']);
        const matchLen = Object.values(pick(val, ['categoryName', 'typeName', 'itemName', 'categoryId', 'typeId', 'itemId'])).length;
        const urlLen = Object.values(urlQuery).length;
        // 说明URL没完全匹配上，目录已被修改，需要拉接口兑换正确结果
        const ctiMatchUrl = !(urlLen && (matchLen < urlLen * 2));
        // 如果已经请求过兑换接口且兑换接口有结果，还没匹配上
        this.showStaticCti = fromUrl && this.newestApiFlag && !ctiMatchUrl && Object.values(this.newestBindCti).length > 0;
        if (fromUrl && !this.newestApiFlag && !ctiMatchUrl) {
            let res = await this.getNewCtiFromUrl();
            this.newestApiFlag = true;
            this.newestBindCti = res;
            if (res && Object.values(res).length > 0 && res.cid) {
                this.defaultQuery = Object.assign(this.catalogInfo, {
                    categoryId: res.cid || 0,
                    typeId: res.tid || 0,
                    itemId: res.iid || 0
                });
                return ;
            }
        } else if (this.showStaticCti) {
            this.searchForm = {
                categoryName: this.newestBindCti.category,
                categoryId: this.newestBindCti.cid,
                typeName: this.newestBindCti.type || '',
                typeId: this.newestBindCti.tid || 0,
                itemName: this.newestBindCti.item || '',
                itemId: this.newestBindCti.iid || 0,
                rgId: this.newestBindCti.rgId || 0,
                rgName: this.newestBindCti.rgName || ''
            };
        } else {
            for (let key in val) {
                this.searchForm[key] = val[key];
            }
        }
        if (this.searchForm.rgId) {
            if (this.defaultRgUsers && this.defaultRgUsers.length) {
                this.withCtiRgList = this.defaultRgUsers;
            }
            this.setAssigned(this.searchForm.rgId);
        } else {
            this.searchForm.assigned = '';
        }
        this.$emit('change', this.searchForm, this.searchType, fromUrl, this.isRecommendAssigned);
        this.$emit('template-change', this.searchForm.itemId);
    }
    async getNewCtiFromUrl () {
        const defaultQuery = this.catalogInfo.categoryId ? {
            cid: this.catalogInfo.categoryId,
            tid: this.catalogInfo.typeId,
            iid: this.catalogInfo.itemId
        } : {
            category: this.catalogInfo.categoryName,
            type: this.catalogInfo.typeName,
            item: this.catalogInfo.itemName
        };
        const res: Ajax.AxiosResponse = await api.ctiApi.getNewCtiFromUrl(true, defaultQuery);
        return res.data || {};
    }
    // 设置处理人
    async setAssigned (val) {
        try {
            const res: Ajax.AxiosResponse = await api.ctiApi.getOncallUser({ rgId: val });
            this.defaultAssigned = res.data.identify;
            this.searchForm.assigned = res.data.identify;
            this.$emit('change', this.searchForm, this.searchType, false, this.isRecommendAssigned);
        } catch (e) {
            console.log(e);
        }
    }
    // 获取当前rg下的用户列表
    async getRgUser () {
        this.withCtiRgList = [];
        try {
            const res: Ajax.AxiosResponse = await api.ctiApi.getRgUser({ identify: '', rgId: this.searchForm.rgId });
            let { code, data } = res;
            if (code === 200) {
                this.withCtiRgList = data.items;
            }
        } catch (e) {
            this.withCtiRgList = [];
            console.log(e);
        }
    }
    withCtiChange (val) {
        this.$emit('change', this.searchForm, this.searchType, false, this.isRecommendAssigned);
    }
    // 仅按人搜索时
    async searchInAllUser (query) {
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
                    label: `${item.displayName}（${item.username}）`,
                    value: item.username,
                    children: [],
                    virtual: item.virtual,
                    external: item.external
                };
            });
            this.personalRgList = result.length ? result : [this.constDefault];
        } catch (e) {
            this.personalRgList = [this.constDefault];
            console.log(e);
        }
    }
    // 动态获取用户所属rg目录
    async loadCtiData (item, callback) {
        let result = await this.getUserCtiBySpace(item.value, item.virtual || item.external);
        callback(result);
    }
    // 根据用户名搜索rg
    async getUserCtiBySpace (mis, virtual?) {
        let result = [];
        try {
            const res: Ajax.AxiosResponse = await api.ctiApi.getUserCtiBySpace({
                assigned: mis,
                domain: this.spaceDomain
            });
            let { code, data } = res;
            if (!virtual) {
                result.push({
                    value: NoCatalog,
                    label: this.$getText('create_category_init_without_cti', '※不选择目录直接发起※'),
                    isLeaf: true
                });
            }
            data.items.forEach((item) => {
                if (item.categoryName !== '找不到合适的目录') {
                    let obj = {
                        value: item,
                        label: `${item.categoryName}／${item.typeName}／${item.itemName}（${item.rgName}）`,
                        isLeaf: true
                    };
                    result.push(obj);
                }
            });
            if (!result || !result.length) {
                result.push({
                    label: this.$getText('create_category_user_not_available_cti', '当前用户暂无服务目录'),
                    value: '',
                    disabled: true,
                    isLeaf: true
                });
            }
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
        this.$emit('change', this.searchForm, this.searchType, false, this.isRecommendAssigned);
        this.$emit('template-change', this.searchForm.itemId);
    }
    clearData () {
        // 在创建页使用时，切换radio埋点上报
        let bid = this.searchType === 'assigned' ? CREATE_LX_MAP['radio_assigned'] : CREATE_LX_MAP['radio_category'];
        lxReportClick(bid);
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
        this.$emit('change', this.searchForm, this.searchType, false, this.isRecommendAssigned);
    }
    reset () {
        this.$refs.catalogGroup && this.$refs.catalogGroup.reset();
    }
    // 用户是否使用默认推荐人
    get isRecommendAssigned () {
        return (this.searchType === 'category') && (this.defaultAssigned === this.searchForm.assigned);
    }
}
</script>

<style lang="scss">
.category-assigned-search-container {
    width: 100%;
    .with-label {
        margin-left: 70px;
    }
    .category-form-item {
        display: inline-block;
        width: 100%;
        .mtd-select {
            width: 100%;
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
    }
    .info-label {
        width: 74px;
        margin-right: 15px;
        text-align: right;
        line-height: 34px;
        vertical-align: bottom;
        color: rgba(0, 0, 0, 0.6);
    }
    .assigned-cascader {
        margin-bottom: 10px;
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
    .category-form-inline {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
    }
}
.assigned-popper {
    z-index: 10000 !important;
}
</style>