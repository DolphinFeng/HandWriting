// 给一个数组，例如["a","a","b","b","c","c","c"]
// 原地变换得到下面的结果
// ["a","2","b","2","c","3"]，输出结果6，为得到的结果数组的长度。
// 还有个例子，输入数组为
// ["a"]
// 那么结果为
// ["a"]
// "1"省略，输出结果为得到的结果长度为1

let arr = ["a","a","b","b","c","c","c","d"];

function getLength (arr) {
    let res = 0, i = 0;
    while (i < arr.length) {
        let j = i;
        while (j < arr.length && arr[i] === arr[j]) {
            j++
        }
        arr[res++] = arr[i]
        let count = j - i
        if (count > 1) {
            for (let digit of count.toString()) {
                arr[res++] = digit
            }
        }
        i = j
    }
    return res
}

console.log(getLength(arr));