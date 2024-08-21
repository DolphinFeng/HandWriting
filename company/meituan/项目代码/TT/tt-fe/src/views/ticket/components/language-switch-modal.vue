<template>
    <div>
        <mtd-modal
            v-model="modalVisible"
            :title="$getText('language_switch_modal_title', '语言与时区')"
            @close="handleClose">
            <mtd-form
                ref="transferForm"
                label-position="top"
                :model="formData">
                <mtd-form-item
                    :label="$getText('language_switch_modal_language_label', '语言')"
                    prop="language">
                    <mtd-select
                        v-model="formData.language"
                        :placeholder="$getText('language_switch_modal_language_placeholder', '请选择语言')">
                        <mtd-option
                            v-for="item in languageOptions"
                            :key="item.value"
                            :value="item.value"
                            :label="item.label" />
                    </mtd-select>
                </mtd-form-item>
                <mtd-form-item
                    :label="$getText('language_switch_modal_time_label', '时区')"
                    prop="timeZone">
                    <mtd-select
                        v-model="formData.timeZone"
                        :placeholder="$getText('language_switch_modal_time_placeholder', '请选择时区')">
                        <mtd-option
                            v-for="item in timeZoneOptions"
                            :key="item.value"
                            :value="item.value"
                            :label="item.label" />
                    </mtd-select>
                </mtd-form-item>
                
            </mtd-form>

            <div slot="footer">
                <mtd-button @click="handleClose">{{ $getText('language_switch_modal_cancel', '取消') }}</mtd-button>
                <mtd-button
                    type="primary"
                    @click="handelSubmit">{{ $getText('language_switch_modal_confirm', '确定') }}</mtd-button>
            </div>
        </mtd-modal>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Getter, Mutation } from 'vuex-class';
import { LanguageType, TimeZoneType } from '@/config/map.conf';
import { changeLanguageForElement } from '@/inject-element-ui';
import * as api from '@/api';

@Component({ components: {} })
export default class LanguageSwitchModal extends Vue {
    @Prop({ default: false })
    modalVisible: boolean;

    @Getter language;
    @Getter timeZone;
    @Mutation setLanguage;
    @Mutation setTimeZone;

    LanguageType = LanguageType;
    TimeZoneType = TimeZoneType;

    formData: any = {
        language: 'zh',
        timeZone: 'GMT+08:00'
    };

    @Watch('modalVisible', { immediate: true })
    onShowChanged (val) {
        if (val) {
            this.formData = {
                language: this.language || 'zh',
                timeZone: this.timeZone || 'GMT+08:00'
            };
            api.preferenceApi.getLanguageOptions().then(res => this.LanguageType = res?.data || LanguageType);
            api.preferenceApi.getTimeZoneOptions().then(res => this.TimeZoneType = res?.data || TimeZoneType);
        }
    }

    get languageOptions () {
        return Object.entries(this.LanguageType).map(([key, value]) => ({ label: key, value }));
    }

    get timeZoneOptions () {
        return Object.entries(this.TimeZoneType[this.formData.language]).map(([key, value]) => ({ label: key, value }));
    }

    handleClose () {
        this.$emit('close', 'cancel');
    }

    async handelSubmit () {
        if (!this.formData || this.formData?.language === this.language && this.formData?.timeZone === this.timeZone) {
            this.$emit('close', 'submit');
            return;
        }
        const { language: newLanguage, timeZone: newTimeZone } = this.formData;
        // 改i18n配置
        if (newLanguage !== this.language) {
            this.$i18nClient.changeLanguage(newLanguage, (err) => {
                if (err) {
                    this.$mtd.message.error(this.$getText('change_language_failed', '语言切换失败'));
                    return;
                }
                changeLanguageForElement(newLanguage);
                this.setLanguage(newLanguage);
                this.$mtd.message.success(this.$getText('change_language_success', '语言切换成功'));
            });
        }
        if (newTimeZone !== this.timeZone) {
            // 处理时区
            this.setTimeZone(newTimeZone);
        }
                // 请求语言和时区设置接口
        try {
            await api.preferenceApi.setUserLanguage({
                locale: newLanguage,
                timeZone: newTimeZone
            });
        } catch (error) {
            console.error('Change user language setting failed: ', error);
        }
        this.$emit('close', 'submit');
        window.location.reload();
    }
}
</script>
<style lang="scss" scoped>
.language-modal-footer {
    padding: 17px;
    display: flex;
    justify-content: flex-end;
    .table-setting-button {
        margin: 0 12px;
        padding: 0 26px;
    }
}
</style>