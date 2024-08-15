let str = 'abcdabdcdddd'

function getMaxLength (str) {
    if (str.length <= 1) return str.length
    let max = 0
    let left = 0, right = 1
    while (right < str.length) {
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
