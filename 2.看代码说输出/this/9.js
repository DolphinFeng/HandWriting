function n(){
    console.log(this);
}
console.log(this); // {} node模块问题，这就是 module.exports,默认就是空对象，node下每个文件都相当于一个module
n() // global