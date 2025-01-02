import {sub, startOfDay, endOfDay} from 'date-fns';
import {ISSUE_CONDITION_TYPE, ISSUE_ENV} from '../../src/views/map/Issue/constants';
import {issueLayer} from '../system/issue/layer';

//弹框设置
export const issueStore = {
  namespaced: true,
  state() {
    /**
     * show_by_id: 显示了哪些图层
     * search_conditions: 搜索条件
     */
    return {
      show_by_id: {},
      search_conditions: {
        date_range: [startOfDay(sub(new Date(), {hours: 1})), endOfDay(new Date())],

        selected_issue_props: {
          [ISSUE_CONDITION_TYPE.ISSUE_NOTIFY_TYPE]: {'101': true, '102': true},
          [ISSUE_CONDITION_TYPE.ISSUE_ENV]: {
            [ISSUE_ENV.PROD]: true,
          },
          [ISSUE_CONDITION_TYPE.ISSUE_STATUS]: {
            Normal: true,
          },
        },
      },
      is_condition_show: false,
    };
  },

  mutations: {
    // 选中打开的图层
    select(state, {selected_layer}: {selected_layer: string; show: boolean}) {
      const show = !state.show_by_id[selected_layer];

      state.show_by_id = {
        [selected_layer]: show,
      };

      if (selected_layer === 'issue_start_end_point') {
        if (show) {
          issueLayer.show = true;
          issueLayer.mouseLoadingIssue();
        } else {
          issueLayer.show = false;
        }
      }
    },

    setConditionPanelShow(state, {show}: {show: boolean}) {
      state.is_condition_show = show;
    },

    setSearchConditionProps(state, {type, id}: {type: string; id: string}) {
      if (!state.search_conditions.selected_issue_props[type]) {
        state.search_conditions.selected_issue_props[type] = {};
      }
      if (type === ISSUE_CONDITION_TYPE.ISSUE_ENV) {
        const is_checked = state.search_conditions.selected_issue_props[type][id];
        if (is_checked) {
          state.search_conditions.selected_issue_props[type] = {};
        } else {
          state.search_conditions.selected_issue_props[type] = {
            [id]: true,
          };
        }
      } else {
        state.search_conditions.selected_issue_props[type][id] =
          !state.search_conditions.selected_issue_props[type][id];
      }
    },
  },
  actions: {},
};
