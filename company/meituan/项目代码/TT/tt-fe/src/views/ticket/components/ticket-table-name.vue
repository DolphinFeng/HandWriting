<template>
    <router-link
        class="recordEdit"
        target="_blank"
        :to="{
            name: 'tt_detail',
            params: {
                space: spaceDomain
            },
            query: { id: scope.row.id }}">{{ scope.row.name }}</router-link>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { Getter } from 'vuex-class';

/**
 * 归档
 *
 * @author rencheng
 * @date 03/09/2021
 */
@Component
export default class TicketTableName extends Vue {
    @Prop({ default: () => {
        return {};
    } })
    scope: any;

    @Getter spaceDomain;
}
</script>
