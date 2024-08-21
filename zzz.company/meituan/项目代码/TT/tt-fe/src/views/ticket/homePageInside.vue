<template>
    <div class="tt-home-page-inside-container">
        <div class="tt-recommend-wrapper">
            <div class="content-card center-banner">
                <h1>{{ $getText('dashboard_intro', '有问题，提') }}<span style="font-family: Helvetica-Bold;">TT</span></h1>
                <p>{{ $getText('dashboard_intro_description', 'TT是全公司通用的问题流转工具，您遇到的问题可以在TT上找到服务团队解决') }}</p>
                <mtd-button
                    type="primary"
                    size="large"
                    icon="iconfont icon-add2"
                    class="tt-create-link"
                    :to="{ name: 'tt_create', params: { space: spaceDomain } }"
                    v-lxay
                    lxay-act="moduleClick"
                    lxay-bid="b_techportal_a446qpc9_mc">
                    {{ $getText('dashboard_init_TT', '发起TT') }}
                </mtd-button>
            </div>
            <div
                class="content-card tt-guess-ask"
                id="tt-guess-ask">
                <h3>{{ $getText('dashboard_frequently_asked', '猜你想问') }}</h3>
                <AskCard
                    :title="item.title"
                    :cti="item.ctiName"
                    :icon="item.icon"
                    :color="item.color"
                    :key="index"
                    v-for="(item, index) in guessAskList" />
            </div>
        </div>
        <div class="tt-myticket-wrapper">
            <div class="content-card tt-about-me" id="tt-about-me">
                <h3>{{ $getText('dashboard_my_todo', '我的待处理') }}
                    <router-link
                        class="page-link-class right"
                        :to="{
                            name: 'tt_handle',
                            params: {
                                space: spaceDomain
                            },
                            query: {
                                filter: 'todo'
                            }
                        }">
                        {{ $getText('dashboard_inspect_all', '查看全部') }}<i class="mtdicon mtdicon-right-thick" />
                    </router-link>
                </h3>
                <div class="about-myticket-info">
                    <AboutNum
                        :title="$getText(stateMapCn[name])"
                        :number="num"
                        :key="name"
                        v-for="(num, name) in assignedNumMap"
                        @click.native="goToList(name)"  />
                </div>
                <div class="myticket-handle-link">
                    <router-link
                        class="page-link-class"
                        :to="{
                            name: 'tt_statistic_new',
                            params: {
                                space: spaceDomain
                            }
                        }">
                        {{ $getText('dashboard_inspect_department_detail', '查看部门处理情况') }}<i class="mtdicon mtdicon-right-thick" />
                    </router-link>
                </div>
            </div>
            <personal-oncall-card
                class="content-card oncall-card"
                v-if="showOncallCard"
                :rg-list="oncallRgList" />
            <div
                v-else
                class="content-card tt-my-history"
                id="tt-my-history">
                <h3 style="padding: 0 8px; margin-bottom: 10px;">{{ $getText('dashboard_init_by_me', '我发起的') }}
                    <router-link
                        v-if="historyReportList.length"
                        class="page-link-class right"
                        :to="{
                            name: 'tt_list',
                            params: {
                                space: spaceDomain
                            },
                            query: {
                                filter: 'createdBy'
                            }
                        }">
                        {{ $getText('dashboard_inspect_all', '查看全部') }}<i class="mtdicon mtdicon-right-thick" />
                    </router-link>
                </h3>
                <div v-if="historyReportList.length">
                    <HistoryTicket
                        :key="item.ticketId"
                        v-for="item in historyReportList"
                        :title="item.name"
                        :id="item.ticketId"
                        :cti="item.ctiName" />
                </div>
                <div class="history-report-empty" v-else>
                    <img
                        style="width: 80px;"
                        alt=""
                        src="../../assets/img/empty-data.png">
                    <h4>{{ $getText('dashboard_tip_no_record', '您还没有发起记录哦！') }}</h4>
                    <p>{{ $getText('dashboard_tip_ask_questions', '有什么问题都可以提问哦，快来') }}
                        <router-link
                            :to="{
                                name: 'tt_create',
                                params: {
                                    space: spaceDomain
                                },
                                query: {
                                    filter: 'createdBy'
                                }
                            }">{{ $getText('dashboard_init_TT', '发起TT') }}</router-link>
                        {{ $getText('dashboard_tip_ask_questions_affix', 'dashboard_tip_ask_questions_affix') }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import { Getter, Mutation } from 'vuex-class';
import { STATE_MAP_CN } from '@/config/map.conf';
import { HOME_LX_MAP } from '@/config/lx_map.conf';
import { lxReportClick } from '@/utils/directive/lxanaly';

import AskCard from '@/views/ticket/home-components/ask-card.vue';
import AboutNum from '@/views/ticket/home-components/about-num.vue';
import HistoryTicket from '@/views/ticket/home-components/history-ticket.vue';
import PersonalOncallCard from '@/views/ticket/home-components/personal-oncall-card.vue';
import * as api from '@/api';

import Driver from 'driver.js';
import 'driver.js/dist/driver.min.css';

/**
 * 系统首页
 *
 * @author liyuyao
 * @date 04/20/2019
 */
@Component({
    components: {
        AskCard,
        AboutNum,
        HistoryTicket,
        PersonalOncallCard
    }
})
export default class Home extends Vue {
    @Getter inside;
    @Getter spaceDomain;
    @Getter misX;

    @Mutation setTtListTitle;

    loading: boolean = true;
    showOncallCard: boolean = false;
    oncallRgList: any[] = [];

    driver: any = null;

    guessAskList: CommonTypes.GuessAsk[] = [];
    historyReportList: CommonTypes.HistoryReport[] = [];
    assignedNumMap: CommonTypes.mapObject = {};
    stateMapCn: CommonTypes.mapObject = STATE_MAP_CN;

    @Watch('misX', { immediate: true })
    mountUserMis () {
        if (this.misX) {
            this.getGuessAskByOrg();
            this.getHistoryReport();
            this.getAssignedTicketNum();
            this.getOncallRgList();
        }
    }

    mounted () {
        // 首页个人值班上线后，PM确认下线新手引导
        // !localStorage.homeGuide && this.initDriver();
    }
    async getGuessAskByOrg () {
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.getGuessAskByOrg(this.misX);
            let { code, data } = res;
            if (code === 200) {
                this.guessAskList = data.items;
            }
        } catch (e) {
            console.log(e);
        }
    }
    async getOncallRgList () {
        const res = await api.oncallApi.getOncallRgList(this.misX);
        const { data, code } = res;
        if (code === 200 && data) {
            this.oncallRgList = data.items || [];
            this.showOncallCard = !!this.oncallRgList.length;
        }
    }
    async getHistoryReport () {
        const res: Ajax.AxiosResponse = await api.ticketApi.getHistoryReport(this.misX);
        let { code, data } = res;
        if (code === 200) {
            this.historyReportList = data.items;
        }
    }
    async getAssignedTicketNum () {
        const res: Ajax.AxiosResponse = await api.ticketApi.getAssignedTicketNum(this.misX);
        let { code, data } = res;
        if (code === 200) {
            this.assignedNumMap = {
                'todo': data.assignedTodo,
                'doing': data.assignedDoing,
                'pause': data.assignedPause,
                'reopen': data.assignedReopen
            };
        }
    }
    goToList (name) {
        lxReportClick(HOME_LX_MAP[name]);
        this.setTtListTitle(`${this.$getText('dashboard_my_todo_with_status', { status: this.$getText(STATE_MAP_CN[name]) })}`);
        this.$router.push({
            name: 'tt_handle',
            params: {
                space: this.spaceDomain
            },
            query: {
                filter: 'inMyTodo',
                assigned: this.misX,
                ticketState: name === 'pause' ? this.$getText('dashboard_pause', '暂停') : this.$getText(STATE_MAP_CN[name])
            }
        }).catch(e => e);
    }
    initDriver () {
        this.driver = new Driver({
            opacity: .36,
            doneBtnText: this.$getText('dashboard_instruction_start', '开始使用'),
            closeBtnText: this.$getText('dashboard_instruction_skip', '跳过引导'),
            stageBackground: '#FFFFFF',
            nextBtnText: this.$getText('dashboard_instruction_next_step', '下一步'),
            allowClose: false,
            onReset: () => {
                if (typeof localStorage === 'object') {
                    try {
                        localStorage.homeGuide = true;
                    } catch (error) {
                        console.log(error);
                    }
                }
            }
        });
        this.driver.defineSteps([{
            element: '#tt-about-me',
            popover: {
                title: this.$getText('dashboard_instruction_todo_title', '我的待处理'),
                description: `${this.$getText('dashboard_instruction_todo_desc', '快速查看发送给我的未处理、处理中、暂停、重新打开的工单，查看与我相关的TT数据走向')}<div class="driver-popover-pager">1/3</div>`,
                position: 'left'
            }
        }, {
            element: '#tt-guess-ask',
            popover: {
                title: this.$getText('dashboard_instruction_guess_title', '猜你想问'),
                description: `${this.$getText('dashboard_instruction_guess_desc', '当前部门和公司的热门问题，点击即可快速发起该类问题')}<div class="driver-popover-pager">2/3</div>`,
                position: 'right'
            }
        }, {
            element: '#tt-my-history',
            popover: {
                title: this.$getText('dashboard_instruction_init_title', '我发起的'),
                description: `${this.$getText('dashboard_instruction_init_desc', '可以快速查看近期发起的TT工单，点击再次发起可以在该目录下再次发起工单。还没创建TT工单的，快来发起吧！')}<div class="driver-popover-pager">3/3</div>`,
                position: 'left'
            }
        }]);
        this.driver.start();
    }
    beforeDestroy () {
        this.driver && this.driver.reset();
    }
}
</script>

