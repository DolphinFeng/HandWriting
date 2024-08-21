<template>
    <mtd-modal
        :title="`${isEdit ? '编辑' : '添加'}${isCategory ? '一级' : '二级'}目录`"
        class="add-type-dialog form-dialog"
        width="430px"
        :mask-closable="false"
        @close="close"
        v-model="show">
        <mtd-form
            :model="formCustom"
            :label-width="100"
            ref="formCustom"
            :rules="ruleCustom">
            <mtd-form-item label="目录名称" prop="name">
                <mtd-input
                    placeholder="请输入名称"
                    v-model.trim="formCustom.name"
                    type="text" />
                <div class="mtd-form-item-helper">{{ createTip }}
                    <a
                        :href="aboutUrl"
                        target="_blank"
                        v-if="isCategory">请联系我们</a>
                </div>
            </mtd-form-item>
            <div v-if="isEdit">
                <mtd-form-item label="发起目录" prop="defaultItemId">
                    <mtd-checkbox v-model="formCustom.ticketRelated">允许选择{{ isCategory ? '一级' : '二级' }}目录发起TT</mtd-checkbox>
                    <mtd-tooltip
                        :content="`选择允许${isCategory ? '一级' : '二级'}目录发起TT，需要先设置指定的三级目录`"
                        placement="top">
                        <i class="mtdicon mtdicon-question-circle" />
                    </mtd-tooltip>
                    <mtd-cascader
                        v-if="formCustom.ticketRelated"
                        v-model="relatedArr"
                        :data="list"
                        :load-data="isCategory ? loadData : null"
                        :props="{
                            'label': 'name',
                            'value': 'id'
                        }"
                        placeholder="请选择默认的三级目录"
                        style="width: 100%;"
                        clearable
                        :no-data-text="`该目录下没有${isCategory ? '二级' : '三级'}目录，请在首页该目录下创建`"
                        @change="ticketRelatedChange" />
                </mtd-form-item>
                <mtd-form-item
                    label="目录管理员"
                    prop="ticketRelated"
                    v-if="formCustom.ticketRelated">
                    <mtd-select
                        v-model="formCustom.admins"
                        :loading="searchLoading"
                        filterable
                        remote
                        multiple
                        auto-clear-query
                        :debounce="200"
                        :remote-method="searchUser">
                        <mtd-option
                            v-for="item in userList"
                            :key="item.username"
                            :label="`${item.displayName}(${item.username})`"
                            :value="item.username" />
                    </mtd-select>
                </mtd-form-item>
            </div>
        </mtd-form>
        <div slot="footer" class="demo-modal-footer">
            <mtd-button @click="close">取消</mtd-button>
            <mtd-button
                :loading="btnLoading"
                type="primary"
                @click="submit">确定</mtd-button>
        </div>
    </mtd-modal>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { State } from 'vuex-class';
import * as api from '@/api';
import * as validators from '@/utils/validator';
import { Form as MtdForm } from '@ss/mtd-vue';
interface Form {
    name: string;
    ticketRelated: boolean;
    defaultItemId: number;
    admins: string[];
}
/**
 * 添加二级目录
 *
 * @author xiaokunyu
 * @date 01/11/2010
 */
@Component
export default class AddTypeDialog extends Vue {
    @State(state => state.cti.env)
    env: string;

    @Prop({ default: false })
    isCategory: Boolean;
    @Prop({ default: false })
    isEdit: Boolean;
    @Prop({ default: false })
    visible: Boolean;
    @Prop({ default: 0 })
    id: number;
    @Prop({
        default: () => {
            return [];
        }
    })
    list: any;

    $refs: { formCustom: MtdForm };
    show: Boolean = false;
    btnLoading: Boolean = false;
    formCustom: Form = {
        name: '',
        ticketRelated: false,
        defaultItemId: null,
        admins: []
    };
    relatedArr: number[] = [];
    searchLoading: boolean = false;
    userList: CommonTypes.UserInfoItem[] = [];

    ruleCustom = {
        name: [
            { validator: validators.validateName, trigger: 'blur, change' }
        ],
        defaultItemId: [
            { validator: this.validateItemId, trigger: 'change' }
        ]
    };

    validateItemId (_rule, value, callback) {
        if (this.formCustom.ticketRelated && !this.formCustom.defaultItemId) {
            return callback(new Error('请选择默认目录'));
        }
        return callback();
    }

