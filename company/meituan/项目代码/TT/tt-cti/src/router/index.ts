import Vue from 'vue';
import Router from 'vue-router';
import Layout from '../views/layout.vue';
import CtiConfig from '../views/cti/index.vue';
import RgList from '../views/rg/index.vue';
import SpaceList from '../views/space/index.vue';
import Rgdetail from '../views/rg/detail/index.vue';
import RgCatalog from '../views/rg/detail/catalog.vue';
import RgUser from '../views/rg/detail/user.vue';
// import RgOncall from '../views/rg/detail/oncall.vue';
import RgOncallNew from '../views/rg/detail/oncall/oncallManagement.vue';
import RgOncallInfo from '../views/rg/detail/oncall/pages/oncallInfoTable.vue';
import OncallGroupSetting from '../views/rg/detail/oncall/pages/oncallGroupSetting.vue';
import OncallRules from '../views/rg/detail/oncall/pages/oncallRules.vue';
import OncallShiftSetting from '../views/rg/detail/oncall/pages/oncallShiftSetting.vue';
import OncallReminder from '../views/rg/detail/oncall/pages/oncallReminder.vue';
import OncallDataExport from '../views/rg/detail/oncall/pages/oncallDataExport.vue';
import RgTemplate from '../views/rg/detail/template.vue';
import RgTemplateSettings from '../views/rg/detail/templateSettings/rgTemplateSettings.vue';
import RgTemplateAnnouncement from '../views/rg/detail/templateSettings/rgTemplateAnnouncement.vue';
import RgTemplateQuestion from '../views/rg/detail/templateSettings/rgTemplateQuestion.vue';
import RgTemplateOrdinary from '../views/rg/detail/templateOrdinary.vue';
import RgTemplateCustom from '../views/rg/detail/templateCustom.vue';
import RgReport from '../views/rg/detail/report.vue';
import RgTrigger from '../views/rg/detail/trigger.vue';
import RgReply from '../views/rg/detail/reply.vue';
import RgFile from '../views/rg/detail/file.vue';
import RgTag from '../views/rg/detail/tag.vue';
import RgSla from '../views/rg/detail/sla.vue';
import RgSatisfaction from '../views/rg/detail/satisfaction.vue';
import RgHistory from '../views/rg/detail/history.vue';
import RgMoses from '../views/rg/detail/moses/moses.vue';
import BindRobot from '../views/rg/detail/moses/bindRobot.vue';
import GroupRobot from '../views/rg/detail/moses/groupRobot.vue';
import RgSetting from '../views/rg/detail/setting.vue';
import RgDxSetting from '../views/rg/detail/dxSetting/dxSetting.vue';
import RgBrainpower from '../views/rg/detail/brainpower.vue';
import TriggerEdit from '../views/rg/detail/components/trigger-edit.vue';
import CustomForm from '../views/rg/detail/components/custom-form-edit.vue';
import SpaceDetail from '../views/space/detail.vue';
import SpaceAdmin from '../views/space/detail/space-admin.vue';
import SpaceRg from '../views/space/detail/space-rg.vue';
import SpaceCatalog from '../views/space/detail/space-catalog.vue';
import SpaceTemplate from '../views/space/detail/space-template.vue';
import SpaceFile from '../views/space/detail/space-file.vue';
import SpaceTemplateOrdinary from '../views/space/detail/space-template-components/templateOrdinary.vue';
import SpaceTemplateCustom from '../views/space/detail/space-template-components/templateCustom.vue';
import SpaceTemplateSettings from '../views/space/detail/space-template-components/templateSettings.vue';
import SpaceTemplateTable from '../views/space/detail/space-template-components/templateSettings/spaceTemplateTable.vue';
import SpaceInspectionAdmin from '../views/space/quality/inspectionAdmin.vue';
import SpaceInspectionTemplate from '../views/space/quality/inspectionTemplateList.vue';
import InspectionTemplate from '../views/space/quality/template/inspectionTemplate.vue';
import HelpdeskIndex from '../views/helpdesk/index.vue';
import CtiTransfer from '../views/cti/transfer.vue';
import Blank from '../views/components/noPermission.vue';

