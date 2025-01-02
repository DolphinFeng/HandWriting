# Dimension

地图众包管理平台

# 支持指令

1. `npm run start`：启动开发项目
2. `npm run build`：进行项目打包

# 相关依赖

1. Node版本 - V16
2. React版本 - V18
3. React Router - V6

 
# 部署方案 

使用了 Ras 系统进行部署，并结合 ingresses 的 proxy，达到使用域名进行访问的效果

# 部署环境
### 1. Dev
- k8s 集群：[tencent-dev](http://kubepi.nioint.com/kubepi/dashboard/dashboard?cluster=tencent-dev)
- Ingress: [ingresses](http://kubepi.nioint.com/kubepi/dashboard/ingresses/aip-tencent-dev/cross-produce-web-dev/detail?yamlShow=false&cluster=tencent-dev)
- 访问域名：http://cross-produce-web-dev.nioint.com

 

### 2. Stg 
- K8S Service：[ext-ras](http://kubepi.nioint.com/kubepi/dashboard/services/nmap-idc-stg/ext-ras/detail?yamlShow=false&cluster=idc-prod-new)
- Ingress：[cross-produce-web-stg.nioint.com](http://kubepi.nioint.com/kubepi/dashboard/ingresses/nmap-idc-stg/cross-produce-web-stg.nioint.com/detail?yamlShow=false&cluster=idc-prod-new)             