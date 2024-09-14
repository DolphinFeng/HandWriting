// 判断是否为环形链表

// function isCircle (node) {
//     let cur = node
//     let right
//     while (cur) {
//         cur = cur.next
//         right = cur
//         while (right) {
//             right = right.next
//             if (cur.val === right.val) return true
//         }
//     }
//     return false
// }

// let node = {
//     val: 'a',
//     next: {
//         val:'b',
//         next: {
//             val: 'c',
//             next: {
//                 val: 'd',
//                 next: {
//                     val: 'b',
//                     next: {
//                         val: 'c',
//                         next: {
//                             val: 'd',
//                             next: null
//                         }
//                     }
//                 }
//             }
//         }
//     }
// }

// console.log(isCircle(node))
