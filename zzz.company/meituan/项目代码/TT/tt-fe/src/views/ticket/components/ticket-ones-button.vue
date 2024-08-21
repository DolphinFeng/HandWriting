<template>
    <div class="transfer-btn-container">
        <mtd-button
            class="ones-btn"
            size="small"
            @click="createOnes">
            <span class="ticket-about-btn-content">
                <i class="iconfont icon-ones" />
                <span class="btn-label">{{ $getText('ticket_ones_button_ones_text', '转入ONES') }}</span>
            </span>
        </mtd-button>
        <create-ones-dialog
            v-if="dialogController.createOnes"
            :info="createOnesInfo"
            @close="dialogController.createOnes = false"
            @success="createOnesSuccess" />
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Getter } from 'vuex-class';

import CreateOnesDialog from './create-ones-dialog.vue';

import { markHyperLink } from '@/utils/tools';
/**
 * 创建ones
 *
 * @author liyuyao
 * @date 03/15/2019
 */
@Component({
    components: {
        CreateOnesDialog
    }
})
export default class TicketOnesButton extends Vue {
    @Getter env;

    @Prop({ default: () => {
        return {};
    } })
    info: any;

    withOnes: string = '';
    onesIssueId: number = 0;
    onesState: string = '';

    createOnesInfo: any = {
        projectId: null,
        assigned: '',
        name: '',
        expectClose: '',
        cc: [],
        ccResult: [],
        reporter: '',
        attachment: [],
        desc: ''
    };

    dialogController: any = {
        createOnes: false,
        score: false
    };
    ticketId: number = 0;

    mounted () {
        this.ticketId = this.$route.query.id;
    }
    @Watch('info', { immediate: true })
    async onWatchInfo () {
        if (this.info.assigned) {
            // 初始化ones信息
            this.createOnesInfo.name = this.info.name;
            this.createOnesInfo.cc = this.info.cc || [];
            this.createOnesInfo.reporter = this.info.reporter;
            this.createOnesInfo.attachment = this.info.attachment;
            this.createOnesInfo.assigned = this.info.assigned;

            let ttUrl = this.env === 'prod' ? `https://tt.sankuai.com/ticket/detail?id=${this.info.id}` : `http://tt.cloud.test.sankuai.com/ticket/detail?id=${this.info.id}`;
            this.createOnesInfo.desc = markHyperLink(`<p>${this.$getText('ticket_ones_button_transfer_desc', '转自TT')}：${ttUrl}</p>` + this.info.desc);
        }
    }
    handleUpdate () {
        this.$emit('success');
    }
    createOnes () {
        this.dialogController.createOnes = true;
    }
    createOnesSuccess () {
        this.$emit('update');
    }
}
</script>
<style lang="scss" scoped>
.btn-label {
    max-width: 90px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-left: 4px;
}
.ones-btn {
    background: #fff !important;
    .ones-btn-content {
        display: flex;
        align-items: center;
        line-height: 20px;
    }
}
.icon-ones {
    font-size: 17px;
    margin-right: 2px;
    color: #0a70f5;
}
.transfer-btn-container {
    height: 24px;
    display: flex;
    align-items: center;
}
</style>
