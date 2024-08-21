<template>
    <div class="sla-nonworking-container">
        <h5>非工作时间不接单
            <mtd-switch
                v-model="formCustom.active"
                size="small"
                style="vertical-align: middle;"
                @change="nonWorkingSetting" />
        </h5>
        <div v-if="formCustom.active">
            <div class="nonworking-content-wrapper">
                <p>
                    非工作时间<span style="color: red; font-weight: bold;">仍然处理</span>的工单等级：
                    <mtd-checkbox-group style="display: inline-block;" v-model="formCustom.stillDealSlaList">
                        <mtd-checkbox
                            v-for="sla in slaList"
                            :key="sla.value"
                            :value="sla.value">{{ sla.name }}</mtd-checkbox>
                    </mtd-checkbox-group>
                </p>
                <p>
                    发起成功后的提示语：
                </p>
            </div>
            <editor
                v-if="formCustom.active"
                style="width: 600px;"
                ref="editor"
                :is-comment="false"
                :action="`/api/tt/1.0/file/upload/desc?area=desc`"
                @input="handleContentChange"
                :value="formCustom.hint" />
            <div class="button-wrapper">
                <mtd-button type="primary" @click="save">保存并预览</mtd-button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import Editor from '@/views/components/quill-editor.vue';
import { SlaList } from '@/config/map.conf';
import * as api from '@/api';
import 'quill/dist/quill.snow.css';

/**
 * sla 工作时间设置
 *
 * @author liyuyao
 * @date 01/20/2019
 */
@Component({
    components: {
        Editor
    }
})
export default class NonWorking extends Vue {
    slaList: any = SlaList;

    formCustom: any = {
        active: false,
        hint: '您好，您的问题已收到，我们将在工作时间立刻为您处理，请您耐心等待 ~',
        stillDealSlaList: [],
        rgId: 0
    };

    get rgId () {
        return parseInt(this.$route.query.rgId as string, 10);
    }

    mounted () {
        this.formCustom.rgId = this.rgId;
        this.getWorkingSetting();
    }

    handleContentChange (val) {
        this.formCustom.hint = val;
    }

    async save () {
        await this.nonWorkingSetting();
        const hint = this.formCustom.hint;
        this.$mtd.confirm({
            title: '发起成功',
            width: '400px',
            type: 'success',
            message: `<div class="ql-editor">${hint}</div>`,
            dangerouslyUseHTMLString: true
        }).catch(e => e);
    }
    cancel () {
        console.log('cancel');
    }
    async nonWorkingSetting () {
        const res = await api.ticketApi.nonWorkingSetting(this.formCustom);
        const { data, code } = res;
        if (code === 200) {
            this.$mtd.message.success('保存成功');
            this.formCustom = data;
        }
    }
    async getWorkingSetting () {
        const res = await api.ticketApi.getNonWorkingSetting({ rgId: this.rgId });
        const { data, code } = res;
        if (code === 200) {
            this.formCustom = Object.assign(this.formCustom, data);
        }
    }
}
</script>

<style lang="postcss">
.sla-nonworking-container {
    .nonworking-content-wrapper {
        line-height: 40px;
    }
    .button-wrapper {
        margin-top: 20px;
    }
}
</style>
