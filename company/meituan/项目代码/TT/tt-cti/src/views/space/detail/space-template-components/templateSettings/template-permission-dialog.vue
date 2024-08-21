<template>
    <mtd-modal
        title="设置模板权限"
        class="template-permission-dialog"
        @close="handleClose"
        v-model="visible"
        width="400px">
        部门：<mtd-radio-group v-model="hasPermission">
            <mtd-radio :value="false">无限制</mtd-radio>
            <mtd-radio :value="true">指定部门</mtd-radio>
        </mtd-radio-group>
        <mtd-select
            v-model="permissionOrgs"
            v-if="hasPermission"
            :loading="searchLoading"
            filterable
            remote
            multiple
            auto-clear-query
            :debounce="200"
            :remote-method="searchOrg"
            value-key="orgId"
            style="width: 100%; margin-top: 12px;">
            <mtd-option
                v-for="org in orgList"
                :key="org.orgId"
                :label="org.orgPath"
                :value="org" />
        </mtd-select>
        <div slot="footer" class="demo-modal-footer">
            <mtd-button @click="cancel">取消</mtd-button>
            <mtd-button type="primary" @click="submit">确定</mtd-button>
        </div>
    </mtd-modal>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import * as api from '@/api';

// import * as api from '@/api';

/**
 * 选择指定目录
 *
 * @author liyuyao
 * @date 06/09/2020
 */
@Component
export default class TemplatePermissionDialog extends Vue {
    @Prop()
    id: number;

    @Prop({
        default: () => {
            return [];
        }
    })
    orgs: CommonTypes.OrgVO[];

    visible: Boolean = true;
    hasPermission: boolean = false;
    searchLoading: boolean = false;
    orgList: CommonTypes.OrgVO[] = [];
    permissionOrgs: CommonTypes.OrgVO[] = [];

    mounted () {
        this.permissionOrgs = this.orgs;
        this.hasPermission = this.orgs.length > 0;
        this.orgList = this.orgs;
    }
    async searchOrg (query) {
        this.orgList = [];
        if (query.length < 2 || query === '集团') {
            return;
        }
        this.searchLoading = true;
        try {
            const res = await api.ruleApi.searchOrg(query);
            this.orgList = res.data.items;
        } catch (e) {
            this.orgList = [];
            console.log(e);
        }
        this.searchLoading = false;
    }
    async submit () {
        try {
            const res = await api.rgApi.updateRgCustomTemplate({
                rgId: this.rgId,
                id: this.id,
                permissionOrgs: this.hasPermission ? this.permissionOrgs : []
            });
            const { code } = res;
            if (code === 200) {
                this.$mtd.message.success('操作成功');
                this.$emit('success');
                this.$emit('close');
            }
        } catch (e) {
            this.orgList = [];
            console.log(e);
        }
    }
    handleClose () {
        this.$emit('close');
    }
    cancel () {
        this.visible = false;
        this.handleClose();
    }
    get rgId () {
        return parseInt(this.$route.query.rgId as string, 10) || 0;
    }
}
</script>

<style lang="postcss">
.special-cti-dialog .mtd-modal-content-wrapper {
    min-width: 700px;
}
</style>
