<template>
    <mtd-modal
        :title="$getText('add_rg_modal_title', '添加RG成员')"
        class="add-rg-dialog"
        :mask-closable="false"
        width="340px"
        @close="close"
        v-model="show">
        <mtd-form
            :model="formCustom"
            ref="formCustom"
            :label-width="52">
            <mtd-form-item :label="$getText('add_rg_modal_form_name', '姓名')">
                <pm-select
                    type="dropdown"
                    remote
                    :remote-method="remoteMethod"
                    class="component-rg-user"
                    :show-avatar="true"
                    @change="onUserChanged"
                    profile-key="avatar"
                    :placeholder="$getText('add_rg_modal_form_name_placeholder', '请输入姓名、mis进行搜索')"
                    :input-placeholder="$getText('add_rg_modal_form_name_placeholder', '请输入姓名、mis进行搜索')">
                    <pm-select-option
                        v-for="item in userList"
                        :profile="item.avatar"
                        :show-avatar="true"
                        :key="item.username"
                        :value="item"
                        :label="`${item.displayName}(${item.username})`" />
                </pm-select>
            </mtd-form-item>
        </mtd-form>
        <div slot="footer">
            <mtd-button @click="close">{{ $getText('add_rg_modal_cancel_btn', '取消') }}</mtd-button>
            <mtd-button
                :loading="btnLoading"
                type="primary"
                @click="submit">{{ $getText('add_rg_modal_confirm_btn', '确定') }}</mtd-button>
        </div>
    </mtd-modal>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import * as api from '@/api';
interface Form {
    rgUser: string;
    role: 'NORMAL' | 'RGADMIN';
}

@Component
export default class AddRgUserDialog extends Vue {
    @Prop({ default: false })
    visible: boolean;
    @Prop({ default: 0 })
    id: number;
    @Prop({ default: '' })
    userType: string;

    show: Boolean = false;
    userList: CommonTypes.UserInfoItem[] = [];
    formCustom: Form = {
        rgUser: '',
        role: 'NORMAL'
    };
    btnLoading: Boolean = false;
    searchLoading: Boolean = false;

    @Watch('visible', { immediate: true })
    onShowChanged (val) {
        this.show = val;
    }
    close () {
        this.$emit('update:visible', false);
    }
    onUserChanged (val) {
        this.formCustom.rgUser = val?.username;
    }
    async remoteMethod (query) {
        if (!query) return;
        this.searchLoading = true;
        try {
            const res = await api.ctiApi.searchUser({ keyword: query, includeExternal: true });
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
        this.btnLoading = true;
        try {
            await api.ctiApi.addRgUser({
                rgUsers: [this.formCustom.rgUser],
                role: this.userType,
                rgId: this.id,
                type: 'MISID'
            });
            this.$mtd.message({
                message: this.$getText('add_rg_modal_success_msg', '添加 RG 成员成功'),
                type: 'success'
            });
            this.$emit('success', this.formCustom.rgUser);
            this.close();
        } catch (e) {
            console.log(e);
        }
        this.btnLoading = false;
    }
}
</script>
<style lang="scss" scoped>
.add-rg-dialog {
    .mtd-modal-footer {
        .mtd-btn {
            & + .mtd-btn {
                margin-left: 0;
            }
        }
    }
}
</style>