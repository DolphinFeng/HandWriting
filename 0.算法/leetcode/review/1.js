let num = [2, 7, 9, 15]

// 暴力
// function getIndex (num, target) {
//     for (let i = 0; i < num.length; i++) {
//         for (let j = i + 1; j < num.length; j++) {
//             if (num[i] + num[j] === target) {
//                 return [i, j]
//             }
//         }
//     }
// }

// console.log(getIndex(num, 16));


// map
// function getIndex (num, target) {
//     let obj = {}
//     for (let i = 0; i < num.length; i++) {
//         if (num[target - num[i]] !== undefined) {
//             return [obj[target - num[i]], i]
//         } else {
//             obj[num[i]] = i
//         }
//     }
// }

// console.log(getIndex(num, 9));
