<template>
    <div class="sla-raise-notice-container">
        <section class="header">
            <mtd-announcement
                title="非常紧急、紧急工单超过时长会通知主管，您可以在当前页面配置该功能。暂时只支持工单发起后三十日内的超时提醒。"
                type="warning"
                show-icon />
        </section>
        <section class="setting-container">
            <h2>响应超时提醒</h2>
            <ul class="notice-list">
                <li v-for="(item, index) in responseNotices" :key="index + item.id">
                    <raise-notice-entry
                        v-model="responseNotices[index]"
                        ref="responseNoticeEntry"
                        :index="index"
                        label="响应"
                        @delete="deleteResponseEntry" />
                </li>
            </ul>
            <mtd-button
                type="text"
                class="add-button"
                icon="mtdicon mtdicon-file-add-o"
                @click="addResponseEntry">添加提醒</mtd-button>
        </section>
        <hr class="divider">
        <section class="setting-container resolve-timeout-setting">
            <h2>处理超时提醒</h2>
            <ul class="notice-list">
                <li v-for="(item, index) in resolveNotices" :key="index + item.id">
                    <raise-notice-entry
                        v-model="resolveNotices[index]"
                        ref="resolveNoticeEntry"
                        :index="index"
                        label="处理"
                        @delete="deleteResolveEntry" />
                </li>
            </ul>
            <mtd-button
                type="text"
                class="add-button"
                icon="mtdicon mtdicon-file-add-o"
                @click="addResolveEntry">添加提醒</mtd-button>
        </section>

        <section class="actions">
            <mtd-button type="primary" @click="submit">保存</mtd-button>
            <mtd-button @click="cancel">取消</mtd-button>
        </section>
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import * as api from '@/api';
import RaiseNoticeEntry, { SettingEntryProp } from './raise-notice-entry.vue';
import { clearUserInfoMapCache } from '@/services/user';

const mapNoticeToSettingEntry = (notice: CommonTypes.SlaRaiseNotice): SettingEntryProp => {
    const implicitReceivers = notice.noticeReceivers.type || [];
    const explicitReceivers = notice.noticeReceivers.username || [];
    return {
        id: notice.id != null ? notice.id : null, // 不写成 notice.id || null 是怕 notice.id 为 0
        slaLevel: notice.slaLevel,
        expiredTimes: notice.expiredTimes,
        receivers: [
            ...implicitReceivers.map(type => ({ role: type, misId: '' })),
            ...explicitReceivers.map(username => ({ role: 'EXPLICIT_USER' as const, misId: username }))
        ],
        receiversJoinDxGroup: notice.receiversJoinDxGroup
    };
};

type TransformedNoticeProps = Pick<CommonTypes.SlaRaiseNotice, 'noticeReceivers' | 'slaLevel' | 'expiredTimes' | 'id' | 'receiversJoinDxGroup'>;
const mapSettingEntryToNoticeProps = (settingEntryProp: SettingEntryProp): TransformedNoticeProps => {
    const { receivers, slaLevel, expiredTimes, id, receiversJoinDxGroup } = settingEntryProp;
    return {
        slaLevel,
        expiredTimes,
        noticeReceivers: {
            type: receivers.filter(item => item.role !== 'EXPLICIT_USER').map(item => item.role) as any,
            username: receivers.filter(item => item.role === 'EXPLICIT_USER').map(item => item.misId)
        },
        receiversJoinDxGroup,
        ...(id == null ? {} : { id })
    };
};

@Component({
    name: 'raise-notice-setting',
    components: { RaiseNoticeEntry }
})
export default class RaiseNoticeSetting extends Vue {
    rgId: number = null;

    notices: Array<CommonTypes.SlaRaiseNotice> = [];

    responseNotices: SettingEntryProp[] = [];
    resolveNotices: SettingEntryProp[] = [];

    async created () {
        this.rgId = parseInt(this.$route.query.rgId as string, 10) || null;
        await this.getSlaRaiseNotices();
    }

    unmounted () {
        clearUserInfoMapCache();
    }

    async getSlaRaiseNotices () {
        try {
            const res = await api.rgApi.getSlaRaiseNoticeSetting({ rgId: this.rgId });
            const { code, data } = res;
            if (code === 200 && Array.isArray(data.items)) {
                this.notices = data.items;
                this.responseNotices = data.items.filter(item => item.slaType === 'RESPONSE').map(mapNoticeToSettingEntry);
                this.resolveNotices = data.items.filter(item => item.slaType === 'RESOLVE').map(mapNoticeToSettingEntry);
            }
        } catch (e) {
            console.log(e);
        }
    }

