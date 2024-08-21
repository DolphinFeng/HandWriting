<template>
    <mtd-modal
        :title="title"
        class="edit-xm-group-modal"
        width="500px"
        @close="close"
        v-model="visible">
        <mtd-form
            :model="groupDetail"
            :rules="ruleCustom"
            ref="xmGroupForm"
            :label-width="100">
            <mtd-form-item label="成员组名称" prop="groupName">
                <mtd-input v-model="groupDetail.groupName" style="width: 350px;" />
            </mtd-form-item>
            <mtd-form-item label="描述" prop="description">
                <mtd-textarea
                    v-model="groupDetail.description"
                    rows="1"
                    style="width: 450px;" />
            </mtd-form-item>
            <mtd-form-item label="群组成员" required>
                <div class="member-container">
                    <mtd-tag
                        v-for="(user, index) in groupDetail.memberDetails"
                        :key="user.mis"
                        theme="gray"
                        type="unbordered"
                        closable
                        @close="removeTag(index)">{{ `${user.name}/${user.mis}` }}
                        <span class="quit-tag" v-if="!user.isActive">{{ '(离职)' }}</span>
                    </mtd-tag>
                </div>
                <search-user-dropdown
                    @change="userChange"
                    @close="dropdownVisible = false"
                    placement="bottom-start"
                    placeholder="请输入姓名、mis进行搜索"
                    :visible="dropdownVisible"
                    :include-virtual="true">
                    <span class="add-button" @click="dropdownVisible = true"><i class="iconfont icon-add" /> 添加</span>
                </search-user-dropdown>
            </mtd-form-item>
        </mtd-form>
        <div slot="footer">
            <mtd-button @click="close">取消</mtd-button>
            <mtd-button
                :loading="btnLoading"
                type="primary"
                @click="submit">确认</mtd-button>
        </div>
    </mtd-modal>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import * as api from '@/api';
import SearchUserDropdown from '../components/search-user-dropdown.vue';
import { cloneDeep } from 'lodash';
const validateName: Function = (_rule, value, callback) => {
    if (!value) {
        return callback(new Error('成员组名称不能为空'));
    }
    if (value.length > 30) {
        return callback(new Error('成员组名称不能超过30个字'));
    }
    return callback();
};
const validateInstruction: Function = (_rule, value, callback) => {
    if (value && value.length > 100) {
        return callback(new Error('成员组说明不能超过100个字'));
    }
    return callback();
};
@Component({
    components: {
        SearchUserDropdown
    }
})
export default class EditGroupModal extends Vue {
    @Prop({ default: false })
    visible: boolean;
    @Prop({ default: 0 })
    rgId: number;
    @Prop({
        default: {
            groupName: '',
            description: '',
            memberDetails: []
        }
    })
    data: any;
    dropdownVisible: boolean = false;
    userList: any[] = [];
    formCustom: any = {
        members: []
    };
    groupDetail: any = {
        groupName: '',
        description: '',
        memberDetails: []
    };
    ruleCustom = {
        groupName: [
            { validator: validateName, trigger: 'blur', required: true }
        ],
        description: [
            { validator: validateInstruction, trigger: 'blur' }
        ]
    };
    btnLoading: Boolean = false;

    @Watch('data', { immediate: true, deep: true })
    onDataChanged () {
        if (this.data.groupId) {
            this.groupDetail = cloneDeep(this.data);
        } else {
            this.groupDetail = {
                groupName: '',
                description: '',
                memberDetails: []
            };
        }
    }
    close () {
        this.$emit('update:visible', false);
    }
    removeTag (index) {
        this.groupDetail.memberDetails.splice(index, 1);
    }
    async remoteMethod (query) {
        if (!query) {
            this.userList = [];
            return;
        }
        try {
            const res = await api.rgApi.searchUser({ keyword: query, includeExternal: true });
            this.userList = res.data.items || [];
        } catch (e) {
            this.userList = [];
            console.log(e);
        }
    }
    submit () {
        (this.$refs.xmGroupForm as any).validate(async (valid) => {
            if (valid) {
                if (!this.groupDetail.memberDetails?.length) {
                    this.$mtd.message.error('群组成员不能为空！');
                    return;
                }
                this.editGroup();
            }
        });
    }
    async editGroup () {
        this.btnLoading = true;
        try {
            const res = await api.rgApi.setXmGroup({
                groupId: this.data.groupId,
                rgId: this.rgId,
                groupName: this.groupDetail.groupName,
                description: this.groupDetail.description,
                members: this.groupDetail.memberDetails.map(item => item.mis)
            });
            const { code } = res;
            if (code === 200) {
                this.btnLoading = false;
                this.$mtd.message.success(this.data.groupId ? '编辑成功！' : '创建成功！');
                this.$emit('success');
            }
        } catch (error) {
            this.btnLoading = false;
        }
    }
    userChange (mis, name) {
        if (this.groupDetail.memberDetails?.length > 19) {
            this.$mtd.message({
                message: '成员不得超过20个',
                type: 'error'
            });
            return;
        }
        const existUser = this.groupDetail.memberDetails.find((userItem) => {
            return userItem.mis === mis;
        });
        if (!existUser) {
            this.groupDetail.memberDetails.push({
                mis,
                name,
                isActive: true
            });
        } else {
            this.$mtd.message.error('不能重复添加成员！');
        }
    }
    get title () {
        return this.data.groupId ? '编辑成员组' : '创建成员组';
    }
}
</script>
<style lang="scss">
.member-container {
    display: inline-block;
}
.public-search-user-dropdown-container {
    display: inline-block;
    .mtd-dropdown {
        color: #FFC300;
        .icon-add {
            font-size: 14px;
        }
    }
}
</style>
