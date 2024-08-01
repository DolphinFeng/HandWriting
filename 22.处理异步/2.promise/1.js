function A() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log('A');
            resolve()
            // console.log('AA');
        }, 1000)
    })
}

function B() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log('B');
            resolve()
        }, 500)
    })
}

function C() {
    console.log('C');
}

A().then(() => {
    B().then(() => {
        C()
    })
})