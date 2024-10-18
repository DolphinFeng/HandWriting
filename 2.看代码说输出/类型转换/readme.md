


# == 11.9.3 https://es5.github.io/#x11.9.3 https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Equality
null和undefined是相等的  对于 == 
<!-- 
1. 两个都为简单类型，字符串和布尔值都会转换成数值，再比较
2. 简单类型与引用类型比较，对象转化成其原始类型的值，再比较
3. 两个都为引用类型，则比较它们是否指向同一个对象
4. null 和 undefined 相等
5. 存在 NaN 则返回 false
-->