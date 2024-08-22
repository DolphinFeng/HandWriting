<template>
    <div class="rg-reply-container" v-if="permission">
        <div>
            <div class="reply-title">字段设置</div>
            <mtd-tabs v-model="fieldTab">
                <mtd-tab-pane
                    :key="tab.value"
                    v-for="tab in fieldSettingTabs"
                    :label="tab.label"
                    :value="tab.value">
                    <keep-alive>
                        <reply-field-edit :type="tab.type" v-if="fieldTab === tab.value" />
                    </keep-alive>
                </mtd-tab-pane>
            </mtd-tabs>
        </div>
        <div style="margin-top: 20px;">
            <div class="reply-title">常用回复设置</div>
            <mtd-tabs v-model="replyTab">
                <mtd-tab-pane
                    :key="tab.value"
                    v-for="tab in replySettingTabs"
                    :label="tab.label"
                    :value="tab.value">
                    <keep-alive>
                        <reply-field-edit
                            :type="tab.type"
                            v-if="replyTab === tab.value"
                            :is-reply="true" />
                    </keep-alive>
                </mtd-tab-pane>
                <mtd-tab-pane
                    label="自动评论"
                    value="auto_comment">
                    <keep-alive>
                        <div>
                            <div class="comment-title">开启工单自动评论
                                <mtd-switch
                                    v-model="openAutoComment"
                                    size="small"
                                    @change="editAutoComment('switch', autoCommentSwitchId)" />
                            </div>
                            <div v-if="openAutoComment">
                                <div class="comment-hint">RG组收到工单后立即在工单评论中自动评论，评论人为该工单当前处理人</div>
                                <mtd-radio-group v-model="activeComment" @input="editAutoComment('switch', autoCommentSwitchId)">
                                    <mtd-radio value="default">固定评论</mtd-radio>
                                    <mtd-radio value="moses">智能评论</mtd-radio>
                                </mtd-radio-group>
                                <div v-if="activeComment === 'default'">
                                    <div class="comment-title">自动评论内容：</div>
                                </div>
                                <div v-else class="moses-wrapper">
                                    <span class="moses-required">*</span>
                                    <span class="moses-title">输入机器人ID：</span>
                                    <mtd-input
                                        v-model="mosesBotId"
                                        style="width: 320px;"
                                        @keyup.enter="editAutoComment('moses', autoCommentMosesId)" />
                                    <mtd-button
                                        type="primary"
                                        @click="editAutoComment('moses', autoCommentMosesId)"
                                        :disabled="!mosesBotId">绑定</mtd-button>
                                    <div class="moses-bot-id-description">
                                        <template v-if="bindMosesId">
                                            <a target="_blank" :href="mosesDetailURL">点击此处</a> 进入摩西机器人管理页进行配置
                                        </template>
                                        <template v-else>
                                            如果您还未申请机器人ID，可前往 <a :href="mosesRobotURL" target="_blank">摩西平台</a>申请
                                        </template>
                                    </div>
                                    <div class="comment-title">机器人没有匹配内容时自动评论内容：</div>
                                </div>
                                <mtd-textarea
                                    placeholder="请输入自动评论的内容~"
                                    type="text"
                                    v-model="autoCommentContent"
                                    rows="3" />
                                <mtd-button
                                    type="primary"
                                    @click="editAutoComment('text', autoCommentId)"
                                    :disabled="!autoCommentContent.trim()">保存</mtd-button>
                            </div>
                        </div>
                    </keep-alive>
                </mtd-tab-pane>
            </mtd-tabs>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { ReplySettingTabs, FieldSettingTabs } from '@/config/map.conf';
import ReplyFieldEdit from './components/reply-field-edit.vue';
import * as api from '@/api';

/**
 * sla设置
 *
 * @author liyuyao
 * @date 09/07/2020
 */
@Component({
    components: {
        ReplyFieldEdit
    }
})
export default class RgReply extends Vue {
    @State(state => state.cti.permission.rg_report)
    permission: boolean;
    @State(state => state.cti.env)
    env: string;

    fieldTab: string = 'pause';
    replyTab: string = 'comment';

    openAutoComment: boolean = false;
    // 用于保存后端返回的评论类型、摩西机器人、固定评论内容、摩西默认内容的ID
    autoCommentSwitchId: number = 0;
    autoCommentMosesId: number = 0;
    defaultItemId: number = 0;
    mosesItemId: number = 0;
    // textarea的绑定值
    autoCommentContent: string = '';
    // 固定评论内容和摩西默认内容
    defaultContent: string = '';
    mosesContent: string = '';
    // 输入的机器人ID
    mosesBotId: string = null;
    // 绑定成功的机器人ID
    bindMosesId: string = null;

    replySettingTabs: CommonTypes.mapObject[] = ReplySettingTabs;
    fieldSettingTabs: CommonTypes.mapObject[] = FieldSettingTabs;

