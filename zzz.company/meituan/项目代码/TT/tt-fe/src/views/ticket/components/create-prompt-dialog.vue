<template>
    <mtd-modal
        class="create-prompt-dialog form-dialog"
        :mask-closable="false"
        width="420px"
        @close="handleClose"
        v-model="visible">
        <div class="prompt-icon-wrap">
            <img
                class="prompt-icon"
                src="@/assets/img/recommend.png">
        </div>
        <p class="dialog-content-title">{{ $getText('create_prompt_dialog_dialog_content_title', '已帮你缩小服务目录范围，推荐使用！') }}</p>
        <p class="dialog-content-title-pre">{{ $getText('create_prompt_dialog_dialog_content_title_pre', '根据您的组织架构缩小目录选择范围，更快找对目录，高效解决问题！') }}</p>
        <div slot="footer" class="create-prompt-dialog-footer">
            <mtd-button
                type="primary"
                @click="submit">{{ $getText('create_prompt_dialog_submit_btn', '确定使用') }}</mtd-button>
        </div>
    </mtd-modal>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { State, Getter } from 'vuex-class';
import { CREATE_LX_MAP } from '@/config/lx_map.conf';
import { lxReportClick } from '@/utils/directive/lxanaly';

/**
 * 发起页跳转提示
 *
 * @author wb_zhanghongwei
 * @date 08/05/2021
 */

@Component
export default class CreatePromptDialog extends Vue {
    @State(state => state.tt.userInfo)
    userInfo: CommonTypes.UserInfoItem;
    @Getter env;
    visible: Boolean = true;

    includeCc: Boolean = false;
    @Prop({
        default: () => {
            return {};
        }
    })
    promptUserInfo: any;
    handleClose () {
        // this.$emit('close');
        this.visible = false;
    }

    get baseUrl () {
        return this.env === 'prod' ? 'https://tt.sankuai.com' : 'https://tt.cloud.test.sankuai.com';
    }

    async submit () {
        // console.log(this.promptUserInfo);
        this.handleClose();
        lxReportClick(CREATE_LX_MAP['create_prompt_ok']);
        // const spaceName = this.userInfo?.guideCreateLink.split('/')[3];
        window.open(this.promptUserInfo?.guideCreateLink, '_self');
        // window.open(`${window.location.origin}/${spaceName}/create`, '_self');
    }
}
</script>
<style lang="postcss" scoped>
.prompt-icon-wrap {
    width: 100%;
    display: flex;
    justify-content: center;
    .prompt-icon {
        width: 100px;
        height: 84px;
        margin-top: 8px;
        margin-bottom: 16px;
    }
}
.dialog-content-title {
    font-family: PingFang SC;
    font-size: 16px;
    color: rgba(0, 0, 0, 0.87);
    letter-spacing: 0;
    text-align: center;
    line-height: 24px;
    font-weight: 500;
    margin-bottom: 8px;
}
.dialog-content-title-pre {
    font-family: PingFang SC;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.6);
    letter-spacing: 0;
    text-align: center;
    line-height: 22px;
    font-weight: 400;
}
.create-prompt-dialog-footer {
    display: flex;
    justify-content: center;
}
/deep/.mtd-modal-close {
    width: 20px;
    height: 20px;
}
/deep/.mtd-modal-footer {
    padding-bottom: 20px;
}
</style>