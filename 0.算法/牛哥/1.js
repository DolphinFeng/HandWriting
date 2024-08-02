// 找到出现最多的元素
let lines = ['192.168.1.1', '192.168.1.2', '192.168.1.2', '192.168.1.2']

const findMost = (arr) => {
    const obj = {}
    let max = 1
    let ip = ''

    for (let i = 0; i < lines.length; i++) {
        const item = arr[i]
        if (item in obj) {  // 'a' in obj 可以用于判断对象是否有这个key
            obj[item]++
            if (obj[item] > max) {
                max = obj[item]
                ip = item
            }
        } else {
            obj[item] = 1
        }
    }
    return ip
}

console.log(findMost(lines));

