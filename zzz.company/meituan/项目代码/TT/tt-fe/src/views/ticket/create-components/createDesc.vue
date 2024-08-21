<template>
    <div class="create-desc-wrapper create-content-wrapper">
        <h1>{{ `0${descIndex} ${$getText('create_desc_title', '问题描述')}` }}</h1>
        <editor
            ref="editor"
            :is-comment="false"
            @input="handleDescChange"
            @blur="emitRecommend"
            @imgUpload="handleImgUpload"
            @change-val="handleValChanged"
            :value="form.desc"
            :action="`${uploadApi}`"
            :placeholder="$getText('create_desc_please_describe', '请简单描述您的问题')" />
        <div 
            class="mtd-form-item-error-tip"
            v-if="showDescCheck">{{ $getText('create_desc_desc_cannot_be_empty', '问题描述不能为空') }}</div>
        <CreateAttachment
            :is-ordinary-file="isOrdinaryFile"
            @change="attachmentChange" />
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import eventBus from '@/utils/event-bus';

import editor from '@/components/quill-editor.vue';
import CreateAttachment from './createAttachment.vue';


/**
 * 新版问题描述
 *
 * @author liyuyao
 * @date 04/20/2019
 */
@Component({
    components: {
        editor,
        CreateAttachment
    }
})
export default class CreateDesc extends Vue {
    @Getter inside;
    @Getter loginType;

    @Prop({ default: () => {
        return {};
    }})
    config: CommonTypes.mapObject;

    @Prop()
    showDescCheck: boolean;

    @Prop()
    isOrdinaryFile: boolean;

    @Prop()
    descIndex: number;

    form: CommonTypes.mapObject = {
        name: '',
        desc: ''
    };

    @Watch('config', { immediate: true })
    getConfig (config) {
        if (config.desc) {
            this.form.desc = this.getDefaultValue('desc');
        }
        if (config.name) {
            this.form.name = this.getDefaultValue('name');
            document.querySelector('.desc-inner-input input').value = this.form.name;
        }
    }

    get defaultDesc () {
        const descConfig = this.config.desc;
        return descConfig && descConfig.defaultValue || '';
    }

    getDefaultValue (identify: string) {
        const field = this.config[identify];
        return field && field.defaultValue ? field.defaultValue : '';
    }
    getFieldVisible (identify: string) {
        const field = this.config[identify];
        return !(field && field.isHidden);
    }
    get uploadApi () {
        return this.loginType === 'PASSPORT' ? `/api/passport/tt/1.0/file/upload/desc?area=desc` : `/api/tt/1.0/file/upload/desc?area=desc`;
    }

    mounted () {
        this.$refs.editor && this.insertNameInput();
    }

    insertNameInput () {
        const textContainer = document.querySelector('.ql-container');
        if (textContainer) {
            const template = `<div class="desc-inner-input"><input placeholder="${this.$getText('create_desc_please_enter_title', '请输入标题')}" /></div>`;
            let doc = new DOMParser().parseFromString(template, 'text/html');
            let newInput = doc.querySelector('.desc-inner-input');
            const parentNode = textContainer.parentNode;
            parentNode.insertBefore(newInput, textContainer);
            document.querySelector('.desc-inner-input input').addEventListener('blur', this.getNameInputValue);
        }
    }
    getNameInputValue () {
        const inputValue = document.querySelector('.desc-inner-input input').value;
        this.form.name = inputValue;
        this.$emit('change', this.form);
    }
    handleDescChange (val) {
        this.form.desc = val;
        this.$emit('change', this.form);
    }
    handleImgUpload (val) {
        console.log('xxx', val);
    }
    emitRecommend (val) {
        this.$nextTick(() => {
            eventBus.$emit('recommendCti', val);
        });
    }
    attachmentChange (attachment) {
        this.$emit('attachment-change', attachment);
    }
    beforeDestroy () {
        const input = document.querySelector('.desc-inner-input input');
        input && input.removeEventListener('blur', this.getNameInputValue);
    }
    handleValChanged (val) {
        // this.showDescCheck = !val;
        this.$emit('change-val', val);
    }
}
</script>

<style lang="scss" scoped>
/deep/.tt-quill-editor .ql-container.ql-snow {
    border-top: none;
}
/deep/.desc-inner-input {
    padding: 8px 12px 0 12px;
    font-family: PingFang SC;
    border-left: 1px solid rgba(0, 0, 0, 0.12);
    border-right: 1px solid rgba(0, 0, 0, 0.12);
    input {
        padding: 8px 0;
        width: 100%;
        border: none;
        border-bottom: 1px solid rgba(0, 0, 0, 0.12);
        font-family: PingFang SC;
        font-size: 20px;
        color: rgba(0, 0, 0, 0.84);
        line-height: 30px;
        font-weight: 500;
        &::-webkit-input-placeholder,
        &::-moz-placeholder,
        &::-ms-input-placeholder,
        &::placeholder {
            font-weight: bold;
            color: rgba(0, 0, 0, 0.24);
        }
    }
}
</style>
