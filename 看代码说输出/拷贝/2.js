let obj = {
    name:"hello world",
    age:55
}

let obj2 = obj
obj2['c'] = 22

console.log(obj) // 多了个c: 22
console.log(obj2) // 和obj一样