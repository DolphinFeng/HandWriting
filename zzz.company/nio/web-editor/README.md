# 介绍
前端按功能划分主要包括七大模块：地图展示、nio底图展示、图层管理、ODD管理、任务模块、质检模块、路测数据可视化。

技术栈为**vue3** + **vite** + **element plus** + **cesium**

---
# 系统设计 
## 资源src目录
* animate    动画
* assets     资源css、font
* cesium     地图模型
* components 可视化组件库
* event      事件模块
* js         一些数据结构的封装
* primitives 绘制图形的函数
* request    axios封装
* router     vue-router
* store      vue-store
* system     平台数据模块
* utils      辅助计算的工具库
* views      视图组件
* worker     多线程任务管理
## 模块设计
### 一、地图展示
地图展示是平台提供的基础功能，承担渲染结果位置对比、地图交互等功能。
#### 1.1加载地图：`imageryProvider`
需要提供切换百度地图、高德影响、高德地图、腾讯地图等地图的显示、隐藏、切换三种功能。

![img.png](readmeImg/img.png)

#### 1.2三维/二维切换
此处是伪2d，2d模式下禁用了相机的旋转功能。平台默认为2d模式

![img_4.png](readmeImg/img_4.png)

#### 1.3坐标搜索定位
封装组件`SearchLocation.vue`

在界面右上角提供通过输入***坐标***或***图幅号***进行定位的功能，通过正则匹配判断用户输入的类型，并能通过历史记录查看上一次定位地点，且支持删除记录功能。

