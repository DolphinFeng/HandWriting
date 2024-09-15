// 相交链表

var getIntersectionNode = function(headA, headB) {
    const visited = new Set()
    let temp = headA
    while (temp !== null) {
        visited.add(temp)
        temp = temp.next
    } 
    temp = headB
    while (temp !== null) {
        if (visited.has(temp)) {
            return temp 
        }
        temp = temp.next
    }
    return null
 };

let headA = {
    val: 4,
    next: {
        val: 1,
        next: {
            val: 8,
            next: {
                val: 4,
                next: {
                    val: 5,
                    next: null
                }
            }
        }
    }
}

let headB = {
    val: 5,
    next: {
        val: 0,
        next: {
            val: 1,
            next: headA.next.next
        }
    }
}

console.log(getIntersectionNode(headA, headB));
console.log(111);