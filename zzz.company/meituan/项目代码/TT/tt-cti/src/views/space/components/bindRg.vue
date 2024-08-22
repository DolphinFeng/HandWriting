<template>
    <mtd-modal
        title="绑定已有目录"
        @close="closeModal"
        v-model="visible">
        <mtd-form
            :model="formCustom"
            ref="formCustom"
            :rules="ruleCustom">
            <mtd-form-item label="选择目录">
                <mtd-cascader
                    popper-class="bind-rg__cascader"
                    :props="{label: 'name', value: 'id'}"
                    :data="options"
                    v-model="formCustom.categoryIds"
                    :multiple="true"
                    clearable
                    :loading="searchLoading"
                    placeholder="请选择"
                    style="width: 340px;">
                    <!-- <div slot-scope="{ data }">
                        {{ data.itemName && data.typeName && data.categoryName }}
                    </div> -->
                </mtd-cascader>
            </mtd-form-item>
            <mtd-radio-group v-model="formCustom.includeRg">
                <mtd-radio :value="true">原有服务组跟随目录绑定</mtd-radio>
                <mtd-radio :value="false">原有服务组与目录解绑，仅绑定目录</mtd-radio>
            </mtd-radio-group>
        </mtd-form>
        <div slot="footer" class="demo-modal-footer">
            <mtd-button @click="closeModal">取消</mtd-button><mtd-button
                type="primary"
                @click="confirm">确定</mtd-button>
        </div>
        <ConflictModal
            :show="showConflictModal"
            :conflict-list="conflictList"
            :transfer-params="transferParams"
            :un-conflict-list="unConflictList"
            @closeModal="closeModalHandler"
            @confirm="confirmIgnoreConflictHandler" />
    </mtd-modal>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import * as api from '@/api';
import { get } from 'lodash';
import ConflictModal from './conflictModal.vue';

@Component({
    components: {
        ConflictModal
    }
})
export default class BindRg extends Vue {
    @Prop()
    show: boolean;

    visible: boolean = false;
    searchLoading: boolean = false;
    options: any = [];
    ruleCustom: any = {};
    showConflictModal: boolean = false;
    transferParams: any = {
        categoryIds: []
    };
    conflictList: any[] = [];
    unConflictList: any[] = [];
    formCustom: any = {
        categoryIds: [],
        includeRg: false
    };

    @Watch('show')
    showHandler (val) {
        this.visible = val;
    }

    created () {
        this.getCatalogList();
    }

    converseFetchDataToCascader (list) {
        const res = list.map(item => {
            const temp = { ...item };
            temp.name = item.itemName || item.typeName || item.categoryName;
            temp.id = item.itemId || item.typeId || item.categoryId;
            if (item.children && item.children.length) {
                temp.children = this.converseFetchDataToCascader(item.children);
            }
            return temp;
        });
        return res;
    }

    async getCatalogList () {
        const spaceId = parseInt(this.$route.params.id, 10);
        const res = await api.ctiApi.otherCatalog({
            spaceId
        });
        this.options = this.converseFetchDataToCascader(get(res, ['data', 'items'], []));
    }

    closeModalHandler () {
        this.showConflictModal = !this.showConflictModal;
    }

    closeModal () {
        this.$emit('clodeModal');
    }

    async confirmIgnoreConflictHandler (params) {
        const res = await api.ctiApi.migrateSpace({
            ...params,
            unbindConflictingDirectories: true
        });
        if (get(res, ['code'], null) === 200) {
            this.$mtd.message.success('目录绑定成功');
            this.$emit('update');
        }
    }

    async confirm () {
        const categoryIds = this.formCustom.categoryIds.flat();
        const params = Object.assign({}, this.formCustom, {
            targetSpaceId: this.$route.params.id,
            categoryIds
        });
        const res = await api.ctiApi.migrateSpace(params);
        const conflict = get(res, ['data', 'conflict'], false);
        const noConflictingDirectories = get(res, ['data', 'noConflictingDirectories'], []);
        const conflictingDirectories = get(res, ['data', 'conflictingDirectories'], []);
        this.transferParams = params;
        this.conflictList = conflictingDirectories;
        this.unConflictList = noConflictingDirectories;
        if (conflict) {
            this.showConflictModal = true;
        } else {
            this.$mtd.message.success('绑定的目录处于停用状态，进入目录管理设置目录');
            this.$emit('update');
        }
        this.formCustom.categoryIds = [];
        this.formCustom.includeRg = false;
        this.getCatalogList();
        this.closeModal();
    }
}
</script>

<style lang="postcss">
.bind-rg__cascader {
    .mtd-cascader-menu {
        .mtd-checkbox {
            display: none;
        }
        &:first-child {
            .mtd-checkbox {
                display: inline-block;
            }
        }
    }
}
</style>
