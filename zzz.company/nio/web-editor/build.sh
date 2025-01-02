#!/bin/bash
npm config set registry https://artifactory.nioint.com/artifactory/api/npm/dd-npm-all-virtual/
npm config ls
echo "设置完成registry https://artifactory.nioint.com/artifactory/api/npm/dd-npm-all-virtual/"
echo "开始安装依赖"
npm install --force
echo "开始安装依赖结束"
echo "开始构建"
npm run build
echo "构建成功,开始覆盖node_modules下的cesium"
cp -rfv ./Cesium/* ./dist/cesium

ls -l ./dist

tar -cvf web_editor.tar ./dist ./build ./nio

ls -l ./web_editor.tar
