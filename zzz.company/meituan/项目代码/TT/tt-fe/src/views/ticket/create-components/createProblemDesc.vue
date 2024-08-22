<template>
    <div class="create-custom-fields create-content-wrapper">
        <div class="create-title">
            <i slot="icon" class="iconfont icon-a-02" /><h1> {{ $getText('create_custom_fields_issue_description', '问题描述') }}</h1>
        </div>
        <div class="more-fields-wrapper">
            <custom-form
                ref="descCustomForm"
                :rg-id="rgId"
                :text-align="textAlign"
                :field-schema="defaultConfig"
                :default-content="staticConfig"
                :has-no-catalog="hasNoCatalog"
                @finish-upload="handleUpload"
                @change="bindFormChange" />
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import CustomForm from '@/views/ticket/components/customForm/customFormIndex.vue';

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
    defaultConfig: CommonTypes.CustomField[];

    @Prop({ default: null })
    rgId: number;

    @Prop()
    defaultContent: any;

    @Prop()
    customIndex: number;

    @Prop()
    hasNoCatalog: number;

    @Prop({ default: () => {
        return {};
    }})
    staticConfig: CommonTypes.mapObject;

    textAlign: string = 'left';

    bindFormChange (formData) {
        this.$emit('change', formData);
    }
    async validateForm () {
        return await this.$refs.descCustomForm && this.$refs.descCustomForm.validate().catch(err => console.log(`validate msg: `, err));
    }
    handleUpload () {
        this.$emit('finish-desc-upload');
    }
}
</script>

<style lang="scss" scoped>
.create-custom-fields {
    .create-title {
        margin-bottom: 12px;
        h1 {
            display: inline;
            vertical-align: middle;
        }
        .icon-a-02 {
            font-size: 22px;
            vertical-align: middle;
            display: inline-block;
            color: rgba(0, 0, 0, 0.72);
        }
    }
}
/deep/.custom-label-left {
    .mtd-form-item-label {
        width: 80px !important;
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
        margin-left: 92px !important;
    }
}
/deep/ .mtd-form-item.file {
    margin-bottom: 0;
    .upload-title {
        .upload-text {
            font-family: PingFangSC-Medium;
            margin-left: 4px;
        }
        .mtdicon-export-o {
            color: rgba(0, 0, 0, 0.6);
        }
        .mtdicon-info-circle-o {
            color: rgba(0, 0, 0, 0.36);
        }
    }
}
</style>
