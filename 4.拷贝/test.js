let obj = {
    a: {
        b: 1
    }
}

function deepCopy(obj) {
    return new Promise((resolve) => {
        const { port1, port2 } = new MessageChannel() // 对象解构的key不能乱写
        port1.postMessage(obj) // 喊话obj

        obj.a.b = 2
    
        port2.onmessage = function (msg) { // msg就是port1喊话的内容
            resolve(msg.data) // msg被包裹了一层data
        }
    })
}

async function fn () {
    let objCopy = await deepCopy(obj)
    console.log(objCopy);
}

fn()

