let num = 123456789

function getThousandSign(num) {
    let str = num.toString()
    let len = str.length
    let res = []
    for (let i = len - 1; i > 0; i-=3) {
        let block = str.substring(i - 3, i)
        res.unshift(block)
    }
    return res.join(',')
}

console.log(getThousandSign(num));