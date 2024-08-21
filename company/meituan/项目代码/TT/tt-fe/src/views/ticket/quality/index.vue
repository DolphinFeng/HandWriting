<template>
    <div class="inspection-main">
        <router-view v-if="showContent" />
        <ticket-blank
            :from-detail="false"
            :hint="hint"
            v-else />
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import TicketBlank from '@/views/ticket/components/ticket-blank.vue';

@Component({
    components: {
        TicketBlank
    }
})
export default class QualityIndex extends Vue {
    @Getter inspectionInfo;
    get showContent () {
        return this.inspectionInfo.showInspection;
    }
    get hint () {
        return `此页面暂无权限访问，详情可查看<a target="_blank" href="https://km.sankuai.com/collabpage/1502059350">质检TT操作手册</a>`;
    }
}
</script>

<style lang="scss">
.inspection-main {
    min-width: 1200px;
    height: 100%;
    .mtd-table {
        .mtd-btn {
            font-size: 14px;
        }
    }
}
.inspection-confirm {
    .mtd-modal-header {
        padding-right: 54px;
        font-weight: 500;
        font-family: PingFangSC-Medium;
        color: rgba(0, 0, 0, 0.9);
    }
    .mtd-confirm-message {
        color: rgba(0, 0, 0, 0.7);
    }
    .mtd-modal-footer {
        .mtd-btn {
            border-radius: 6px;
            border: none;
            font-weight: 500;
            opacity: 0.9;
            font-family: PingFangSC-Medium;
            &:not(.mtd-btn-primary) {
                background: rgba(0, 0, 0, 0.06);
            }
        }
    }
}
</style>
