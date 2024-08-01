let arr = [1, 1, 1, 2, 2]

function unique(arr) {
    return Array.from(new Set(arr))
}

// console.log(unique(arr));
// console.log([...new Set(arr)]);


console.log([...new Set(arr)]);
