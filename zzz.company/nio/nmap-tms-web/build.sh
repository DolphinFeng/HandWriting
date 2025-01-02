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
ls -l ./dist

tar -cvf tms_web.tar ./dist ./build ./nio

ls -l ./tms_web.tar
