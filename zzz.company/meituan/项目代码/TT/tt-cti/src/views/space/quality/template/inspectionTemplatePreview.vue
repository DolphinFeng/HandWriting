<template>
    <div class="preview-container">
        <div class="preview-img-container">
            <div class="content-wrapper">
                <div class="title"><span>质检ID：XXXXXXXX</span><mtd-tag type="pure">待质检</mtd-tag></div>
                <img src="https://s3plus.sankuai.com/v1/mss_0701f23087724b1699a5aa3ca38f3c85/onesproduct/1671443543021/工单demo切图.png" alt="">
            </div>
        </div>
        <inspection-form :inspection-form="inspectionForm"  />
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import InspectionForm from './inspectionForm.vue';
@Component({
    components: {
        InspectionForm
    }
})
export default class InspectionTemplatePreview extends Vue {
    @Prop() inspectionForm: CommonTypes.mapObject;
}
</script>
<style lang="scss">
.preview-container {
    display: flex;
    flex: auto;
    .preview-img-container {
        flex: auto;
        background: #F7F7F7;
        padding: 14px 60px 48px 60px;
        font-size: 16px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        .content-wrapper {
            width: auto;
        }
        .title {
            display: flex;
            align-items: center;
            margin-left: 12px;
            .mtd-tag {
                margin-left: 4px;
                background: rgba(212, 30, 33, 0.1);
                border-radius: 4px;
                border: none;
                color: #D41E21;
            }
        }
        img {
            max-width: 900px;
            max-height: 100%;
            display: block;
        }
    }
}
</style>
