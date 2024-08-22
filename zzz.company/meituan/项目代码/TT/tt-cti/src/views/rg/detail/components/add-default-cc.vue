<template>
    <mtd-modal
        title="添加默认抄送人"
        class="form-dialog"
        :mask-closable="false"
        @close="handleClose"
        v-model="visible">
        <mtd-form>
            <mtd-form-item
                label="姓名"
                prop="name"
                :label-width="70">
                <mtd-select
                    v-model="ccList"
                    :loading="searchLoading"
                    multiple
                    placeholder="请输入添加成员的mis号"
                    :filterable="true"
                    :debounce="200"
                    :remote="true"
                    style="width: 300px;"
                    :remote-method="remoteMethod">
                    <mtd-option
                        v-for="item in userList"
                        :key="item.username"
                        :label="`${item.displayName}(${item.username})`"
                        :value="item.username" />
                </mtd-select>
            </mtd-form-item>
        </mtd-form>
        <div slot="footer" class="demo-modal-footer">
            <mtd-button @click="cancel">取消</mtd-button>
            <mtd-button type="primary" @click="submit">确定</mtd-button>
        </div>
    </mtd-modal>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import * as api from '@/api';
/**
 * 添加RG user
 *
 * @author xiaokunyu
 * @date 01/11/2010
 */
@Component
export default class AddDefaultCc extends Vue {
    @Prop()
    defaultCcList: any;

    visible: Boolean = true;
    searchLoading: boolean = false;
    userList: CommonTypes.UserInfoItem[] = [];

    ccList: string[] = [];

    mounted () {
        this.remoteMethod('');
        if (this.defaultCcList.length) {
            this.ccList = this.defaultCcList.map((user) => {
                return user.username;
            });
        }
    }
    handleClose () {
        this.$emit('close');
    }
    async remoteMethod (query: any) {
        this.searchLoading = true;
        const res = await api.rgApi.searchUser({
            keyword: query,
            includeVirtual: true
        });
        if (res && res.code === 200) {
            this.userList = res.data.items as any;
        }
        this.searchLoading = false;
    }
    async submit () {
        const params = {
            rgId: this.rgId,
            users: this.ccList
        };
        try {
            const res = await api.rgApi.sendRgSetting(params);
            const { code } = res;
            if (code === 200) {
                this.$mtd.message.success('修改成功');
                this.$emit('success');
                this.handleClose();
            }
        } catch (e) {
            this.$mtd.message.error(`修改失败，原因：${e}`);
        }
    }
    cancel () {
        this.visible = false;
        this.handleClose();
    }
    get rgId () {
        return parseInt(this.$route.query.rgId as string, 10);
    }
}
</script>
