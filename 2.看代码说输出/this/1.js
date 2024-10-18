var a = 1;
var obj = {
  a: 2,
  console() {
    function fn() {
      console.log(this.a);
    }
    fn();
  }
};

obj.console(); // 问输出什么?  1
// 默认绑定