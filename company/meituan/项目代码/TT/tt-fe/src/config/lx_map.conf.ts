/*
@click情况
直接在组件传属性：
v-lxay
lxay-act="moduleClick"
lxay-bid="b_onecloud_scw2vcdy_mc"


@change情况 ：

import { Getter } from 'vuex-class';
import LX_MAP, { submitLXInfo } from '@/config/lx_map.conf';

// 组件内注册getter
@Getter misX

// 需要发出的时机:
// 单组件从MAP拿
submitLXInfo(LX_MAP['filter_category'], this.misX)
// 从 ref拿

<mtd-select
    @change="v => submit(v, 'filter-type')"
    ref="filter-type"
    lxay-bid="b_onecloud_lwn1s3z1_mc"
    ...
>

if (ref) {
            const bid: string = this.$refs[ref].$attrs['lxay-bid']
            if (bid) {
                submitLXInfo(bid, this.misX)
            }
        }
*/

export function submitLXInfo (lxBid: string, mis: string) {
    // @ts-ignore
    window.LXAnalytics('moduleClick', lxBid, { custom: { mis } });
}

export const CREATE_LX_MAP = {
    select_sla: 'b_onecloud_qetoterv_mc',
    select_type: 'b_onecloud_bhg6qb9z_mc',
    radio_category: 'b_onecloud_h6bfy0pa_mc',
    radio_assigned: 'b_onecloud_ygdwxt7h_mc',
    click_cc: 'b_onecloud_yrgvszve_mc',
    switch_permission: 'b_onecloud_purikzla_mc',
    click_cancelsave: 'b_onecloud_4sud1hh5_mc',
    click_resetcreate: 'b_techportal_gjtnavr3_mc',
    click_create: 'b_techportal_8zdexvop_mc',
    click_addtag: 'b_onecloud_b6iuqn4k_mc',
    click_removetag: 'b_onecloud_fu0gojvi_mc',
    click_uploadfile: 'b_techportal_ox86wexm_mc',
    select_city: 'b_techportal_4dnxbl55_mc',
    click_reporter: 'b_techportal_2t5e6jk3_mc',
    click_name: 'b_techportal_qeiljowo_mc',
    create_prompt_ok: 'b_techportal_mwllho1m_mc'
};
export const COMMON_LX_MAP = {
    topnav_search_ticket: 'b_onecloud_0blocva4_mc'
};
export const CHART_LX_MAP = {
    rg_select_rg: 'b_onecloud_ipjp2si6_mc',
    rg_select_user: 'b_onecloud_g0r1rl40_mc',
    rg_click_date: 'b_onecloud_uxhiwgoz_mc',
    rg_export_data: 'b_onecloud_tgy52pdg_mc',
    cti_catalog_category: 'b_onecloud_7j0kuane_mc',
    cti_catalog_type: 'b_onecloud_6hazbs4r_mc',
    cti_catalog_item: 'b_onecloud_cudo4e0n_mc',
    statistic_new: 'b_techportal_fwuabccr_mc'
};
export const COMMON_DIRECTORY = {
    show_common_directory: 'b_onecloud_adbqm1zp_mv',
    hit_common_directory: 'b_onecloud_srthlh49_mc'
};
export const PAGE_VIEW = {
    ticket_create: 'b_techportal_mxalqvwl_mv'
};
export const HOME_LX_MAP = {
    'todo': 'b_techportal_pghkwx3w_mc',
    'pause': 'b_techportal_av3gs45e_mc',
    'reopen': 'b_techportal_tuifngwj_mc',
    'doing': 'b_techportal_jtx51zqu_mc'
};
export const LIST_LX_MAP = {
    'file_expand': 'b_techportal_e6jhmjx4_mc',
    'file_filter': 'b_techportal_rkt3wqvf_mc',
    'copy_num': 'b_techportal_qi6ev6hq_mc',
    'goto_detail': 'b_techportal_u04f5wm0_mc',
    'sort_state': 'b_techportal_hvd5y16v_mc',
    'sort_sla': 'b_techportal_algsvcwy_mc',
    'sort_ticketType': 'b_techportal_algsvcwy_mc',
    'sort_createdAt': 'b_techportal_5zs42be5_mc'
};
export const HANDLE_LX_MAP = {
    'detail_change': 'b_techportal_pb86q7cy_mc',
    'list_change': 'b_techportal_apbbp1zm_mc'
};
export const FILTER_LX_MAP = {
    'label_relation': 'b_techportal_ip1n3b7g_mc',
    'label_search': 'b_techportal_vabydwf2_mc',
    'save_filter': 'b_techportal_yya8b9j4_mc',
    'filter_category': 'b_onecloud_jaftsi8k_mc', // 目录
    'filter_sla': 'b_onecloud_ryab5o11_mc',  // 等级
    'filter_state': 'b_onecloud_jv4627j4_mc',  // 状态
    'filter_type': 'b_onecloud_lwn1s3z1_mc',  // 类型
    'filter_time': 'b_onecloud_4cnrtnid_mc',  // 时间
    'filter_handler': 'b_onecloud_xvpz5aq2_mc', // 处理人
    'filter_assaigner': 'b_onecloud_3myzo485_mc', // 发起人
    'filter_collapse': 'b_onecloud_cknnhpzo_mc', // 隐藏
    'filter_expand': 'b_onecloud_1ppm5pqu_mc', // 展开
    'filter_reset': 'b_onecloud_4orogdgw_mc',  // 重置
    'filter_content': 'b_techportal_145n6yd2_mc',// 内容
    'static_rg': 'b_onecloud_ez36h5g6_mc',  // 页面路由有统一埋点，不重复上报
    'static_cti': 'b_onecloud_i73b6vin_mc' // 页面路由有统一埋点，不重复上报
};
// 发起TT数据建设：发起tt访问 & 点击创建
export const CREATE_METHODS_VIEW = {
    'create_from_basic': 'b_techportal_nlpjoufa_mv',
    'create_from_custom': 'b_techportal_mas0y4tk_mv',
    'create_from_url': 'b_techportal_1t19bvnd_mv',
    'create_from_space': 'b_techportal_vhu68sys_mv',
    'create_from_passport': 'b_techportal_nktpx201_mv'
};
export const CREATE_METHODS_CLICK = {
    'create_from_basic': 'b_techportal_ys8tcs1v_mc',
    'create_from_custom': 'b_techportal_gq52urss_mc',
    'create_from_url': 'b_techportal_cds1o67r_mc',
    'create_from_space': 'b_techportal_5inptw0j_mc',
    'create_from_passport': 'b_techportal_3pyva1s6_mc'
};
export const entranceSourceMap = {
    'create_from_basic': 1,
    'create_from_space': 2,
    'create_from_url': 3,
    'create_from_custom': 4,
    'create_from_passport': 5
};
export const CREATE_CTI_CHOOSE = {
    'cti_search_hit': 'b_techportal_shr54mtt_mc',
    'cti_search': 'b_techportal_2mjdj1x9_mc',
    'cti_search_result': 'b_techportal_q6fzzltp_mc',
    'cti_search_empty': 'b_techportal_fysqfo4o_mc',
    'cti_select_hit': 'b_techportal_xgdql1yg_mc',
    'cti_select': 'b_techportal_2ey3vdv1_mc',
    'cti_common': 'b_techportal_6c9vllhe_mc',
    'cti_no_catalog': 'b_techportal_egoz2wm6_mc',
    'no_cti': 'b_techportal_egoz2wm6_mc',
    'cti_focus': 'b_techportal_xmvowyqu_mc',
    'cti_operate_start': 'b_techportal_nj6mpoto_mc',
    'cti_select_recommend': 'b_techportal_66i86pdd_mc',
    'cti_recommend_create': 'b_techportal_9t1ajsut_mc'
};
export const CREATE_CTI_RESULT = {
    'success_search': 'b_techportal_l8rmw0z9_mc',
    'success_select': 'b_techportal_l3b1zlal_mc',
    'success_common': 'b_techportal_opppogv2_mc',
    'fail_no_cti': 'b_techportal_a3u9yept_mc',
    'fail_with_cti': 'b_techportal_2ndbc24p_mc',
    'fail_with_cti_and_content': 'b_techportal_x45l3z3u_mc'
};
export const DETAIL_CIRCULATION = {
    'input_circulation': 'b_techportal_z76navw6_mc',
    'click_not_inscope': 'b_techportal_46xl13c0_mc'
};
// 数据建设3
export const LINK_ENTRANCE_SOURCE = {
    'ticket_create': 'b_techportal_rwtvki7r_mc',
    'ticket_custom': 'b_techportal_6z55kxx8_mc',
    'ticket_cid': 'b_techportal_o355q91t_mc',
    'space_create': 'b_techportal_2f26srm9_mc',
    'passport_create': 'b_techportal_6goyxfyi_mc'
};
export const ENTRANCE_SUCCESS = {
    'ticket_create': 'b_techportal_bqzm0cbs_mc',
    'ticket_custom': 'b_techportal_ayqtgif4_mc',
    'ticket_cid': 'b_techportal_rvbkcdg0_mc',
    'space_create': 'b_techportal_xipf9pqf_mc',
    'passport_create': 'b_techportal_633e5wjg_mc'
};
export const ENTRANCE_FAIL_WITHOUT_CTI = {
    'ticket_create': 'b_techportal_t3613vfa_mc',
    'ticket_custom': 'b_techportal_dk2rjl2e_mc',
    'ticket_cid': 'b_techportal_a5s7axbq_mc',
    'space_create': 'b_techportal_plyrqccd_mc',
    'passport_create': 'b_techportal_sxmnz0de_mc'
};
export const ENTRANCE_FAIL_WITH_CTI = {
    'ticket_create': 'b_techportal_ch5fz84m_mc',
    'ticket_custom': 'b_techportal_zuqa6qmz_mc',
    'ticket_cid': 'b_techportal_ndszmebt_mc',
    'space_create': 'b_techportal_ogifml3t_mc',
    'passport_create': 'b_techportal_z2njuafu_mc'
};
export const ENTRANCE_FAIL_WITH_CTI_AND_FIELD = {
    'ticket_create': 'b_techportal_6qktdjd8_mc',
    'ticket_custom': 'b_techportal_kwg7wxms_mc',
    'ticket_cid': 'b_techportal_r3zeh7pn_mc',
    'space_create': 'b_techportal_8kj5csyu_mc',
    'passport_create': 'b_techportal_psqcyo27_mc'
};
export const OUTSIDE_ENTRANCE = {
    'other_system': 'b_techportal_xzqo3731_mc'
};
export const CREATE_RES_MAP = {
    'success': 'b_techportal_8i50hh58_mc',
    'fail_with_cti': 'b_techportal_h9afs1lm_mc',
    'fail_with_cti_and_field': 'b_techportal_7abq86rw_mc',
    'fail_without_cti': 'b_techportal_fxikzx4b_mc'
};

