定时器在node端返回一个对象，在浏览器端返回一串数字

await后面接了一个定时器，按道理await后面一定是个promise，但是await会自动将其转换成一个promise，promise.resolve(xxx)的做法

await的作用是等 promise.resolve()的完成  然后  将后续代码推入到微任务  若后续没有代码，就是将await所在的async函数的完成推入到微队列
函数完成就是等函数return 若这个函数没有return 就是默认return 一个 undefined


