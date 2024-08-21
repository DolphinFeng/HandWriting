<template>
    <mtd-modal
        :title="$getText('not_in_scope_modal_title', '不在处理范围工单流转')"
        v-model="showModal"
        class="not-in-scope-modal"
        @close="close"
        width="560px">
        <span class="required-mark">*</span><span class="form-title">{{ $getText('not_in_scope_modal_reason_title', '为什么不在您的处理范围内：') }}</span>
        <mtd-textarea
            :placeholder="$getText('not_in_scope_modal_reason_placeholder', '请描述原因')"
            style="width: 100%;"
            rows="3"
            v-model="form.reason"
            maxlength="50" />
        <span class="required-mark">*</span><span class="form-title">{{ $getText(recommendList.length ? 'not_in_scope_modal_select_cti_title_detail':'not_in_scope_modal_select_cti_title', '请选择流转的目录') }}</span>
        <ul class="recommend-content-list">
            <li
                :class="['recommend-item', { 'selected-item': selectedItemId === recommend.itemId}]"
                v-for="(recommend, index) in recommendList"
                :key="recommend.itemId"
                @click="selectRecommend(recommend)">
                <span class="list-icon">{{ index + 1 }}</span>
                <span>{{ recommend.categoryId === noCatalogId ? $getText('not_in_scope_modal_no_catalog_desc', '不选择目录直接发起') : `${recommend.categoryName} / ${recommend.typeName} / ${recommend.itemName}` }}</span>
            </li>
        </ul>
        <category-tree
            ref="categoryTree"
            @categoryChange="handleCtiChange"
            :placeholder="$getText('not_in_scope_modal_other_cti_placeholder', '都不是，选择其他的目录进行添加')"
            :is-not-in-scope="true"
            :category-name="selectCti.categoryName"
            :type-name="selectCti.typeName"
            :item-name="selectCti.itemName"
            :category-id="selectCti.categoryId"
            :type-id="selectCti.typeId"
            :item-id="selectCti.itemId"
            :rg-id="selectCti.rgId"
            :rg-name="selectCti.rgName" />
        <div slot="footer">
            <mtd-button @click="close">{{ $getText('not_in_scope_modal_cancel_btn', '取消') }}</mtd-button>
            <mtd-button
                :loading="btnLoading"
                :disabled="!(form.reason && form.cti.categoryId)"
                type="primary"
                @click="submit">{{ $getText('not_in_scope_modal_confirm_btn', '确定') }}</mtd-button>
        </div>
    </mtd-modal>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import CategoryTree from '@/components/category-tree.vue';
import * as api from '@/api';
import { NoCatalog } from '@/config/map.conf';
@Component({
    components: {
        CategoryTree
    }
})
export default class NotInScopeModal extends Vue {
    @Prop() desc: string;
    @Prop() ticketId: number;
    @Prop() reporter: string;
    showModal: boolean = true;
    btnLoading: boolean = false;
    form: any = {
        reason: '',
        assigned: '',
        cti: {
            categoryName: '',
            categoryId: 0,
            typeName: '',
            typeId: 0,
            itemName: '',
            itemId: 0,
            rgId: 0
        }
    };
    recommendList: any[] = [];
    selectedItemId: number = 0;
    noCatalogId: number = NoCatalog.categoryId;
    selectCti: any = {
        categoryName: '',
        categoryId: 0,
        typeName: '',
        typeId: 0,
        itemName: '',
        itemId: 0,
        rgId: 0
    };