其中图幅号定位需要通过[后端接口](http://nmap-mesh-manager.tencent-dev.nioint.com/mesh/query)查询图幅几何信息，并计算图幅中心坐标再进行定位。

当搜索框触发focus事件时弹出历史记录下拉框。

![img_2.png](readmeImg/img_2.png)

历史记录以栈的形式保存在localstorage中，限制记录10条。

#### 1.4地图坐标查询 
监听鼠标右键事件，用户右键点击地图会弹出窗口，窗口组件`Popup.vue`。

`PopupData`用于向`store.setPopup`传递消息，改变弹窗显示内容

![img_3.png](readmeImg/img_3.png)

### 二、nio底图展示
平台基础功能，通过3DTile格式的数据，支持可视化以下数据：
* nio全国的车道(lane) `HdMapTileLayer`
* 车道线(laneBoundary) `HdMapTileLayer`
* 道路(road) `HdMapTileLayer`
* 动态事件(dynamicEvent) `DynamicTileLayer`

底图加载入口：`function switchHdMapVersion`，每当修改地图版本时重新加载底图
### 2.1 数据格式
生成静态3DTile格式的数据，存储到niofs dept中。

存储路径名称格式约定：china_json_${version}_new/${type}/tileset.json

其中version为地图版本，例：22122101；type为加载的目标，例：lane
### 2.2地图版本
地图数据版本控制，版本信息保存在src/store/version.js当中

![img_5.png](readmeImg/img_5.png)

### 三、图层管理:src/system/layer
平台支持管理各个可视化的图层。
#### 3.1图层
默认包含车道线、车道、道路、动态图层、事件五个图层。

基础类：Layer。所以图层均继承自该类。

![img_6.png](readmeImg/img_6.png)

#### 3.2管理自定义图层
平台支持添加或删除任何3DTile格式的图层，并设置图层色彩，如路测放行数据、服务区数据等。并提供快速定位功能。

![img_7.png](readmeImg/img_7.png)

### 四、ODD管理:src/system/odd
ODD是平台核心功能模块，功能主要包括渲染、增、删、改。

ODD数据分为***母库数据***和***作业库数据***。作业库中存储当前任务已作业的ODD数据，在质检通过结束任务后转移到母库当中，其中涉及到母库与作业库数据冲突的问题。

核心类：
* `HoverOddLayer`(单例)，存放处于选中状态的lane，还未正式生成Odd
* `ODDLayer`（单例），存放从母库、作业库以及本地创建的Odd
* `OddLane` Odd对应的线
* `OddData` Odd对应事件的数据，挂载在 `OddLane` 下面
* `OpHistory` 用户关于增、删、改ODD数据的操作历史，以链表的形式保存，链表节点的值为 `OddOpRecord`
* `OddOpRecord` 用户的一次增、删、改的操作记录，

#### 4.1多线程管理:/src/worker
ODD数据以WKT格式存储，采用正则匹配的方式提取坐标性能代价在0.1s以上，会造成页面明显的卡顿，因此需要web worker的辅助

WorkerPoll线程池+Worker线程对象来分配任务。线程池poll提供start方法，寻找空闲线程，然后在taskHandler任务路由中进行匹配并执行任务。

#### 4.2加载母库数据
监听鼠标move事件，限流每1s执行一次。加载、解析均在worker中进行，拖拽地图时通过解析用户当前页面包含的图幅来查询母库ODD。为了优化查询性能，采用了将图幅列表分批查询的方式。在解析结束后需要剔除已经存在的母库ODD，防止数据错误叠加。
调用流程：
* `function loadingSourceOddHandler` 请求加载母库数据，发起worker任务请求
* `function handleOddData` worker发起的ODD母库查询请求结束，开始处理查询的结果
* `oddLayer.laneToEvent(lane)` 将查询结果转换成ODD保存到本地

#### 4.3加载作业库数据
调用流程：
* `function loadingWorkOddHandler` 请求加载作业库数据，发起worker任务请求
* `function handleOddData` worker查询结束后，处理查询结果
* `oddLayer.laneToEvent(lane)` 将查询结果转换成ODD保存到本地

仅当任务开始时去请求一次作业库，加载、解析同样均在worker中执行。其中涉及到一些与母库冲突（两者eventId相同）的情况：
* 作业库中删除：为了知晓某条ODD被删除，将ODD的status设为2标识ODD已失效，当作业库的ODD.status为2时，需要隐藏母库的ODD
* 作业库修改：作业库优先级较高，需要覆盖母库的ODD数据

#### 4.4ODD渲染
按照业务需求，ODD均从lane上创建，一条lane可能包含多条ODD事件，因此lane与ODD是一对多的关系。

保存ODD数据到本地：`oddLayer.laneToEvent`

#### 4.5ODD选择
平台支持拉取范围选择框来查询ODD。监听鼠标弹起事件，当拉框结束后计算框的中心点坐标、宽高，通过中心点来查询width、height范围内的线
几种选择方式：
* `hoverOddLayer.shiftEvent` 框选lane
* `hoverOddLayer.laneClickHandler` 单选一条lane
* `oddLayer.ctrlEvent` 框选ODD
* `oddLayer.ctrlOneEvent` 单选一条ODD

![img_8.png](readmeImg/img_8.png) 

图例：框选ODD

#### 4.6ODD修改
在选中ODD线后会弹出属性面板，进行单条或多条ODD属性修改。支持切换不同ODD。

ODD属性面板组件：`ODDEventDataPanel.vue`

<img src="readmeImg/img_9.png" width="220" alt="">

#### 4.7ODD操作保存
通过维护一个操作历史记录链表`OpHistory`对用户的增、删、改操作做记录。遍历链表，得到关于增、删、改操作的map。

* 创建ODD：
  ```js
  oddLayer.createEventLanes //创建多条Odd
  oddLayer.createOneEventLane //创建单条Odd
  ```
* 修改ODD：
  ```
  function changeOddData
  ```
* 删除ODD：
  ```js
  oddLayer.deleteEvent //删除全部选中的ODD
  ```

#### 4.8按起终点生成ODD
业务中针对长距离ODD，可以通过输入起终点坐标进行路径规划，来快速生成ODD。

调用入口： `function loadingTrajHandler()`

### 五、任务模块:src/system/task/taskList
每个范围的ODD即一个任务，需要下发给作业员来完成。

#### 5.1任务列表
封装组件：`TaskList.vue`

在页面加载时需要查询作业员的任务列表，其中执行中的任务显示"**提交**"按钮，普通任务显示"**开始**"按钮。

每个人只允许有一条任务处在进行中的状态。

展示任务号、任务版本、任务来源链接、任务描述内容。

<img src="readmeImg/img_10.png" width="300" alt="">

#### 5.2领取任务
一些任务在后台可能处于未分配的状态，作业员可以主动领取任务并刷新任务列表。

#### 5.3开始任务
作业员点击开始任务后会有以下四个流程：
* `function loadingTaskList()` post发送开始任务的通知
* `function requestOddBranchName()` 根据任务Id查询作业库Id
* `function loadingWorkOddHandler()` 查询作业库的ODD
* `function requestQualityTagHandler()` 查询作业库的质检标

其中任何一个环节失败都会提醒用户任务开始失败。

#### 5.4任务截图
封装组件：`TaskCapture.vue`

监听任务列表中的截图按钮鼠标点击事件，可以打开该任务的截图列表，支持截图切换

<img src="readmeImg/img_11.png" width="260" alt="">

#### 5.5ODD作业库列表
点击任务列表中的任务号，支持查看该任务对应的作业库ODD数据，支持分页展示

<img src="readmeImg/img_12.png" width="390" alt="">

#### 5.6提交任务
作业员完成作业后点击提交按钮，会有以下流程：
* `function uploadOddData()` 上传本地ODD修改数据
* `function modifyQualityTagHandler()` 上传当前任务的所有质检标
* `function submitWorkTaskHandler()` post发送结束任务的通知

以上三个环节任何一个失败都会提醒用户提交失败。

成功提交任务后需要清空本地的所有ODD事件、质检标，并刷新任务列表和重新加载当前页面范围的母库数据。

### 六、质检模块:src/system/task/quality
支持对作业员提交的任务ODD数据进行质检，并做出任务通过或打回重做的通知。质检任务也需要通过任务列表开始
#### 6.1质检标
质检任务可以创建、修改、删除质检标。

当点击工具栏内的质检按钮后，进入质检标放置阶段，该阶段内不可移动相机、不可选取ODD，仅能放置质检标。 
* 监听鼠标移动，鼠标变为质检标形态
* 监听鼠标左键，放下并创建一个质检标
* 监听鼠标右键，取消创建并退出质检标放置阶段

![img_13.png](readmeImg/img_13.png)

![img_15.png](readmeImg/img_15.png)

#### 6.2编辑质检标
点击地图上的质检标会弹出质检标属性编辑面板。

<img src="readmeImg/img_14.png" width="190" alt="">

### 七、路测数据可视化:src/system/trajectory
支持范围区域内的路测资料、采集资料、服务区资料数据查询与可视化。
#### 7.1查询路测数据

通过alt+左键拉取范围，生成矩形WKT进行路测数据查询。

<img src="readmeImg/img_16.png" width="230" alt="">

查询结果以面板列表的形式展示，支持切换不同的路测轨迹，切换轨迹下的轨迹点，并支持查看轨迹点的坐标、采集时间、轨迹id、轨迹照片。

此处监听键盘方向左右按键，实现轨迹点的快速切换。

<img src="readmeImg/img_17.png" width="230" alt="">

#### 7.2轨迹可视化

在地图上渲染轨迹点、轨迹线、当前选中的轨迹点，切换轨迹点时需要重新渲染当前选中的轨迹点，并监听地图鼠标事件，通过选点来切换当前选中的轨迹点。

<img src="readmeImg/img_18.png" width="250" alt="">

---
# 命令
```sh
npm run dev 本地运行
```
```sh
npm run build --打包
```
```sh
npm run push  --将打包结果推送至83服务器
```

# 环境地址
* [开发环境](http://nmap-web-editor.tencent-dev.nioint.com)
* [测试环境](http://nmap-web-editor.idc-uat.nioint.com/)
* [生产环境](http://nmap-web-editor.idc-prod.nioint.com/)

