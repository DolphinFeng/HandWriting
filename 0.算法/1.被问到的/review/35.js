function mySetInterval (cb, delay) {
    function repeat () {
        cb()
        setTimeout(repeat, delay)
    }
    setTimeout(repeat, delay)
}

mySetInterval(() => {
    console.log(1);
    
}, 1000)