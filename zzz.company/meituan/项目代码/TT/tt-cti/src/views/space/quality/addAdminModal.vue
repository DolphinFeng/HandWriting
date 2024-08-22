<template>
    <mtd-modal
        :title="`添加${name}`"
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
                <pm-select
                    type="dropdown"
                    multiple
                    collapse-tags
                    :remote-method="remoteMethod"
                    class="inspection-member-select"
                    @change="handleMemberChanged"
                    :placeholder="`请选择${name}`"
                    :input-placeholder="`搜索${name}`">
                    <pm-select-option
                        v-for="item in userList"
                        :key="item.username"
                        :value="item"
                        :label="`${item.displayName}/${item.username}`" />
                </pm-select>
            </mtd-form-item>
        </mtd-form>
        <div slot="footer">
            <mtd-button @click="close" class="tt-pure-btn">取消</mtd-button>
            <mtd-button
                :loading="btnLoading"
                class="tt-pure-btn"
                type="primary"
                @click="submit">确定</mtd-button>
        </div>
    </mtd-modal>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import * as api from '@/api';

@Component
export default class AddAdminModal extends Vue {
    @Prop({ default: false })
    visible: boolean;
    @Prop({ default: 0 })
    id: number;
    @Prop({ default: 'admin' })
    type: 'admin' | 'inspector';

    show: boolean = false;
    userList: CommonTypes.UserInfoItem[] = [];
    orinigalUser: CommonTypes.UserInfoItem[] = [];
    formCustom: CommonTypes.mapObject = {
        inspector: []
    };

    btnLoading: Boolean = false;
    searchLoading: Boolean = false;
    $refs: any;

    @Watch('visible', { immediate: true })
    onShowChanged (val) {
        this.show = val;
        if (val) {
            this.formCustom.inspector = [];
        }
    }
    close () {
        this.$emit('update:visible', false);
    }
    mounted () {
        this.getSpaceAdmin();
    }
    handleMemberChanged (val) {
        this.formCustom.inspector = val.map(item => item.username);
    }
    async getSpaceAdmin () {
        const res = await api.spaceApi.getSpaceAdmin(this.spaceId);
        const { code, data } = res;
        if (code === 200) {
            this.userList = Object.assign([], data.items);
            this.orinigalUser = Object.assign([], data.items);
        }
    }
    async remoteMethod (query) {
        if (!query) {
            this.userList = this.orinigalUser;
            return;
        }
        this.searchLoading = true;
        this.userList = this.userList.filter(item => {
            return item.displayName.includes(query) || item.username.includes(query);
        });
        this.searchLoading = false;
    }
    async submit () {
        if (this.btnLoading) {
            return;
        }
        this.btnLoading = true;
        try {
            await api.inspectApi.addInspector({
                nameList: this.formCustom.inspector,
                objectId: this.spaceId,
                role: this.type.toUpperCase()
            });
            this.$mtd.message({
                message: `添加${this.name}成功`,
                type: 'success'
            });
            this.$emit('success');
            this.close();
        } catch (e) {
            console.log(e);
        }
        this.btnLoading = false;
    }
    get spaceId () {
        return parseInt(this.$route.params.id, 10);
    }
    get name () {
        return this.type === 'admin' ? '质检管理员' : '质检员';
    }
}
</script>
<style lang="scss">
.inspection-member-select {
    height: 34px;
    .mtd-picker {
        height: 34px;
    }
}
</style>
