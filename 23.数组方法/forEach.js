let arr = [1, 2, 3, 4, 5, 6]

Array.prototype.myForEach = function (cb) {
    let arr = this
    for (let i = 0; i < arr.length; i++) {
        cb(arr[i], i, arr)
    }
}

arr.myForEach((item) => {
    console.log(item);
})