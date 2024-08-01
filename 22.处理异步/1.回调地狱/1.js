function A(fn) {
    setTimeout(() => {
        console.log('A');
        fn()
    }, 1000)
}

function B(fn) {
    setTimeout(() => {
        console.log('B');
        C()
    }, 500)
}

function C() {
    console.log('C');
}

A(B)