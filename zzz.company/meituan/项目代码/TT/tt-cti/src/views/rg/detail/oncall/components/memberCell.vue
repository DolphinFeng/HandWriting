<template>
    <div class="oncall-member-wrapper">
        <mtd-popover
            v-model="visible"
            :show-arrow="false"
            :disabled="disablePopover"
            placement="right"
            @input="onPopover"
            popper-class="oncall-member-popover"
            trigger="click">
            <div :class="['member-wrapper', {'selected': activeMis === member.identify}]">
                <user-avatar
                    :show-online="true"
                    :tooltip-content="member.deleted ? `${member.identify}（已删除）` : member.identify"
                    :username="member.identify"
                    :avatar="member.avatarUrl"
                    :display-name="member.displayName"
                    :online="member.currentlyOnline" />
                <mtd-tag :theme="tagTheme">{{ tagText }}</mtd-tag></div>
            <template slot="content">
                <div class="item" @click="switchShift">换班</div>
                <div class="item" @click="updateState">{{ stateText }}</div>
                <div class="item" @click="deleteMember">删除</div>
            </template>
        </mtd-popover>

        <switch-shift-modal
            v-if="showSwitchModal"
            :visible.sync="showSwitchModal"
            :proposer="member.identify"
            @success="onSuccess" />
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import SwitchShiftModal from './modals/switchShiftModal.vue';
import UserAvatar from '@/views/components/userAvatar.vue';
import * as api from '@/api';
import { lxReportClick } from '@/utils/directive/lxanaly';
import { OncallReportMap } from '@/config/lx.conf';

@Component({
    components: {
        SwitchShiftModal,
        UserAvatar
    }
})
export default class MemberCell extends Vue {
    @Prop({ default: () => ({}) }) member: CommonTypes.mapObject;
    @Prop({ default: '' }) activeMis: string;

    showSwitchModal: boolean = false;
    visible: boolean = false;

    switchShift () {
        lxReportClick(OncallReportMap.click_switch_oncall);
        this.showSwitchModal = true;
    }
    updateState () {
        if (!this.member.currentlyOnline) {
            // 上线无校验
            this.updateMemberState();
        } else {
            // 判断是否为当前最后一名在线值班人
            this.checkLastOnlineMember();
        }
    }
    async checkLastOnlineMember () {
        const res = await api.oncallApi.checkOncallMemberState({
            rgId: this.rgId,
            mis: [this.member.identify],
            action: this.member.currentlyOnline ? 'OFFLINE' : 'ONLINE'
        });
        const { code, data } = res;
        if (code === 200 && data) {
            if (data.lastOncall) {
                this.$mtd.confirm({
                    title: '下线提示',
                    width: '433px',
                    className: 'common-modal',
                    showCancelButton: true,
                    okButtonProps: {
                        class: 'tt-pure-btn'
                    },
                    cancelButtonProps: {
                        class: 'tt-pure-btn'
                    },
                    okButtonText: '确认',
                    type: 'info',
                    message: '您当前为最后一名值班人，是否确认下线？',
                    onOk: () => {
                        this.updateMemberState();
                    }
                }).catch(e => e);
            } else {
                this.updateMemberState();
            }
        }
    }
    async updateMemberState () {
        const res = await api.oncallApi.updateOncallMemberState({
            rgId: this.rgId,
            mis: [this.member.identify],
            action: this.member.currentlyOnline ? 'OFFLINE' : 'ONLINE'
        });
        if (res && res.code === 200) {
            this.$mtd.message.success(`${this.stateText}成功`);
            this.$emit('success');
            lxReportClick(OncallReportMap[this.member.currentlyOnline ? 'click_offline' : 'click_online']);
            this.visible = false;
            this.$emit('close');
        }
    }
    deleteMember () {
        if (this.member.currentlyOnline) {
            this.$mtd.message.error('当前用户仍在线接单，无法删除！');
            return;
        }
        this.$mtd.confirm({
            title: '删除值班人',
            width: '433px',
            message: `是否确认删除值班人 ${this.member.displayName ? `${this.member.displayName}/${this.member.identify}` : this.member.identify} ，删除后该用户的值班任务也会被清空`,
            showCancelButton: true,
            type: 'warning',
            okButtonText: '确认',
            className: 'common-modal',
            okButtonProps: {
                type: 'danger',
                class: 'tt-pure-btn'
            },
            cancelButtonProps: {
                class: 'tt-pure-btn'
            },
            onOk: async () => {
                const res = await api.oncallApi.deleteOncallMember({
                    rgId: this.rgId,
                    mis: [this.member.identify]
                });
                if (res && res.code === 200) {
                    this.$mtd.message.success('删除值班人成功');
                    this.$emit('success');
                }
            }
        }).catch(e => e);
    }
    onPopover (visible: boolean) {
        if (!visible) {
            this.$emit('close');
        }
    }
    onSuccess () {
        this.$emit('success');
    }
    get disablePopover () {
        return this.member.deleted;
    }
    get stateText () {
        return this.member.currentlyOnline ? '下线' : '上线';
    }
    get tagTheme () {
        return this.member.currentlyOnline ? 'green' : 'gray';
    }
    get tagText () {
        return this.member.deleted ? '已删除' : this.member.currentlyOnline ? '已上线' : '已下线';
    }
    get rgId () {
        return parseInt(this.$route.query.rgId as string, 10);
    }
}
</script>
