<template>
    <div class="create-custom-fields create-content-wrapper">
        <div class="create-title">
            <i slot="icon" :class="['iconfont', this.customIndex === 2 ? 'icon-a-02' : 'icon-a-03']" /><h1> {{ $getText('create_custom_fields_fill_form', '填写绑定表单') }}</h1>
        </div>
        <div class="more-fields-wrapper">
            <custom-form
                ref="customForm"
                :rg-id="rgId"
                :field-schema="customConfig"
                :default-content="defaultContent"
                :create-type="createType"
                :form-type="formType"
                @finish-upload="handleUpload"
                @get-assigned-cti="getAssignedCti"
                @get-default-cti="getDefaultCti"
                @change="bindFormChange" />
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import CustomForm from '@/views/ticket/components/customForm/customFormIndex.vue';


/**
 * 新版更多属性
 *
 * @author liyuyao
 * @date 06/30/2021
 */
@Component({
    components: {
        CustomForm
    }
})
export default class CreateCustomFields extends Vue {
    @Getter inside;
    @Getter loginType;

    @Prop({ default: () => {
        return [];
    }})
    customConfig: CommonTypes.CustomField[];

    @Prop({ default: null })
    rgId: number;

    @Prop()
    defaultContent: any;

    @Prop()
    customIndex: number;

    // 发起方式
    @Prop({ default: 'BASIC' })
    createType: string;

    @Prop()
    formType: string;

    bindFormChange (formData) {
        this.$emit('change', formData);
    }
    async validateForm () {
        return await this.$refs.customForm && this.$refs.customForm.validate().catch(err => console.log(`validate msg: `, err));
    }
    getAssignedCti (cti) {
        this.$emit('get-assigned-cti', cti);
    }
    getDefaultCti (cti) {
        this.$emit('get-default-cti', cti);
    }
    handleUpload () {
        this.$emit('finish-custom-upload');
    }
}
</script>

<style lang="scss" scoped>
.more-fields-title {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.84);
    line-height: 22px;
    cursor: pointer;
    .mtdicon {
        color: rgba(0, 0, 0, 0.38);
    }
}
.create-custom-fields {
    .create-title {
        margin-bottom: 12px;
        h1 {
            display: inline;
            vertical-align: middle;
        }
        .icon-a-02,
        .icon-a-03 {
            font-size: 22px;
            vertical-align: middle;
            display: inline-block;
            color: rgba(0, 0, 0, 0.72);
        }
    }
}
/deep/.custom-label-left {
    .mtd-form-item-label {
        width: 60px !important;
        padding: 0;
        margin-left: 10px;
        text-align: left;
        position: relative;
        &::before {
            position: absolute;
            left: -10px;
        }
    }
    .mtd-form-item-content {
        margin-left: 72px !important;
    }
}
.more-fields-wrapper {
    /deep/.mtd-form-item {
        &:last-child {
            margin-bottom: 0;
        }
    }
}
</style>
