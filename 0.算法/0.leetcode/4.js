// 寻找两个正序数组的中位数


function findMedianSortedArrays(nums1, nums2) {
    // 归并排序
    const merged = []
    let i = 0
    let j = 0
    while (i < nums1.length && j < nums2.length) {
        if (nums1[i] < nums2[j]) {
            merged.push(nums1[i++])
        } else {
            merged.push(nums2[j++])
        }
    }
    while (i < nums1.length) {
        merged.push(nums1[i++])
    }
    while (j < nums2.length) {
        merged.push(nums2[j++])
    }

    const { length } = merged
    return length % 2 === 1
        ? merged[Math.floor(length / 2)]
        : (merged[length / 2] + merged[length / 2 - 1]) / 2
};

let nums1 = [1, 2]
let nums2 = [3, 4]
console.log(findMedianSortedArrays(nums1, nums2))
