// 回文链表

function isPalindrome (head) {
    const arr = []
    while(head) {
        arr.push(head.val)
        head = head.next
    }
    let left = 0, right = arr.length - 1
    while(left < right) {
        if(arr[left] !== arr[right]) {
            return false
        }
        left ++
        right --
    } 
    return true
}

let head = {
    val: 1,
    next: {
        val: 2,
        next: {
            val: 2,
            next: {
                val: 1,
                next: null
            }
        }
    }
}

console.log(isPalindrome(head));
