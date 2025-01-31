console.log([1, 3, 4, 10, 8, 78, 20].sort());
// [1, 10, 20, 3, 4, 78, 8]

// 默认排序是根据字符串的Unicode码点排序的，所以数字会被当作字符串排序，而不是数字排序
// 0 是 48， 1 是 49， 2 是 50， 3 是 51， 4 是 52， 5 是 53， 6 是 54， 7 是 55， 8 是 56， 9 是 57
// 所以 10 是 49， 20 是 50
// 所以 10 会在 20 之前
// 只比较第一个字符，所以 10 会在 2 之前