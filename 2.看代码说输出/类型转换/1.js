console.log(Boolean(new Boolean(false)));  // true 包装类也是引用类型  引用类型转布尔就是true

console.log('5' + undefined);  // 5undefined 跟字符串相加，无论什么类型都会往字符串转

console.log(false == undefined);  // false == 是转number undefined转number是NaN，== 只要看到NaN就是false

console.log(null == undefined);  // true  特例