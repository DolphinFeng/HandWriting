// t神字节一面

var length = 10;
function fn() {
    return this.length + 1;
} 
var obj = { 
    length: 5,  
    test1: function() { 
        return fn(); 
    } 
};

obj.test2=fn; 

//下面代码输出是什么 
console.log(obj.test1()) // 11
console.log(fn()); // 11
console.log(obj.test2()); // 6
console.log(fn()===obj.test2()) // false