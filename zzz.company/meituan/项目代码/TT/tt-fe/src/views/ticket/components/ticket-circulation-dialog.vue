<template>
    <mtd-modal
        class="ticket-circulations-dialog"
        @close="handleClose"
        :title="$getText('ticket_circulation_dialog_title', '服务目录流转')"
        :mount-on-create="false"
        v-model="visible">
        <div class="ticket-circulation-container">
            <category-assigned-search
                :circulation-reason="true"
                :catagory-info="catagorys"
                :is-detail="true"
                :render-assigned="false"
                :assigned-detail="assignedDetail"
                :is-work-hour="isWorkHour"
                @changeHandler="changeHandlerState"
                @changeWorkHour="updateWorkHourState"
                @change="updateCategoryAssigned"
                @searchedChanged="handleSearchedChanged" />
            <mtd-checkbox
                class="chat-group-checkbox"
                v-if="isWorkHour && chatId && catagorys.assigned && (catagoryInfo.assigned !== catagorys.assigned)"
                v-model="newAssignedJoinChat">{{ $getText('ticket_circulation_dialog_invite_assigned_to_chat', '已建群沟通，邀请当前处理人进群') }}</mtd-checkbox>
            <div class="button-group">
                <mtd-button
                    @click="cancelSave">{{ $getText('ticket_circulation_dialog_cancel_btn', '取消') }}</mtd-button>
                <mtd-button
                    @click="categorySave"
                    type="primary"
                    :loading="btnLoading"
                    :disabled="disableState">{{ $getText('ticket_circulation_dialog_confirm_btn', '确定') }}</mtd-button>
            </div>
        </div>
    </mtd-modal>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import CategoryAssignedSearch from '@/components/category-assigned-search.vue';
import * as api from '@/api';
import eventBus from '@/utils/event-bus';

/**
 * 处理人流转
 *
 * @author liyuyao
 * @date 04/25/2019
 */
@Component({
    components: {
        CategoryAssignedSearch
    }
})
export default class TicketCirculationDialog extends Vue {

    @Prop()
    catagoryInfo: any;

    @Prop()
    assignedDetail: {};

    @Prop({ default: 0 })
    ticketId: number;

    @Prop()
    isWorkHour: boolean;

    @Prop()
    isTicket: boolean;

    @Getter chatId;
    @Getter misX;
    @Getter env;

    catagorys: any = {
        assigned: '',
        categoryName: '',
        categoryId: 0,
        typeName: '',
        typeId: 0,
        itemName: '',
        itemId: 0,
        rgId: 0,
        rgName: '',
        transferReason: '',
        appointAssigned: true
    };
    currentSearchType: string = 'category';
    newAssignedJoinChat: boolean = true;
    btnLoading: Boolean = false;

    visible: Boolean = true;
    isHandlerChanged: boolean = false;
    hidenotInScopeBtn: boolean = false;
    searching: boolean = false; // 这里定义searched变量

    get assignedCnName () {
        return (this.assignedDetail.displayName ? `${this.assignedDetail.displayName || this.assignedDetail.mis }(${this.assignedDetail.mis})` : (this.assignedDetail.mis || '-')) || this.catagoryInfo.assigned;
    }

    @Watch('catagoryInfo', { immediate: true })
    onGetCatagoryInfo () {
        this.reMounted();
        this.calculateHideBtn();
    }
    handleClose () {
        this.$emit('close');
    }
    reMounted () {
        for (let key in this.catagorys) {
            this.catagorys[key] = this.catagoryInfo[key];
        }
    }
    calculateHideBtn () {
        if (!this.catagoryInfo?.createdAt) return;
        const nowTime = new Date().getTime();
        // 超过工单创建时间一周的工单，隐藏“帮我流转”按钮
        this.hidenotInScopeBtn = (nowTime - this.catagoryInfo.createdAt) / (1000 * 60 * 60 * 24) > 7;
    }
    updateCategoryAssigned (val, searchType) {
        this.currentSearchType = searchType || 'category';
        for (let key in this.catagorys) {
            this.catagorys[key] = val[key];
        }
    }

