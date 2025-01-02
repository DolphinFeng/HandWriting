// 地图相关的接口配置
import axios from "axios";
const nioMapUrl = window.api.apiNioMapURL;
const nioWorkUrl = window.api.apiNioWorkURL;
// 搜索Tile
export const getTileInfo = (data = {}) => axios({
  url: `${nioMapUrl}/nio/release/mesh/status`,
  method: 'post',
  data,
});

// 根据时间搜索任务版本
export const queryPublishList = (data = {}) => axios({
  url: `${nioWorkUrl}/query_publish_list`,
  method: 'post',
  data,
})