    activeComment: string = '';

    get rgId () {
        return parseInt(this.$route.query.rgId as string, 10);
    }
    get autoCommentId () {
        return this.activeComment === 'default' ? this.defaultItemId : this.mosesItemId;
    }
    get mosesDetailURL () {
        return this.env === 'prod' ? `https://moses.sankuai.com/#/cms/detail/${this.bindMosesId}` : `https://moses.nlp.test.sankuai.com/#/cms/detail/${this.bindMosesId}`;
    }
    get mosesRobotURL () {
        return this.env === 'prod' ? 'https://moses.sankuai.com/#/cms/robot' : 'https://moses.nlp.test.sankuai.com/#/cms/robot';
    }

    @Watch('replyTab')
    onTabChanged (tab) {
        tab === 'auto_comment' && this.getRgAutoComment();
    }
    @Watch('activeComment', { immediate: true })
    onActiveChanged () {
        if (this.activeComment === 'default') {
            this.autoCommentContent = this.defaultContent;
        } else {
            this.autoCommentContent = this.mosesContent;
        }
    }

    async getRgAutoComment () {
        const res = await api.rgApi.getRgReplyText({
            type: 'AUTOCOMMENT',
            rgId: this.rgId
        });
        const { code, data } = res;
        if (code === 200) {
            data.items.forEach(item => {
                switch (item.type) {
                    case 'AUTOCOMMENT_IN_USE':
                        this.openAutoComment = item.content !== 'off';
                        if (this.openAutoComment) {
                            this.activeComment = item.content;
                        }
                        this.autoCommentSwitchId = item.id;
                        break;
                    case 'AUTOCOMMENT_CONTENT':
                        this.defaultContent = item.content;
                        this.defaultItemId = item.id;
                        break;
                    case 'AUTOCOMMENT_MOSES_DEFAULT':
                        this.mosesContent = item.content;
                        this.mosesItemId = item.id;
                        break;
                    case 'AUTOCOMMENT_MOSES_ID':
                        this.mosesBotId = item.content;
                        this.bindMosesId = item.content;
                        this.autoCommentMosesId = item.id;
                        break;
                    default:
                        break;
                }
            });
        }
    }

    async editAutoComment (type: string, id: number) {
        const isSwitch = type === 'switch';
        const isDefault = this.activeComment === 'default';
        const params = {
            id: id,
            content: '',
            type: '',
            rgId: this.rgId
        };
        switch (type) {
            case 'switch':
                params.content = this.openAutoComment ? (isDefault ? 'default' : 'moses') : 'off';
                params.type = 'AUTOCOMMENT_IN_USE';
                break;
            case 'moses':
                params.content = this.mosesBotId;
                params.type = 'AUTOCOMMENT_MOSES_ID';
                break;
            case 'text':
                if (!isDefault && !this.bindMosesId) {
                    this.$mtd.message({
                        message: '请先绑定摩西机器人',
                        type: 'error'
                    });
                    return;
                }
                params.content = this.autoCommentContent;
                params.type = isDefault ? 'AUTOCOMMENT_CONTENT' : 'AUTOCOMMENT_MOSES_DEFAULT';
                break;
            default:
                break;
        }
        try {
            const res = await api.rgApi.editReplyText(params);
            const { code } = res;
            if (code === 200) {
                !isSwitch && this.$mtd.message.success('保存成功');
                this.getRgAutoComment();
            }
        } catch (error) {
            console.log(error);
        }
    }
}
</script>

<style lang="postcss">
.rg-reply-container {
    padding: 16px 0;
    .reply-title {
        font-family: PingFangSC-Semibold;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.87);
        line-height: 16px;
        border-left: 3px solid #999999;
        padding-left: 8px;
        margin-bottom: 15px;
        border-left-color: #FFC300;
    }
    .sla-desc {
        font-family: PingFangSC-Regular;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.38);
    }
    .comment-title {
        font-family: PingFangSC-Semibold;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.87);
        line-height: 32px;
        .mtd-switch {
            vertical-align: middle;
        }
    }
    .comment-hint {
        font-size: 12px;
        margin-bottom: 8px;
    }
    .mtd-textarea {
        width: 600px;
    }
    .mtd-btn {
        display: block;
        margin-top: 10px;
    }
    .moses-wrapper {
        .moses-required {
            font-family: SimSun, sans-serif;
            display: inline-block;
            margin-right: 4px;
            color: #F5483B;
        }
        .mtd-btn {
            display: inline-block;
        }
        .moses-bot-id-description {
            font-size: 12px;
            color: rgba(0, 0, 0, 0.36);
            letter-spacing: 0;
            line-height: 22px;
            margin-left: 110px;
        }
        .comment-title {
            font-family: PingFangSC-Regular;
            color: rgba(0, 0, 0, 0.6);
        }
    }
}
</style>
