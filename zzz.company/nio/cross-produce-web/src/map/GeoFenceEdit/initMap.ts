import {
    Ion,
    Viewer,
    FeatureDetection,
    ScreenSpaceEventType,
    Clock,
    Math as CMath,
    Cartesian3,
    SceneMode, 
    Color, 
    UrlTemplateImageryProvider,
    buildModuleUrl,
} from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";

Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxYjdkZDc5ZS1jZjg3LTQxMTktODM5MS1kODU3NjY2ZDI2ZjYiLCJpZCI6MTAzNDkzLCJpYXQiOjE2NjU4MzExMTd9.gK4NHpWA5tQOoRZrbKqoTK_m_kFrPaFjaxA57SLZuJI';

// 设置 Cesium 静态资源的基路径
(window as any).CESIUM_BASE_URL = '/Cesium/';

export interface NioMap {
    viewer: Viewer | null;
    destroy: () => void;
    createViewer: (containerId: string, initCenter?: Cartesian3) => Viewer;
    toCenter: (initCenter: Cartesian3) => void;
}

const nioMap: NioMap = {
    viewer: null,

    destroy(): void {
        if (this.viewer === null) {
            return;
        }
        if (this.viewer.isDestroyed()) {
            this.viewer = null;
            return;
        }
        this.viewer.destroy();
        this.viewer = null;
    },

    createViewer(containerId: string, initCenter?: Cartesian3): Viewer {
        if(this.viewer !== null && !this.viewer.isDestroyed()){
            return this.viewer;
        }

        this.viewer = new Viewer(containerId, {
            animation: false,
            baseLayerPicker: false,
            fullscreenButton: false,
            geocoder: false,
            homeButton: false,
            infoBox: false,
            sceneModePicker: false,
            selectionIndicator: false,
            timeline: false,
            requestRenderMode: true,
            navigationHelpButton: false,
            scene3DOnly: true,
            fullscreenElement: document.body,
            useDefaultRenderLoop: true,
            targetFrameRate: undefined,
            showRenderLoopErrors: false,
            automaticallyTrackDataSourceClocks: true,
            contextOptions: undefined,
            sceneMode: SceneMode.SCENE3D,
        });

        this.viewer.imageryLayers.removeAll();
        this.viewer.imageryLayers.addImageryProvider(new UrlTemplateImageryProvider({
            url: "http://wprd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scl=1&style=7&x={x}&y={y}&z={z}",
        }));

        // 配置 viewer
        (this.viewer.cesiumWidget.creditContainer as HTMLElement).style.display = 'none';
        
        if (window.devicePixelRatio > 1.0) {
            this.viewer.resolutionScale = window.devicePixelRatio;
        }
        
        this.viewer.scene.postProcessStages.fxaa.enabled = true;
        this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        this.viewer.scene.globe.showGroundAtmosphere = false;
        this.viewer.scene.skyBox.show = true;
        this.viewer.scene.sun.show = true;
        this.viewer.scene.moon.show = true;
        this.viewer.scene.requestRenderMode = true;
        this.viewer.camera.percentageChanged = 0.05;
        this.viewer.scene.globe.baseColor = Color.fromCssColorString('#546a53');

        if (initCenter) {
            this.toCenter(initCenter);
        }

        return this.viewer;
    },

    toCenter(initCenter: Cartesian3): void {
        if (!this.viewer) {
            throw new Error('Viewer not initialized');
        }

        this.viewer.camera.setView({
            destination: initCenter,
            orientation: {
                heading: CMath.toRadians(0),
                pitch: CMath.toRadians(-90),
                roll: 0.0
            }
        });
    }
};

export default nioMap;