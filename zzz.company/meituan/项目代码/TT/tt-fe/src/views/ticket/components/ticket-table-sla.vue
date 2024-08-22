<template>
    <sla-icon :sla="scope.row.sla" />
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import SlaIcon from '@/components/sla-icon.vue';

/**
 * 归档
 *
 * @author rencheng
 * @date 03/09/2021
 */
@Component({
    components: {
        SlaIcon
    }
})
export default class TicketTableSLA extends Vue {
    @Prop({ default: () => {
        return {};
    } })
    scope: any;
}
</script>