    async validateAll (options: { typeFilter: CommonTypes.SlaRaiseType | 'ALL' }) {
        const typeFilter = options.typeFilter;

        const responseEntryRefs = (this.$refs.responseNoticeEntry || []) as Array<RaiseNoticeEntry>;
        const resolveEntryRefs = (this.$refs.resolveNoticeEntry || []) as Array<RaiseNoticeEntry>;

        const responseTasks = (['RESPONSE', 'ALL']).includes(typeFilter)
            ? responseEntryRefs.map((ref) => {
                return ref.validate();
            })
            : [];

        const resolveTasks = (['RESOLVE', 'ALL']).includes(typeFilter)
            ? resolveEntryRefs.map((ref) => {
                return ref.validate();
            })
            : [];

        const results = await Promise.all(responseTasks.concat(resolveTasks));

        return results.every(success => success);
    }

    async submit () {
        const validateSuccess = await this.validateAll({ typeFilter: 'ALL' });
        if (!validateSuccess) return;

        // 提交时的数据结构是 receivers: { type: [], username: [] }
        const responseEntriesPayload: Array<CommonTypes.SlaRaiseNotice> = this.responseNotices.map(item => {
            return {
                slaType: 'RESPONSE',
                ...mapSettingEntryToNoticeProps(item)
            };
        });

        const resolveEntriesPayload: Array<CommonTypes.SlaRaiseNotice> = this.resolveNotices.map(item => {
            return {
                slaType: 'RESOLVE',
                ...mapSettingEntryToNoticeProps(item)
            };
        });

        this.submitSlaRaiseNotices(responseEntriesPayload.concat(resolveEntriesPayload));
    }

    cancel () {
        this.$mtd.confirm({
            title: '确认放弃当前修改的内容吗？',
            width: '433px',
            showCancelButton: true,
            type: 'warning',
            okButtonText: '确定',
            okButtonProps: {
                type: 'danger'
            },
            onOk: async () => {
                this.responseNotices = this.notices.filter(item => item.slaType === 'RESPONSE').map(mapNoticeToSettingEntry);
                this.resolveNotices = this.notices.filter(item => item.slaType === 'RESOLVE').map(mapNoticeToSettingEntry);
            }
        }).catch(e => e);
    }

    async submitSlaRaiseNotices (payload: Array<CommonTypes.SlaRaiseNotice>) {
        try {
            const res = await api.rgApi.setSlaRaiseNotices({ payload, rgId: this.rgId });
            const { code } = res;
            if (code === 200) {
                this.$mtd.message({ message: '您的设置已保存', type: 'success' });
                this.getSlaRaiseNotices();
            }
        } catch (e) {
            console.log(e);
        }
    }

    async addResponseEntry () {
        const validateSuccess = await this.validateAll({ typeFilter: 'RESPONSE' });
        if (!validateSuccess) return;
        this.responseNotices.push({
            id: null,
            slaLevel: null,
            expiredTimes: null,
            receivers: [],
            receiversJoinDxGroup: false
        });
    }

    async addResolveEntry () {
        const validateSuccess = await this.validateAll({ typeFilter: 'RESOLVE' });
        if (!validateSuccess) return;
        this.resolveNotices.push({
            id: null,
            slaLevel: null,
            expiredTimes: null,
            receivers: [],
            receiversJoinDxGroup: false
        });
    }

    deleteResponseEntry (index: number) {
        this.responseNotices.splice(index, 1);
    }

    deleteResolveEntry (index: number) {
        this.resolveNotices.splice(index, 1);
    }
}
</script>

<style lang="postcss">
.sla-raise-notice-container {
    .setting-container {
        padding: 0;
        margin-top: 20px;
        h2 {
            font-family: PingFangSC-Medium;
            /* font-size: 14px; */
            color: rgba(0, 0, 0, 0.84);
            line-height: 22px;
        }
        ul.notice-list {
            margin-top: 12px;
        }
        hr.divider {
            margin-top: 24px;
            margin-bottom: 24px;
            height: 1px;
            color: rgba(0, 0, 0, 0.06);
        }
        .add-button {
            padding-left: 0;
            border: 0;
        }
        &.resolve-timeout-setting {
            margin-bottom: 64px;
        }
    }
    .actions {
        position: fixed;
        bottom: 0;
        width: 100%;
        text-align: right;
        padding: 14px 14px 14px 0;
        padding-right: 15%;
        border-top: 1px solid rgba(209, 209, 209, 0.8);
        background-color: #FFFFFF;
    }
}
</style>
