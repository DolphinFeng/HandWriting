let a = [1, 2, 3, 4, 5] //[2,3,4,5] [1,3,4,5]
let b = [3, 1, 7, 12]
let c = [14, 5, 9, 2]
function qian(arr) {
    let res = []
    arr.sort((a, b) => a - b)
    res[0] = arr[0]
    for (let i = 1; i < arr.length; i++) {
        res[i] = arr[i] - arr[i - 1]
    }
    return res
}
function test(b, c) {
    let a1 = qian(b)
    let a2 = qian(c)
    // console.log(a1,a2);
    let res = a1.concat(a2)
    let set = new Set(res)
    return set
} +

    console.log(test(b, c));
