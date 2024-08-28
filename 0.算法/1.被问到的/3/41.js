// u 神 二面腾讯 random5 实现 random7

function random5() {
    return Math.floor(Math.random() * 5) + 1;
}

function random7() {
    let result = 0;
    do {
        let num1 = random5() - 1; // 将输出从 0 到 4
        let num2 = random5(); // 将输出从 1 到 5
        result = num1 * 5 + num2; // 产生从 1 到 25 的均匀分布
    } while (result > 21); // 如果结果大于 21，重新生成

    return (result - 1) % 7 + 1; // 将 1 到 21 映射到 1 到 7
}

// 测试 random7 函数
console.log(Array.from({length: 10}, random7)); // 生成一个长度为 10 的数组，元素为 random7 的返回值