const routes = [
    {
        path: '/',
        component: Layout,
        children: [
            {
                path: '/cti',
                name: 'cti',
                component: CtiConfig,
                meta: {
                    alias: '目录管理页'
                }
            },
            {
                path: '/cti/transfer',
                name: 'cti_transfer',
                component: CtiTransfer,
                meta: {
                    alias: '批量迁移TT页'
                }
            },
            {
                path: '/rg',
                name: 'rg',
                component: RgList,
                meta: {
                    alias: 'rg列表页'
                }
            }, {
                path: '/space',
                name: 'space',
                component: SpaceList,
                meta: {
                    alias: '空间列表页'
                }
            }, {
                path: '/mw',
                name: 'helpdesk',
                component: HelpdeskIndex,
                meta: {
                    alias: '美维迁移页'
                }
            }, {
                path: '/trigger',
                name: 'trigger-edit',
                component: TriggerEdit,
                meta: {
                    alias: '触发器编辑页'
                }
            }, {
                path: '/customForm',
                name: 'custom-form',
                component: CustomForm,
                meta: {
                    alias: '自定义表单编辑页'
                }
            }, {
                path: '/quality-template',
                name: 'quality-inspection-template',
                component: InspectionTemplate,
                meta: {
                    alias: '质检模板编辑、预览页'
                }
            }, {
                path: '/rg/detail',
                component: Rgdetail,
                children: [
                    {
                        path: 'catalog',
                        name: 'rg_catalog',
                        component: RgCatalog,
                        meta: {
                            alias: 'rg绑定服务目录页'
                        }
                    },
                    {
                        path: 'user',
                        name: 'rg_user',
                        component: RgUser,
                        meta: {
                            alias: 'rg成员列表页'
                        }
                    },
                    {
                        path: 'oncall',
                        name: 'rg_oncall',
                        redirect: 'oncall/info',
                        component: RgOncallNew,
                        meta: {
                            alias: '值班成员列表页'
                        },
                        children: [{
                            path: 'info',
                            name: 'rg_oncall_info',
                            component: RgOncallInfo,
                            meta: {
                                alias: '值班信息'
                            }
                        }, {
                            path: 'group',
                            name: 'rg_oncall_group',
                            component: OncallGroupSetting,
                            meta: {
                                alias: '值班组管理'
                            }
                        }, {
                            path: 'setting',
                            name: 'rg_oncall_setting',
                            component: OncallShiftSetting,
                            meta: {
                                alias: '班次管理'
                            }
                        }, {
                            path: 'rules',
                            name: 'rg_oncall_rules',
                            component: OncallRules,
                            meta: {
                                alias: '值班规则'
                            }
                        }, {
                            path: 'reminder',
                            name: 'rg_oncall_reminder',
                            component: OncallReminder,
                            meta: {
                                alias: '值班提醒'
                            }
                        }, {
                            path: 'export',
                            name: 'rg_oncall_export',
                            component: OncallDataExport,
                            meta: {
                                alias: '值班数据导出'
                            }
                        }]
                    },
                    {
                        path: 'template',
                        name: 'rg_template',
                        component: RgTemplate,
                        redirect: 'template/ordinary',
                        meta: {
                            alias: '模板管理列表页'
                        },
                        children: [{
                            path: 'ordinary',
                            name: 'rg_template_ordinary',
                            component: RgTemplateOrdinary,
                            meta: {
                                alias: '普通模板管理页'
                            }
                        }, {
                            path: 'custom',
                            name: 'rg_template_custom',
                            component: RgTemplateCustom,
                            meta: {
                                alias: '定制模板管理页'
                            }
                        }, {
                            path: 'settings',
                            name: 'rg_template_settings',
                            component: RgTemplateSettings,
                            meta: {
                                alias: '定制模版设置页'
                            },
                            children: [{
                                path: 'announcement',
                                name: 'rg_template_announcement',
                                component: RgTemplateAnnouncement,
                                meta: {
                                    alias: '公告'
                                }
                            }, {
                                path: 'question',
                                name: 'rg_template_question',
                                component: RgTemplateQuestion,
                                meta: {
                                    alias: '常见问题'
                                }
                            }, {
                                path: '',
                                redirect: {
                                    name: 'rg_template_announcement'
                                }
                            }]
                        }, {
                            path: '',
                            redirect: {
                                name: 'rg_template_ordinary'
                            }
                        }]
                    },
                    {
                        path: 'report',
                        name: 'rg_report',
                        component: RgReport,
                        meta: {
                            alias: '邮件报表设置页'
                        }
                    },
                    {
                        path: 'trigger',
                        name: 'rg_trigger',
                        component: RgTrigger,
                        meta: {
                            alias: '触发器设置页'
                        }
                    },
                    {
                        path: 'reply',
                        name: 'rg_reply',
                        component: RgReply,
                        meta: {
                            alias: '常用回复设置页'
                        }
                    },
                    {
                        path: 'file',
                        name: 'rg_file',
                        component: RgFile,
                        meta: {
                            alias: '问题归档设置页'
                        }
                    },
                    {
                        path: 'tag',
                        name: 'rg_tag',
                        component: RgTag,
                        meta: {
                            alias: '常用标签设置页'
                        }
                    },
                    {
                        path: 'history',
                        name: 'rg_history',
                        component: RgHistory,
                        meta: {
                            alias: '操作记录页'
                        }
                    },
                    {
                        path: 'dx',
                        name: 'rg_dx',
                        component: RgDxSetting,
                        meta: {
                            alias: '大象相关设置'
                        }
                    },
                    {
                        path: 'moses',
                        name: 'rg_moses',
                        component: BindRobot,
                        redirect: 'moses/create',
                        meta: {
                            title: '绑定机器人'
                        },
                        children: [{
                            path: 'create',
                            name: 'rg_moses_create_robot',
                            component: RgMoses,
                            meta: {
                                alias: '发起机器人'
                            }
                        }, {
                            path: 'group',
                            name: 'rg_moses_group_robot',
                            component: GroupRobot,
                            meta: {
                                alias: '群聊机器人'
                            }
                        }]
                    },
                    {
                        path: 'brainpower',
                        name: 'rg_brainpower',
                        component: RgBrainpower,
                        meta: {
                            title: '知识库配置'
                        }
                    },
                    {
                        path: 'sla',
                        name: 'rg_sla',
                        component: RgSla,
                        meta: {
                            alias: 'SLA设置'
                        }
                    },
                    {
                        path: 'satisfaction',
                        name: 'rg_satisfaction',
                        component: RgSatisfaction,
                        meta: {
                            alias: '满意度设置'
                        }
                    },
                    {
                        path: 'setting',
                        name: 'rg_setting',
                        component: RgSetting,
                        meta: {
                            alias: '设置页'
                        }
                    },
                    { path: '', redirect: { name: 'rg_catalog' } }
                ]
            },
            {
                path: '/space/:id',
                // name: 'space_detail',
                component: SpaceDetail,
                meta: {
                    alias: '空间详情页'
                },
                children: [{
                    path: 'admin',
                    name: 'space_admin',
                    component: SpaceAdmin,
                    meta: {
                        alias: '空间管理员'
                    }
                }, {
                    path: 'rg',
                    name: 'space_rg',
                    component: SpaceRg,
                    meta: {
                        alias: '空间RG组管理'
                    }
                }, {
                    path: 'catalog',
                    name: 'space_catalog',
                    component: SpaceCatalog,
                    meta: {
                        alias: '空间目录管理'
                    }
                }, {
                    path: 'quality-inspection-admin',
                    name: 'space-quality-member',
                    component: SpaceInspectionAdmin,
                    meta: {
                        alias: '空间质检成员管理'
                    }
                }, {
                    path: 'quality-inspection-template',
                    name: 'space-quality-template',
                    component: SpaceInspectionTemplate,
                    meta: {
                        alias: '空间质检模板管理'
                    }
                }, {
                    path: 'template',
                    name: 'space_template',
                    component: SpaceTemplate,
                    meta: {
                        alias: '空间模板管理'
                    },
                    children: [{
                        path: 'ordinary',
                        name: 'space_template_ordinary',
                        component: SpaceTemplateOrdinary,
                        meta: {
                            alias: '空间普通模板管理页'
                        }
                    }, {
                        path: 'custom',
                        name: 'space_template_custom',
                        component: SpaceTemplateCustom,
                        meta: {
                            alias: '空间定制模板管理页'
                        }
                    }, {
                        path: 'settings',
                        name: 'space_template_settings',
                        component: SpaceTemplateSettings,
                        meta: {
                            alias: '空间定制模版设置页'
                        },
                        children: [{
                            path: 'announcement',
                            name: 'space_template_settings_announcement',
                            component: SpaceTemplateTable,
                            props: {
                                api: 'Announcement',
                                title: '公告'
                            },
                            meta: {
                                alias: '空间公告'
                            }
                        }, {
                            path: 'question',
                            name: 'space_template_settings_question',
                            component: SpaceTemplateTable,
                            props: {
                                api: 'RgFaq',
                                title: '常见问题'
                            },
                            meta: {
                                alias: '空间常见问题'
                            }
                        }]
                    }]
                }, {
                    path: 'file',
                    name: 'space_file',
                    component: SpaceFile,
                    meta: {
                        alias: '空间问题归档'
                    }
                }, {
                    path: '',
                    redirect: {
                        name: 'space_admin'
                    }
                }]
            },
            { path: '', redirect: { name: 'cti' } }
        ]
    },
    {
        path: '/blank',
        name: 'blank',
        component: Blank,
        meta: {
            alias: '无权限页面'
        }
    },
    { path: '*', redirect: '/' }
];

Vue.use(Router);

const router = new Router({
    mode: 'history',
    routes
});

router.beforeEach((to, _from, next) => {
    const win = (window as any);
    win.LXAnalytics('pageView', {
        custom: {
            name: to.name,
            alias: to.meta.alias
        }
    }, null, 'c_onecloud_188uiwg3');
    next();
});

export default router;
