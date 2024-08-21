<template>
    <mtd-modal
        title="添加个人"
        class="add-rg-dialog form-dialog"
        :mask-closable="false"
        width="480px"
        @close="close"
        v-model="show">
        <mtd-form
            :model="formCustom"
            ref="formCustom"
            :label-width="52">
            <mtd-form-item label="姓名">
                <pm-select
                    type="dropdown"
                    remote
                    multiple
                    :loading="searchLoading"
                    :remote-method="remoteMethod"
                    class="component-rg-user"
                    :show-avatar="true"
                    @change="onUserChanged"
                    profile-key="avatar"
                    placeholder="请输入姓名、mis进行搜索"
                    input-placeholder="请输入姓名、mis进行搜索">
                    <pm-select-option
                        v-for="item in userList"
                        :profile="item.avatar"
                        :show-avatar="true"
                        :key="item.username"
                        :value="item"
                        :label="`${item.displayName}(${item.username})`" />
                </pm-select>
            </mtd-form-item>
            <!-- ('管理员', 'ADMIN') in userRole -->
            <!-- <mtd-form-item label="角色">
                <mtd-select v-model="formCustom.role">
                    <mtd-option
                        v-for="(label, key) in userRole"
                        :key="key"
                        :label="label"
                        :value="key" />
                </mtd-select>
            </mtd-form-item> -->
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
import { UserRole } from '@/config/map.conf';
import * as api from '@/api';
interface Form {
    rgUsers: string[];
    role: 'NORMAL' | 'RGADMIN';
}
/**
 * 添加RG user
 *
 * @author xiaokunyu
 * @date 01/11/2010
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
    userList: CommonTypes.UserInfoItem[] = [];
    formCustom: Form = {
        rgUsers: [],
        role: 'NORMAL'
    };
    userRole: CommonTypes.mapObject = UserRole;
    btnLoading: Boolean = false;
    searchLoading: Boolean = false;
    selectCompKey = 0;
    @Watch('visible', { immediate: true })
    onShowChanged (val) {
        this.show = val;
        // NOTE: 重新加载一次 Select 组件，以快速修复线上 zIndex 错乱的Bug：
        // 1. 点击 “添加成员” 打开 Modal (z-index: z1)，再在 Select 中输入关键词，展开备选项列表框 Popper (z-index: z2)，此时 z1 < z2
        // 2. 关闭 Modal 后，再重新执行第 1 步，会发生 z1 > z2 的问题
        // 通过重置 Select 组件的 key 让 Select 重新初始化重新得到 z2
        this.selectCompKey++;
        if (val) {
            this.formCustom.rgUsers = [];
            this.formCustom.role = 'NORMAL';
        }
    }
    close () {
        this.$emit('update:visible', false);
    }
    onUserChanged (val) {
        this.formCustom.rgUsers = val?.map(item => item.username);
    }
    async remoteMethod (query) {
        if (!query) return;
        this.searchLoading = true;
        try {
            const res = await api.rgApi.searchUser({ keyword: query, includeExternal: true });
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
            await api.rgApi.addRgUser({
                rgUsers: this.formCustom.rgUsers,
                role: this.userType,
                rgId: this.id,
                type: 'MISID'
            });
            this.$mtd.message({
                message: '添加 RG 成员成功',
                type: 'success'
            });
            this.$emit('success');
            this.close();
        } catch (e) {
            console.log(e);
        }
        this.btnLoading = false;
    }
}
</script>
