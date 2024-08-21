<template>
    <mtd-dropdown placement="bottom-end">
        <i class="mtdicon mtdicon-ellipsis" />
        <mtd-dropdown-menu 
            class="ticket-option-more" 
            slot="dropdown">
            <mtd-dropdown-menu-item
                v-lxay
                lxay-act="moduleClick"
                lxay-bid="b_techportal_9pzvq3uc_mc"
                v-if="itemPermission('cloneTicket').editable"
                @click="cloneTicket">{{ $getText('ticket_copy_button_clone_ticket', '克隆TT') }}</mtd-dropdown-menu-item>
            <mtd-dropdown-menu-item
                v-clipboard="linkFilter"
                @success="handleCopySuccess">{{ $getText('ticket_copy_button_copy_link', '复制链接') }}</mtd-dropdown-menu-item>
        </mtd-dropdown-menu>
    </mtd-dropdown>

</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { ssoEnvUrl, passportEnvUrl } from '@/config/baseurl.conf.ts';
import { Getter } from 'vuex-class';
import VueClipboards from 'vue-clipboards';
import { itemPermission } from '@/utils/tools';
Vue.use(VueClipboards);

/**
 * 无权限页面
 *
 * @author liyuyao
 * @date 04/10/2019
 */
@Component
export default class TicketCopyButton extends Vue {
    @Getter loginType;
    @Getter env;
    @Getter spaceDomain;

    itemPermission: any = itemPermission;

    get ticketId () {
        return this.$route.query.id || '';
    }

    linkFilter () {
        let id = this.ticketId;
        return `${this.TTBaseUrl[this.env || 'prod']}/ticket/detail?id=${id}`;
    }
    handleCopySuccess () {
        this.$mtd.message({
            message: this.$getText('ticket_copy_button_copy_success', '复制成功'),
            type: 'success'
        });
    }
    get TTBaseUrl () {
        return this.loginType === 'PASSPORT' ? passportEnvUrl : ssoEnvUrl;
    }

    cloneTicket () {
        let routeData = this.$router.resolve({
            name: 'tt_clone',
            params: {
                space: this.spaceDomain
            },
            query: {
                id: this.ticketId
            }
        });
        window.open(routeData.href, '_blank');
    }
}
</script>

<style lang="scss" scoped>
.mtdicon-link-o,
.mtdicon-ellipsis {
    background: rgba(0, 0, 0, 0.06);
    border-radius: 4px;
    padding: 7px;
    font-size: 18px;
    margin-left: 10px;
    cursor: pointer;
    &:hover {
        color: #000;
        background: rgba(0, 0, 0, 0.12);
    }
}
.ticket-option-more {
    min-width: 120px !important;
}
</style>