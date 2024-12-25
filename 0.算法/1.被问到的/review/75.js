function quickSort (head) {
    if (!head || !head.next) return head
    let pivot = head
    let curr = head.next
    let smallHead = null, smallTail = null
    let largeHead = null, largeTail = null
    while (curr) {
        let next = curr.next
        curr.next = null
        if (curr.val < pivot.val) {
            if (!smallHead) {
                smallHead = smallTail = curr
            } else {
                smallTail.next = curr
                smallTail = curr
            }
        } else {
            if (!largeHead) {
                largeHead = largeTail = curr
            } else {
                largeTail.next = curr
                largeTail = curr
            }
        }
        curr = next
    }

    let left = quickSort(smallHead)
    let right = quickSort(largeHead)

    pivot.next = right
    if (!left) return pivot
    
    let leftTail = left
    while (leftTail.next) {
        leftTail = leftTail.next
    }
    leftTail.next = pivot
    return left
}