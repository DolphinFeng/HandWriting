<template>
    <mtd-modal
        v-model="showModal"
        :destroy-on-close="true"
        title="添加值班组"
        @close="close"
        class="add-oncall-member-modal common-modal"
        width="710px">
        <mtd-form
            :model="groupFormData"
            ref="groupForm"
            :rules="groupFormRules">
            <mtd-form-item prop="displayName" label="值班组名称">
                <mtd-input
                    placeholder="输入值班组名"
                    v-model="groupFormData.displayName"
                    style="width: 100%;"
                    type="text" />
            </mtd-form-item>
            <br>
            <mtd-form-item prop="misList" label="值班组成员">
                <OverrideTransfer
                    :data="currentRgUsers"
                    v-model="groupFormData.misList"
                    ref="transfer"
                    :titles="['RG成员', '值班组成员']"
                    filterable />
            </mtd-form-item>
        </mtd-form>
        <div slot="footer">
            <mtd-button class="tt-pure-btn" @click="close">取消</mtd-button>
            <mtd-button
                type="primary"
                class="tt-pure-btn"
                :loading="btnLoading"
                @click="submitGroupForm">确定</mtd-button>
        </div>
    </mtd-modal>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import * as api from '@/api';
import { Form, FormRules } from '@ss/mtd-vue';
import { OverrideTransfer } from '@/views/components/mtd-override/transfer';

@Component({
    components: {
        OverrideTransfer
    }
})
export default class AddGroupModal extends Vue {
    @Prop({ default: false })
    visible: boolean;
    @Prop({ default: 'add' })
    type: 'add' | 'update';
    @Prop({ default: () => ({}) })
    formData: CommonTypes.mapObject;

    showModal: boolean = false;
    btnLoading: boolean = false;
    currentRgUsers: Array<CommonTypes.RgUserItem> = [];
    userOptions: CommonTypes.mapObject = [];
    groupFormData: { displayName?: string; misList?: any[]; onCallUserList?: any[]; [key: string]: any } = {};
    groupFormRules: FormRules = {
        displayName: { required: true, message: '请输入值班组名称' },
        misList: {
            required: true,
            validator: (_, value, callback) => {
                if (!Array.isArray(value)) {
                    const e = new Error('请选择值班组成员');
                    callback(e.message);
                    return false;
                }
                if (this.currentRgUsers.length > 0 && value.length === 0) {
                    const e = new Error('请选择至少一个值班组成员');
                    callback(e.message);
                    return false;
                }
                callback();
                return true;
            }
        }
    };

    @Watch('visible', { immediate: true })
    onVisibleChanged () {
        this.showModal = this.visible;
    }
    @Watch('formData', { immediate: true, deep: true })
    onDataChanged () {
        this.groupFormData = {
            ...this.formData,
            misList: this.formData.misList || []
        };
    }
    created () {
        this.getCurrentRgUsers();
    }
    // NOTE: 分页获取用户列表接口，参照按人值班页查询值班页的 getOncallUserList 方法，限制参数特殊逻辑 limit=10000
    async getCurrentRgUsers () {
        try {
            const res: any = await api.rgApi.getRgUser({
                cn: 1,
                sn: 10000,
                rgId: this.rgId
            });
            const { code, data } = res;
            if (code === 200) {
                this.currentRgUsers = data.items.map(item => {
                    return {
                        ...item,
                        key: item.identify,
                        label: `${item.displayName}(${item.identify})` + (item.active ? '' : ' 离职'),
                        // 离职员工也要考虑
                        disabled: !item.active
                    };
                });
            } else {
                this.$mtd.message({ type: 'error', message: '查询本 RG 下的用户列表出错' });
            }
        } catch (e) {
            console.error(e);
            this.currentRgUsers = [];
        }
    }
    async submitGroupForm () {
        const groupFormRef = this.$refs.groupForm as Form;
        groupFormRef.validate(async (valid) => {
            if (valid) {
                this.btnLoading = true;
                try {
                    const { identify, displayName, misList } = this.groupFormData;

                    const existed = !(identify == null);
                    const sendSubmitRequest = existed ? () => api.oncallApi.updateRgGroup({
                        identify,
                        rgId: this.rgId,
                        displayName,
                        misList,
                    }) : () => api.oncallApi.addRgGroup({
                        rgId: this.rgId,
                        displayName,
                        misList
                    });

                    const res: any = await sendSubmitRequest();
                    const { code } = res;
                    this.btnLoading = false;
                    if (code === 200) {
                        this.$mtd.message({
                            message: existed ? '修改值班组成功' : '添加值班组成功',
                            type: 'success'
                        });
                        this.$emit('success');
                        this.close();
                    } else {
                        console.error(res.code, res.msg);
                    }
                } catch (e) {
                    this.btnLoading = false;
                    console.error(e);
                }
            } else {
                const e = new Error('表单校验不通过');
                (e as any).valid = valid;
                console.error(valid);
            }
        }).catch(e => {
            console.debug('calling validate() on groupForm throws error');
            console.error(e);
        });
    }
    close () {
        this.$emit('update:visible', false);
    }
    confirm () {
        this.close();
        // 添加成员、回调success，刷新页面
    }
    get rgId () {
        return parseInt(this.$route.query.rgId as string, 10);
    }
}
</script>

<style lang="scss">
.add-oncall-member-modal {
    .mtd-modal-content-wrapper {
        padding-top: 24px !important;
        padding-bottom: 12px;
    }
    .drop-tip {
        color: rgba(0, 0, 0, 0.35);
        margin-bottom: 4px;
        font-size: 12px;
        span {
            color: rgba(0, 0, 0, 0.84);
        }
    }
    .drop-filter {
        .draggable-item {
            padding: 6px 6px;
            &:hover {
                background: #F5F5F5;
                cursor: grab;
            }
            .mtdicon {
                margin-right: 8px;
            }
        }
    }
}
</style>
