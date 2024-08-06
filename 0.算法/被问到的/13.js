// 判断版本号
// v1.0.1-base.1 v1.0.2-cr.5 v1.2.3-alpha.1
// cr>base>alpha
// 定义标识优先级
const priority = {
  'cr': 3,
  'base': 2,
  'alpha': 1
};

/**
 * 比较两个版本号
 * @param {string} version1 - 第一个版本号
 * @param {string} version2 - 第二个版本号
 * @returns {number} - 返回1表示version1大于version2，返回-1表示version1小于version2，返回0表示两者相等
 */
function compareVersions(version1, version2) {
  // 去掉版本号前的 'v' 字符，并拆分主版本号和标识部分
  const v1 = version1.slice(1).split('-');
  const v2 = version2.slice(1).split('-');

  // 将主版本号部分按 '.' 拆分，并转换为数字数组
  const main1 = v1[0].split('.').map(Number);
  const main2 = v2[0].split('.').map(Number);
  
  // 将标识部分按 '.' 拆分
  const tag1 = v1[1].split('.');
  const tag2 = v2[1].split('.');

  // 比较主版本号的每一部分
  for (let i = 0; i < 3; i++) {
    if (main1[i] > main2[i]) return 1;
    if (main1[i] < main2[i]) return -1;
  }

  // 比较标识优先级
  if (priority[tag1[0]] > priority[tag2[0]]) return 1;
  if (priority[tag1[0]] < priority[tag2[0]]) return -1;

  // 比较标识编号
  if (Number(tag1[1]) > Number(tag2[1])) return 1;
  if (Number(tag1[1]) < Number(tag2[1])) return -1;

  // 版本号完全相同
  return 0;
}

// 示例
console.log(compareVersions('v1.0.1-base.1', 'v1.0.2-cr.5')); // -1
console.log(compareVersions('v1.2.3-alpha.1', 'v1.0.2-cr.5')); // 1
console.log(compareVersions('v1.0.1-base.1', 'v1.0.1-alpha.1')); // 1


