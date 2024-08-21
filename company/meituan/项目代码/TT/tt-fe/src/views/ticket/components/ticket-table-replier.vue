<template>
    <div style="width: 90%;">
        <img
            src="@/assets/img/logo.png"
            class="last-replier"
            v-if="scope.row.lastReplyType === 1">
        <img
            src="@/assets/img/dx-logo.png"
            class="last-replier"
            v-if="scope.row.lastReplyType === 2">
        <span class="last-replier-name">{{ scope.row.lastReplierI18nDisplayName ? `${scope.row.lastReplierI18nDisplayName}/${scope.row.lastReplierMisId}` : (scope.row.lastReplier !== '-' ? `${scope.row.lastReplier}/${scope.row.lastReplierMisId}` : scope.row.lastReplierMisId) || '-' }}</span>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

/**
 * 归档
 *
 * @author rencheng
 * @date 03/09/2021
 */
@Component
export default class TicketTableReplier extends Vue {
    @Prop({ default: () => {
        return {};
    } })
    scope: any;
}
</script>
<style lang="scss">
.last-replier {
    width: 16px;
    height: 16px;
}
.last-replier-name {
    vertical-align: top;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: inline-block;
    width: 100%;
}
</style>