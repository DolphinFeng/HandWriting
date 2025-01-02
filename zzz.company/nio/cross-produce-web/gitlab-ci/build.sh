#!/bin/bash
npm config set registry https://artifactory.nioint.com/artifactory/api/npm/dd-npm-all-virtual/
npm config ls
echo "设置完成registry https://artifactory.nioint.com/artifactory/api/npm/dd-npm-all-virtual/"
echo "开始安装依赖"
npm install --force
echo "开始安装依赖结束"
echo "开始构建"
npm run build
echo "构建成功"
ls -l ./build

mkdir -p temp/html temp/works

cp -r ./build/* temp/html/
cp -r ./gitlab-ci/* temp/works/

tar -cvf cross_produce_web.tar -C temp html works

rm -rf temp

ls -l ./cross_produce_web.tar
