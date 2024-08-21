<template>
    <div class="ticket-custom-edit-container">
        <expand-button :text="$getText('ticket_custom_edit_expand_button_text', '自定义字段')" :fold.sync="customFold" />
        <div class="editor-content" v-show="customFold">
            <FormIndex
                :is-origin-edit="!edit"
                v-if="customFieldValues.length"
                ref="formIndex"
                :field-schema="customFieldValues"
                text-align="left"
                :no-hidden="true"
                @blur-change="blurChangeSubmit"
                :disabled="disabled" />
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import * as api from '@/api';
import FormIndex from '@/views/ticket/components/form/formIndex.vue';
import expandButton from '@/components/expand-button.vue';

import { FieldToDataType } from '@/config/custom.conf';

/**
 * Ticket详情 自定义字段编辑
 *
 * @author liyuyao
 * @date 04/18/2020
 */
@Component({
    components: {
        FormIndex,
        expandButton
    }
})
export default class TicketCustomEdit extends Vue {
    @Prop({ default: () => {
        return {};
    } })
    info: any;

    @Prop({ default: false })
    edit: boolean;

    @Prop({ default: false })
    disabled: boolean;


    isCanEdit: Boolean = false;

    $refs: any;

    fieldConfig: CommonTypes.mapObject[] = [];
    customFieldValueList: CommonTypes.mapObject[] = [];
    customFormId: number = 0;
    customFieldValues: CommonTypes.mapObject[] = [];

    customFold: boolean = true;

    editStatus: any = {
        desc: false,
        custom: false
    };

    ticketId: number = 0;

    // 获取系统字段
    async getSystemAndCustomFields (customId: number) {
        try {
            const params = {
                customFormId: customId,
                forceGet: true
            };
            const res: Ajax.AxiosResponse = await api.ticketApi.getSystemAndCustomFields(params);
            let { code, data } = res;
            if (code === 200) {
                this.isCanEdit = data.immutable;
                this.fieldConfig = data.customFieldContents;
            }
        } catch (e) {
            console.log(e);
        }
    }
    getOptions (elem) {
        elem.options.forEach((option) => {
            option.isDefault = false;
        });
        // 如果是多选 默认值是数组
        if (elem.inputType === 'MULTI_DROP_DOWN' && elem.multiDropDownValue.indexOf(',')) {
            const multiDropDownValue = elem.multiDropDownValue.split(',');
            elem.options.forEach((option) => {
                multiDropDownValue.forEach((multiDrop) => {
                    if (option.value === multiDrop) {
                        option.isDefault = true;
                    }
                });
            });
        } else if (elem.inputType === 'SINGLE_DROP_DOWN'
        || (elem.inputType === 'MULTI_DROP_DOWN' && elem.multiDropDownValue.indexOf(',') === -1)) {
            elem.options.forEach((option) => {
                if (option.value === elem.multiDropDownValue) {
                    option.isDefault = true;
                }
            });
        }
        return elem.options;
    }
    @Watch('info', { immediate: true })
    async onWatchInfo (info) {
        this.ticketId = info.id;
        // 初始化表单数据
        this.customFormId = info.customFormId;
        // this.customFieldValues = info.customFieldValues;
        // for (let key in this.info) {
        //     this.ticketDetail[key] = this.info[key];
        // }
        if (this.customFormId) {
            if (this.info.customFieldContents) {
                // isCanEdit 赋值有问题
                this.isCanEdit = this.info.immutable === undefined ? true : this.info.immutable;
                this.fieldConfig = this.info.customFieldContents;
            } else {
                await this.getSystemAndCustomFields(this.customFormId);
            }
            const customFieldValues: any[] = [];
            this.fieldConfig.forEach(elem => {
                if (info.customFieldValues && info.customFieldValues.length) {
                    info.customFieldValues.map(customElem => {
                        if (elem.id === customElem.customFieldId) {
                            elem.defaultValue = customElem.value;
                            elem.customFieldId = customElem.id;
                            if (elem.options && elem.options.length > 0) {
                                elem.defaultValue = '';
                                elem.multiDropDownValue = customElem.value;
                                elem.options = this.getOptions(elem);
                            }
                            customFieldValues.push(elem);
                        }
                    });
                }
            });
            // 获取详情
            this.customFieldValues = customFieldValues;
        }
    }
    async preSubmit () {
        let baseInfo: any;
        try {
            baseInfo = await this.$refs.formIndex.validate().catch(err => console.log(`validate msg: `, err));
        } catch (err) {
            console.log('err', err);
        }
        if (baseInfo && baseInfo.valid) {
            this.customFieldValueList = [];
            this.customFieldValues.forEach((elem) => {
                Object.keys(baseInfo.payload).forEach((payloadElem) => {
                    let valueData = '';
                    if (`'${elem.id}'` === payloadElem) {
                        // 是数组的话，需要转换成字符串
                        if (Array.isArray(baseInfo.payload[payloadElem])) {
                            valueData = '';
                            if (baseInfo.payload[payloadElem].length) {
                                valueData = baseInfo.payload[payloadElem].join(',');
                            }
                        } else {
                            valueData = baseInfo.payload[payloadElem];
                        }
                        let obj = {
                            id: elem.customFieldId,
                            value: valueData,
                            dataType: FieldToDataType[elem.inputType]
                        };
                        this.customFieldValueList.push(obj);
                        return;
                    }
                });
            });
        }
    }
    async submit () {
        await this.preSubmit();
        let params = {
            customFieldValueList: this.customFieldValueList
        };
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.updateCustomTicket(this.ticketId, params);
            let { code, data } = res;
            if (code === 200) {
                // this.$mtd.message({
                //     message: '编辑成功',
                //     type: 'success'
                // });
                this.$emit('success');
            }
        } catch (e) {
            console.log('e', e);
            this.$mtd.message.error(`${this.$getText('ticket_custom_edit_submit_error', '编辑失败，原因')}：${e}`);
        }
    }
    blurChangeSubmit () {
        // isCanEdit
        !this.edit && this.submit();
    }
}
</script>

<style lang="scss" scoped>
.ticket-custom-edit-container {
    margin-bottom: 24px;
}
.expand-more {
    font-weight: bold;
    color: rgba(0, 0, 0, 0.6);
}
.editor-content {
    padding: 16px 0;
}
</style>
