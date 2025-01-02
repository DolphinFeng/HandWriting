import {reactive} from 'vue';
//import { taskData} from "../task/taskList/taskData.js";
//import { oddLayer } from "../odd/oddLayer.js"

//用于根据source的值进行显示和隐藏
export let oddLayerSource = reactive([
  {name: 'ODD平台', source: 1, show: localStorage.getItem('ODD平台') === 'true'},
  {name: '腾讯', source: 2, show: localStorage.getItem('腾讯') === 'true'},
  {name: 'nio_map_issue', source: 3, show: localStorage.getItem('nio_map_issue') === 'true'},
  {name: 'AO事件', source: 4, show: localStorage.getItem('AO事件') === 'true'},
  {name: 'nio_map_permit', source: 5, show: localStorage.getItem('nio_map_permit') === 'true'},
  {name: '母库挖掘', source: 6, show: localStorage.getItem('母库挖掘') === 'true'},
  {name: 'nio_map_permit_ramp', source: 7, show: localStorage.getItem('nio_map_permit_ramp') === 'true'},
  {name: '快修补匝道', source: 9, show: localStorage.getItem('快修补匝道') === 'true'},
  {name: 'QA准出', source: 10, show: localStorage.getItem('QA准出') === 'true'},
  {name: '伴生', source: 11, show: localStorage.getItem('伴生') === 'true'},
]);

//link类型事件的source
export let linkOddLayerSource = reactive([
  {name: 'ODD平台', source: 1, show: localStorage.getItem('ODD平台-link') === 'true'},
]);

//SDLink类型事件的source
export let sdLinkOddLayerSource = reactive([
  {name: 'ODD平台', source: 1, show: localStorage.getItem('ODD平台-sd-link') === 'true'},
  {name: '伴生', source: 11, show: localStorage.getItem('伴生-sd-link') === 'true'},
]);

const visible_sources = new Set();
const link_visible_sources = new Set();
const sd_link_visible_sources = new Set();

for (let i = 0; i < oddLayerSource.length; i++) {
  const item = oddLayerSource[i];
  if (item.show) {
    visible_sources.add(item.source);
  }
}

for (let i = 0; i < linkOddLayerSource.length; i++) {
  const item = linkOddLayerSource[i];
  if (item.show) {
    link_visible_sources.add(item.source);
  }
}

for (let i = 0; i < sdLinkOddLayerSource.length; i++) {
  const item = sdLinkOddLayerSource[i];
  if (item.show) {
    sd_link_visible_sources.add(item.source);
  }
}

//切换显示/隐藏状态
function switchOddLayerSouceVisible(name) {
  visible_sources.clear();
  for (let i = 0; i < oddLayerSource.length; i++) {
    const item = oddLayerSource[i];
    if (item.name === name) {
      item.show = !item.show;
      localStorage.setItem(item.name, item.show);
    }

    if (item.show) {
      visible_sources.add(item.source);
    }
  }
}

export function switchLinkOddLayerSouceVisible(name) {
  link_visible_sources.clear();
  for (let i = 0; i < linkOddLayerSource.length; i++) {
    const item = linkOddLayerSource[i];
    if (item.name === name) {
      item.show = !item.show;
      localStorage.setItem(item.name + '-link', item.show);
    }

    if (item.show) {
      link_visible_sources.add(item.source);
    }
  }
}

export function switchSDLinkOddLayerSouceVisible(name) {
  sd_link_visible_sources.clear();
  for (let i = 0; i < sdLinkOddLayerSource.length; i++) {
    const item = sdLinkOddLayerSource[i];
    if (item.name === name) {
      item.show = !item.show;
      localStorage.setItem(item.name + '-sd-link', item.show);
    }

    if (item.show) {
      sd_link_visible_sources.add(item.source);
    }
  }
}

function setOddLayerSourceVisible(source) {
  for (let i = 0; i < oddLayerSource.length; i++) {
    const item = oddLayerSource[i];
    if (item.source === source) {
      item.show = true;
      visible_sources.add(item.source);
      localStorage.setItem(item.name, item.show);
    }
  }
}

export function setLinkOddLayerSourceVisible(source) {
  for (let i = 0; i < linkOddLayerSource.length; i++) {
    const item = linkOddLayerSource[i];
    if (item.source === source) {
      item.show = true;
      link_visible_sources.add(item.source);
      localStorage.setItem(item.name + '-link', item.show);
    }
  }
}

export function setSDLinkOddLayerSourceVisible(source) {
  for (let i = 0; i < sdLinkOddLayerSource.length; i++) {
    const item = sdLinkOddLayerSource[i];
    if (item.source === source) {
      item.show = true;
      sd_link_visible_sources.add(item.source);
      localStorage.setItem(item.name + '-sd-link', item.show);
    }
  }
}

function getOddLayerVisible() {
  //只在事件图层显示的时候进行数据的加载
  let visible = false;
  for (let i = 0; i < oddLayerSource.length; i++) {
    const item = oddLayerSource[i];
    if (item.show) {
      visible = true;
      break;
    }
  }

  for (let i = 0; i < linkOddLayerSource.length; i++) {
    const item = linkOddLayerSource[i];
    if (item.show) {
      visible = true;
      break;
    }
  }

  for (let i = 0; i < sdLinkOddLayerSource.length; i++) {
    const item = sdLinkOddLayerSource[i];
    if (item.show) {
      visible = true;
      break;
    }
  }

  return visible;
}

function getCurrentOddLayerSource() {
  return visible_sources;
}

export function getCurrentLinkOddLayerSource() {
  return link_visible_sources;
}

export function getCurrentSDLinkOddLayerSource() {
  return sd_link_visible_sources;
}

export {getCurrentOddLayerSource, getOddLayerVisible, switchOddLayerSouceVisible, setOddLayerSourceVisible};
