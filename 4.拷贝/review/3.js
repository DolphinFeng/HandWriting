// 借助管道通信实现深拷贝

let obj = {
    a: {
        b: 1
    }
}

function deepCopy (obj) {
    return new Promise((resolve, reject) => {
        const { port1, port2 } = new MessageChannel()
        port1.postMessage(obj)

        port2.onmessage = (msg) => {
            resolve(msg.data)
        }
    })
}

async function fn () {
    let objCopy = await deepCopy(obj)
    obj.a.b = 2

    console.log(objCopy);   
}

fn()