    selectRecommend (cti) {
        if (this.selectedItemId === cti.itemId) {
            // 已选中该条目录，取消选中状态
            this.selectedItemId = 0;
            this.$refs.categoryTree && this.$refs.categoryTree.reset();
            this.form.cti = Object.assign(this.form.cti, {
                categoryName: '',
                categoryId: 0,
                typeName: '',
                typeId: 0,
                itemName: '',
                itemId: 0,
                rgId: 0
            });
            this.selectCti = Object.assign(this.selectCti, {
                categoryName: '',
                categoryId: 0,
                typeName: '',
                typeId: 0,
                itemName: '',
                itemId: 0,
                rgId: 0
            });
        } else {
            this.selectedItemId = cti.itemId;
            this.selectCti = Object.assign(this.selectCti, cti);
        }
    }
    created () {
        this.getRecommendCti();
    }
    handleCtiChange (cti: any) {
        this.form.cti = Object.assign(this.form.cti, cti);
        // 将选择器选择的目录在推荐目录中进行勾选/取消
        const targetItem = this.recommendList.find(i => i.itemId === this.form.cti.itemId);
        this.selectedItemId = targetItem ? this.form.cti.itemId : 0;
    }
    async getRecommendCti () {
        const res: Ajax.AxiosResponse = await api.ctiApi.getRecommendCti({
            desc: this.desc,
            reporter: this.reporter
        });
        let { code, data } = res;
        if (code === 200) {
            this.recommendList = data.items || [];
        }
    }
    async submit () {
        this.btnLoading = true;
        await this.getOncallUser();
        const res: Ajax.AxiosResponse = await api.ticketApi.updateTicket(this.ticketId, {
            ...this.form.cti,
            assigned: this.form.assigned,
            notInScopeWithFurtherInfo: true,
            appointAssigned: false,
            transferReason: this.form.reason
        });
        const { code, data } = res;
        if (code === 200 && data) {
            this.$mtd.message({
                message: this.$getText('not_in_scope_modal_success_message', '流转成功'),
                type: 'success'
            });
            this.$emit('success');
            this.showModal = false;
        }
        this.btnLoading = false;
    }
    async close () {
        this.showModal = false;
        this.$emit('close');
        await api.ticketApi.cancelNotInScope(this.ticketId.toString());
    }
    async getOncallUser () {
        if (!this.form.cti.rgId) return;
        const res: Ajax.AxiosResponse = await api.ctiApi.getOncallUser({ rgId: this.form.cti.rgId });
        let { code, data } = res;
        if (code === 200) {
            this.form.assigned = data.identify;
        }
    }
}
</script>
<style lang="scss">
.not-in-scope-modal {
    .mtd-modal-title {
        font-family: PingFangSC-Medium;
        font-size: 16px;
        line-height: 24px;
    }
    .mtd-modal-footer {
        .mtd-btn {
            width: 100px;
        }
    }
    .mtd-modal-content-wrapper {
        padding-bottom: 22px;
    }
    .required-mark {
        color: #f5483b;
        margin-right: 4px;
        font-weight: 600;
        vertical-align: middle;
    }
    .form-title {
        font-family: PingFangSC-Medium;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.84);
        text-align: justify;
        line-height: 22px;
    }
    .mtd-textarea {
        margin-top: 8px;
        margin-bottom: 24px;
    }
    .recommend-item {
        margin-top: 12px;
        font-family: PingFang SC;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.84);
        letter-spacing: 0;
        line-height: 22px;
        font-weight: 400;
        cursor: pointer;
        .list-icon {
            display: inline-block;
            margin-right: 4px;
            width: 16px;
            line-height: 16px;
            background: rgba(0, 0, 0, 0.06);
            border-radius: 2px;
            text-align: center;
            font-size: 12px;
            color: rgba(0, 0, 0, 0.36);
            letter-spacing: 0;
            font-weight: 500;
        }
        &:hover {
            color: #f80;
            font-family: PingFangSC-Medium;
            .list-icon {
                background: rgba(255, 136, 0, 0.12);
                color: #f80;
            }
        }
    }
    .selected-item {
        color: #f80;
        font-family: PingFangSC-Medium;
        .list-icon {
            background: rgba(255, 136, 0, 0.12);
            color: #f80;
        }
    }
    .category-tree-container {
        margin-top: 12px;
    }
}
</style>