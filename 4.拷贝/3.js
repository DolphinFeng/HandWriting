// 借助管道通信实现深拷贝

let obj = {
    a: {
        b: 1
    }
}

/**
 * 深拷贝函数
 * @param {Object} obj - 需要深拷贝的对象
 * @returns {Promise} - 返回一个Promise，resolve时返回深拷贝后的对象
 */
function deepCopy (obj) {
    return new Promise((resolve) => {
        // 创建一个消息通道
        const { port1, port2 } = new MessageChannel() 
        // 通过port1发送消息
        port1.postMessage(obj) 
        
        // 监听port2的消息事件，当接收到消息时，resolve Promise
        port2.onmessage = function (msg) {
            resolve(msg.data)
        }
    })
}

/**
 * 异步函数，用于测试深拷贝
 */
async function fn () {
    // 调用深拷贝函数并等待结果
    let objCopy = await deepCopy(obj)
    // 打印深拷贝后的对象
    console.log(objCopy);
}

// 调用测试函数
fn()
