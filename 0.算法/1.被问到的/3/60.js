// 开火车
// 时间限制:3000MS内存限制:589824KB题目描述:
// 小L很喜欢一个人玩开火车消磨时间。
// 开火车是一种卡牌游戏。具体的，有m种卡牌，第i种卡牌有a; 张。小L开始的时候会持有一个由若干卡牌组成的卡牌序列，小L在游戏中不能调整自己持有卡牌序列的顺序。另外有一个卡池序列，卡池序列初始为空。每次小L会将自己持有的卡牌序列的第一张卡牌拿出来加入卡池序列末尾，如果这种卡牌已经在卡池序列中出现过，那么删去卡池序列中这种卡牌之间的所有卡牌(包括这两张这种卡牌)。最后当小L的卡牌序列为空时，游戏结束，此时卡池序列的长度为小 L最后的得分。如果卡池序列为空，得分为0。
// 例如，目前卡池序列为1,2,3,4,10,7。小L持有卡牌序列为4,2,5。小L持有卡牌第一张为4,加入后卡池序列为1,2,3,4,10,7,4。由于4已经出现过，将中间都删去，剩下1,2,3。持有卡牌序列变成2,5，将2加入卡池序列，变成1,2,3,2。2已经出现过,删去后为1。再加入5,5没出现过，不变，最后卡池序列为1,5，得分为2。
// 现在小L可以从所有卡牌中任意选择若干张任意排列组成自己的初始持有卡牌序列，小L想知道他可能的最高得分是多少

// 输入描述
// 第一行输入一个整数m表示卡牌的种类数。
// 接下来一行m个整数a1.am表示每种卡牌的数量。对于 100%的数据，
// 2<=m<=100000,0<=a¡<=109
// 输出描述
// 输出一行一个整数表示最高得分。

// 样例输出
// 5
// 3 2 1 0 1

// 样例输出
// 4

// 如果第一种选3张，第2,3,5选一张，持有卡牌序列排成1,1,1,2,3,5,最后卡池序列为1,2,3,5，得分为4。

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// 获取用户输入
rl.question('', (firstLine) => {
    const m = parseInt(firstLine.trim());
    
    rl.question('', (secondLine) => {
        const cardCounts = secondLine.split(' ').map(Number);

        // 计算最高得分
        const result = getMaxScore(m, cardCounts);
        console.log(result); // 输出结果

        rl.close();
    });
});

function getMaxScore(m, cardCounts) {
    // 计算卡牌总数
    const totalCards = cardCounts.reduce((sum, count) => sum + count, 0);

    // 如果卡牌总数为0，得分为0
    if (totalCards === 0) {
        return 0;
    }

    // 计算最高得分
    let maxScore = 0;
    for (let i = 0; i < m; i++) {
        if (cardCounts[i] > 0) {
            maxScore += 1;
        }
    }

    return maxScore;
}
