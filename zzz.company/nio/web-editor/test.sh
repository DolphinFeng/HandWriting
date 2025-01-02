cp -f build/config_local_dev.js dist/config.js
rm -rf /Users/yunguo.qin/Desktop/tileSource/assets
rm -rf /Users/yunguo.qin/Desktop/tileSource/cesium
rm -rf /Users/yunguo.qin/Desktop/tileSource/img
cp -rf /Users/yunguo.qin/Desktop/web-editor/node_modules/cesium/Build/Cesium/* /Users/yunguo.qin/Desktop/web-editor/dist/cesium
cp -rf /Users/yunguo.qin/Desktop/web-editor/dist/* /Users/yunguo.qin/Desktop/tileSource
