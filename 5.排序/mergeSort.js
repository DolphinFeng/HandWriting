let arr = [5, 1, 3, 6, 2, 4, 7]

/**
 * 归并排序函数
 * 依旧是采用分而治之的思想，将数组不断地分割成两个子数组，直到每个数组只有一个元素，然后再将相邻地子数组两两合并，
 * 如何划分就如何合并，但是合并过程中需要排序，此时的排序比较两部分的第一部分，小的就放前面
 * @param {Array} arr - 需要排序的数组
 * @returns {Array} - 排序后的数组
 */
function mergeSort(arr) {
    // 如果数组长度小于等于1，直接返回数组
    if (arr.length <= 1) return arr

    // 找到数组的中间位置，Math.floor 用于向下取整
    const mid = Math.floor(arr.length / 2);
    // 将数组分成左右两部分
    const leftArr = arr.slice(0, mid);
    const rightArr = arr.slice(mid);

    /**
     * 合并两个有序数组
     * @param {Array} leftArr - 左半部分数组
     * @param {Array} rightArr - 右半部分数组
     * @returns {Array} - 合并后的有序数组
     */
    const merge = (leftArr, rightArr) => {
        let res = [];
        let leftIdx = 0;
        let rightIdx = 0;
        // 比较左右两部分的元素，依次将较小的元素加入结果数组中
        while (leftIdx < leftArr.length && rightIdx < rightArr.length) {
            if (leftArr[leftIdx] < rightArr[rightIdx]) {
                res.push(leftArr[leftIdx]);
                leftIdx++;
            } else {
                res.push(rightArr[rightIdx]);
                rightIdx++;
            }
        }
        // 将剩余的左半部分元素加入结果数组
        while (leftIdx < leftArr.length) {
            res.push(leftArr[leftIdx]);
            leftIdx++;
        }
        // 将剩余的右半部分元素加入结果数组
        while (rightIdx < rightArr.length) {
            res.push(rightArr[rightIdx]);
            rightIdx++;
        }
        return res;
    }

    // 递归调用mergeSort对左右两部分进行排序，并合并排序后的数组
    return merge(mergeSort(leftArr), mergeSort(rightArr));
}

// 输出排序后的数组
console.log(mergeSort(arr));
