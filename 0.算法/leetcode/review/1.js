let num = [2, 7, 11, 15]

// 暴力
function twoSum (num, target) {
    let len = num.length
    for (let i = 0; i < len; i++) {
        for (let j = i + 1; j < len; j++) {
            if (num[i] + num[j] === target) {
                return [i, j]
            }
        }
    }
}

// function twoSum (num, target) {
//     let len = num.length
//     let obj = {}
//     for (let i = 0; i < len; i++) {
//         if (obj[target - num[i]] !== undefined) {
//             return [obj[target - num[i]], i]
//         } else {
//             obj[num[i]] = i
//         }
//     }
// }

console.log(twoSum(num, 9));