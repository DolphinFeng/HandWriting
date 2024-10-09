// 判断版本号
// v1.0.1-base.1 v1.0.2-cr.5 v1.2.3-alpha.1
// cr>base>alpha


function compareVersions (v1, v2) {
  const priority = {
    'cr': 3,
    'base': 2,
    'alpha': 1
  }

  const main1 = v1.slice(1).split('-')[0].split('.')
  const main2 = v2.slice(1).split('-')[0].split('.')

  for (let i = 0; i < main1.length; i++) {
    if (main1[i] > main2[i]) return 1
    if (main2[i] > main1[i]) return -1 
  }

  const tag1 = v1.slice(1).split('-')[1].split('.')
  const tag2 = v2.slice(1).split('-')[1].split('.')

  if (priority[tag1[0]] > priority[tag2[0]]) return 1
  if (priority[tag1[0]] < priority[tag2[0]]) return -1

  if (tag1[1] > tag2[1]) return 1
  if (tag1[1] < tag2[1]) return -1
  
  return 0
}

// 示例
console.log(compareVersions('v1.0.1-base.1', 'v1.0.2-cr.5')); // -1
console.log(compareVersions('v1.2.3-alpha.1', 'v1.0.2-cr.5')); // 1
console.log(compareVersions('v1.0.1-base.1', 'v1.0.1-alpha.1')); // 1


