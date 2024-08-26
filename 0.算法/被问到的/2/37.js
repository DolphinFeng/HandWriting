// b站秋招笔试
// 给一个数组，返回数组的众数（出现次数最多），若有多个，返回最小的那个

function findMode(arr) {
    // 创建一个 Map 来存储每个数字出现的次数
    const countMap = new Map();

    // 遍历数组，统计每个数字出现的次数
    for (const num of arr) {
        if (countMap.has(num)) {
            countMap.set(num, countMap.get(num) + 1);
        } else {
            countMap.set(num, 1);
        }
    }

    // 初始化众数和最大出现次数
    let mode = null;
    let maxCount = 0;

    // 遍历 Map，找到出现次数最多的数字
    for (const [num, count] of countMap) {
        if (count > maxCount || (count === maxCount && num < mode)) {
            mode = num;
            maxCount = count;
        }
    }

    return mode;
}

// console.log(findMode([1,1,4,5,1,4])); 
console.log(findMode([1,9,1,9,8,10]));


