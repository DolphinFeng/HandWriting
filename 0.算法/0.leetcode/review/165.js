// 比较版本号

function compareVersion (v1, v2) {
    v1 = v1.split('.')
    v2 = v2.split('.')

    const len = Math.max(v1.length, v2.length)

    for (let i = 0; i < len; i ++) {
        let num1 = parseInt(v1[i] || 0, 10)
        let num2 = parseInt(v2[i] || 0, 10)

        if (num1 > num2) return 1
        if (num2 > num1) return -1 
    }

    return 0
}

// 示例调用
console.log(compareVersion("1.2", "1.10")); // 输出 -1
console.log(compareVersion("1.01", "1.001")); // 输出 0
console.log(compareVersion("1.0", "1.0.0.0")); // 输出 0