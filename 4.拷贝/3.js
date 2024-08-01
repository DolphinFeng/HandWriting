// 借助管道通信实现深拷贝

let obj = {
    a: {
        b: 1
    }
}

function deepCopy (obj) {
    return new Promise((resolve) => {
        const { port1, port2 } = new MessageChannel() 
        port1.postMessage(obj) 
        
        port2.onmessage = function (msg) {
            resolve(msg.data)
        }
    })
}

async function fn () {
    let objCopy = await deepCopy(obj)
    console.log(objCopy);
}

fn()