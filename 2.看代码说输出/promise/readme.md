<!-- https://juejin.cn/post/6844904077537574919?searchId=20230927095310F49DA960ABBD93AB11AB#heading-16 -->


Promise的状态一经改变就不能再改变。(见3.1)
.then和.catch都会返回一个新的Promise。(上面的👆1.4证明了)
catch不管被连接到哪里，都能捕获上层未捕捉过的错误。(见3.2)
在Promise中，返回任意一个非 promise 的值都会被包裹成 promise 对象，例如return 2会被包装为return Promise.resolve(2)。
Promise 的 .then 或者 .catch 可以被调用多次, 但如果Promise内部的状态一经改变，并且有了一个值，那么后续每次调用.then或者.catch的时候都会直接拿到该值。(见3.5)
.then 或者 .catch 中 return 一个 error 对象并不会抛出错误，所以不会被后续的 .catch 捕获。(见3.6)
.then 或 .catch 返回的值不能是 promise 本身，否则会造成死循环。(见3.7)
.then 或者 .catch 的参数期望是函数，传入非函数则会发生值透传。(见3.8)
.then方法是能接收两个参数的，第一个是处理成功的函数，第二个是处理失败的函数，再某些时候你可以认为catch是.then第二个参数的简便写法。(见3.9)
.finally方法也是返回一个Promise，他在Promise结束的时候，无论结果为resolved还是rejected，都会执行里面的回调函数。



Promise.all()的作用是接收一组异步任务，然后并行执行异步任务，并且在所有异步操作执行完后才执行回调。
.race()的作用也是接收一组异步任务，然后并行执行异步任务，只保留取第一个执行完成的异步操作的结果，其他的方法仍在执行，不过执行结果会被抛弃。
Promise.all().then()结果中数组的顺序和Promise.all()接收到的数组顺序一致。
all和race传入的数组中如果有会抛出异常的异步任务，那么只有最先抛出的错误会被捕获，并且是被then的第二个参数或者后面的catch捕获；但并不会影响数组中其它的异步任务的执行。



「紧跟着await后面的语句相当于放到了new Promise中，下一行及之后的语句相当于放在Promise.then中」。


定时器谁先执行，你只需要关注谁先被调用的以及延迟时间是多少，这道题中延迟时间都是0，所以只要关注谁先被调用的。。

