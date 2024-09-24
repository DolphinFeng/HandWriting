const numbers = [1, 2, 3, 4, 5];

const greaterThanThree = numbers.reduce((acc, num) => {
    if (num > 3) {
        acc.push(num);
    }
    return acc;
}, []);

console.log(greaterThanThree); // 输出: [4, 5]