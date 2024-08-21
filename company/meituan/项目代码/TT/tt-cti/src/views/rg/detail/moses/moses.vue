<template>
    <div class="rg-moses-container">
        <mtd-radio-group v-model="activeTab">
            <mtd-radio-button value="setting">机器人设置</mtd-radio-button>
            <mtd-radio-button value="bulletin">公告设置</mtd-radio-button>
            <mtd-radio-button value="faq">常见问题</mtd-radio-button>
        </mtd-radio-group>

        <main class="rg-moses-main-content">
            <div class="setting-tab-content" v-if="activeTab === 'setting'">
                <mtd-form
                    :model="formData"
                    :label-width="160"
                    ref="settingForm"
                    :rules="settingFormRules">
                    <mtd-form-item prop="active" label="开启机器人对话">
                        <mtd-switch
                            v-model="formData.active"
                            @change="toggleMosesSetting"
                            :loading="toggling" />
                    </mtd-form-item>
                    <div v-show="formData.active">
                        <mtd-form-item prop="mosesBotId" label="输入机器人ID">
                            <mtd-input
                                v-model="formData.mosesBotId"
                                style="width: 320px;"
                                @keyup.enter="submitMosesBotId" />
                            <mtd-button type="primary" @click="submitMosesBotId">绑定</mtd-button>
                            <div class="moses-bot-id-description">
                                <template v-if="mosesSetting.mosesBotId">
                                    <a target="_blank" :href="`https://moses.sankuai.com/#/cms/detail/${mosesSetting.mosesBotId}`">点击此处</a> 进入摩西机器人管理页进行配置
                                </template>
                                <template v-else>
                                    如果您还未申请机器人ID，可前往 <a href="https://moses.sankuai.com/#/cms/robot" target="_blank">摩西平台</a>申请
                                </template>
                            </div>
                        </mtd-form-item>
                        <mtd-form-item
                            prop="mosesBotUrl"
                            label="机器人的RG链接"
                            v-if="mosesSetting.mosesBotUrl">
                            <a
                                :href="mosesSetting.mosesBotUrl"
                                target="_blank">
                                {{ mosesSetting.mosesBotUrl }}
                            </a>
                            <mtd-button
                                v-if="mosesSetting.mosesBotUrl"
                                type="text"
                                v-clipboard="mosesSetting.mosesBotUrl"
                                @success="clipboardSuccessHandler">
                                复制链接
                            </mtd-button>
                        </mtd-form-item>
                    </div>
                    <mtd-form-item
                        v-show="formData.active"
                        prop="resolutionKnowledgeBaseSwitch"
                        label="开启解决方案沉淀知识库"
                        :label-width="175">
                        <span slot="label">
                            开启解决方案沉淀知识
                            <info-tip content="开启之后，处理方可以在TT详情页中将处理方案或关闭原因设置为领域下意图的回复内容" />
                        </span>
                        <mtd-switch
                            v-model="formData.resolutionKnowledgeBaseSwitch"
                            @change="toggleOpenSolution"
                            :loading="solutionIng" />
                    </mtd-form-item>
                </mtd-form>
            </div>

            <div v-if="activeTab === 'bulletin'">
                <rg-moses-bulletin :rg-id="rgId" />
            </div>

            <div v-if="activeTab === 'faq'">
                <rg-moses-faq :rg-id="rgId" />
            </div>
        </main>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import * as api from '@/api';
import RgMosesFaq from './faq.vue';
import RgMosesBulletin from './bulletin.vue';
import { Form, FormRules } from '@ss/mtd-vue';
import InfoTip from '../../../components/info-tip.vue';

const getTtHost = () => {
    const { host } = window.location;
    if (host.indexOf('cti.cloud.test.sankuai.com') > -1) {
        return host.replace('cti', 'tt');
    }
    if (host.indexOf('localhost:3001') > -1) {
        return host.replace('3001', '3002');
    }
    if (host.indexOf('cti.fetc.st.sankuai.com') > -1) {
        return host.replace('cti', 'tt');
    }
    return 'tt.sankuai.com';
};

interface MosesSetting {
    active: boolean;
    mosesBotId: string;
    mosesBotUrl: string;
    resolutionKnowledgeBaseSwitch?: boolean;
}

@Component({ name: 'rg-moses', components: { RgMosesFaq, RgMosesBulletin, InfoTip } })
export default class RgMoses extends Vue {
    rgId: number = null;
    activeTab: string = '';

    toggling: boolean = null;
    solutionIng: boolean = null;
    formData = { active: null, mosesBotId: null, resolutionKnowledgeBaseSwitch: null };
    mosesSetting: MosesSetting = { active: null, mosesBotId: null, mosesBotUrl: null, resolutionKnowledgeBaseSwitch: null };
    settingFormRules: FormRules = {
        mosesBotId: [
            { required: true, message: '不可为空' }
        ]
    };

