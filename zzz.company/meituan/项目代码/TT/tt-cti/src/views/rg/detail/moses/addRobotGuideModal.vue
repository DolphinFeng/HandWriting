<template>
    <mtd-modal
        class="add-robot-guide-modal common-modal"
        width="600px"
        @close="close"
        v-model="visible">
        <template v-slot:title>
            <i class="mtdicon mtdicon-success-circle" />{{ isRgReport ? '保存成功！你还需要将TT机器人加入相关群，才能收到相关通知信息哦~' : '保存成功！你还需要将TT机器人加入相关群，TT机器人才能生成TT工单哦~' }}</template>
        <div>第1步：去往相关大象群，点击“群信息”<br>
            第2步：点击群机器人“管理”，输入“TT”搜索TT机器人，并点击“添加”。</div>
        <img src="https://s3plus.sankuai.com/v1/mss_0701f23087724b1699a5aa3ca38f3c85/onesproduct/68734926/a7fd8f9f-0226-45cd-9b98-e62a7e5fdb06/组39.png" alt="">

        <template slot="footer" v-if="!isRgReport">
            <mtd-button
                class="tt-pure-btn"
                :loading="btnLoading"
                type="primary"
                :href="url"
                target="_blank">立即去添加“TT机器人”</mtd-button>
            <mtd-button class="tt-pure-btn" @click="close">稍后添加</mtd-button>
        </template>
    </mtd-modal>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';

@Component({
    components: {}
})
export default class AddRobotGuideModal extends Vue {
    @State(state => state.cti.env)
    env: string;
    @Prop({ default: false })
    visible: boolean;
    @Prop({})
    groupId: number;
    @Prop({ default: false })
    isRgReport: boolean;

    btnLoading: boolean = false;

    close () {
        this.$emit('update:visible', false);
    }

    get url () {
        return this.env === 'test' ? `//xm-web.it.test.sankuai.com/bridge/chat?gid=${this.groupId}` : `//x.sankuai.com/bridge/chat?gid=${this.groupId}`;
    }
}
</script>
<style lang="postcss" scoped>
.add-robot-guide-modal {
    /deep/.mtd-modal-header {
        border: none;
        font-size: 18px;
        padding-right: 60px;
        .mtdicon {
            font-size: 20px;
            color: #00BA73;
            margin-right: 4px;
        }
    }
    /deep/.mtd-modal-content {
        img {
            width: 391px;
            margin-top: 16px;
        }
    }
    /deep/.mtd-modal-footer {
        text-align: left;
        display: flex;
        .mtd-btn {
            width: auto;
        }
    }
}
</style>
