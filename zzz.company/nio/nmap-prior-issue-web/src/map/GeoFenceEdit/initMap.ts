// @ts-nocheck
import {
    Ion,
    Viewer,
    FeatureDetection,
    ScreenSpaceEventType,
    Clock,
    Math as CMath,
    Cartesian3,
    HeadingPitchRange,
    Matrix4,
    SceneMode, Color, UrlTemplateImageryProvider
} from "cesium";
import {markRaw} from "vue";
import "cesium/Build/Cesium/Widgets/widgets.css";

Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxYjdkZDc5ZS1jZjg3LTQxMTktODM5MS1kODU3NjY2ZDI2ZjYiLCJpZCI6MTAzNDkzLCJpYXQiOjE2NjU4MzExMTd9.gK4NHpWA5tQOoRZrbKqoTK_m_kFrPaFjaxA57SLZuJI';

export interface NioMap {
    viewer: Viewer;
    destroy: () => void;
    createViewer: (containerId: string, initCenter: Cartesian3 | undefined) => Viewer;
    toCenter: (initCenter: Cartesian3) => void;
}

const nioMap: NioMap = {
    viewer: null,
    destroy() {
        if (nioMap.viewer === null) {
            return;
        }
        if (nioMap.viewer.isDestroyed()) {
            nioMap.viewer = null;
            return;
        }
        nioMap.viewer.destroy();
        nioMap.viewer = null;
    },
    createViewer(containerId: string, initCenter: Cartesian3 | undefined) {
        if(nioMap.viewer !== null && !nioMap.viewer.isDestroyed()){
          return nioMap.viewer;
        }
        //禁止被vue注册响应式
        nioMap.viewer = markRaw(new Viewer(containerId, {
            animation: false, //取消创建左下角动画小控件
            baseLayerPicker: false, //不显示图层选择器
            fullscreenButton: false, //不显示全屏按钮
            geocoder: false, //不显示Geocoder查询
            homeButton: false, //不显示Home按钮
            infoBox: false, //不显示点击物体后弹出的信息框
            sceneModePicker: false, //不显示三维、二维地图选择器
            selectionIndicator: false, //不显示选取指示器(点击为绿框)
            timeline: false, //不显示时间轴
            requestRenderMode: true,  //需要手动调用scene.requestRender或forceRender进行渲染
            navigationHelpButton: false, //不显示右上角的帮助按钮
            scene3DOnly: true, //所有几何图形以三角形模式绘制以节省GPU资源
            clock: new Clock(), //用于控制当前时间的时钟对象
            imageryProvider: null,
            fullscreenElement: document.body, //全屏渲染时的html元素
            useDefaultRenderLoop: true, //控制循环渲染
            targetFrameRate: undefined, //使用默认render loop时的帧率
            showRenderLoopErrors: false, //不显示错谁的信息
            automaticallyTrackDataSourceClocks: true, //自动追踪最近添加的数据源时钟设置
            contextOptions: undefined, //传递给Scene对象的上下文参数
            sceneMode: SceneMode.SCENE3D, //初始场景模式
        }));

        nioMap.viewer.imageryLayers.removeAll();
        nioMap.viewer.imageryLayers.addImageryProvider(new UrlTemplateImageryProvider({
            url: "http://wprd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scl=1&style=7&x={x}&y={y}&z={z}",
        }));

        nioMap.viewer._cesiumWidget._creditContainer.style.display = 'none'; //去除版权信息
        if (FeatureDetection.supportsImageRenderingPixelated()) {
            nioMap.viewer.resolutionScale = window.devicePixelRatio;
        }
        nioMap.viewer.scene.postProcessStages.fxaa.enabled = true; //开启抗锯齿
        nioMap.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(ScreenSpaceEventType.LEFT_DOUBLE_CLICK); //去掉双击
        nioMap.viewer.scene.globe.showGroundAtmosphere = false; //关闭地表大气层
        nioMap.viewer.scene.skyBox.show = true; //隐藏天空盒
        nioMap.viewer.scene.sun.show = true; //隐藏太阳
        nioMap.viewer.scene.moon.show = true; //隐藏月亮
        nioMap.viewer.scene.requestRenderMode = true; // 
        nioMap.viewer.camera.percentageChanged = 0.05; //相机事件精度，默认5
        nioMap.viewer.scene.globe.baseColor = Color.fromCssColorString('#546a53'); //将默认的蓝色地球修改为墨绿色

        if (initCenter) {
            nioMap.toCenter(initCenter);
        }

        return nioMap.viewer;
    },
    toCenter(initCenter: Cartesian3) {
        nioMap.viewer.camera.setView({
            destination: initCenter,
            orientation: {
                heading: CMath.toRadians(0),  // 朝北
                pitch: CMath.toRadians(-90),  // 直接向下看
                roll: 0.0
            }
        });
    }
};

export {nioMap};
