class LazyMan {
    queue = []
    constructor (name) {
        this.push(() => {
            console.log(`I am ${name}`);
            
        })
        setTimeout(() => {
            this.next()
        })
    }

    sleepFirst (seconds) {}

    sleep (seconds) {}

    drink () {}

    eat () {}

    push () {}

    unshift () {}

    next () {}
}