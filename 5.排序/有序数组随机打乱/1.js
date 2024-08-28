// 实现 Fisher-Yates 洗牌算法

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}


const sortedArray = [1, 2, 3, 4, 5];
const shuffledArray = shuffleArray(sortedArray);
console.log(shuffledArray);