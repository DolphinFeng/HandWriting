// 判断是否为环形链表

function isCircle (node) {
    let slow = node, fast = node
    while (fast && fast.next) {
        slow = slow.next
        fast = fast.next.next
        if (slow == fast) {
            return true
        }
    }
    return false
}

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
