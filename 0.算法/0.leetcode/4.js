// 寻找两个正序数组的中位数 要求时间复杂度为o(m + n)


var findMedianSortedArrays = function(nums1, nums2) {
    let merge = []
    // 归并排序
    let i = 0, j = 0
    while (i < nums1.length && j < nums2.length) {
        if (nums1[i] < nums2[j]) {
            merge.push(nums1[i++])
        } else {
            merge.push(nums2[j++])
        }
    }
    while (i < nums1.length) {
        merge.push(nums1[i++])
    }
    while (j < nums2.length) {
        merge.push(nums2[j++])
    }
    const { length } = merge
    return length % 2 === 0 ?
    (merge[length / 2] + merge[length / 2 - 1]) / 2
    : merge[~~(length / 2)]
};

let nums1 = [1, 2]
let nums2 = [3, 4]
console.log(findMedianSortedArrays(nums1, nums2))
