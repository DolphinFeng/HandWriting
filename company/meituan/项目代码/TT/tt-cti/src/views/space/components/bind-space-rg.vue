<template>
    <mtd-modal
        title="绑定已有服务组"
        class="bind-space-rg-dialog form-dialog"
        :mask-closable="false"
        width="480px"
        @close="close"
        v-model="show">
        <mtd-form
            :model="formCustom"
            ref="formCustom"
            :label-width="70">
            <mtd-form-item
                prop="rgId"
                label="服务组："
                class="rg-item">
                <mtd-select
                    v-model="formCustom.rgId"
                    no-match-text="对不起，没有该服务组，请先去创建服务组"
                    :loading="searchLoading"
                    :filterable="true"
                    :debounce="500"
                    :remote="true"
                    :remote-method="remoteMethod"
                    auto-clear-query
                    clearable>
                    <mtd-option
                        v-for="item in rgList"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id" />
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

/**
 * 绑定空间rg
 *
 * @author liyuyao
 * @date 08/11/2020
 */
@Component
export default class BindSpaceRgDialog extends Vue {
    @Prop({ default: false })
    visible: Boolean;

    show: Boolean = false;
    rgList: CommonTypes.UserInfoItem[] = [];

    formCustom: CommonTypes.mapObject = {
        rgId: null
    };

    btnLoading: Boolean = false;
    searchLoading: Boolean = false;
    $refs: any;

    get spaceId () {
        return parseInt(this.$route.params.id, 10);
    }

    @Watch('visible', { immediate: true })
    onShowChanged (val) {
        this.show = val;
        if (val) this.formCustom.rgId = null;
    }
    close () {
        this.$emit('update:visible', false);
    }
    async remoteMethod (query) {
        this.searchLoading = true;
        try {
            const res = await api.rgApi.getRgList({ name: query });
            this.rgList = res.data.items.map((item) => {
                return {
                    name: item.name,
                    id: item.id
                };
            });
        } catch (e) {
            this.rgList = [];
            console.log(e);
        }
        this.searchLoading = false;
    }
    async submit () {
        if (this.btnLoading || !this.formCustom.rgId) {
            return;
        }
        this.btnLoading = true;
        try {
            const res = await api.spaceApi.bindSpaceRg({
                rgId: this.formCustom.rgId,
                spaceId: this.spaceId
            });
            const { code, data } = res;
            if (code === 200) {
                this.$mtd.message.success('绑定RG成功');
                this.$emit('success');
                this.close();
            } else if (code === 400) {
                this.cannotBindConfirm(data);
            }
            this.btnLoading = false;
        } catch (e) {
            this.btnLoading = false;
        }
    }
    cannotBindConfirm (data) {
        const adminStr = data.spaceAdmins.map(admin => {
            return `${admin.displayName}/${admin.username}`;
        });
        this.$mtd.confirm({
            title: `该服务组已绑定空间“${data.spaceName}”`,
            message: `请联系空间管理员：${adminStr.join('，')}；解绑后方可重新绑定`,
            width: '433px',
            showCancelButton: false,
            type: 'info',
            okButtonText: '确定'
        }).catch(e => e);
    }
}
</script>