    handleSearchedChanged (searchedStatus) {
        this.searching = searchedStatus;
    }

    categorySave () {
        let bid = this.currentSearchType === 'assigned' ? 'b_onecloud_mwqu29hu_mc' : 'b_onecloud_cpx7ftgr_mc';
        window.LXAnalytics && window.LXAnalytics('moduleClick', bid, { custom: { mis: this.misX } });
        if (this.catagorys.itemId && this.catagorys.rgId) {
            this.submit();
        }
    }
    cancelSave () {
        window.LXAnalytics && window.LXAnalytics('moduleClick', 'b_onecloud_icp0sz24_mc', { custom: { mis: this.misX } });
        this.handleClose();
    }
    async assignToMe () {
        if (this.misX === this.catagorys.assigned) {
            return;
        }
        const res: Ajax.AxiosResponse = await api.ticketApi.updateTicket(this.ticketId, Object.assign(this.catagorys, {
            assigned: this.misX
        }));
        let { code } = res;
        if (code === 200) {
            this.$mtd.message({
                message: this.$getText('ticket_circulation_dialog_tip_act_success', '操作成功'),
                type: 'success'
            });
            this.$emit('update', this.catagorys);
        }
    }
    async submit () {
        this.btnLoading = true;
        try {
            this.catagorys.appointAssigned = this.isHandlerChanged;
            let obj = {};
            Object.assign(obj, this.catagorys);
            if (!this.isHandlerChanged || !obj.assigned || obj.assigned === 'defaultAssigned') {
                const res: Ajax.AxiosResponse = await api.ctiApi.getOncallUser({ rgId: this.catagorys.rgId });
                let { code, data } = res;
                if (code === 200) {
                    obj.assigned = data.identify;
                } else {
                    obj.assigned = null;
                }
            }
            obj.inviteNewAssigned = this.isWorkHour && this.newAssignedJoinChat;
            await api.ticketApi.updateTicket(this.ticketId, obj);
            this.btnLoading = false;
            this.$mtd.message({
                message: this.$getText('ticket_circulation_dialog_edit_success', '编辑成功'),
                type: 'success'
            });
            // 触发事件通知其他组件
            eventBus.$emit('ticket-updated', this.catagorys);
            this.$emit('update', this.catagorys);
            this.visible = false;
            this.handleClose();
        } catch (e) {
            console.log(e, 2222);
            this.btnLoading = false;
        }
    }
    async inviteUserToChat (assignedPeople: string) {
        const res = this.isTicket ? await api.ticketApi.inviteUserToChat({
            ticketId: this.ticketId,
            roomId: this.chatId,
            userList: [assignedPeople]
        }) : await api.chatApi.addMember({
            groupId: this.chatId,
            memberIds: [assignedPeople]
        });
        const { code, data } = res;
        if (data && code === 200) {
            this.$mtd.message({
                message: this.$getText('ticket_circulation_dialog_group_success', '邀请处理人加群成功'),
                type: 'success'
            });
        }
    }
    get disableState () {
        return this.searching || (!this.catagorys.itemId) || (!this.catagorys.assigned);
    }

    updateWorkHourState (val) {
        this.$emit('changeWorkHour', val);
    }

    changeHandlerState (val) {
        this.isHandlerChanged = val;
    }

}
</script>
<style lang="scss">
.ticket-circulation-container {
    .button-group {
        float: right;
        margin-top: 20px;
    }
    .category-assigned-search-container {
        .mtd-radio-group {
            margin-bottom: 12px;
        }
    }
    .info-label {
        color: rgba(0, 0, 0, 0.54);
    }
    .chat-group-checkbox {
        margin: 10px 0 0 70px;
    }
    .unknown {
        margin-left: 0;
        margin-top: 0;
        margin-bottom: 16px;
    }
    .category-form-item {
        width: 400px;
    }
}
</style>
