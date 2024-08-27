let str = 'abcdeabdcdddd'

function getMaxLength (str) {
    let len = str.length
    let left = 0, right = 1
    let max = 0
    while (right < len) {
        let temp = str.slice(left, right)
        if (temp.indexOf(str[right]) > -1) {
            left++
            continue
        } else {
            right++
        }
        if (right - left > max) {
            max = right - left
        }
    }
    return max
}

console.log(getMaxLength(str));
