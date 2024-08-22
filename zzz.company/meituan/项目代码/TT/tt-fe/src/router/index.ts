import Vue from 'vue';
import Router from 'vue-router';
import store from '@/store';

import Layout from '../views/layout.vue';
import Ticket from '../views/ticket/index.vue';
import { lxReportPV, lxReportClick } from '@/utils/directive/lxanaly';
import { loadScriptDynamic } from '@/utils/tools';
import { LINK_ENTRANCE_SOURCE } from '@/config/lx_map.conf';
import { loginType, spaceDomain } from '@/env';

const TicketList = () => import(/* webpackChunkName: "ticket-list"*/ '../views/ticket/ticket-list.vue');
const TicketHandle = () => import(/* webpackChunkName: "ticket-handle"*/ '../views/ticket/ticket-handle.vue');
const TicketDetailPage = () => import(/* webpackChunkName: "ticket-detail-page"*/ '../views/ticket/ticket-detail-page.vue');
const TicketDetail = () => import(/* webpackChunkName: "ticket-detail"*/ '../views/ticket/ticket-detail.vue');
const TicketSearch = () => import(/* webpackChunkName: "ticket-search"*/ '../views/ticket/ticket-search.vue');
const TicketCreate = () => import(/* webpackChunkName: "ticket-create"*/ '../views/ticket/ticket-create-new.vue');

const TicketClone = () => import(/* webpackChunkName: "ticket-clone"*/ '../views/ticket/ticket-clone.vue');
const TicketCloneCustom = () => import(/* webpackChunkName: "ticket-clone-custom"*/ '../views/ticket/ticket-clone-custom.vue');
const TicketHelpDesk = () => import(/* webpackChunkName: "ticket-help-desk"*/ '../views/ticket/ticket-helpdesk.vue');
const TicketHelpDeskRg = () => import(/* webpackChunkName: "ticket-help-desk-rg"*/ '../views/ticket/ticket-helpdesk-rg.vue');
// const TicketHelpDeskSpace = () => import(/* webpackChunkName: "ticket-help-desk-space"*/ '../views/ticket/ticket-helpdesk-space.vue');

const TicketMosesHelper = () => import(/* webpackChunkName: "ticket-moses-helper"*/ '../views/ticket/ticket-moses-helper.vue');

const HomePage = () => import(/* webpackChunkName: "home-page"*/ '../views/ticket/homePage.vue');
const TicketCustomCreate = () => import(/* webpackChunkName: "ticket-custom-create"*/ '../views/ticket/ticket-custom-create.vue');
const TicketStatisticsNew = () => import(/* webpackChunkName: "statistic-index"*/ '../views/ticket/statistic-ticket-index.vue');
const CreateTicketStatistics = () => import(/* webpackChunkName: "create-statistic-ticket"*/ '../views/ticket/create-statistic-ticket.vue');
const EditTicketStatistics = () => import(/* webpackChunkName: "create-statistic-ticket"*/ '../views/ticket/edit-statistic-ticket.vue');
// 大象中发起tt 懒加载
const dxCreate = () => import(/* webpackChunkName: "dx-create"*/ '../views/ticket/dx-create.vue');
const noMatchSpace = () => import(/* webpackChunkName: "no-match-space"*/ '../views/ticket/no-match-space.vue');
// const SpaceCustomList = () => import(/* webpackChunkName: "space-help-desk"*/ '../views/ticket/space-custom-list.vue');
const myHandover = () => import(/* webpackChunkName: "my-handover"*/ '../views/ticket/my-handover.vue');
const memberHandover = () => import(/* webpackChunkName: "member-handover"*/ '../views/ticket/member-handover.vue');
const dxmpDetail = () => import(/* webpackChunkName: "dxmp-detail"*/ '../views/ticket/dxmp-detail.vue');
const dxmpHandle = () => import(/* webpackChunkName: "dxmp-handle"*/ '../views/ticket/dxmp-handle-page.vue');
const TicketInspectionIndex = () => import(/* webpackChunkName: "ticket-inspection"*/ '../views/ticket/quality/index.vue');
const TicketInspectionContainer = () => import(/* webpackChunkName: "ticket-inspection-container"*/ '../views/ticket/quality/inspectionContainer.vue');
const InspectorTaskDetail = () => import(/* webpackChunkName: "ticket-inspection-task"*/ '../views/ticket/quality/inspector/inspectorTaskDetail.vue');
const InspectorTicket = () => import(/* webpackChunkName: "ticket-inspection-ticket"*/ '../views/ticket/quality/inspector/inspectorTicket.vue');

