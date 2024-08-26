// 是给你一个随机数生成器（可以生成0～7随机数），然后让你通过这个生成器生成（0-10）的随机数，并且每个数概率相同

// 随机数生成器，生成0到7的随机数
function random0to7() {
    return Math.floor(Math.random() * 8);
}

// 生成0到10的随机数
function random0to10() {
    while (true) {
        // 生成一个0到63的随机数
        let num = random0to7() * 8 + random0to7();
        // 如果生成的数在0到63之间
        if (num < 88) {
            // 返回0到10的随机数
            return num % 11;
        }
    }
}

// 用例：生成10个0到10的随机数
for (let i = 0; i < 10; i++) {
    console.log(random0to10());
}