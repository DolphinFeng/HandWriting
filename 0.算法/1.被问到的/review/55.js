const numbers = [1, 2, 3, 4, 5];

const greaterThanThree = numbers.reduce((acc, item) => {
    if (item > 3) {
        acc.push(item)
    }
    return acc
}, [])

console.log(greaterThanThree); // 输出: [4, 5]