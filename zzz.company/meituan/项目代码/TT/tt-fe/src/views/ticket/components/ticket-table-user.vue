<template>
    <user-avatar
        :username="scope.row.assignedI18nDisplayName ? `${scope.row.assignedI18nDisplayName}/${scope.row.assigned}` : (scope.row.assignedCnName? `${scope.row.assignedCnName}/${scope.row.assigned}` : scope.row.assigned)"
        :display-name="scope.row.assignedCnName"
        :avatar="scope.row.assignedHeadUrl" />
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import UserAvatar from '@/components/user-avatar.vue';

/**
 * 归档
 *
 * @author rencheng
 * @date 03/09/2021
 */
@Component({
    components: {
        UserAvatar
    }
})
export default class TicketTableUser extends Vue {
    @Prop({ default: () => {
        return {};
    } })
    scope: any;
}
</script>
