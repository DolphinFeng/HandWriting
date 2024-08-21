<template>
    <div class="ticket-edit-title" style="display: flex;">
        <hover-field style="flex: 1;">
            <mtd-textarea
                autosize
                v-model="currentName"
                :disabled="!itemPermission('name').editable"
                @blur="titleSave"
                @keydown.enter="preventCheckEnter" />
        </hover-field>
        <mtd-select
            v-if="data.detailOperate.customStatus !== 'disabled'"
            class="mtd-select-state"
            v-model="value"
            placeholder="添加自定义状态"
            @change="handleSelectChange"
            :disabled="data.detailOperate.customStatus === 'visible'"
            clearable>
            <mtd-option
                v-for="item in menuItems"
                :key="item.id"
                :label="item.content"
                :value="item" />
        </mtd-select>
        <ticket-copy-button v-if="language === 'zh'" style="line-height: 40px;" />
    </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import TicketCopyButton from './ticket-copy-button.vue';
import { itemPermission } from '@/utils/tools';
import * as api from '@/api';
import eventBus from '@/utils/event-bus';
/**
 * ticket标题
 *
 * @author liyuyao
 * @date 04/10/2019
 */
@Component({
    components: {
        TicketCopyButton
    }
})
export default class TicketName extends Vue {
    @Getter language;

    @Prop({ default: '' })
    name: string;

    currentName: string = '';
    value: string = '';
    menuItems: Array<{ id: number, name: string }> = [];
    itemPermission: Function = itemPermission;
    ticketDetail: CommonTypes.mapObject = {};
    data: any = { detailOperate: { customStatus: '' } };

    @Watch('name', { immediate: true })
    getName () {
        this.currentName = this.name;
    }

    get rgId () {
        return this.ticketDetail.rgId;
    }

    get ticketId () {
        return this.$route.query.id;
    }

    mounted () {
        this.initializeData();
        // 监听事件总线的事件
        eventBus.$on('ticket-updated', this.handleTicketUpdated);
    }
    beforeDestroy () {
        // 组件销毁前移除事件监听
        eventBus.$off('ticket-updated', this.handleTicketUpdated);
    }
    handleTicketUpdated (updatedCategory) {
        // 根据需求处理更新逻辑
        console.log('Ticket updated:', updatedCategory);
        this.initializeData(); // 重新获取状态
    }

    async initializeData () {
        try {
            await this.ticketDetailPermissions();
            await this.getState(); // 确保 getState 拿到 rgId 供后面使用
            if (this.rgId) {
                this.getStatuses();
            }
        } catch (e) {
            console.log(e);
        }
    }

    async getState () {
        if (!this.ticketId || isNaN(Number(this.ticketId))) {
            return;
        }
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.getTicketDetail(Number(this.ticketId));
            let { code, data } = res;
            this.ticketDetail = data;
            if (code === 200) {
                this.value = data.customStatusDisplayName;
            }
        } catch (e) {
            console.log(e);
        }
    }

    async ticketDetailPermissions () {
        if (!this.ticketId || isNaN(Number(this.ticketId))) {
            return;
        }
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.ticketDetailPermissions(Number(this.ticketId));
            let { code, data } = res;
            if (code === 200) {
                this.data = data; // 将 data 保存以供模板中使用
            }
        } catch (e) {
            console.log(e);
        }
    }

    async getStatuses () {
        // 清空当前选项
        this.menuItems = [];
        let res: Ajax.AxiosResponse = await api.ctiApi.getRgReplyField({
            rgId: Number(this.rgId),
            type: 'CUSTOM_STATUS'
        });
        let { code, data } = res;
        if (code === 200) {
            this.menuItems = data?.items || [];
        }
    }

    async statusChange (selectedItem) {
        if (!this.ticketId || isNaN(Number(this.ticketId))) {
            return;
        }
        try {
            await api.ticketApi.updateTicket(Number(this.ticketId), {
                customStatusId: selectedItem.id.toString(),  // 将选中的状态id作为customStatusId传递给后端
                customStatusDisplayName: selectedItem.content // 传递选项的内容给后端
            });
            this.$mtd.message({
                message: this.$getText('pend_ticket_tip_state_change', '状态变更成功'),
                type: 'success'
            });
        } catch (e) {
            console.log(e);
        }
    }

    titleSave () {
        // 如用户仅点开没有更改则不做校验也不emit
        if (this.name === this.currentName) return;
        if (this.currentName.length > 60) {
            this.$mtd.message.warning(this.$getText('ticket_name_title_length_warning', '标题不能超过60个字'));
            this.currentName = this.name;
            return ;
        }
        if (this.currentName.length === 0) {
            this.$mtd.message.warning(this.$getText('ticket_name_title_empty_warning', '标题不能为空'));
            this.currentName = this.name;
            return ;
        }
        this.$emit('update:name', this.currentName);
        this.$emit('submit', 'name', this.currentName);
    }
    cancelTitleSave () {
        this.currentName = this.name;
    }
    preventCheckEnter (e) {
        if (e.preventDefault) e.preventDefault();
        return false;
    }

    handleSelectChange (newValue) {
        if (!newValue) {
            newValue = { id: 0, content: '' };
        }
        this.statusChange(newValue);
    }
}
</script>

<style lang="scss">
.ticket-edit-title {
    padding: 4px 12px 0 8px;
    // border-bottom: 2px solid rgba(0, 0, 0, 0.06);
    // height: 43px;
    .mtd-textarea {
        width: 100%;
    }
    .mtd-textarea {
        font-family: PingFangSC-Semibold;
        font-size: 28px;
        color: rgba(0, 0, 0, 0.84);
        letter-spacing: 0;
        line-height: 27px;
        vertical-align: middle;
        resize: none;
        padding-bottom: 0;
        // height: 43px !important;
    }
    .mtd-select-state {
        position: relative;
        width: 200px;
        height: 32px;
        display: flex;
        flex-direction: column;
        padding: 5px 8px;
        opacity: 1;
        .mtd-input {
            border: 6px solid rgba(0, 0, 0, 0);
        }
        .mtd-input-wrapper,
        .mtd-input-suffix,
        .mtd-input {
            padding-right: 10px;
        }
    }
}
</style>