export const CREATE_TT_MAP = {
    'create_submit': 'b_techportal_gt5wo4lr_mc',
    'create_success': 'b_techportal_ebre5lrz_mc'
};

export const CHAT_TT_MAP = {
    'problem_detail': 'b_techportal_x24ek7tt_mc',
    'dx_chat': 'b_techportal_mvzsj8sq_mc',
    'create_chat': 'b_techportal_fwkm29be_mc',
    'confirm_create_chat': 'b_techportal_lypf8fm7_mc'
};
export const CHAT_PANEL_MAP = {
    'enter_group': 'b_techportal_jjiei2l7_mc',
    'confirm_enter_group': 'b_techportal_q4iw0onc_mc',
    'disband_group': 'b_techportal_a64na83u_mc',
    'confirm_disband_group': 'b_techportal_nhf2u325_mc',
    'enter_dx': 'b_techportal_4n0tdafx_mc',
    'click_input': 'b_techportal_4d77md1q_mc',
    'send_message': 'b_techportal_i77s0vpj_mc',
    'add_member': 'b_techportal_fnr64zed_mc',
    'confirm_add_member': 'b_techportal_me9dn810_mc',
    'delete_member': 'b_techportal_htirot3u_mc',
    'confirm_delete_member': 'b_techportal_m4qq8pvf_mc',
    'click_tt_files': 'b_techportal_db0mmfqz_mc',
    'send_tt_files': 'b_techportal_ag0hibnm_mc',
    'click_local_files': 'b_techportal_weznupsa_mc',
    'send_local_files': 'b_techportal_1ru56l5t_mc'
};

export const INSPECTION_KNOWLEDGE_MAP = {
    'copy_knowledge': 'b_techportal_u22ifbil_mc',
    'open_knowledge_tool': 'b_techportal_22u8xcrz_mc',
    'search_knowledge': 'b_techportal_n61zhmbw_mc',
    'copy_inspection_task': 'b_techportal_68muraca_mc',
    're_inspect_ticket': 'b_techportal_h7ilu0d0_mc',
    'download_inspector_task': 'b_techportal_jq0g039n_mc',
    'download_inspection_task': 'b_techportal_vtgrx04o_mc'
};