    @Watch('visible', { immediate: true })
    onShowChanged (val) {
        this.show = val;
        if (val) {
            this.formCustom = {
                name: '',
                ticketRelated: false,
                defaultItemId: null,
                admins: []
            };
            this.isEdit && this.getCatalogDetail();
        }
    }
    close () {
        this.$emit('update:visible', false);
    }
    async getCatalogDetail () {
        const res = await api.ctiApi.getCatalogDetail({ id: this.id, level: this.isCategory ? 1 : 2 });
        const { code, data } = res;
        if (code === 200) {
            const { itemId, typeId } = data.defaultCti || {};
            this.formCustom = {
                name: data.name,
                ticketRelated: data.ticketRelated || false,
                defaultItemId: itemId,
                admins: data.admins || []
            };
            if (this.isCategory) {
                this.relatedArr = [typeId, itemId];
                const defaultList = await this.getItemList(typeId);
                this.list.forEach(item => {
                    if (item.id === typeId) {
                        this.$set(item, 'children', defaultList);
                    }
                });
            } else {
                this.relatedArr = [itemId];
            }
        }
    }
    async loadData (node, callback) {
        const result = await this.getItemList(node.id);
        callback(result);
    }
    async getItemList (parentId: number) {
        const res = await api.ctiApi.getItemList({ parentId: parentId });
        const emptyTip = [{
            disabled: true,
            id: null,
            isLeaf: true,
            name: '该目录下没有三级目录，请在首页该目录下创建'
        }];
        const { code, data } = res;
        if (code === 200) {
            return data.items && data.items.length ? data.items.map(item => {
                return Object.assign(item, {
                    isLeaf: true
                });
            }) : emptyTip;
        } else {
            return emptyTip;
        }
    }
    ticketRelatedChange (val) {
        this.formCustom.defaultItemId = val[val.length - 1];
    }
    async searchUser (query) {
        if (!query) {
            return;
        }
        this.searchLoading = true;
        try {
            const res = await api.rgApi.searchUser({ keyword: query });
            this.userList = res.data.items as any;
        } catch (e) {
            this.userList = [];
            console.log(e);
        }
        this.searchLoading = false;
    }
    async submit () {
        if (this.btnLoading) {
            return;
        }
        this.$refs.formCustom.validate(async (valid) => {
            if (valid) {
                this.btnLoading = true;
                try {
                    if (this.isCategory) {
                        if (this.isEdit) {
                            await api.ctiApi.editCategory(this.id, this.formCustom);
                        } else {
                            await api.ctiApi.addCategory({ name: this.formCustom.name });
                        }
                    } else {
                        if (this.isEdit) {
                            await api.ctiApi.editType(this.id, this.formCustom);
                        } else {
                            await api.ctiApi.addType({ name: this.formCustom.name, parentId: this.id });
                        }
                    }
                    this.$mtd.message({
                        message: `${this.isEdit ? '编辑' : '添加'}${this.isCategory ? '一级' : '二级'}目录成功`,
                        type: 'success'
                    });
                    this.$emit('success');
                    this.close();
                } catch (e) {
                    console.log(e);
                }
                this.btnLoading = false;
            }
        }).catch(e => e);
    }
    get createTip () {
        let tipContent = '可以以产品或服务命名二级目录';
        if (this.isCategory) {
            tipContent = '如需创建一级目录';
        } else if (this.isNoCategory) {
            tipContent = '该目录下不创建其他目录，请到对应的一级目录下创建二级目录';
        }
        return tipContent;
    }
    get aboutUrl () {
        const url = this.env === 'prod' ? '//tt.sankuai.com/ticket/create?category=TroubleTracker&type=CTI管理&item=CTI目录管理' : '//tt.cloud.test.sankuai.com/ticket/create?cid=2&tid=3&iid=15';
        return url;
    }
    // 对找不到合适的目录的单独处理
    get isNoCategory () {
        return (this.env === 'prod' && this.id === 14) || (this.env === 'test' && this.id === 657);
    }
}
</script>
<style lang="postcss">
.add-type-dialog {
    .mtdicon-question-circle {
        color: rgba(0, 0, 0, 0.38);
    }
}
.mtd-cascader-menu-empty-item {
    white-space: normal;
}
</style>
