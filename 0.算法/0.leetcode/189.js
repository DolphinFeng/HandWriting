// 轮转数组

var rotate = function(nums, k) {
    const n = nums.length
    if ((k %= n) === 0) return
    
    const reverse = (l, r) => {
        let t
        while (l < r) {
            t = nums[l]
            nums[l++] = nums[r]
            nums[r--] = t 
        }
    }
    
    reverse(0, n - 1)
    reverse(0, k - 1)
    reverse(k, n - 1)
};

// test cases
const nums1 = [1,2,3,4,5,6,7]
const k1 = 3
rotate(nums1, k1)
console.log(nums1) // [5,6,7,1,2,3,4]

const nums2 = [-1,-100,3,99]
const k2 = 2
rotate(nums2, k2)
console.log(nums2) // [3,99,-1,-100]