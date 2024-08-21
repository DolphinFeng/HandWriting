<template>
    <div class="rg-brainpower-container">

        <main class="rg-brainpower-main-content">
            <div class="setting-tab-content">
                <mtd-form
                    :model="formData"
                    :label-width="160"
                    ref="settingForm"
                    :rules="settingFormRules">
                    <mtd-form-item prop="active" label="开启摩西辅助">
                        <mtd-switch
                            v-model="formData.isActive"
                            @change="toggleMosesSetting"
                            :loading="toggling" />
                    </mtd-form-item>
                    <div v-show="formData.isActive">
                        <mtd-form-item prop="mosesId" label="输入机器人ID">
                            <mtd-input
                                v-model="formData.mosesId"
                                style="width: 320px;"
                                @keyup.enter="submitMosesId" />
                            <mtd-button type="primary" @click="submitMosesId">绑定</mtd-button>
                            <div class="moses-bot-id-description">
                                <template v-if="mosesSetting.mosesId">
                                    <a target="_blank" :href="`https://moses.sankuai.com/#/cms/detail/${mosesSetting.mosesId}`">点击此处</a> 进入摩西机器人管理页进行配置
                                </template>
                                <template v-else>
                                    如果您还未申请机器人ID，可前往 <a href="https://moses.sankuai.com/#/cms/robot" target="_blank">摩西平台</a>申请
                                </template>
                            </div>
                        </mtd-form-item>
                    </div>
                </mtd-form>
            </div>

        </main>
    </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import * as api from '@/api';
import { Form, FormRules } from '@ss/mtd-vue';

interface MosesSetting {
    isActive: boolean;
    mosesId: string;
}

@Component({ name: 'rg-brainpower' })
export default class RgMoses extends Vue {
    rgId: number = null;

    toggling: boolean = false;
    formData = { isActive: false, mosesId: '' };
    mosesSetting: MosesSetting = { isActive: false, mosesId: '' };
    settingFormRules: FormRules = {
        mosesId: [
            { required: true, message: '不可为空' }
        ]
    };

    created () {
        const { rgId } = this.$route.query;
        this.rgId = parseInt(rgId as string, 10);

        this.getMosesSetting();
    }

    async getMosesSetting () {
        const res = await api.rgApi.getBrainpowerMoses(this.rgId);
        const { code, message, data } = res;
        if (code === 200) {
            const { isActive = false, mosesId = '' } = data;
            this.mosesSetting = { isActive, mosesId };
            this.formData = { ...this.mosesSetting };
        } else {
            this.$mtd.message.error(message);
        }
    }

    async toggleMosesSetting (toggle) {
        this.toggling = true;
        const result = await this.updateMosesSetting();
        this.toggling = false;
        if (result) {
            this.$mtd.message.success(toggle ? '启用成功' : '已关闭');
        } else {
            // 如果提交到后台失败了，那么恢复原来的状态
            this.formData.isActive = !toggle;
        }
    }

    validateMosesId (): Promise<boolean> {
        return new Promise((resolve) => {
            (this.$refs.settingForm as Form).validate((valid) => {
                resolve(valid);
            }).catch(e => {
                console.log(e);
                resolve(false);
            });
        });
    }

    async submitMosesId () {
        const valid = await this.validateMosesId();
        if (!valid) return;
        const result = await this.updateMosesSetting();
        if (result) {
            this.$mtd.message.success('绑定成功');
        }
    }

    async updateMosesSetting () {
        const setting:any = {
            rgId: this.rgId,
            isActive: !!this.formData.isActive,
            mosesId: this.formData.mosesId || this.mosesSetting.mosesId || ''
        };

        try {
            const { code, message, data } = await api.rgApi.updateBrainpowerMoses(setting);
            if (code === 200) {
                const { isActive = false, mosesId = '' } = data;
                this.mosesSetting = { isActive, mosesId };
                this.formData = { ...this.mosesSetting };
                return true;
            } else {
                this.$mtd.message.error(message);
                return false;
            }
        } catch (msg) {
            this.$mtd.message.error(msg || '操作失败');
            return false;
        }
    }
}
</script>
<style lang="postcss">
.rg-brainpower-container {
    padding: 16px 24px;
    .rg-brainpower-main-content {
        padding: 16px 0;
        .mtd-form-item-label {
            &::after {
                content: ':';
            }
        }
        .setting-tab-content {
            .moses-bot-id-description {
                font-size: 12px;
                color: rgba(0, 0, 0, 0.36);
                letter-spacing: 0;
                line-height: 22px;
            }
        }
    }
}
</style>
