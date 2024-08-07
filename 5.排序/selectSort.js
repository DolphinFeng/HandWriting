let arr = [5, 3, 2, 4, 1]
// 1, 3, 2, 4, 5
// 1, 2, 3, 4, 5

/**
 * 选择排序算法
 * 每次从待排序的元素中选择最小的元素与第一个元素互换位置，然后从剩余的未排序元素中继续选择最小的元素，与待排序的第一个元素互换位置，直到顺序为止
 * @param {Array} arr - 需要排序的数组
 * @returns {Array} - 排序后的数组
 */
function selectSort(arr){
    const len = arr.length
    let minIndex 
    // 外层循环：遍历数组的每一个元素
    for(let i = 0; i < len; i++){
        minIndex = i
        // 内层循环：找到从当前位置到数组末尾的最小值
        for(let j = i; j < len; j++){
            if(arr[j] < arr[minIndex]){
                minIndex = j
            }
        }
        // 如果找到的最小值不是当前位置的值，则交换两者
        if(minIndex != i){
            [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]]
        }
    }
    return arr
}

// 输出排序后的数组
console.log(selectSort(arr));
