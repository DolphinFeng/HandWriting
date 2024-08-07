let arr = [3, 2, 4, 1, 5] // 初始化数组

/**
 * 冒泡排序算法
 * 重复遍历数列，依次比较两个相邻的元素，顺序错误则交换位置，直到没有任何元素需要交换为止
 * @param {Array} arr - 需要排序的数组
 */
function bubbleSort(arr) {
    // 外层循环控制遍历次数
    for (let i = 0; i < arr.length; i++) {
        // 内层循环控制每次遍历的比较和交换
        for (let j = i + 1; j < arr.length; j++) {
            // 如果前一个元素大于后一个元素，则交换它们的位置
            if (arr[i] > arr[j]) {
                [arr[i], arr[j]] = [arr[j], arr[i]] // 交换元素
            }
        }
    }
}


bubbleSort(arr)
console.log(arr);