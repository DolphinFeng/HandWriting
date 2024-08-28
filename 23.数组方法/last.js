// Array.prototype.last 方法用于获取数组的最后一个元素 实际上没有这个方法

if (!Array.prototype.last) {
    Array.prototype.last = function() {
        return this[this.length - 1];
    };
}


const arr = [1, 2, 3, 4, 5];
console.log(arr.last()); // 输出: 5
