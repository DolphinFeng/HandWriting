async function testSometing() {
    console.log("执行testSometing");
    return "testSometing";
  }
  
  async function testAsync() {
    console.log("执行testAsync");
    return Promise.resolve("hello async");
  }
  
  async function test() {
    console.log("test start...");
    const v1 = await testSometing();
    console.log(v1);
    const v2 = await testAsync();
    console.log(v2); //  重新被 await testAsync(); 代入 微任务中
    console.log(v1, v2);
  }
  
  test();
  
  var promise = new Promise(resolve => {
    console.log("promise start...");
    resolve("promise");
  });
  promise.then(val => console.log(val));
  
  console.log("test end...");
  