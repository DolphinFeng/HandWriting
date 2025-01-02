window.api = {
  // 用户，任务测试环境
  // apiNioURL: 'http://nmap-pms-manager.mapcloud.tencent-stg.nioint.com',
  apiNioURL: 'http://nmap-tms-rbac.mapcloud.tencent-stg-1.nioint.com', //2022-8-17修改
  //占图服务
  apiNioMeshURL: 'http://nmap-tms-coordinate.mapcloud.tencent-stg-1.nioint.com',
  // 作业服务测试环境
  // apiNioWorkURL: 'http://9.148.67.127:8080',
  apiNioWorkURL: 'http://nmap-release.mapcloud.tencent-stg.nioint.com',
  // 地图总览测试环境
  apiNioMapURL: 'http://nmap-release.mapcloud.tencent-stg.nioint.com',
  // 人工快修测试环境
  apiquickFixURL: 'http://nmap-pms-task.mapcloud.tencent-stg.nioint.com',
  // nio的问题分析服务测试环境
  // apiNioquickFixURL: 'http://9.145.234.35:8081/issueanalysis',R
  // 任务流测试
  apiFixURL: 'http://nmap-pms-quickfix.mapcloud.tencent-stg.nioint.com',
  //nio后台情报
  nioUploadURL: 'http://nmap-intelligence.mapcloud.tencent-stg.nioint.com/',
  //nio任务重构情报
  nioTaskURL: 'http://nmap-tms.mapcloud.tencent-stg-1.nioint.com:80/tms',
  // nio资料管理
  nioSourceURL: 'http://nmap-source-management.mapcloud.tencent-stg.nioint.com',
  // check检查管理
  nioCheckURL: 'http://nmap-check-management.mapcloud.tencent-stg.nioint.com',
  // 数据管理
  nioDataURL: 'http://nmap-mapdata-service.mapcloud.tencent-stg.nioint.com/maps',
  // 执行检查接口
  nioCheckDataURL: 'http://nmap-data-check.mapcloud.tencent-stg.nioint.com',
  // 数据发布服务
  nioReleaseURL: 'http://nmap-mapdata-release-service.mapcloud.tencent-stg-1.nioint.com/map-release',
  //换电站管理
  // nioPowerSwapURL: 'http://nmap-power-swap-station.tencent-dev.nioint.com',
  nioPowerSwapURL: 'http://nmap-power-swap-station.mapcloud.tencent-stg.nioint.com',
  //差分服务
  nioDifferenceURL: 'http://nmap-difference-service.mapcloud.tencent-stg.nioint.com',
  //文件上传
  nioStorageServiceURL: 'http://nmap-storage-service.idc-stg.nioint.com',
  //离线框架
  nioOfflineTaskURL: 'http://nmap-offline-task-service.idc-uat.nioint.com',
  //ODD聚类
  oddClusterURL: 'http://nio-issue-management.idc-uat.nioint.com',
  //调度服务
  scheduleURL: 'http://nmap-schedule-service.mapcloud.tencent-stg-1.nioint.com',
  //grafana日志服务
  grafanaURL: 'http://grafana.nmap.nioint.com/explore',
  //差分服务
  nioDiffSourceURL: 'http://nmap-diff-source-service.mapcloud.tencent-stg.nioint.com',
   //项目管理
   nioProjectService:'http://nmap-release-project-service.mapcloud.tencent-stg.nioint.com',
  //case服务
  nioCaseService: 'http://nmap-case-management.mapcloud.tencent-stg.nioint.com',
  nioCollectionAdaptor: 'http://nmap-collection-adaptor.tencent-prod.nioint.com',
  namespace: 'nmap-idc-stg',
  datasource: 'Loki',
  url: 'stg'
}
