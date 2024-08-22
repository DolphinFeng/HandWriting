
export function visionFollow(spotlight, getPageStatus, visionPush, visionApply) {
  // 第一次上传
  spotlight?.onCollect(() => {
    console.log('有新的跟随者');
    console.log(getPageStatus());
    return getPageStatus();
  });
  // 下载
  spotlight?.onAccept((data) => {
    console.log('建立跟随');
    visionApply(data);
  });
  // 上传
  visionPush(spotlight);
}
