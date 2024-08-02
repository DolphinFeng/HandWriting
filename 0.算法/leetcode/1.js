// 两数之和
let nums = [2,7,11,15]

// 暴力
// function twoSum(arr, target) {
//     for(let i = 0; i < arr.length; i++) {
//         for(let j = i + 1; j < arr.length; j++) {
//             if (arr[i] + arr[j] === target) {
//                 return [i, j]
//             }
//         }
//     }
// }


// 对象
function twoSum(arr, target) {
    let obj = {}
    for (let i = 0; i < arr.length; i++) {
        if (obj[target - arr[i]] !== undefined) {
            return [obj[target - arr[i]], i]
        } else {
            obj[arr[i]] = i
        }
    }
}
console.log(twoSum(nums, 9));