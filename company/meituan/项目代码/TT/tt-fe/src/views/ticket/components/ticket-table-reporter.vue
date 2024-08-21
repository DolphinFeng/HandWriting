<template>
    <user-avatar
        :username="scope.row.reporterI18nDisplayName ? `${scope.row.reporterI18nDisplayName}/${scope.row.reporter}` : (scope.row.reporterCnName ? `${scope.row.reporterCnName}/${scope.row.reporter}` : scope.row.reporter)"
        :display-name="scope.row.reporterCnName"
        :avatar="scope.row.reporterHeadUrl" />
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