    mounted () {
        const { rgId, tab } = this.$route.query;
        this.rgId = parseInt(rgId as string, 10);

        this.getMosesSetting();

        if (['setting', 'bulletin', 'faq'].indexOf(tab as string) > -1) {
            this.activeTab = tab as string;
        } else {
            this.activeTab = 'setting';
            const originalQuery = this.$route.query;
            this.$router.replace({ query: { ...originalQuery, tab: 'setting' } });
        }
    }

    @Watch('activeTab')
    mutateTabQuery (newVal, oldVal) {
        if (newVal === oldVal) {
            return;
        }
        this.$router.push({
            query: {
                ...this.$route.query,
                tab: newVal
            }
        }).catch((e) => {
            console.warn(e);
        });
    }

    async getMosesSetting () {
        const res = await api.rgApi.getMosesSetting(this.rgId);
        const { code, message, data } = res;
        if (code === 200) {
            const { active, mosesId, content, resolutionKnowledgeBaseSwitch } = data;
            this.mosesSetting.active = active;
            this.mosesSetting.mosesBotId = mosesId;
            this.mosesSetting.mosesBotUrl = content;
            this.mosesSetting.resolutionKnowledgeBaseSwitch = resolutionKnowledgeBaseSwitch;

            // 初始化
            this.formData = { mosesBotId: mosesId, active, resolutionKnowledgeBaseSwitch };
        } else {
            this.$mtd.message({ message, type: 'error' });
        }
    }

    async toggleMosesSetting (toggle) {
        if (toggle == null) {
            return;
        }
        this.toggling = true;
        const result = await this.updateMosesSetting({ active: toggle });
        if (result) {
            this.$mtd.message({ message: toggle ? '启用成功' : '已关闭', type: 'success' });
            this.toggling = false;
        } else {
            // 如果提交到后台失败了，那么恢复原来的状态
            this.mosesSetting.active = !toggle;
            this.toggling = false;
        }
    }

    async toggleOpenSolution (toggle) {
        if (toggle == null) {
            return;
        }
        this.solutionIng = true;
        const result = await this.updateMosesSetting({ resolutionKnowledgeBaseSwitch: toggle });
        if (result) {
            this.$mtd.message({ message: toggle ? '启用成功' : '已关闭', type: 'success' });
            this.solutionIng = false;
        } else {
            // 如果提交到后台失败了，那么恢复原来的状态
            this.mosesSetting.resolutionKnowledgeBaseSwitch = !toggle;
            this.solutionIng = false;
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

    async submitMosesBotId () {
        const valid = await this.validateMosesId();
        if (!valid) return;
        const botId = this.formData.mosesBotId;
        const ttHost = getTtHost();
        const landingPageUrl = `${window.location.protocol}//${ttHost}/ticket/moses-helper?rgId=${this.rgId}`;
        this.updateMosesSetting({ mosesBotId: botId, mosesBotUrl: landingPageUrl, resolutionKnowledgeBaseSwitch: this.mosesSetting.resolutionKnowledgeBaseSwitch });
    }

    async updateMosesSetting (payload: Partial<MosesSetting>) {
        // WTF 还要这样判断是否已设置机器人和链接
        // const exists = this.mosesSetting.mosesBotId != null && this.mosesSetting.mosesBotUrl != null;

        const setting:any = {
            rgId: this.rgId,
            active: payload.active != null ? payload.active : true,
            mosesId: (payload.mosesBotId != null ? payload.mosesBotId : this.mosesSetting.mosesBotId) || '',
            content: (payload.mosesBotUrl != null ? payload.mosesBotUrl : this.mosesSetting.mosesBotUrl) || '',
        };
        if (payload.resolutionKnowledgeBaseSwitch !== undefined) {
            setting.resolutionKnowledgeBaseSwitch = payload.resolutionKnowledgeBaseSwitch != null ? payload.resolutionKnowledgeBaseSwitch : false;
        }
        // const sendReq = api.rgApi.theMosesSetting(setting);
        // exists
        //     ? () => api.rgApi.updateMosesSetting(setting)
        //     : () => api.rgApi.addMosesSetting(setting);

        try {
            const { code, message, data } = await api.rgApi.theMosesSetting(setting);
            if (code === 200) {
                const { content, active, mosesId, resolutionKnowledgeBaseSwitch } = data;
                this.mosesSetting.active = active;
                this.mosesSetting.mosesBotId = mosesId;
                this.mosesSetting.mosesBotUrl = content;
                this.mosesSetting.resolutionKnowledgeBaseSwitch = resolutionKnowledgeBaseSwitch;
                this.getMosesSetting();
                return true;
            } else {
                this.$mtd.message({ message, type: 'error' });
                return false;
            }
        } catch (e) {
            this.$mtd.message({ message: e || '操作失败', type: 'error' });
            return false;
        }
    }

    clipboardSuccessHandler () {
        this.$mtd.message({ message: '复制成功', type: 'success' });
    }
}
</script>
<style lang="postcss">
.rg-moses-container {
    padding: 16px 24px;
    .rg-moses-main-content {
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
