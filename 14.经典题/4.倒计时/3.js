function start (t) {
    function run () {
        requestAnimationFrame (() => {
            t = t - 1000
            setTimeout(() => {
                console.log(t);
                run()
            }, 1000) 
        }) 
    }
    run()
}

start(10000)
