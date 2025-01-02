import {PrimitiveCollection, Cartesian3, defined} from 'cesium';

import {Layer} from '../layer/Layer.js';

import {createViewer} from '../../cesium/initMap.js';
import {Issue} from './issue';
import {searchDrillPicks} from '../../utils/compute.js';
import {debounce} from 'lodash-es';
import {NioMessage, getTileLevel} from '../../utils/utils.js';
import {LayerEvent} from '../../event/index.js';
import {throttle} from 'lodash';
import {IssueMeta} from './model.js';
import {loadingIssueHandler} from './loadingIssueData.js';

class IssueLayer extends Layer {
  viewer = createViewer();

  issue_by_id = new Map<string | number, Issue>();
  issue_id_map = new Map<string | number, boolean>();

  highlight_issue?: Issue;
  //geometry事件权柄
  handler: LayerEvent;

  loading: boolean = false;

  // 临时的 issue
  temp_issue: Issue | null = null;
  data_source_temp: PrimitiveCollection = new PrimitiveCollection();

  constructor() {
    super(false, 'Issue', [], new PrimitiveCollection(), false, false);
    this.viewer.scene.primitives.add(this.dataSource);
    this.viewer.scene.primitives.add(this.data_source_temp);

    this.loadData([]);
    this.initMouseHandler();
  }

  initMouseHandler() {
    this.handler = new LayerEvent();

    //鼠标按下事件(拖动查询事件)
    this.handler.add('LEFT_DOWN', (ev) => {
      this.handler.start('MOUSE_MOVE');
      this.handler.start('LEFT_UP');
    });
    //鼠标拖动事件
    this.handler.add(
      'MOUSE_MOVE',
      throttle(() => {
        this.mouseLoadingIssue();
      }, 1000),
    );
    //鼠标抬起事件
    this.handler.add('LEFT_UP', (ev) => {
      // this.mouseLoadingOdd();
      this.handler.stop('MOUSE_MOVE');
      this.handler.stop('LEFT_UP');
    });

    this.startOddEvent();
  }

  startOddEvent() {
    this.handler.start('LEFT_DOWN');
  }

  stopOddEvent() {
    this.handler.stop('LEFT_DOWN');
  }

  //加载远程Issue数据
  mouseLoadingIssue() {
    let tile = getTileLevel();
    if (tile <= 10 || !this.show || this.loading) {
      return;
    }
    loadingIssueHandler(false);
  }

  loadData(issues: IssueMeta[]) {
    issues.forEach((item) => {
      if (this.issue_id_map.get(item.id)) {
        return;
      }

      const issue = new Issue(this.viewer, item);
      issue.addTo(this.dataSource);
      this.issue_by_id.set(item.id, issue);
      this.issue_id_map.set(item.id, true);
    });

    this.viewer.scene.requestRender();
  }

  flyToIssue(issue: IssueMeta) {
    if (!issue) {
      console.log('未找到对应的 issue ');
      return;
    }

    let issue_layer = this.issue_by_id.get(issue.id);

    if (!issue_layer) {
      this.loadData([issue]);
      issue_layer = this.issue_by_id.get(issue.id);
    }

    if (!issue_layer) {
      console.log('未找到对应的 issue_layer ');
      return;
    }

    const currentPosition = this.viewer.camera.positionCartographic;

    this.viewer.scene.camera.position.z;

    this.viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(
        issue_layer.start_point_coord[0],
        issue_layer.start_point_coord[1],
        currentPosition.height,
      ),
      duration: 1,
      complete: () => {
        this.highlight_issue?.deHighlight();
        issue_layer?.hightlight();
        this.highlight_issue = issue_layer;
      },
    });
  }

  /** 显示被找到的数据 */
  showSearchedIssue(issue_meta: IssueMeta) {
    this.removeSearchedIssue();

    const issue = new Issue(this.viewer, issue_meta);

    issue.addTo(this.data_source_temp);

    issue.flyTo();
    issue.hightlight();
    this.temp_issue = issue;

    setTimeout(() => {
      this.removeSearchedIssue();
    }, 5000);
  }

  /** 移除被找到的数据 */
  removeSearchedIssue() {
    try {
      if (this.temp_issue) {
        this.temp_issue.dispose();
        this.data_source_temp.remove(this.temp_issue.collection);
      }
    } catch (error) {
      console.error(error);
    }
    this.temp_issue = null;
  }

  async shiftEvent(stPos, edPos, way) {
    const picks = searchDrillPicks(stPos, edPos);

    let id_map = {};

    picks?.forEach((pick) => {
      const issue_id = pick?.id?.split('-')[0];

      if (issue_id) {
        id_map[issue_id] = true;
      }
    });

    const keys = Object.keys(id_map);

    if (keys.length > 0) {
      NioMessage('success', `当前共计选中 ${keys.length} 个issue点`, 5000);
    }
  }

  debounceShiftEvent = debounce(this.shiftEvent, 300);

  /**
   * 如果条件发生改变，清空现有渲染的图层
   */
  clearIssues() {
    this.dataSource.removeAll();
    this.issue_by_id.clear();
    this.issue_id_map.clear();
  }

  removeIssue(issue: Issue) {
    this.issue_by_id.delete(issue.id);
    this.issue_id_map.delete(issue.id);
    issue.dispose();
  }
}

export const issueLayer = new IssueLayer();

export function clearIssueData() {
  issueLayer.clearIssues();
}