const routes = [
    {
        path: '/dx-create',
        name: 'dx-create',
        component: dxCreate,
        meta: {
            alias: '大象内发起TT'
        }
    }, {
        path: '/dxmp-detail',
        name: 'dxmp-detail',
        component: dxmpDetail,
        meta: {
            alias: '大象侧边栏查看TT详情'
        }
    }, {
        path: '/dxmp-handle',
        name: 'dxmp-handle',
        component: dxmpHandle,
        meta: {
            alias: '大象侧边栏操作'
        }
    }, {
        path: '/no-match-space',
        name: 'no-match-space',
        component: noMatchSpace,
        meta: {
            alias: '无匹配空间'
        }
    },
    {
        path: '/',
        component: Layout,
        children: [
            {
                path: '',
                component: HomePage,
                name: 'home',
                meta: {
                    alias: '首页'
                }
            },
            {
                path: '/:space?',
                component: Ticket,
                children: [
                    {
                        path: 'list',
                        name: 'tt_list',
                        component: TicketList,
                        meta: {
                            alias: 'ticket列表页'
                        }
                    },
                    {
                        path: 'handle',
                        name: 'tt_handle',
                        component: TicketHandle,
                        meta: {
                            alias: 'ticket处理页'
                        }
                    }, {
                        path: 'statistic/new',
                        name: 'tt_statistic_new',
                        component: TicketStatisticsNew,
                        meta: {
                            alias: 'TT-新版统计分析页'
                        }
                    }, {
                        path: 'statistic/create/dashboardId/:dashboardId/widgetId/:widgetId',
                        name: 'tt_statistic_create',
                        component: CreateTicketStatistics,
                        meta: {
                            alias: 'TT-新版统计分析页-创建图表'
                        }
                    }, {
                        path: 'statistic/edit/dashboardId/:dashboardId/widgetId/:widgetId',
                        name: 'tt_statistic_edit',
                        component: EditTicketStatistics,
                        meta: {
                            alias: 'TT-新版统计分析页-编辑图表'
                        }
                    }, {
                        path: '',
                        redirect: {
                            name: 'tt_create'
                        }
                    }
                ]
            },
            {
                path: '/:space?/search',
                name: 'tt_search',
                component: TicketSearch,
                meta: {
                    alias: 'ticket搜索页'
                }
            },
            {
                path: '/:space?/detail',
                name: 'tt_detail',
                component: TicketDetailPage,
                meta: {
                    alias: 'ticket详情页'
                }
            },
            {
                path: '/:space?/detail-for-case',
                name: 'tt_detail_case',
                component: TicketDetailPage,
                meta: {
                    alias: 'ticket详情页'
                }
            },
            {
                path: '/:space?/mini-detail',
                name: 'tt_mini_detail',
                component: TicketDetail,
                meta: {
                    alias: 'ticket详情页'
                }
            },
            {
                path: '/:space?/create',
                name: 'tt_create',
                component: TicketCreate,
                meta: {
                    alias: 'ticket创建页'
                }
            },
            {
                path: '/:space?/mini-create',
                name: 'tt_mini_create',
                component: TicketCreate,
                meta: {
                    alias: 'ticket创建页'
                }
            },
            {
                path: '/:space?/clone',
                name: 'tt_clone',
                component: TicketClone,
                meta: {
                    alias: 'ticket克隆-普通表单'
                }
            },
            {
                path: '/:space?/cloneCustom',
                name: 'tt_clone_custom',
                component: TicketCloneCustom,
                meta: {
                    alias: 'ticket克隆-自定义表单'
                }
            },
            {
                path: '/ticket/helpdesk',
                name: 'tt_helpdesk',
                component: TicketHelpDesk,
                meta: {
                    alias: 'ticket帮助台'
                }
            },
            {
                path: '/ticket/helpdesk/:rgId',
                name: 'tt_helpdesk_rg',
                component: TicketHelpDeskRg,
                meta: {
                    alias: '指定RG帮助台'
                }
            },
            {
                path: '/:space?/ticket/moses-helper',
                name: 'tt_moses_helper',
                component: TicketMosesHelper,
                meta: {
                    alias: '摩西机器人帮助台'
                }
            },
            {
                path: '/:space?/custom/create/:id/:rgId',
                name: 'tt_helpdesk_create',
                component: TicketCreate,
                meta: {
                    alias: '自定义模板ticket创建页'
                }
            },
            {
                path: '/ticket/my/handover',
                name: 'tt_my_handover',
                component: myHandover,
                meta: {
                    alias: '我的工作交接'
                }
            },
            {
                path: '/ticket/member/handover',
                name: 'tt_member_handover',
                component: memberHandover,
                meta: {
                    alias: '组员的工作交接'
                }
            }, {
                path: '/quality/inspection',
                name: 'quality_inspection',
                component: TicketInspectionIndex,
                redirect: '/quality/inspection/list',
                meta: {
                    alias: '质检TT'
                },
                children: [
                    {
                        path: 'list',
                        name: 'quality_inspection_list',
                        component: TicketInspectionContainer,
                        meta: {
                            alias: '质检列表页'
                        }
                    },
                    {
                        path: 'detail',
                        name: 'quality_inspector_task_detail',
                        component: InspectorTaskDetail,
                        meta: {
                            alias: '质检子任务详情'
                        }
                    },
                    {
                        path: 'ticket',
                        name: 'quality_inspector_ticket',
                        component: InspectorTicket,
                        meta: {
                            alias: '质检工单页'
                        }
                    }
                ]
            },
            { path: '', redirect: { name: 'tt_list' } }
        ]
    },
    { path: '*', redirect: '/' }
];

