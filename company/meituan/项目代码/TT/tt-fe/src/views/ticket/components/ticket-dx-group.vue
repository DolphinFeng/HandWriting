<template>
    <div class="ticket-dx-group-container">
        <mtd-button
            @click="createDxGroup"
            v-show="dxChatRoomPermission && groupStatus !== 'CREATED'">{{ dxGroupText }}
        </mtd-button>
        <mtd-button
            @click="enterDxGroup"
            v-show="isTicket && groupStatus === 'CREATED'">{{ $getText('ticket_dx_group_join_dx_group', '加入大象群') }}
        </mtd-button>
        <create-chatroom-dialog
            @success="handleCreateChatroom"
            v-if="createChatVisible"
            :rg-id="info.rgId"
            @close="createChatVisible = false" />
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { Getter, State } from 'vuex-class';
import store from '@/store';
import { lxReportClick } from '@/utils/directive/lxanaly';
import { CHAT_TT_MAP } from '@/config/lx_map.conf';

import CreateChatroomDialog from './create-chatroom-dialog.vue';
import { itemPermission } from '@/utils/tools';

import * as api from '@/api';
/**
 * 创建大象群 按钮
 *
 * @author liyuyao
 * @date 03/15/2019
 */
@Component({
    components: {
        CreateChatroomDialog
    }
})
export default class TicketDxGroup extends Vue {
    @Getter misX;
    @Getter env;
    @Getter inside;
    @Getter chatId;
    @State(state => state.tt.userInfo)
    userInfo: CommonTypes.UserInfoItem;

    @Prop({ default: () => {
        return {};
    } })
    info: any;

    @Prop() groupStatus: string;
    @Prop() isTicket: boolean;

    createChatVisible: Boolean = false;

    chatRoomId: number = 0;
    chatMembers: string[] = [];

    get ticketId () {
        return this.$route.query.id;
    }

    get dxChatRoomPermission () {
        return itemPermission('createChatRoom').editable;
    }

    createDxGroup () {
        if (this.groupStatus !== 'CREATED') {
            this.createChatVisible = true;
            this.submitReport('create_chat');
        }
    }
    submitReport (param: string) {
        const otherParams = {
            ticket_id: this.ticketId,
            mis: this.misX,
            org: this.userInfo?.orgId
        };
        lxReportClick(CHAT_TT_MAP[param], otherParams);
    }
    async enterDxGroup () {
        const res = await api.ticketApi.inviteUserToChat({
            ticketId: Number(this.ticketId),
            roomId: this.chatId,
            userList: [this.misX]
        });
        const { code, data } = res;
        if (data && code === 200) {
            this.$mtd.message({
                message: this.$getText('ticket_dx_group_join_success', '加群成功'),
                type: 'success'
            });
        }
    }
    async createGroup (includeCc) {
        // 如果当前用户可以看到“创建大象群”按钮，说明其有拉群权限，会将当前用户拉进群内
        // 当前用户 + 发起人 + 处理人 + 抄送人（可选）
        const members = [this.info.reporter].concat(this.info.assigned).filter(mem => mem !== 'tt.notAssigned');
        const ccMembers = includeCc ? (this.info.cc || []).concat(members) : members;
        const finalMembers = Array.from(new Set(ccMembers));
        const name = `${this.info.id}：${this.info.name}`;
        try {
            const res: Ajax.AxiosResponse = await api.chatApi.createGroup({
                objectId: Number(this.ticketId),
                memberIds: finalMembers,
                // ticketID：TT标题
                name: name
            });
            const { code, data } = res;
            if (data && code === 200) {
                this.$mtd.message({
                    message: this.$getText('ticket_dx_group_create_success', '创建大象群成功'),
                    type: 'success'
                });
                this.chatRoomId = data;
                store.commit('SET_CHAT_ID', this.chatRoomId);
                this.$emit('chat-exist', this.chatRoomId);
            }
        } catch (error) {
            if (error === '当前存在群聊!') {
                this.$emit('update', 'chat');
            }
            console.log(error);
        }
    }
    async handleCreateChatroom (includeCc) {
        +this.ticketId && await this.createGroup(includeCc);
        this.submitReport('confirm_create_chat');
        this.$emit('update');
    }
    // 大象群操作
    get dxGroupText () {
        return this.groupStatus === 'CREATED' ? this.$getText('ticket_dx_group_created', '已建群') : this.$getText('ticket_dx_group_create_dx_group', '创建大象群');
    }
}
</script>
<style lang="scss" scoped>
.ticket-dx-group-container {
    display: inline-block;
    .mtd-btn {
        vertical-align: bottom;
    }
}
</style>
