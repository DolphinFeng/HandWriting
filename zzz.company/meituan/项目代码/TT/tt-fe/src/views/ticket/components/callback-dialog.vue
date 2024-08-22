<template>
    <mtd-modal
        class="topnav-callback-dialog form-dialog"
        :mask-closable="false"
        width="500px"
        @close="close"
        v-model="show">
        <div slot="title" class="callback-title">
            <i class="iconfont icon-customer" />
            {{ $getText('callback_dialog_title', '向客服提问') }}
        </div>
        <editor
            ref="editor"
            :value="callbackContent"
            :action="uploadApi"
            @input="handleChange"
            @imgUpload="handleImgUpload"
            class="callback-quill">
            <div slot="toolbar">
                <slot name="toolbar" />
            </div>
        </editor>
        <div slot="footer">
            <mtd-button @click="close">{{ $getText('callback_dialog_cancel_btn', '取消') }}</mtd-button>
            <mtd-button
                :loading="btnLoading || imgUploadStatus"
                type="primary"
                :disabled="imgUploadStatus"
                @click="submit">{{ $getText('callback_dialog_submit_btn', '提交') }}</mtd-button>
        </div>
    </mtd-modal>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import * as api from '@/api/index';
import editor from '@/components/quill-editor.vue';
/**
 * 反馈弹窗
 *
 * @author liyuyao
 * @date 11/20/2020
 */
@Component({
    components: {
        editor
    }
})
export default class CallbackDialog extends Vue {
    @Getter loginType;
    @Getter misX;
    @Getter spaceDomain;
    @Getter env;

    show: Boolean = true;
    callbackContent: string = '';
    btnLoading: Boolean = false;
    imgUploadStatus: boolean = false;

    close () {
        this.$emit('close');
        this.show = false;
    }
    async submit () {
        if (this.btnLoading || !this.callbackContent) {
            return;
        }
        this.btnLoading = true;
        const res: Ajax.AxiosResponse = await api.ticketApi.fastCreateTicket({
            name: 'TT问题反馈',
            desc: this.callbackContent,
            sla: 'S4',
            ticketType: '事件',
            itemId: this.env === 'test' ? 2801 : 9397, // 基础研发-基础技术/研发效能/TT-问题流转工具
            reporter: this.misX
        });
        let { code, data } = res;
        if (code === 200) {
            this.close();
            this.$router.push({
                name: 'tt_detail',
                params: {
                    space: this.spaceDomain
                },
                query: {
                    id: data.id
                }
            }).catch(e => e);
        }
        this.btnLoading = false;
    }
    handleImgUpload (val) {
        this.imgUploadStatus = val;
    }
    handleChange (value) {
        this.callbackContent = value;
    }
    get uploadApi () {
        return this.loginType === 'PASSPORT' ? `/api/passport/tt/1.0/file/upload?ticketId=0&area=desc` : `/api/tt/1.0/file/upload?ticketId=0&area=desc`;
    }
}
</script>
<style lang="scss" scoped>
.callback-quill {
    /deep/ .ql-editor {
        min-height: 0;
        height: 120px;
    }
}
.callback-title {
    font-size: 18px;
    font-family: PingFangSC-Medium;
    color: rgba(0, 0, 0, 0.87);
    .icon-customer {
        font-size: 20px;
    }
}
</style>