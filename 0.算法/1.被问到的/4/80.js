// 找出数组中重复最多的元素

// var arr = [1, 2, 3, 1, 2, 3, 4, 3, 3, 5, 3];

// a、找出数组中重复最多的数字。

// b、重复最多的数字最先开始的位置。

// c、重复最多的数字的数量。



function findMostFrequentElement(arr) {
    const elementCount = {};
    let maxElement = null;
    let maxCount = 0;
    let firstIndex = -1;

    arr.forEach((element, index) => {
        if (elementCount[element] === undefined) {
            elementCount[element] = { count: 1, firstIndex: index };
        } else {
            elementCount[element].count++;
        }

        if (elementCount[element].count > maxCount) {
            maxElement = element;
            maxCount = elementCount[element].count;
            firstIndex = elementCount[element].firstIndex;
        }
    });

    return {
        element: maxElement,
        firstIndex: firstIndex,
        count: maxCount
    };
}

// Example usage:
const arr = [1, 2, 3, 1, 2, 3, 4, 3, 3, 5, 3];
const result = findMostFrequentElement(arr);
console.log(result); // { element: 3, firstIndex: 2, count: 5 }
