function start (n) {
    let timer 
    
    timer = setInterval(() => {
            n = n - 1000
            if (n > 0) console.log(n / 1000);
            if (n <= 0) clearInterval(timer)
        }, 1000)
}

start(10000)