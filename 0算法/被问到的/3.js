// 模拟一个请求，没超时就是resolve，超时则reject

/**
 * 模拟一个请求函数
 * @param {number} timeout - 超时时间，单位为毫秒
 * @returns {Promise} - 返回一个Promise对象，根据请求时间决定resolve或reject
 */
function simulateRequest(timeout) {
  return new Promise((resolve, reject) => {
    // 模拟请求的时间，随机生成0到2000毫秒之间的数值
    const requestTime = Math.random() * 2000;

    // 设置一个定时器，模拟请求
    setTimeout(() => {
      // 如果请求时间小于等于超时时间，则请求成功，调用resolve
      if (requestTime <= timeout) {
        resolve('请求成功');
      } else {
        // 如果请求时间大于超时时间，则请求超时，调用reject
        reject('请求超时');
      }
    }, requestTime);
  });
}

// 定义超时时间为1000毫秒
const timeout = 1000;

simulateRequest(timeout)
  .then((message) => {
    console.log(message); // 请求成功
  })
  .catch((error) => {
    console.error(error); // 请求超时
  });
