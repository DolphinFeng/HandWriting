<template>
    <div class="member-handover-wrapper">
        <div class="handover-header">
            <span class="header-title">{{ $getText('member_handover_header_title', '组员的工作交接') }}</span>
        </div>
        <div v-if="misList.length" class="member-content-wrapper">
            <handover-nav  
                @change="changeUser"
                @update="getNextPage"
                :active-mis="activeMis"
                :mis-list="misList"
                :current-page="currentPage"
                :limit="limit"
                :total="total" />
            <handover-content
                v-if="showContent && !finishHandover"
                :user="activeMis" />
            <div class="already-handover-wrapper" v-else>
                <div class="already-handover">
                    <i class="mtd-icon mtdicon-success-o" />
                    <div>{{ $getText('member_handover_already_handover', {name: activeName}) }}</div>
                    <div>{{ $getText('member_handover_already_handover_desc', '历史交接情况正在加急开发中，敬请期待~') }}</div>
                </div>
            </div>
        </div>
        <div v-else class="empty-member-wrapper">
            <div class="empty-page">
                <i class="mtd-icon mtdicon-barschart-o" />
                <div>{{ $getText('member_handover_empty_page_title', '暂无需要交接的工作') }}</div>
                <div>{{ $getText('member_handover_empty_page_desc', '去试试别的功能吧~') }}</div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import HandoverContent from '@/views/ticket/components/handover-content.vue';
import HandoverNav from '@/views/ticket/components/handover-nav.vue';
import * as api from '@/api';
import { Getter } from 'vuex-class';
import { PaginationMixin } from '@/utils/mixin';
@Component({
    components: {
        HandoverContent,
        HandoverNav
    }
})
export default class MemberHandover extends PaginationMixin {
    @Getter misX;
    misList: any[] = [];
    activeMis: string = '';
    activeName: string = '';
    showContent: boolean = true;
    finishHandover: boolean = false;
    limit: number = 10;

    @Watch('misX', { immediate: true })
    getUserChanged () {
        if (this.misX) {
            this.getMemberHandoverList();
        }
    }
    mounted () {
        this.$route.query.mis && (this.activeMis = this.$route.query.mis);
    }
    changeUser (mis: string, name: string, finishHandover: boolean) {
        if (!mis) {
            return ;
        }
        this.showContent = false;
        this.activeMis = mis;
        this.activeName = name;
        this.finishHandover = finishHandover;
        this.$nextTick(() => {
            this.showContent = true;
        });
        this.updateRouter();
    }
    updateRouter () {
        let query = this.$router.history.current.query;
        let path = this.$router.history.current.path;
        let newQuery = JSON.parse(JSON.stringify(query));
        newQuery.mis = this.activeMis;
        this.$router.push({ path, query: newQuery }).catch(err => err);
    }
    getNextPage (current: number, limit: number) {
        this.limit = limit;
        this.currentPage = current;
        this.getMemberHandoverList();
    }
    async getMemberHandoverList () {
        const res: Ajax.AxiosResponse = await api.ctiApi.getHandoverMembers(this.currentPage, this.limit);
        const { code, data } = res;
        if (code === 200 && data) {
            this.total = data.tn;
            this.misList = data.items || [];
            // 默认选中第一项
            if (this.misList.length && !this.$route.query.mis) {
                this.activeMis = this.misList[0].username;
                this.activeName = this.misList[0].displayName;
                this.updateRouter();
            }
        }
    }
}
</script>
<style lang="scss">
.member-handover-wrapper {
    width: 994px;
    margin: 12px auto;
    margin-bottom: 24px;
    height: calc(100% - 36px);
    .handover-header {
        padding: 17px 0 17px 20px;
        background: #fff;
        box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.08);
        border-radius: 4px;
        margin-bottom: 12px;
        .header-title {
            font-weight: 500;
            font-family: PingFangSC-Medium;
            font-size: 20px;
            color: rgba(0, 0, 0, 0.84);
            line-height: 26px;
        }
    }
    .member-content-wrapper {
        display: flex;
        height: calc(100% - 63px);
        min-height: 640px;
        .content-wrapper {
            height: 100%;
        }
    }
    .already-handover-wrapper {
        flex: 1 1 auto;
        position: relative;
        box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.08);
        border-radius: 4px;
        background: #fff;
        .already-handover {
            height: 154px;
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translateY(-50%) translateX(-50%);
            font-weight: 500;
            font-family: PingFangSC-Medium;
            font-size: 16px;
            color: rgba(0, 0, 0, 0.87);
            line-height: 24px;
            text-align: center;
            .mtd-icon {
                font-size: 112px;
                color: #c2c1c2;
            }
            div:last-child {
                font-weight: 400;
                font-family: PingFangSC-Regular;
                font-size: 12px;
                color: rgba(0, 0, 0, 0.38);
                line-height: 20px;
            }
        }
    }
    .empty-member-wrapper {
        background: #fff;
        box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.08);
        border-radius: 4px;
        height: calc(100% - 63px);
        .empty-page {
            height: 154px;
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translateY(-50%) translateX(-50%);
            font-weight: 500;
            font-family: PingFangSC-Medium;
            font-size: 16px;
            color: rgba(0, 0, 0, 0.87);
            line-height: 24px;
            text-align: center;
            .mtd-icon {
                font-size: 112px;
                color: #c2c1c2;
            }
            div:last-child {
                font-weight: 400;
                font-family: PingFangSC-Regular;
                font-size: 12px;
                color: rgba(0, 0, 0, 0.38);
                line-height: 20px;
            }
        }
    }
}
</style>