// window.onbeforeunload = function (e) {
//     const router = ['/ticket/list', '/ticket/detail'];
//     if (~router.indexOf(location.pathname) && store.state.tt.guard.comment) {
//         e = e || window.event;
//         // 兼容IE8和Firefox 4之前的版本
//         if (e) {
//             e.returnValue = '放弃当前编辑的评论吗?';
//         }
//         // Chrome, Safari, Firefox 4+, Opera 12+ , IE 9+
//         return '放弃当前编辑的评论吗?';
//     }
// };

function reportEntranceData (to, from) {
    const fromName = from.name;
    const { name, query } = to;
    let reportKey = '';
    if (['tt_create', 'tt_helpdesk_create'].includes(fromName)) {
        return ;
    }
    if (['tt_create', 'tt_helpdesk_create'].includes(name)) {
        const isPrivateSpace = spaceDomain !== 'ticket';
        if (isPrivateSpace) {
            reportKey = 'space_create';
        } else if (loginType === 'PASSPORT') {
            reportKey = 'passport_create';
        } else if (name === 'tt_helpdesk_create') {
            reportKey = 'ticket_custom';
        } else if (query && (query.cid || query.categoryName)) {
            reportKey = 'ticket_cid';
        } else {
            reportKey = 'ticket_create';
        }
        lxReportClick(LINK_ENTRANCE_SOURCE[reportKey]);
        store.commit('setCreateEntrance', reportKey);
        if (to.query?.source) {
            if (typeof sessionStorage === 'object') {
                try {
                    sessionStorage.setItem('createEntranceQuery', JSON.stringify(to.query));
                } catch (error) {
                    console.log(error);
                }
            }
            store.commit('setCreateReferrer', '00');
        }
    } else {
        store.commit('setCreateEntrance', '');
    }
}

Vue.use(Router);

const router = new Router({
    mode: 'history',
    routes
});

router.beforeEach(async (to, _from, next) => {
    // 判断空间
    store.commit('SPACE_DOMAIN', to.params.space || 'ticket');

    // 判断在大象打开
    let isDxWindowName = (window.name.indexOf('dxweb-app-panel') > -1);
    document.title = 'TT系统';

    // CAT & 灵犀上报
    lxReportPV(to);
    reportEntranceData(to, _from);

    const win = (window as any);
    win.owl && win.owl('config', {
        project: win.appName,
        pageUrl: to.name || to.path
    });
    win.owl && win.owl('resetPv', {
        pageUrl: to.name || to.path
    });

    if ((to.name !== 'dx-create') && isDxWindowName) {
        next({ name: 'dx-create' });
    } else {
        // 详情页后退处理 若从列表进入 将列表页的query保存在session中
        let fromName = _from.name;
        if (fromName === 'tt_list' && typeof sessionStorage === 'object') {
            try {
                sessionStorage.removeItem('tt_search');
                sessionStorage.setItem('tt_list', JSON.stringify(_from.query));
            } catch (error) {
                console.log(error);
            }
        }
        if (fromName === 'tt_search' && typeof sessionStorage === 'object') {
            try {
                sessionStorage.removeItem('tt_list');
                sessionStorage.setItem('tt_search', JSON.stringify(_from.query));
            } catch (error) {
                console.log(error);
            }
        }
        // 仅当从创建页跳转至详情时，允许读取保存在session中的创建结果
        if (fromName !== 'tt_create' && typeof sessionStorage === 'object') {
            try {
                sessionStorage.removeItem('cerateData');
            } catch (error) {
                console.log(error);
            }
        }
        next();
    }
});

export default router;
