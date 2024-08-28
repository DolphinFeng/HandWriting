function matchPath(pathRule = '', path) {
  const ruleList = pathRule.split('/');
  const pathList = path.split('/');
  if (ruleList.length !== pathList.length) {
    return false;
  }
  for (let i = 0; i < ruleList.length; i++) {
    if (ruleList[i] !== '*' && ruleList[i] !== pathList[i]) {
      return false;
    }
  }
  return true;
}

function _getFocusMenu(path, list) {
  let expendList = [];
  for (let i = 0; i < list.length; i++) {
    if (matchPath(list[i].path, path)) {
      return [list[i].key, expendList, list[i]];
    }

    if (list[i].children) {
      const res = _getFocusMenu(path, list[i].children);
      if (res) {
        expendList = [list[i].key].concat(res[1]);
        return [res[0], expendList, res[2]];
      }
    }
  }

  return false;
}
// 简单匹配菜单
export function getFocusMenu(path, list) {
  const res = _getFocusMenu(path, list);
  if (!res) {
    return ['', [], {}];
  }
  return res;
}
