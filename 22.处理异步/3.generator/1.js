function A(next) {
    setTimeout(() => {
        console.log('A');
        next()
    }, 1000)
}

function B(next) {
    setTimeout(() => {
        console.log('B');
        next()
    }, 500)
}

function C(next) {
    console.log('C');
    next()
}

function* g() {
    yield A
    yield B
    yield C
}

function run() {
    let gen = g()

    function next(err, data) {
        let res = gen.next(data)
        if(res.done) return 
        res.value(next)
    }
    next()
}

run(g)