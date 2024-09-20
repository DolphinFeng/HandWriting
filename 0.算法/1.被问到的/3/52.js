// 我们正在为一个日程安排管理系统开发一个关键功能。在这个系
// 统中，有两个不同的用户群体，分别有他们各自的空闲日程区间
// 列表。
// 第一个用户群体的空闲日程区间列表记为 firstList，其
// 中firstList[i]=[start i, end i]
// 同样地，第二个用户群体的日程区间列表记为 secondList
// secondList[jl=[start j,end j]
// 每个用户群体的日程区间都是成对出现且不相交的，并且两个列
// 表都已经按照时间顺序排好序。
// 现在，为了找到两个用户群体都有空闲时间可以进行共同活动的
// 时间段，需要设计一个算法来返回这两个日程区间列表的交集
// 将其找出来以便系统可以安排共同的活动。
// 请你设计一个高效的算法来解决这个问题。

// 输入： [[0,3],[5,9],[11,13]],[[2,6],[8,10]]
// 输出： [[2,3],[5,6],[8,9]] 说明：区间内数字是一种时间的映射，不对应真实时分秒

// 输入：[],[[4,9]]
// 输出：[]

/**
 * 代码中的类名、方法名、参数名已经指定，请勿修改，直接返回方法规定的值即可
 *
 * 
 * @param firstList int整型二维数组 
 * @param secondList int整型二维数组 
 * @return int整型二维数组
 */
function findIntersection( firstList ,  secondList ) {
    // write code here
}
module.exports = {
    findIntersection : findIntersection
};


function findIntersection(firstList, secondList) {
    let i = 0, j = 0;
    let result = [];

    while (i < firstList.length && j < secondList.length) {
        let start1 = firstList[i][0], end1 = firstList[i][1];
        let start2 = secondList[j][0], end2 = secondList[j][1];

        // 找到重叠部分
        let start = Math.max(start1, start2);
        let end = Math.min(end1, end2);

        if (start <= end) {
            result.push([start, end]);
        }

        // 移动指针
        if (end1 < end2) {
            i++;
        } else {
            j++;
        }
    }

    return result;
}

module.exports = {
    findIntersection: findIntersection
};

// 测试代码
console.log(findIntersection([[0,3],[5,9],[11,13]], [[2,6],[8,10]])); // 输出: [[2,3],[5,6],[8,9]]
console.log(findIntersection([], [[4,9]])); // 输出: []
console.log(findIntersection([[1,3],[5,9]], [[4,6],[8,10]])); // 输出: [[5,6],[8,9]]