# 美团实习总结
>> 核心本地商业 – 基础研发平台 – 企业平台研发部 – 办公效率 – 办公应用研发

## 给移动端 rn 项目接入了 i18n 国际化
   
   美团内部有个 i18n 的库，可以自动生成多语言的文件，但是需要手动配置
   1. 要创建一个 locale 文件夹，里面创建一个 en.json 文件，里面是英文的配置，然后创建一个 zh.json 文件，里面是中文的配置，还有个 繁体 的文件，里面是繁体的配置
   2. 在项目中，要使用 i18n 的库，需要先引入，然后使用 i18n.t('key') 方法来获取多语言的配置
   3. 项目入口文件中配置 i18n 的库，然后使用 i18n.locale 方法来设置语言，i18n.language 方法来获取语言，有个 i18n.changeLanguage 方法来切换语言，有个 init 方法初始化语言
   4. 在组件中使用翻译：需要 解构 出 t 方法，然后使用 t 方法来获取翻译后的文本

## 给移动端 rn 项目实现了切换 时区 的方法
   调研得知：有两个 库 均可实现，一个是 moment，一个是 day
   day 更为轻量化，moment 更大，并且已经好久没有人维护，所以选择了 day 库
   具体实现其实也很简单： 就是在时间处理的 工具函数 文件中统一去 用 moment 的 一个函数 tz 来处理时区
   但是 day 有个 问题，安卓系统 不支持，缺少一个 INTL api 会报错
   问题原因：rn 在 android 上 默认使用 JSCore 引擎，而 JSCore 引擎在某些版本 不支持 INTL 这个 api，这是因为 INTl 是一个比较新的特性；并不是所有的 js 引擎都支持
   ios 支持是因为 IOS 的 JSCore 引擎比较新，不会出现这个问题
   moment 没问题是因为 moment 不依赖 INTL api 来处理日期和时间格式；
   解决方案： 可以对 dayjs 使用 Polyfill；可以替换 moment




# 蔚来实习总结
>> 产品设计与研发-自动驾驶研发-时空信息部-地图产线团队

## 给后台系统 across-produce-web 添加了一个 地理围栏 功能
   使用地图库 Cesium 来渲染 3D 地图，nioMap 模块负责初始化 Cesium Viewer ，并设置地图的基本属性和图层
   通过事件处理器，比如 ScreenSpaceEventHandler 来捕获用户的鼠标和键盘事件，这些事件用于在地图上添加、移动或删除点，比如左边点击事件用于在地图上添加点，右键点击事件用户完成多边形的绘制
   使用 Cesium 的 Entity 和 Graphics (比如 PolygonGraphics 和 PolylineGraphics) 来绘制多边形和路径线，MapController 类负责管理这些实体的创建，更新和删除
   Wkt 是一种用于几何对象的文本标记语言，在我的地理围栏中，wkt 用于将多边形和路径线的集合信息序列化和反序列化
   terraformer-wkt-parser 库用于解析和生成 wkt 字符串
   使用命令模式（Command 接口极其实现）来封装用户操作（添加点，删除点，移动端，创建多边形）
   CommandHistory 类用于管理命令的执行，撤销和重做
   使用 useState,useEffect 来管理组件的状态和生命周期
   工具栏控制器：useToolbarController 钩子提供了一组方法，用于与地图交互（撤销，重做，复制 WKT 字符串等）

   按钮图层的区分，首先入参有个地图版本，然后有个 tile_id，然后有个图层的 event_types，请求的 url 是 load3DTile 里面的 属性生成的 custom_url；请求后的的结果是通过 item[source] 来区分图层


## 给 地图标注平台(Web-editor) 实现了 多线程 WebWorker 绘制 道路、绘制匝道 的功能
    前端绘制地图其实是借助 cesium 这个库来实现的，其实这个库是基于 canvas 的
    cesium 有很多模块，其中有个 entity, 可以用来绘制地图
    需要拿到后端给到的 geojson 数据，里面会包含 features 数组，每个 feature 是一个对象，里面包含 geometry 和 properties 两个属性
    网站：geojson.io/#map=2/20/0；
    地图上有按钮实现获取 geojson 数据，关闭按钮实现关闭接口

    按钮很多，需要展示不同的路口，匝道，需要控制不同数据的 feature[source]， [id_link] 等字段作为一个过滤条件

    web-editor 项目中使用 webworker 主要是为了异步处理任务（用于执行大量计算的任务，数据分析，工作数据，轨迹数据），任务被分发给可用的工作者，处理结果后被发送回主线程，从而避免阻塞主线程；
    worker 构造函数是从 worker.js 创建的一个实例，这是在 taskWorker 类中完成的，该类是由 workerPool 类管理的工作池的一部分
    workerPool 类管理一组 taskWorker 实例，每个 taskWorker 可以通过 web worker 处理一个任务，池的大小设置为 3，意思就是有三个工作者可以同时处理任务
    任务分发给可用的工作者，当任务被分发时，工作者的 onmessage 和 onerror 处理程序会根据工作者的响应来解决或拒绝任务的 promise
    工作者监听来自主线程的消息。当收到消息时，他使用 taskHandler 根据任务类型分发任务，结果随后被发送回主线程
    taskHandler 对象注册不同的任务类型极其对应的处理程序，当任务被分发时，调用相应的处理程序并传递参数
    taskResult 类用于封装任务的结果，包括状态码，消息，数据。任务完成后，这个结果被发送回主线程

## tms 做了一个 虚拟列表
   有一个弹窗内容会有很多子任务，与后端确认有几千条，考虑这个展示是在弹窗里面，建议做一个上下滚动，最终使用了虚拟列表的方式保证其不卡顿

## 更改了某个后台项目的前端存储逻辑


