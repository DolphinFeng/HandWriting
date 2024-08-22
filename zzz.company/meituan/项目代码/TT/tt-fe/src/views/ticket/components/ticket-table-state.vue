<template>
    <state-icon :state="scope.row.state" :state-display-name="scope.row.stateDisplayName" />
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import StateIcon from '@/components/state-icon.vue';

/**
 * 归档
 *
 * @author rencheng
 * @date 03/09/2021
 */
@Component({
    components: {
        StateIcon
    }
})
export default class TicketTableState extends Vue {
    @Prop({ default: () => {
        return {};
    } })
    scope: any;
}
</script>
