// 合并区间

arr = [[1,3],[2,6],[8,10],[15,18]]

/**
 * 合并重叠的区间
 * @param {Array} arr - 二维数组，每个子数组包含两个元素，表示区间的起始和结束
 * @returns {Array} - 合并后的区间数组
 */
function merge (arr) {
    // 初始化第一个区间
    let first = arr[0]
    // 存储合并后的区间结果
    let res = []
    // 遍历剩余的区间
    for (let i = 1; i < arr.length; i++) {
        let cur = arr[i]
        // 如果当前区间与前一个区间有重叠，合并区间
        if (first[1] >= cur[0]) {
            first[1] = Math.max(first[1], cur[1])
        } else {
            // 如果没有重叠，将前一个区间加入结果数组，并更新当前区间
            res.push(first)
            first = cur
        }
    }
    // 将最后一个区间加入结果数组
    res.push(first)
    return res
}

// 输出合并后的区间
console.log(merge(arr));
