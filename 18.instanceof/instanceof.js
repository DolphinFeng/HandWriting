function instanceOf(L, R) {
    let left = L.__proto__
    let right = R.prototype
    while (left !== null) {
        if (left === right) return true
        left = left.__proto__
    }
    return false
}

let arr = []
console.log(arr instanceof Array);
console.log(arr instanceof Object)

console.log(instance(arr, Array));
console.log(instance(arr, Object));