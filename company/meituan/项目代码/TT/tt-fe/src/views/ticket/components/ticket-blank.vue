<template>
    <div class="ticket-blank-container"> 
        <div class="info-contanier">
            <img src="@/assets/img/no-permission.png">
            <p>{{ $getText('ticket_blank_hint_no_permission', '此页面暂无权限访问，') }}</p>
            <p v-if="permissionUsers.length > 0">{{ $getText('ticket_blank_hint_contact', {contact: permissionUsersString}) }}</p>
            <p v-if="!fromDetail" v-html="hint" />
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import * as api from '@/api';
/**
 * 无权限页面
 *
 * @author liyuyao
 * @date 04/10/2019
 */
@Component
export default class TicketBlank extends Vue {
    @Prop({ default: true }) fromDetail: boolean;
    @Prop({ default: '' }) hint: string;
    permissionUsers: any = [];

    mounted () {
        this.fromDetail && this.getTicketPermission();
    }
    async getTicketPermission () {
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.getTicketPermission(this.ticketId);
            let { code, data } = res;
            if (code === 200) {
                this.permissionUsers = data.items;
            }
        } catch (e) {
            console.log(e);
        }
    }
    get ticketId () {
        return this.$route.query.id;
    }
    get permissionUsersString () {
        let str = this.permissionUsers.map((user) => {
            return `${user.displayName}（${user.mis}）`;
        });
        return str.join('，');
    }
}
</script>

<style lang="scss">
.ticket-blank-container {
    width: 100%;
    height: 100%;
    position: relative;
    .info-contanier {
        position: absolute;
        margin: auto;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        img {
            width: 118px;
            height: 118px;
        }
    }
}
</style>