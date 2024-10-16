function instance (left, right) {
    let L = left.__proto__
    let R = right.prototype
    while (L !== null) {
        if (L === R) {
            return true
        }
        L = L.__proto__
    }
    return false
}

let arr = []

console.log(arr instanceof Array);
console.log(arr instanceof Object);

console.log(instance(arr, Array));
console.log(instance(arr, Object));