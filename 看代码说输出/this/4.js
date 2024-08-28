// 本例旨在证明箭头函数的 this 无法更改

const obj1 = {
    value: 42,
    arrowFunction: () => { // function () {} 就可以改
        console.log(this.value);
    }
};

const obj2 = {
    value: 100
};

// 直接调用
obj1.arrowFunction(); // 输出: undefined

// 使用 call 尝试改变 this 指向
obj1.arrowFunction.call(obj2); // 输出: undefined

// 使用 apply 尝试改变 this 指向
obj1.arrowFunction.apply(obj2); // 输出: undefined

// 使用 bind 尝试改变 this 指向
const boundArrowFunction = obj1.arrowFunction.bind(obj2);
boundArrowFunction(); // 输出: undefined