window.api = {
  // 用户，任务测试环境
  // apiNioURL: 'http://nmap-pms-manager-stg.nioint.com',
  apiNioURL: 'http://nmap-tms-rbac-stg.nioint.com', //2022-8-17修改
  //占图服务
  apiNioMeshURL: 'http://nmap-reconcile-service-stg.nioint.com',
  apiNioDrafterURL: 'http://nmap-tms-drafter-stg.nioint.com',
  // 作业服务测试环境
  // apiNioWorkURL: 'http://9.148.67.127:8080',
  apiNioWorkURL: 'http://nmap-release-stg.nioint.com',
  // 地图总览测试环境
  apiNioMapURL: 'http://nmap-release-stg.nioint.com',
  // 人工快修测试环境
  apiquickFixURL: 'http://nmap-pms-task-stg.nioint.com',
  // nio的问题分析服务测试环境
  // apiNioquickFixURL: 'http://9.145.234.35:8081/issueanalysis',R
  // 任务流测试
  apiFixURL: 'http://nmap-pms-quickfix-stg.nioint.com',
  //nio后台情报
  nioUploadURL: 'http://nmap-intelligence-stg.nioint.com/',
  //nio任务重构情报
  nioTaskURL: 'http://nmap-tms-stg.nioint.com:80/tms',
  // nio资料管理
  nioSourceURL: 'http://nmap-source-management-stg.nioint.com',
  // check检查管理
  nioCheckURL: 'http://nmap-check-management-stg.nioint.com',
  // 数据管理
  nioDataURL: 'http://nmap-mapdata-service-stg.nioint.com/maps',
  // 执行检查接口
  nioCheckDataURL: 'http://nmap-data-check-stg.nioint.com',
  // 数据发布服务
  nioReleaseURL: 'http://nmap-mapdata-release-service-stg.nioint.com/map-release',
  //换电站管理
  // nioPowerSwapURL: 'http://nmap-power-swap-station.tencent-dev.nioint.com',
  nioPowerSwapURL: 'http://nmap-power-swap-station-stg.nioint.com',
  //差分服务
  nioDifferenceURL: 'http://nmap-difference-service-stg.nioint.com',
  //文件上传
  nioStorageServiceURL: 'http://nmap-storage-service-stg.nioint.com',
  //离线框架
  nioOfflineTaskURL: 'http://nmap-offline-task-service.idc-uat.nioint.com',
  //ODD聚类
  oddClusterURL: 'http://nio-issue-management.idc-uat.nioint.com',
  //调度服务
  scheduleURL: 'http://nmap-schedule-service-stg.nioint.com',
  //grafana日志服务
  grafanaURL: 'https://grafana-sec-aip.nioint.com/d/ef762241-1ace-4497-90fb-e5416c31e28a/38c43a6e-1475-5fc9-aab4-df24128437f7',
  //差分服务
  nioDiffSourceURL: 'http://nmap-diff-source-service-stg.nioint.com',
  //项目管理
  nioProjectService: 'http://nmap-release-project-service-stg.nioint.com',
  //case服务
  nioCaseService: 'http://nmap-case-management-stg.nioint.com',
  nioCollectionAdaptor: 'http://nmap-collection-adaptor.tencent-prod.nioint.com',
  namespace: 'nmap-idc-stg',
  datasource: 'Loki',
  url: 'stg'
}
