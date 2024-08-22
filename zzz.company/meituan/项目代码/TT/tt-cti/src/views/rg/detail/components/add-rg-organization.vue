<template>
    <mtd-modal
        title="添加组织"
        class="add-rg-dialog form-dialog"
        :mask-closable="false"
        width="480px"
        @close="close"
        v-model="show">
        <mtd-form
            :model="formCustom"
            ref="formCustom"
            :label-width="52">
            <mtd-form-item label="组织">
                <mtd-select
                    v-model="formCustom.orgList"
                    :loading="searchLoading"
                    filterable
                    remote
                    auto-clear-query
                    multiple
                    :debounce="200"
                    :remote-method="searchOrg"
                    value-key="orgId"
                    placeholder="可从大象个人名片中查找完整部门链，部门至少三级"
                    :formatter="formatter">
                    <mtd-option-group
                        style="width: 400px;"
                        class="auth-org-option">
                        <mtd-option
                            v-for="org in orgDetailList"
                            :key="org.orgId"
                            :label="org.orgPath"
                            :value="org"
                            :disabled="org.disabled" />
                    </mtd-option-group>
                </mtd-select>
            </mtd-form-item>
        </mtd-form>
        <div slot="footer">
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
import * as api from '@/api';
interface Form {
    orgList: string[];
}
/**
 * 添加组织
 *
 * @author wb_zhanghongwei
 * @date 07/19/2021
 */
@Component
export default class AddRgUserDialog extends Vue {
    @Prop({ default: false })
    visible: boolean;
    @Prop({ default: 0 })
    id: number;
    @Prop({ default: '' })
    userType: string;

    show: Boolean = false;
    formCustom: Form = {
        orgList: []
    };
    btnLoading: Boolean = false;
    searchLoading: Boolean = false;
    orgDetailList: any = [];
    @Watch('visible', { immediate: true })
    onShowChanged (val) {
        this.show = val;
        if (val) {
            this.formCustom.orgList = [];
            this.orgDetailList = [];
        }
    }
    close () {
        this.$emit('update:visible', false);
    }
    async submit () {
        if (this.btnLoading) {
            return;
        }
        this.btnLoading = true;
        try {
            const orgIds = this.formCustom.orgList.map((item:any) => {
                return item.orgId;
            });
            await api.rgApi.orgAdd({
                orgIds,
                role: this.userType,
                rgId: this.id,
            });
            this.$mtd.message({
                message: '添加 RG 组织成功',
                type: 'success'
            });
            this.$emit('success');
            this.close();
        } catch (e) {
            console.log(e);
        }
        this.btnLoading = false;
    }
    formatter (val) {
        if (val.value) {
            return `${val.value.orgName}`;
        }
    }
    async searchOrg (query) {
        if (query.length < 1) {
            // this.orgDetailList = defaultOption;
            return;
        }
        this.searchLoading = true;
        try {
            const res = await api.ctiApi.orgDetailByPath(encodeURIComponent(query));
            const { data } = res;
            if (data) {
                this.orgDetailList = [data];
            } else {
                this.orgDetailList = [];
            }
        } catch (e) {
            console.log(e);
        }
        this.searchLoading = false;
    }
}
</script>
