function arrayIndexOf(arr, value) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === value) {
            return i;
        }
    }
    return -1;
}

let arr = [1, 2, 3, 4, 5];

console.log(arrayIndexOf(arr, 3)); // 输出: 2
console.log(arrayIndexOf(arr, 6)); // 输出: -1
console.log(arrayIndexOf(arr, 1)); // 输出: 0
console.log(arrayIndexOf(arr, 5)); // 输出: 4