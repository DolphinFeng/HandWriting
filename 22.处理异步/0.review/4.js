function A () {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('A');
            resolve()
        }, 1000)
    })
}

function B () {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('B');
            resolve()
        }, 500)
    })
}

function C () {
    console.log('C');
}

async function run () {
    await A()
    await B()
    C()
}

run()