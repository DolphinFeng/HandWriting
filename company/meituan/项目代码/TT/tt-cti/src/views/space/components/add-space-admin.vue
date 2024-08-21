<template>
    <mtd-modal
        title="添加空间管理员"
        class="add-space-user-dialog form-dialog"
        :mask-closable="false"
        width="480px"
        @close="close"
        destroy-on-close
        v-model="show">
        <mtd-form
            :model="formCustom"
            ref="formCustom"
            :label-width="52">
            <mtd-form-item label="姓名">
                <mtd-select
                    v-model="formCustom.spaceUsers"
                    :loading="searchLoading"
                    filterable
                    remote
                    multiple
                    auto-clear-query
                    :debounce="200"
                    :remote-method="remoteMethod">
                    <mtd-option
                        v-for="item in userList"
                        :key="item.username"
                        :label="`${item.displayName}(${item.username})`"
                        :value="item.username" />
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
 * 添加空间 user
 *
 * @author xiaokunyu
 * @date 01/11/2010
 */
@Component
export default class AddSpaceAdminDialog extends Vue {
    @Prop({ default: false })
    visible: Boolean;
    @Prop({ default: 0 })
    id: number;
    show: Boolean = false;
    userList: CommonTypes.UserInfoItem[] = [];

    formCustom: CommonTypes.mapObject = {
        spaceUsers: []
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
        if (val) {
            this.formCustom.spaceUsers = [];
        }
    }
    close () {
        this.$emit('update:visible', false);
    }
    async remoteMethod (query) {
        if (!query) {
            this.userList = [];
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
        this.btnLoading = true;
        try {
            await api.spaceApi.addSpaceAdmin({
                usernames: this.formCustom.spaceUsers,
                spaceId: this.spaceId
            });
            this.$mtd.message({
                message: '添加空间管理员成功',
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
