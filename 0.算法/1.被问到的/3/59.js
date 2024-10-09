// 玩具

// 时间限制:3000MS
// 41828
// 内存限制:589824KB题目描述:
// 小R过年收到了很多压岁钱，所以他想拿去买玩具。
// 小R总共收到了m元压岁钱。商店里有109种玩具，种类编号为1~109，第1种玩具的价格为i元。但是小R已经有了其中n种玩具了，他不喜欢重复，所以每种玩具他最多只想拥有一个，已经有的就不会再买了，没有的也只会买最多一个。现在小R想知道他最多能再买多少种玩具。
// 输入描述
// 第一行两个整数n,m，表示已有玩具的种类数和压岁钱数量。接下来一行n个整数a1,a2an,表示小R拥有的所有玩具的编号。
// 对于100%的数据，2<=n<=100000,1<=aj,m<=109，保证a;互不相同。
// 输出描述
// 输出一个整数表示小R最多能再买多少种玩具。
// 样例输入
// 5 16
// 2 5 9 10 100
// 样例输出
// 4
// 提示：可以买的玩具最多种类为第 1.3.4.6 四种，花费 14 元。

function maxToys(n, m, ownedToys) {
    const ownedSet = new Set(ownedToys); // 使用 Set 存储已有玩具以加快查找速度
    let count = 0; // 统计可以购买的玩具数量
    let cost = 0;  // 记录当前花费

    // 从编号 1 开始检查
    for (let i = 1; ; i++) {
        if (ownedSet.has(i)) {
            continue; // 如果已经拥有，跳过
        }
        cost += i; // 加上当前玩具的价格
        if (cost > m) { // 如果花费超过了预算，停止
            break;
        }
        count++; // 购买了新玩具
    }

    return count;
}

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// 获取用户输入
rl.question('', (firstLine) => {
    const [n, m] = firstLine.split(' ').map(Number);
    
    rl.question('', (secondLine) => {
        const ownedToys = secondLine.split(' ').map(Number);

        // 计算结果并输出
        const result = maxToys(n, m, ownedToys);
        console.log(result); // 输出结果

        rl.close();
    });
});