<style lang="scss">
.tt-home-page-inside-container {
    display: flex;
    display: -webkit-box;
    display: -ms-flexbox;
    margin: 0 auto;
    padding: 16px 24px;
    height: 100%;
    max-width: 1440px;
    min-width: 1200px;
    .tt-recommend-wrapper {
        height: 100%;
        flex: 1;
        max-width: 906px;
        min-width: 666px;
    }
    .tt-myticket-wrapper {
        width: 470px;
        margin-left: 16px;
        height: 100%;
    }
    .content-card {
        padding: 20px;
        background: #fff;
        box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.02), 0 0 2px 0 rgba(0, 0, 0, 0.04);
        border-radius: 6px;
    }
    .center-banner {
        height: 262px;
        margin-bottom: 16px;
        padding: 56px 42px 42px 42px;
        background-image: url("../../assets/img/home-banner.png");
        background-size: contain;
        background-repeat: no-repeat;
        background-clip: padding-box;
        background-position: right;
        .tt-create-link {
            padding: 10px 20px;
            font-family: PingFangSC-Medium;
            font-size: 20px;
            line-height: 28px;
            text-decoration: none;
            border-radius: 6px;
            .icon-add2 {
                font-size: 20px;
            }
        }
        p {
            margin: 6px 0 40px 0;
            width: calc(100% - 338px);
            font-family: PingFangSC-Regular;
            font-size: 14px;
            color: rgba(0, 0, 0, 0.6);
            line-height: 22px;
        }
    }
    .tt-about-me {
        height: 200px;
        margin-bottom: 12px;
    }
    .tt-guess-ask,
    .tt-my-history {
        height: 384px;
    }
    .tt-my-history {
        padding: 20px 12px;
        height: 451px;
        h3 {
            margin-bottom: 30px;
        }
    }
    .oncall-card {
        padding: 0;
        height: 451px;
    }
    .about-myticket-info {
        width: 100%;
        display: inline-flex;
        align-items: center;
        padding: 0 0 26px 0;
        border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    }
    .page-link-class {
        font-family: PingFangSC-Regular;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.6);
        line-height: 22px;
        text-decoration: none;
        &.right {
            float: right;
            line-height: 26px;
        }
        &:hover {
            color: #f80;
        }
        .mtdicon-right-thick {
            font-size: 16px;
        }
    }
    .myticket-handle-link {
        padding-top: 14px;
        .ask-card-wrapper {
            margin: 0;
            width: 49%;
        }
        .ask-card {
            padding: 8px 0;
        }
        .ask-card i {
            line-height: 22px;
            font-size: 18px;
        }
    }
    h1 {
        font-family: PingFangSC-Semibold;
        font-size: 32px;
        color: rgba(0, 0, 0, 0.84);
    }
    h3 {
        margin-bottom: 16px;
        font-family: PingFangSC-Semibold;
        font-size: 18px;
        color: rgba(0, 0, 0, 0.84);
        letter-spacing: 0;
        line-height: 26px;
    }
    h5 {
        font-family: PingFangSC-Medium;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.84);
        line-height: 22px;
    }
    p {
        font-family: PingFangSC-Regular;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.84);
        letter-spacing: 0;
        line-height: 40px;
    }
    .history-report-empty {
        padding-top: 80px;
        text-align: center;
        p {
            font-size: 12px;
            a {
                color: #f80;
                text-decoration: none;
            }
        }
    }
}
// 用户引导样式覆盖
div#driver-popover-item {
    padding: 16px 20px;
    .driver-popover-title {
        font-family: PingFangSC-Semibold;
        font-size: 16px;
        color: rgba(0, 0, 0, 0.87);
        line-height: 24px;
    }
    .driver-popover-description {
        color: rgba(0, 0, 0, 0.6);
        padding-bottom: 18px;
    }
    .driver-popover-pager {
        position: absolute;
        font-size: 12px;
        bottom: 18px;
        color: rgba(0, 0, 0, 0.35);
    }
    .driver-popover-footer {
        .driver-close-btn {
            position: absolute;
            font-size: 12px;
            right: 80px;
            color: rgba(0, 0, 0, 0.35);
            line-height: 20px;
            border-width: 0;
            background-color: inherit;
        }
        .driver-prev-btn {
            display: none !important;
        }
        .driver-next-btn {
            width: 64px;
            color: rgba(0, 0, 0, 0.84);
            cursor: pointer;
            min-width: 24px;
            height: 24px;
            padding: 0;
            font-size: 12px;
            outline: none;
            font-weight: 400;
            user-select: none;
            position: relative;
            transition: all 0.3s;
            border-radius: 4px;
            text-transform: none;
            text-shadow: none;
            background: #ffc300;
            border-color: #ffc300;
        }
    }
}
</style>
